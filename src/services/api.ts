import type { Item, Invoice, HeldBill, StoreSettings, PettyExpense } from '../types/pos';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export interface LanHealth {
  status: string;
  lanIp: string;
  port: number;
}

export const fetchLanHealth = async (): Promise<LanHealth | null> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchLanInventory = async (): Promise<Item[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const saveLanInventoryItem = async (item: Item): Promise<Item[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const deleteLanInventoryItem = async (id: string): Promise<Item[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const resetLanInventory = async (): Promise<Item[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/inventory/reset`, { method: 'POST' });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const fetchLanInvoices = async (): Promise<Invoice[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/invoices`);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const postLanInvoice = async (invoice: Partial<Invoice>): Promise<{ invoice: Invoice; invoices: Invoice[]; inventory: Item[] } | null> => {
  try {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const fetchLanHeldBills = async (): Promise<HeldBill[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/held-bills`);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const saveLanHeldBill = async (bill: HeldBill): Promise<HeldBill[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/held-bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const deleteLanHeldBill = async (id: string): Promise<HeldBill[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/held-bills/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const fetchLanExpenses = async (): Promise<PettyExpense[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/expenses`);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const postLanExpense = async (expense: PettyExpense): Promise<PettyExpense[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const deleteLanExpense = async (id: string): Promise<PettyExpense[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const fetchLanSettings = async (): Promise<StoreSettings | null> => {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

export const saveLanSettings = async (settings: StoreSettings): Promise<StoreSettings | null> => {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};
