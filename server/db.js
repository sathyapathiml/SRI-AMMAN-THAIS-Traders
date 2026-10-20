const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'billing.db');
const db = new sqlite3.Database(dbPath);

const { items } = require('./priceListData.cjs');

const initialInventory = items.map(item => ({
  id: item.id,
  itemCode: item.itemCode,
  itemName: item.itemName,
  category: item.category,
  mrp: item.mrp,
  wholesalePrice: item.wholesalePrice,
  defaultDiscountValue: 0,
  defaultDiscountType: 'percent',
  defaultGstRate: 0,
  isGstApplicable: 0,
  stockQty: 100
}));

const defaultStoreSettings = {
  storeName: 'SRI AMMAN THAIS Traders',
  storeTagline: 'Whole Sale & Retail Crackers Superstore',
  addressLine1: '30/11 B, Periyavilai',
  addressLine2: 'Eathamozhi, Kanyakumari - 629501',
  phone: '+91 8778436718 / +91 8903936798',
  gstin: '33ELHPG2737NIZV',
  invoicePrefix: 'CRK-2026-',
  receiptFooterNote: 'Wish You A Happy & Safe Diwali!'
};

// Initialize Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      itemCode TEXT UNIQUE,
      itemName TEXT,
      category TEXT,
      mrp REAL,
      defaultDiscountValue REAL,
      defaultDiscountType TEXT,
      defaultGstRate REAL,
      isGstApplicable INTEGER,
      stockQty INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoiceNo TEXT UNIQUE,
      createdAt TEXT,
      customerName TEXT,
      customerPhone TEXT,
      items TEXT,
      subtotalMRP REAL,
      totalDiscount REAL,
      taxableAmount REAL,
      totalCGST REAL,
      totalSGST REAL,
      totalGST REAL,
      grandTotal REAL,
      paymentMode TEXT,
      cashTendered REAL,
      changeReturned REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS held_bills (
      id TEXT PRIMARY KEY,
      holdName TEXT,
      createdAt TEXT,
      items TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS counter (
      key TEXT PRIMARY KEY,
      seq INTEGER
    )
  `);

  // Seed inventory if empty
  db.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO inventory (id, itemCode, itemName, category, mrp, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      initialInventory.forEach(item => {
        stmt.run(item.id, item.itemCode, item.itemName, item.category, item.mrp, item.defaultDiscountValue, item.defaultDiscountType, item.defaultGstRate, item.isGstApplicable, item.stockQty);
      });
      stmt.finalize();
    }
  });

  // Seed settings if empty
  db.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
    if (!err && row.count === 0) {
      db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['store', JSON.stringify(defaultStoreSettings)]);
    }
  });

  // Seed counter if empty
  db.get('SELECT COUNT(*) as count FROM counter', (err, row) => {
    if (!err && row.count === 0) {
      db.run('INSERT INTO counter (key, seq) VALUES (?, ?)', ['inv', 100]);
    }
  });
});

// Helper Promise wrappers
const queryAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const queryGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const runSql = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});

module.exports = {
  getInventory: async () => {
    const rows = await queryAll('SELECT * FROM inventory ORDER BY itemCode ASC');
    return rows.map(r => ({ ...r, isGstApplicable: Boolean(r.isGstApplicable) }));
  },

  saveInventoryItem: async (item) => {
    await runSql(`
      INSERT INTO inventory (id, itemCode, itemName, category, mrp, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        itemCode=excluded.itemCode,
        itemName=excluded.itemName,
        category=excluded.category,
        mrp=excluded.mrp,
        defaultDiscountValue=excluded.defaultDiscountValue,
        defaultDiscountType=excluded.defaultDiscountType,
        defaultGstRate=excluded.defaultGstRate,
        isGstApplicable=excluded.isGstApplicable,
        stockQty=excluded.stockQty
    `, [item.id, item.itemCode, item.itemName, item.category, item.mrp, item.defaultDiscountValue, item.defaultDiscountType, item.defaultGstRate, item.isGstApplicable ? 1 : 0, item.stockQty]);
  },

  deleteInventoryItem: async (id) => {
    await runSql('DELETE FROM inventory WHERE id = ?', [id]);
  },

  resetInventory: async () => {
    await runSql('DELETE FROM inventory');
    const stmt = db.prepare(`
      INSERT INTO inventory (id, itemCode, itemName, category, mrp, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialInventory.forEach(item => {
      stmt.run(item.id, item.itemCode, item.itemName, item.category, item.mrp, item.defaultDiscountValue, item.defaultDiscountType, item.defaultGstRate, item.isGstApplicable, item.stockQty);
    });
    stmt.finalize();
  },

  getInvoices: async () => {
    const rows = await queryAll('SELECT * FROM invoices ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
  },

  saveInvoice: async (invoiceData) => {
    // Atomic invoice generation & stock deduction
    await runSql('BEGIN TRANSACTION');
    try {
      const counterRow = await queryGet('SELECT seq FROM counter WHERE key = "inv"');
      const seq = (counterRow ? counterRow.seq : 100) + 1;
      await runSql('UPDATE counter SET seq = ? WHERE key = "inv"', [seq]);

      const prefixRow = await queryGet('SELECT value FROM settings WHERE key = "store"');
      const settings = prefixRow ? JSON.parse(prefixRow.value) : defaultStoreSettings;
      const invoiceNo = `${settings.invoicePrefix}${seq.toString().padStart(5, '0')}`;

      const invoice = {
        ...invoiceData,
        invoiceNo,
        createdAt: invoiceData.createdAt || new Date().toISOString()
      };

      await runSql(`
        INSERT INTO invoices (id, invoiceNo, createdAt, customerName, customerPhone, items, subtotalMRP, totalDiscount, taxableAmount, totalCGST, totalSGST, totalGST, grandTotal, paymentMode, cashTendered, changeReturned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoice.id, invoice.invoiceNo, invoice.createdAt, invoice.customerName || null, invoice.customerPhone || null,
        JSON.stringify(invoice.items), invoice.subtotalMRP, invoice.totalDiscount, invoice.taxableAmount,
        invoice.totalCGST, invoice.totalSGST, invoice.totalGST, invoice.grandTotal, invoice.paymentMode,
        invoice.cashTendered || null, invoice.changeReturned || null
      ]);

      // Deduct stock for items
      for (const item of invoice.items) {
        await runSql('UPDATE inventory SET stockQty = MAX(0, stockQty - ?) WHERE itemCode = ?', [item.qty, item.itemCode]);
      }

      await runSql('COMMIT');
      return invoice;
    } catch (err) {
      await runSql('ROLLBACK');
      throw err;
    }
  },

  getHeldBills: async () => {
    const rows = await queryAll('SELECT * FROM held_bills ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
  },

  saveHeldBill: async (bill) => {
    await runSql(`
      INSERT INTO held_bills (id, holdName, createdAt, items)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET items=excluded.items
    `, [bill.id, bill.holdName, bill.createdAt, JSON.stringify(bill.items)]);
  },

  deleteHeldBill: async (id) => {
    await runSql('DELETE FROM held_bills WHERE id = ?', [id]);
  },

  getSettings: async () => {
    const row = await queryGet('SELECT value FROM settings WHERE key = "store"');
    return row ? JSON.parse(row.value) : defaultStoreSettings;
  },

  saveSettings: async (settings) => {
    await runSql('INSERT INTO settings (key, value) VALUES ("store", ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [JSON.stringify(settings)]);
  }
};
