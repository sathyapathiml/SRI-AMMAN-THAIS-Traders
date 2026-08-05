import type { Item, Invoice, HeldBill, StoreSettings, PrinterConfig } from '../types/pos';
import { initialInventory } from '../data/initialInventory';

const STORAGE_KEYS = {
  INVENTORY: 'crackers_pos_inventory_v1',
  INVOICES: 'crackers_pos_invoices_v1',
  HELD_BILLS: 'crackers_pos_held_bills_v1',
  SETTINGS: 'crackers_pos_settings_v1',
  PRINTER: 'crackers_pos_printer_v1',
  INVOICE_COUNTER: 'crackers_pos_inv_counter_v1'
};

export const defaultStoreSettings: StoreSettings = {
  storeName: 'SRI AMMAN THAIS FIREWORKS & CRACKERS',
  storeTagline: 'Whole Sale & Retail Crackers Superstore',
  addressLine1: 'Main Market Road, Near Town Clock Tower',
  addressLine2: 'Sivakasi / Chennai, Tamil Nadu - 600001',
  phone: '+91 98765 43210 / 044-2345678',
  gstin: '33AAAAA0000A1Z5',
  invoicePrefix: 'CRK-2026-',
  receiptFooterNote: 'Wish You A Happy & Safe Diwali! No Return / No Exchange.'
};

export const defaultPrinterConfig: PrinterConfig = {
  baudRate: 9600,
  autoCut: true,
  openCashDrawer: true,
  printMode: 'browser'
};

export const sortInventoryCategoryWise = (items: Item[]): Item[] => {
  return [...items].sort((a, b) => {
    const catCompare = (a.category || '').localeCompare(b.category || '');
    if (catCompare !== 0) return catCompare;
    return (a.itemCode || '').localeCompare(b.itemCode || '', undefined, { numeric: true });
  });
};

export const getStoredInventory = (): Item[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!data) {
      const sorted = sortInventoryCategoryWise(initialInventory);
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(sorted));
      return sorted;
    }
    return sortInventoryCategoryWise(JSON.parse(data));
  } catch (err) {
    console.error('Failed to load inventory from localStorage', err);
    return sortInventoryCategoryWise(initialInventory);
  }
};

export const saveInventory = (items: Item[]): void => {
  try {
    const sorted = sortInventoryCategoryWise(items);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(sorted));
  } catch (err) {
    console.error('Failed to save inventory to localStorage', err);
  }
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load invoices', err);
    return [];
  }
};

export const resetStoredInvoices = (): Invoice[] => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVOICE_COUNTER, '100');
    return [];
  } catch (err) {
    console.error('Failed to reset invoices in localStorage', err);
    return [];
  }
};

export const saveInvoiceToDB = (invoice: Invoice): Invoice[] => {
  const invoices = getStoredInvoices();
  const updatedInvoices = [invoice, ...invoices];
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updatedInvoices));

  // Deduct stock levels from inventory
  const inventory = getStoredInventory();
  const updatedInventory = inventory.map(item => {
    const lineItem = invoice.items.find(i => i.itemCode === item.itemCode);
    if (lineItem) {
      const newStock = Math.max(0, item.stockQty - lineItem.qty);
      return { ...item, stockQty: newStock };
    }
    return item;
  });
  saveInventory(updatedInventory);

  return updatedInvoices;
};

export const getNextInvoiceNumber = (prefix: string): string => {
  try {
    const currentStr = localStorage.getItem(STORAGE_KEYS.INVOICE_COUNTER);
    let count = currentStr ? parseInt(currentStr, 10) : 100;
    count += 1;
    localStorage.setItem(STORAGE_KEYS.INVOICE_COUNTER, count.toString());
    return `${prefix}${count.toString().padStart(5, '0')}`;
  } catch (err) {
    console.error('Error generating invoice number', err);
    return `${prefix}${Date.now().toString().slice(-5)}`;
  }
};

export const getStoredHeldBills = (): HeldBill[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HELD_BILLS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load held bills', err);
    return [];
  }
};

export const saveHeldBillsToDB = (bills: HeldBill[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HELD_BILLS, JSON.stringify(bills));
  } catch (err) {
    console.error('Failed to save held bills', err);
  }
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return defaultStoreSettings;
    const parsed = JSON.parse(data);
    if (!parsed.storeName || !parsed.storeName.includes('AMMAN')) {
      parsed.storeName = 'SRI AMMAN THAIS FIREWORKS & CRACKERS';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    return defaultStoreSettings;
  }
};

export const saveSettingsToDB = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save store settings', err);
  }
};

export const getStoredPrinterConfig = (): PrinterConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRINTER);
    return data ? JSON.parse(data) : defaultPrinterConfig;
  } catch (err) {
    return defaultPrinterConfig;
  }
};

export const savePrinterConfigToDB = (config: PrinterConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save printer config', err);
  }
};

export const resetInventoryToDefault = (): Item[] => {
  saveInventory(initialInventory);
  return initialInventory;
};
