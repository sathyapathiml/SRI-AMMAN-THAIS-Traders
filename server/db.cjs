const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'billing.db');
const db = new sqlite3.Database(dbPath);

const initialInventory = [
  { id: '1', itemCode: 'CRK001', itemName: '10cm Electric Sparklers (10s)', category: 'Sparklers', mrp: 80, defaultDiscountValue: 10, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 150 },
  { id: '2', itemCode: 'CRK002', itemName: '30cm Deluxe Multi-Color Sparklers (10s)', category: 'Sparklers', mrp: 220, defaultDiscountValue: 15, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 120 },
  { id: '3', itemCode: 'CRK003', itemName: '50cm Crackling Sparklers Giant (5s)', category: 'Sparklers', mrp: 350, defaultDiscountValue: 20, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 85 },
  { id: '4', itemCode: 'CRK004', itemName: 'Special Flower Pots - Big (10s)', category: 'Fountains', mrp: 450, defaultDiscountValue: 15, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 90 },
  { id: '5', itemCode: 'CRK005', itemName: 'Color Koti Fountain Gold (5s)', category: 'Fountains', mrp: 320, defaultDiscountValue: 10, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 110 },
  { id: '6', itemCode: 'CRK006', itemName: 'Giant Ground Chakkars Special (10s)', category: 'Chakkars', mrp: 280, defaultDiscountValue: 10, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 140 },
  { id: '7', itemCode: 'CRK007', itemName: 'Whistling Ground Wheel Deluxe (5s)', category: 'Chakkars', mrp: 390, defaultDiscountValue: 15, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 75 },
  { id: '8', itemCode: 'CRK008', itemName: 'Atom Bomb Green Thunder (10s)', category: 'Sound Crackers', mrp: 260, defaultDiscountValue: 10, defaultDiscountType: 'percent', defaultGstRate: 28, isGstApplicable: 1, stockQty: 100 },
  { id: '9', itemCode: 'CRK009', itemName: '1000 Wala Red Garland Crackers', category: 'Sound Crackers', mrp: 1450, defaultDiscountValue: 20, defaultDiscountType: 'percent', defaultGstRate: 28, isGstApplicable: 1, stockQty: 45 },
  { id: '10', itemCode: 'CRK010', itemName: 'Deluxe Sky Rockets Pack (10s)', category: 'Rockets', mrp: 480, defaultDiscountValue: 15, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 60 },
  { id: '11', itemCode: 'CRK011', itemName: '12-Shot Fancy Aerial Repeater Cake', category: 'Aerial Shots', mrp: 950, defaultDiscountValue: 20, defaultDiscountType: 'percent', defaultGstRate: 28, isGstApplicable: 1, stockQty: 35 },
  { id: '12', itemCode: 'CRK012', itemName: '30-Shot Multi Color Fireworks Spectacle', category: 'Aerial Shots', mrp: 1850, defaultDiscountValue: 25, defaultDiscountType: 'percent', defaultGstRate: 28, isGstApplicable: 1, stockQty: 25 },
  { id: '13', itemCode: 'CRK013', itemName: 'Peacock Feather Fountain Large (3s)', category: 'Fountains', mrp: 380, defaultDiscountValue: 50, defaultDiscountType: 'flat', defaultGstRate: 18, isGstApplicable: 1, stockQty: 80 },
  { id: '14', itemCode: 'CRK014', itemName: 'Diwali Grand Family Gift Box (25 Items)', category: 'Gift Boxes', mrp: 2990, defaultDiscountValue: 30, defaultDiscountType: 'percent', defaultGstRate: 18, isGstApplicable: 1, stockQty: 30 },
  { id: '15', itemCode: 'CRK015', itemName: 'Twinkling Star Sparkler Pencils (10s)', category: 'Novelty', mrp: 120, defaultDiscountValue: 10, defaultDiscountType: 'flat', defaultGstRate: 18, isGstApplicable: 0, stockQty: 200 }
];

const defaultStoreSettings = {
  storeName: 'SRI LAKSHMI FIREWORKS & CRACKERS',
  storeTagline: 'Whole Sale & Retail Crackers Superstore',
  addressLine1: 'Main Market Road, Near Town Clock Tower',
  addressLine2: 'Sivakasi / Chennai, Tamil Nadu - 600001',
  phone: '+91 98765 43210 / 044-2345678',
  gstin: '33AAAAA0000A1Z5',
  invoicePrefix: 'CRK-2026-',
  receiptFooterNote: 'Wish You A Happy & Safe Diwali! No Return / No Exchange.'
};

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
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      createdAt TEXT,
      category TEXT,
      amount REAL,
      notes TEXT,
      staffName TEXT
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

  db.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
    if (!err && row.count === 0) {
      db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['store', JSON.stringify(defaultStoreSettings)]);
    }
  });

  db.get('SELECT COUNT(*) as count FROM counter', (err, row) => {
    if (!err && row.count === 0) {
      db.run('INSERT INTO counter (key, seq) VALUES (?, ?)', ['inv', 100]);
    }
  });
});

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

  getExpenses: async () => {
    return await queryAll('SELECT * FROM expenses ORDER BY createdAt DESC');
  },

  saveExpense: async (exp) => {
    await runSql(`
      INSERT INTO expenses (id, createdAt, category, amount, notes, staffName)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [exp.id, exp.createdAt, exp.category, exp.amount, exp.notes || null, exp.staffName || null]);
  },

  deleteExpense: async (id) => {
    await runSql('DELETE FROM expenses WHERE id = ?', [id]);
  },

  getSettings: async () => {
    const row = await queryGet('SELECT value FROM settings WHERE key = "store"');
    return row ? JSON.parse(row.value) : defaultStoreSettings;
  },

  saveSettings: async (settings) => {
    await runSql('INSERT INTO settings (key, value) VALUES ("store", ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [JSON.stringify(settings)]);
  }
};
