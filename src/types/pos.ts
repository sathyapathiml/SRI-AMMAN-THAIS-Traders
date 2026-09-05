export type DiscountType = 'percent' | 'flat';
export type PaymentMode = 'Cash' | 'UPI' | 'Card';
export type PriceTier = 'retail' | 'wholesale';
export type UserRole = 'admin' | 'worker';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  mrp: number;
  wholesalePrice?: number;
  defaultDiscountValue: number;
  defaultDiscountType: DiscountType;
  defaultGstRate: number;
  isGstApplicable: boolean;
  stockQty: number;
}

export interface CartLineItem {
  id: string;
  itemCode: string;
  itemName: string;
  mrp: number;
  qty: number;
  stockQty: number;
  discountValue: number;
  discountType: DiscountType;
  gstRate: number;
  isGstApplicable: boolean;
  
  // Computed values
  lineSubtotalMRP: number;     // mrp * qty
  lineDiscountAmount: number;  // total discount on this line
  lineTaxableAmount: number;   // taxable base amount
  lineGstAmount: number;       // total GST on this line
  lineCgstAmount: number;      // CGST (half)
  lineSgstAmount: number;      // SGST (half)
  lineGrandTotal: number;      // final line total payable
}

export interface CartTotals {
  itemCount: number;
  totalQty: number;
  subtotalMRP: number;
  itemDiscountsTotal: number;
  overallDiscountValue: number;
  overallDiscountType: DiscountType;
  overallDiscountAmount: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalGST: number;
  grandTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  createdAt: string; // ISO String
  counterNo?: string; // e.g. "Counter 1", "Counter 2"
  customerName?: string;
  customerPhone?: string;
  items: CartLineItem[];
  subtotalMRP: number;
  itemDiscountsTotal: number;
  overallDiscountValue?: number;
  overallDiscountType?: DiscountType;
  overallDiscountAmount?: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalGST: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  cashTendered?: number;
  changeReturned?: number;
  isEstimate?: boolean;
}

export interface HeldBill {
  id: string;
  holdName: string;
  createdAt: string;
  items: CartLineItem[];
  customerName?: string;
  customerPhone?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  gstin: string;
  invoicePrefix: string;
  receiptFooterNote: string;
  openingCashDrawer?: number;
  counterNo?: string; // Counter Identifier e.g. "Counter 1"
}

export interface PrinterConfig {
  baudRate: number;
  autoCut: boolean;
  openCashDrawer: boolean;
  printMode: 'usb' | 'serial' | 'browser';
  connectedPortName?: string;
  usbPrinterName?: string;
}

export interface PettyExpense {
  id: string;
  createdAt: string;
  category: 'Tea & Snacks' | 'Staff Salary / Advance' | 'Transport & Freight' | 'Maintenance' | 'Miscellaneous';
  amount: number;
  notes?: string;
  staffName?: string;
}

export interface DayClosingReport {
  id: string;
  closedAt: string;
  openingCash: number;
  totalCashSales: number;
  totalUpiSales: number;
  totalCardSales: number;
  totalPettyExpenses: number;
  expectedDrawerCash: number;
  actualDrawerCash: number;
  difference: number;
  totalInvoicesCount: number;
  totalRevenue: number;
}
