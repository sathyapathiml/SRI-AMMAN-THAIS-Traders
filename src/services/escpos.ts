import type { Invoice, StoreSettings, PrinterConfig } from '../types/pos';

// ESC/POS Command Byte Constants
const ESC = 0x1B;
const GS = 0x1D;

export const ESC_POS_COMMANDS = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_SIZE_ON: [GS, 0x21, 0x11],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x01],
  NORMAL_SIZE: [GS, 0x21, 0x00],
  CUT_PAPER: [GS, 0x56, 0x41, 0x00],
  CASH_DRAWER_PULSE: [ESC, 0x70, 0x00, 0x19, 0xFA],
  FEED_LINES: (n: number) => [ESC, 0x64, n]
};

// Pad string helper for precise thermal column alignment (48 characters wide)
const padRight = (str: string, length: number): string => {
  return str.padEnd(length).substring(0, length);
};

const padLeft = (str: string, length: number): string => {
  return str.padStart(length).substring(0, length);
};

const formatLine = (left: string, right: string, width = 48): string => {
  const spaceNeeded = width - left.length - right.length;
  if (spaceNeeded <= 0) {
    return left.substring(0, width - right.length) + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
};

const dividerLine = (char = '-', width = 48): string => {
  return char.repeat(width) + '\n';
};

/**
 * Converts String to ASCII Uint8Array
 */
const stringToBytes = (text: string): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Replace non-ASCII currency symbol with Rs. for raw serial thermal printing compatibility
    if (code === 8377) { // '₹' symbol
      bytes.push(...Array.from(new TextEncoder().encode('Rs.')));
    } else {
      bytes.push(code > 255 ? 0x3F : code);
    }
  }
  return bytes;
};

/**
 * Builds full raw ESC/POS ArrayBuffer byte array for thermal receipt printing
 */
export const buildEscPosBuffer = (invoice: Invoice, settings: StoreSettings, autoCut = true, openDrawer = true): Uint8Array => {
  const bytes: number[] = [];

  const push = (...cmd: (number | number[])[]) => {
    for (const c of cmd) {
      if (Array.isArray(c)) {
        bytes.push(...c);
      } else {
        bytes.push(c);
      }
    }
  };

  const printText = (text: string) => {
    push(stringToBytes(text));
  };

  // 1. Initialize
  push(ESC_POS_COMMANDS.INIT);

  // 2. Optional Cash Drawer Release Pulse
  if (openDrawer) {
    push(ESC_POS_COMMANDS.CASH_DRAWER_PULSE);
  }

  // 3. Header
  push(ESC_POS_COMMANDS.ALIGN_CENTER);
  push(ESC_POS_COMMANDS.BOLD_ON);
  push(ESC_POS_COMMANDS.DOUBLE_HEIGHT_ON);

  if (invoice.isEstimate) {
    printText(`*** PROFORMA ESTIMATE / QUOTATION ***\n`);
  }

  printText(`${settings.storeName}\n`);
  push(ESC_POS_COMMANDS.NORMAL_SIZE);
  push(ESC_POS_COMMANDS.BOLD_OFF);

  printText(`${settings.storeTagline}\n`);
  printText(`${settings.addressLine1}\n`);
  printText(`${settings.addressLine2}\n`);
  printText(`Ph: ${settings.phone}\n`);
  if (settings.gstin) {
    printText(`GSTIN: ${settings.gstin}\n`);
  }
  printText(dividerLine('='));

  // 4. Invoice Meta Info
  push(ESC_POS_COMMANDS.ALIGN_LEFT);
  printText(formatLine(`Ref #: ${invoice.invoiceNo}`, `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`) + '\n');
  printText(formatLine(`Pay Mode: ${invoice.paymentMode}`, `Time: ${new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`) + '\n');
  
  if (invoice.customerName || invoice.customerPhone) {
    const custInfo = [invoice.customerName, invoice.customerPhone].filter(Boolean).join(' | ');
    printText(`Customer: ${custInfo}\n`);
  }
  printText(dividerLine('-'));

  // 5. Item Columns (Width: 48 chars)
  printText(padRight('Item Description', 20) + padRight('Qty x Rate', 12) + padRight('Disc', 6) + padLeft('Total', 10) + '\n');
  printText(dividerLine('-'));

  invoice.items.forEach((item) => {
    const nameStr = padRight(item.itemName, 20);
    const qtyRateStr = padRight(`${item.qty}x${item.mrp}`, 12);
    const discStr = padRight(item.lineDiscountAmount > 0 ? (item.discountType === 'percent' ? `${item.discountValue}%` : `Rs.${item.discountValue}`) : '0', 6);
    const totalStr = padLeft(`Rs.${item.lineGrandTotal.toFixed(2)}`, 10);
    
    printText(`${nameStr}${qtyRateStr}${discStr}${totalStr}\n`);
  });

  printText(dividerLine('-'));

  // 6. Financial Totals Summary
  push(ESC_POS_COMMANDS.ALIGN_RIGHT);
  printText(formatLine('Subtotal MRP:', `Rs. ${invoice.subtotalMRP.toFixed(2)}`) + '\n');

  if (invoice.overallDiscountAmount && invoice.overallDiscountAmount > 0) {
    printText(formatLine('Bill Overall Discount:', `- Rs. ${invoice.overallDiscountAmount.toFixed(2)}`) + '\n');
  }

  if (invoice.totalDiscount > 0) {
    printText(formatLine('Total Discount Savings:', `- Rs. ${invoice.totalDiscount.toFixed(2)}`) + '\n');
  }

  if (invoice.totalGST > 0) {
    printText(formatLine('Taxable Subtotal:', `Rs. ${invoice.taxableAmount.toFixed(2)}`) + '\n');
    printText(formatLine('CGST (Split 50%):', `Rs. ${invoice.totalCGST.toFixed(2)}`) + '\n');
    printText(formatLine('SGST (Split 50%):', `Rs. ${invoice.totalSGST.toFixed(2)}`) + '\n');
    printText(formatLine('Total GST Tax:', `Rs. ${invoice.totalGST.toFixed(2)}`) + '\n');
  }

  printText(dividerLine('='));

  // Grand Total Highlight
  push(ESC_POS_COMMANDS.BOLD_ON);
  push(ESC_POS_COMMANDS.DOUBLE_HEIGHT_ON);
  printText(formatLine('NET PAYABLE:', `Rs. ${invoice.grandTotal.toFixed(2)}`) + '\n');
  push(ESC_POS_COMMANDS.NORMAL_SIZE);
  push(ESC_POS_COMMANDS.BOLD_OFF);

  if (invoice.paymentMode === 'Cash' && invoice.cashTendered) {
    printText(formatLine('Cash Tendered:', `Rs. ${invoice.cashTendered.toFixed(2)}`) + '\n');
    printText(formatLine('Change Returned:', `Rs. ${(invoice.changeReturned || 0).toFixed(2)}`) + '\n');
  }

  printText(dividerLine('-'));

  // 7. Footer
  push(ESC_POS_COMMANDS.ALIGN_CENTER);
  printText(`${settings.receiptFooterNote}\n`);
  printText('*** THANK YOU FOR YOUR BUSINESS ***\n');

  // 8. Feed & Paper Cut
  push(ESC_POS_COMMANDS.FEED_LINES(4));
  if (autoCut) {
    push(ESC_POS_COMMANDS.CUT_PAPER);
  }

  return new Uint8Array(bytes);
};

export const buildZReportEscPosBuffer = (zReportData: any, config: PrinterConfig): Uint8Array => {
  const bytes: number[] = [];
  const push = (...cmd: (number | number[])[]) => {
    for (const c of cmd) {
      if (Array.isArray(c)) bytes.push(...c);
      else bytes.push(c);
    }
  };
  const printText = (t: string) => push(stringToBytes(t));

  push(ESC_POS_COMMANDS.INIT);
  push(ESC_POS_COMMANDS.ALIGN_CENTER);
  push(ESC_POS_COMMANDS.BOLD_ON);
  push(ESC_POS_COMMANDS.DOUBLE_HEIGHT_ON);
  printText(`${zReportData.storeName}\n`);
  printText(`*** DAY END Z-REPORT ***\n`);
  push(ESC_POS_COMMANDS.NORMAL_SIZE);
  push(ESC_POS_COMMANDS.BOLD_OFF);
  printText(`Closed At: ${zReportData.closedAt}\n`);
  printText(dividerLine('='));

  push(ESC_POS_COMMANDS.ALIGN_LEFT);
  printText(formatLine('Total Invoices Billed:', `${zReportData.totalInvoices}`) + '\n');
  printText(formatLine('Total Gross Sales:', `Rs. ${zReportData.totalRevenue.toFixed(2)}`) + '\n');
  printText(formatLine('Total Discounts Given:', `Rs. ${zReportData.totalDiscount.toFixed(2)}`) + '\n');
  printText(formatLine('Total GST Collected:', `Rs. ${zReportData.totalGst.toFixed(2)}`) + '\n');
  printText(dividerLine('-'));

  printText(formatLine('Cash Sales Collected:', `Rs. ${zReportData.cashSales.toFixed(2)}`) + '\n');
  printText(formatLine('UPI Sales Collected:', `Rs. ${zReportData.upiSales.toFixed(2)}`) + '\n');
  printText(formatLine('Card Sales Collected:', `Rs. ${zReportData.cardSales.toFixed(2)}`) + '\n');
  printText(formatLine('Petty Expenses Deducted:', `- Rs. ${zReportData.totalPettyExpenses.toFixed(2)}`) + '\n');
  printText(dividerLine('-'));

  printText(formatLine('Opening Cash Float:', `Rs. ${zReportData.openingCash.toFixed(2)}`) + '\n');
  printText(formatLine('Expected Register Cash:', `Rs. ${zReportData.expectedDrawerCash.toFixed(2)}`) + '\n');
  printText(formatLine('Counted Actual Cash:', `Rs. ${zReportData.actualDrawerCash.toFixed(2)}`) + '\n');

  push(ESC_POS_COMMANDS.BOLD_ON);
  printText(formatLine('Drawer Variance (Diff):', `Rs. ${zReportData.difference.toFixed(2)}`) + '\n');
  push(ESC_POS_COMMANDS.BOLD_OFF);

  printText(dividerLine('='));
  push(ESC_POS_COMMANDS.ALIGN_CENTER);
  printText('*** REGISTER BALANCING COMPLETE ***\n');

  push(ESC_POS_COMMANDS.FEED_LINES(4));
  if (config.autoCut) {
    push(ESC_POS_COMMANDS.CUT_PAPER);
  }

  return new Uint8Array(bytes);
};
