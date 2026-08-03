import type { CartLineItem, DiscountType, Item, PriceTier, CartTotals } from '../types/pos';

/**
 * Calculates financial figures for a single line item
 */
export const calculateLineItem = (
  itemCode: string,
  itemName: string,
  mrp: number,
  qty: number,
  stockQty: number,
  discountValue: number,
  discountType: DiscountType,
  gstRate: number,
  isGstApplicable: boolean,
  existingId?: string
): CartLineItem => {
  const lineSubtotalMRP = mrp * qty;

  let lineDiscountAmount = 0;
  if (discountType === 'percent') {
    lineDiscountAmount = (lineSubtotalMRP * Math.min(100, Math.max(0, discountValue))) / 100;
  } else {
    // Flat discount in ₹ per total quantity
    lineDiscountAmount = Math.min(lineSubtotalMRP, Math.max(0, discountValue * qty));
  }

  const lineAfterDiscount = Math.max(0, lineSubtotalMRP - lineDiscountAmount);

  let lineTaxableAmount = lineAfterDiscount;
  let lineGstAmount = 0;
  let lineCgstAmount = 0;
  let lineSgstAmount = 0;

  if (isGstApplicable && gstRate > 0) {
    // MRP includes GST (Retail Inclusive GST standard)
    lineTaxableAmount = lineAfterDiscount / (1 + gstRate / 100);
    lineGstAmount = lineAfterDiscount - lineTaxableAmount;
    lineCgstAmount = lineGstAmount / 2;
    lineSgstAmount = lineGstAmount / 2;
  }

  return {
    id: existingId || `${itemCode}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    itemCode,
    itemName,
    mrp,
    qty,
    stockQty,
    discountValue,
    discountType,
    gstRate,
    isGstApplicable,
    lineSubtotalMRP: roundTwoDecimals(lineSubtotalMRP),
    lineDiscountAmount: roundTwoDecimals(lineDiscountAmount),
    lineTaxableAmount: roundTwoDecimals(lineTaxableAmount),
    lineGstAmount: roundTwoDecimals(lineGstAmount),
    lineCgstAmount: roundTwoDecimals(lineCgstAmount),
    lineSgstAmount: roundTwoDecimals(lineSgstAmount),
    lineGrandTotal: roundTwoDecimals(lineAfterDiscount)
  };
};

export const createCartItemFromItem = (item: Item, qty = 1, priceTier: PriceTier = 'retail'): CartLineItem => {
  const price = (priceTier === 'wholesale' && item.wholesalePrice && item.wholesalePrice > 0)
    ? item.wholesalePrice
    : item.mrp;

  return calculateLineItem(
    item.itemCode,
    item.itemName,
    price,
    qty,
    item.stockQty,
    item.defaultDiscountValue,
    item.defaultDiscountType,
    item.defaultGstRate,
    item.isGstApplicable
  );
};

export const roundTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateCartTotals = (
  items: CartLineItem[],
  overallDiscountValue: number = 0,
  overallDiscountType: DiscountType = 'flat'
): CartTotals => {
  let subtotalMRP = 0;
  let itemDiscountsTotal = 0;
  let taxableAmount = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalGST = 0;
  let rawGrandTotal = 0;
  let totalQty = 0;

  items.forEach(item => {
    subtotalMRP += item.lineSubtotalMRP;
    itemDiscountsTotal += item.lineDiscountAmount;
    taxableAmount += item.lineTaxableAmount;
    totalCGST += item.lineCgstAmount;
    totalSGST += item.lineSgstAmount;
    totalGST += item.lineGstAmount;
    rawGrandTotal += item.lineGrandTotal;
    totalQty += item.qty;
  });

  // Calculate Overall Bill Discount
  let overallDiscountAmount = 0;
  if (overallDiscountType === 'percent') {
    overallDiscountAmount = (rawGrandTotal * Math.min(100, Math.max(0, overallDiscountValue))) / 100;
  } else {
    overallDiscountAmount = Math.min(rawGrandTotal, Math.max(0, overallDiscountValue));
  }

  const finalGrandTotal = Math.max(0, rawGrandTotal - overallDiscountAmount);
  const totalDiscount = itemDiscountsTotal + overallDiscountAmount;

  return {
    itemCount: items.length,
    totalQty,
    subtotalMRP: roundTwoDecimals(subtotalMRP),
    itemDiscountsTotal: roundTwoDecimals(itemDiscountsTotal),
    overallDiscountValue,
    overallDiscountType,
    overallDiscountAmount: roundTwoDecimals(overallDiscountAmount),
    totalDiscount: roundTwoDecimals(totalDiscount),
    taxableAmount: roundTwoDecimals(taxableAmount),
    totalCGST: roundTwoDecimals(totalCGST),
    totalSGST: roundTwoDecimals(totalSGST),
    totalGST: roundTwoDecimals(totalGST),
    grandTotal: Math.round(finalGrandTotal) // Cashier rounded net bill amount
  };
};
