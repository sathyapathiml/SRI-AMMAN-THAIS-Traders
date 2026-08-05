// PostgreSQL implementation of the data access layer
// Replaces SQLite usage with pg pool

const { pool } = require('./pgClient.cjs');

// Initial inventory data (same as previous SQLite version)
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
  storeName: 'SRI AMMAN THAIS Traders',
  storeTagline: 'Whole Sale & Retail Crackers Superstore',
  addressLine1: 'Main Market Road, Near Town Clock Tower',
  addressLine2: 'Sivakasi / Chennai, Tamil Nadu - 600001',
  phone: '+91 98765 43210 / 044-2345678',
  gstin: '33AAAAA0000A1Z5',
  invoicePrefix: 'CRK-2026-',
  receiptFooterNote: 'Wish You A Happy & Safe Diwali! No Return / No Exchange.'
};

// Helper query functions
const queryAll = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows;
};

const queryGet = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows[0] || null;
};

const runSql = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res;
};

// Initialise database schema and seed data
(async () => {
  try {
    await runSql(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        itemCode TEXT UNIQUE,
        itemName TEXT,
        category TEXT,
        mrp REAL,
        wholesalePrice REAL DEFAULT 0,
        defaultDiscountValue REAL,
        defaultDiscountType TEXT,
        defaultGstRate REAL,
        isGstApplicable INTEGER,
        stockQty INTEGER
      )
    `);
    await runSql(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoiceNo TEXT UNIQUE,
        createdAt TEXT,
        counterNo TEXT,
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
    await runSql(`CREATE TABLE IF NOT EXISTS held_bills (id TEXT PRIMARY KEY, holdName TEXT, createdAt TEXT, items TEXT)`);
    await runSql(`CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, createdAt TEXT, category TEXT, amount REAL, notes TEXT, staffName TEXT)`);
    await runSql(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
    await runSql(`CREATE TABLE IF NOT EXISTS counter (key TEXT PRIMARY KEY, seq INTEGER)`);
    await runSql(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, email TEXT UNIQUE, password TEXT, role TEXT, createdAt TEXT)`);

    const invCount = await queryGet('SELECT COUNT(*) AS count FROM inventory');
    if (invCount && invCount.count === 0) {
      const insertInv = `INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
      for (const item of initialInventory) {
        await runSql(insertInv, [item.id, item.itemCode, item.itemName, item.category, item.mrp || 0, item.wholesalePrice || 0, item.defaultDiscountValue || 0, item.defaultDiscountType || 'percent', item.defaultGstRate || 0, item.isGstApplicable, item.stockQty || 0]);
      }
    }
    const settingsCount = await queryGet('SELECT COUNT(*) AS count FROM settings');
    if (settingsCount && settingsCount.count === 0) {
      await runSql('INSERT INTO settings (key, value) VALUES ($1,$2)', ['store', JSON.stringify(defaultStoreSettings)]);
    }
    const counterCount = await queryGet('SELECT COUNT(*) AS count FROM counter');
    if (counterCount && counterCount.count === 0) {
      await runSql('INSERT INTO counter (key, seq) VALUES ($1,$2)', ['inv', 100]);
    }
    const usersCount = await queryGet('SELECT COUNT(*) AS count FROM users');
    if (usersCount && usersCount.count === 0) {
      await runSql(`INSERT INTO users (id, username, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6)`, ['user-admin-1','Sathyapathi (Admin)','sathyapathi555@gmail.com','admin123','admin',new Date().toISOString()]);
      await runSql(`INSERT INTO users (id, username, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6)`, ['user-worker-1','Cashier One','cashier@store.com','worker123','worker',new Date().toISOString()]);
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
})();

module.exports = {
  // Inventory
  getInventory: async () => {
    const rows = await queryAll('SELECT * FROM inventory ORDER BY category ASC, itemCode ASC');
    return rows.map(r => ({ ...r, isGstApplicable: Boolean(r.isgstavailable) }));
  },
  saveInventoryItem: async (item) => {
    const sql = `INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO UPDATE SET itemCode=EXCLUDED.itemCode, itemName=EXCLUDED.itemName, category=EXCLUDED.category, mrp=EXCLUDED.mrp, wholesalePrice=EXCLUDED.wholesalePrice, defaultDiscountValue=EXCLUDED.defaultDiscountValue, defaultDiscountType=EXCLUDED.defaultDiscountType, defaultGstRate=EXCLUDED.defaultGstRate, isGstApplicable=EXCLUDED.isGstApplicable, stockQty=EXCLUDED.stockQty`;
    await runSql(sql, [item.id, item.itemCode, item.itemName, item.category, item.mrp || 0, item.wholesalePrice || 0, item.defaultDiscountValue || 0, item.defaultDiscountType || 'percent', item.defaultGstRate || 0, item.isGstApplicable ? 1 : 0, item.stockQty || 0]);
  },
  deleteInventoryItem: async (id) => {
    await runSql('DELETE FROM inventory WHERE id = $1 OR itemCode = $2', [id, id]);
  },
  importInventory: async (items) => {
    await runSql('BEGIN');
    try {
      await runSql('DELETE FROM inventory');
      const insertSql = `INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
      for (const item of items) {
        await runSql(insertSql, [item.id || (Date.now().toString() + Math.random().toString().slice(2,6)), item.itemCode, item.itemName, item.category || 'General', item.mrp || 0, item.wholesalePrice || 0, item.defaultDiscountValue || 0, item.defaultDiscountType || 'percent', item.defaultGstRate || 0, item.isGstApplicable ? 1 : 0, item.stockQty || 0]);
      }
      await runSql('COMMIT');
    } catch (e) {
      await runSql('ROLLBACK');
      throw e;
    }
  },
  resetInventory: async () => {
    await runSql('DELETE FROM inventory');
    const insertSql = `INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
    for (const item of initialInventory) {
      await runSql(insertSql, [item.id, item.itemCode, item.itemName, item.category, item.mrp || 0, item.wholesalePrice || 0, item.defaultDiscountValue || 0, item.defaultDiscountType || 'percent', item.defaultGstRate || 0, item.isGstApplicable, item.stockQty || 0]);
    }
  },

  // Invoices
  getInvoices: async () => {
    const rows = await queryAll('SELECT * FROM invoices ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
  },
  resetInvoices: async () => {
    await runSql('BEGIN');
    try {
      await runSql('DELETE FROM invoices');
      await runSql('UPDATE counter SET seq = 100 WHERE key = $1', ['inv']);
      await runSql('COMMIT');
    } catch (e) {
      await runSql('ROLLBACK');
      throw e;
    }
  },
  saveInvoice: async (invoiceData) => {
    await runSql('BEGIN');
    try {
      const counterRow = await queryGet('SELECT seq FROM counter WHERE key = $1', ['inv']);
      const seq = (counterRow ? counterRow.seq : 100) + 1;
      await runSql('UPDATE counter SET seq = $1 WHERE key = $2', [seq, 'inv']);
      const settingsRow = await queryGet('SELECT value FROM settings WHERE key = $1', ['store']);
      const settings = settingsRow ? JSON.parse(settingsRow.value) : defaultStoreSettings;
      const invoiceNo = `${settings.invoicePrefix}${seq.toString().padStart(5, '0')}`;
      const invoice = { ...invoiceData, invoiceNo, createdAt: invoiceData.createdAt || new Date().toISOString(), counterNo: invoiceData.counterNo || 'Counter 1' };
      await runSql(`INSERT INTO invoices (id, invoiceNo, createdAt, counterNo, customerName, customerPhone, items, subtotalMRP, totalDiscount, taxableAmount, totalCGST, totalSGST, totalGST, grandTotal, paymentMode, cashTendered, changeReturned) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [invoice.id, invoice.invoiceNo, invoice.createdAt, invoice.counterNo, invoice.customerName || null, invoice.customerPhone || null, JSON.stringify(invoice.items), invoice.subtotalMRP, invoice.totalDiscount, invoice.taxableAmount, invoice.totalCGST, invoice.totalSGST, invoice.totalGST, invoice.grandTotal, invoice.paymentMode, invoice.cashTendered || null, invoice.changeReturned || null]);
      for (const item of invoice.items) {
        await runSql('UPDATE inventory SET stockQty = GREATEST(0, stockQty - $1) WHERE itemCode = $2', [item.qty, item.itemCode]);
      }
      await runSql('COMMIT');
      return invoice;
    } catch (e) {
      await runSql('ROLLBACK');
      throw e;
    }
  },

  // Held bills
  getHeldBills: async () => {
    const rows = await queryAll('SELECT * FROM held_bills ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
  },
  saveHeldBill: async (bill) => {
    await runSql(`INSERT INTO held_bills (id, holdName, createdAt, items) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET holdName = EXCLUDED.holdName, createdAt = EXCLUDED.createdAt, items = EXCLUDED.items`, [bill.id, bill.holdName, bill.createdAt, JSON.stringify(bill.items)]);
  },
  deleteHeldBill: async (id) => {
    await runSql('DELETE FROM held_bills WHERE id = $1', [id]);
  },

  // Expenses
  getExpenses: async () => {
    return await queryAll('SELECT * FROM expenses ORDER BY createdAt DESC');
  },
  saveExpense: async (exp) => {
    await runSql(`INSERT INTO expenses (id, createdAt, category, amount, notes, staffName) VALUES ($1,$2,$3,$4,$5,$6)`, [exp.id, exp.createdAt, exp.category, exp.amount, exp.notes || null, exp.staffName || null]);
  },
  deleteExpense: async (id) => {
    await runSql('DELETE FROM expenses WHERE id = $1', [id]);
  },

  // Settings
  getSettings: async () => {
    const row = await queryGet('SELECT value FROM settings WHERE key = $1', ['store']);
    return row ? JSON.parse(row.value) : defaultStoreSettings;
  },
  saveSettings: async (settings) => {
    await runSql('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['store', JSON.stringify(settings)]);
  },

  // Auth & Users
  findUserByEmail: async (email) => {
    return await queryGet('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  },
  findUserByUsername: async (username) => {
    return await queryGet('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
  },
  createUser: async (user) => {
    await runSql(`INSERT INTO users (id, username, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6)`, [user.id, user.username, user.email, user.password, user.role, user.createdAt]);
    return user;
  },
  getUsers: async () => {
    const rows = await queryAll('SELECT id, username, email, role, createdAt FROM users ORDER BY createdAt DESC');
    return rows;
  }
};
