const path = require('path');
const { pool } = require('./pgClient.cjs');

const isPostgres = Boolean(pool);

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

let sqliteDb = null;

if (!isPostgres) {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'billing.db');
  sqliteDb = new sqlite3.Database(dbPath);

  sqliteDb.serialize(() => {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        itemCode TEXT UNIQUE,
        itemName TEXT,
        category TEXT,
        mrp REAL,
        wholesalePrice REAL,
        defaultDiscountValue REAL,
        defaultDiscountType TEXT,
        defaultGstRate REAL,
        isGstApplicable INTEGER,
        stockQty INTEGER
      )
    `);

    sqliteDb.run(`
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

    sqliteDb.run('ALTER TABLE inventory ADD COLUMN wholesalePrice REAL', () => {});
    sqliteDb.run('ALTER TABLE invoices ADD COLUMN counterNo TEXT', () => {});

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS held_bills (
        id TEXT PRIMARY KEY,
        holdName TEXT,
        createdAt TEXT,
        items TEXT
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        createdAt TEXT,
        category TEXT,
        amount REAL,
        notes TEXT,
        staffName TEXT
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS counter (
        key TEXT PRIMARY KEY,
        seq INTEGER
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        createdAt TEXT
      )
    `);

    sqliteDb.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
      if (!err && row && row.count === 0) {
        const stmt = sqliteDb.prepare(`
          INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        initialInventory.forEach(item => {
          stmt.run(item.id, item.itemCode, item.itemName, item.category, item.mrp, item.wholesalePrice || 0, item.defaultDiscountValue, item.defaultDiscountType, item.defaultGstRate, item.isGstApplicable, item.stockQty);
        });
        stmt.finalize();
      }
    });

    sqliteDb.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
      if (!err && row && row.count === 0) {
        sqliteDb.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['store', JSON.stringify(defaultStoreSettings)]);
      }
    });

    sqliteDb.get('SELECT COUNT(*) as count FROM counter', (err, row) => {
      if (!err && row && row.count === 0) {
        sqliteDb.run('INSERT INTO counter (key, seq) VALUES (?, ?)', ['inv', 100]);
      }
    });

    sqliteDb.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (!err && row && row.count === 0) {
        const stmt = sqliteDb.prepare(`
          INSERT INTO users (id, username, email, password, role, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run('user-admin-1', 'Sathyapathi (Admin)', 'sathyapathi555@gmail.com', 'admin123', 'admin', new Date().toISOString());
        stmt.run('user-worker-1', 'Cashier One', 'cashier@store.com', 'worker123', 'worker', new Date().toISOString());
        stmt.finalize();
      }
    });
  });
}

// Helper query functions for SQLite
const sqliteQueryAll = (sql, params = []) => new Promise((resolve, reject) => {
  sqliteDb.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
});

const sqliteQueryGet = (sql, params = []) => new Promise((resolve, reject) => {
  sqliteDb.get(sql, params, (err, row) => err ? reject(err) : resolve(row || null));
});

const sqliteRunSql = (sql, params = []) => new Promise((resolve, reject) => {
  sqliteDb.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});

// Helper query functions for PostgreSQL
const pgQueryAll = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows || [];
};

const pgQueryGet = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows[0] || null;
};

const pgRunSql = async (sql, params = []) => {
  return await pool.query(sql, params);
};

// PostgreSQL Schema Init
if (isPostgres) {
  (async () => {
    try {
      await pgRunSql(`
        CREATE TABLE IF NOT EXISTS "inventory" (
          "id" TEXT PRIMARY KEY,
          "itemCode" TEXT UNIQUE,
          "itemName" TEXT,
          "category" TEXT,
          "mrp" REAL,
          "wholesalePrice" REAL DEFAULT 0,
          "defaultDiscountValue" REAL,
          "defaultDiscountType" TEXT,
          "defaultGstRate" REAL,
          "isGstApplicable" INTEGER,
          "stockQty" INTEGER
        )
      `);

      await pgRunSql(`
        CREATE TABLE IF NOT EXISTS "invoices" (
          "id" TEXT PRIMARY KEY,
          "invoiceNo" TEXT UNIQUE,
          "createdAt" TEXT,
          "counterNo" TEXT,
          "customerName" TEXT,
          "customerPhone" TEXT,
          "items" TEXT,
          "subtotalMRP" REAL,
          "totalDiscount" REAL,
          "taxableAmount" REAL,
          "totalCGST" REAL,
          "totalSGST" REAL,
          "totalGST" REAL,
          "grandTotal" REAL,
          "paymentMode" TEXT,
          "cashTendered" REAL,
          "changeReturned" REAL
        )
      `);

      await pgRunSql(`CREATE TABLE IF NOT EXISTS "held_bills" ("id" TEXT PRIMARY KEY, "holdName" TEXT, "createdAt" TEXT, "items" TEXT)`);
      await pgRunSql(`CREATE TABLE IF NOT EXISTS "expenses" ("id" TEXT PRIMARY KEY, "createdAt" TEXT, "category" TEXT, "amount" REAL, "notes" TEXT, "staffName" TEXT)`);
      await pgRunSql(`CREATE TABLE IF NOT EXISTS "settings" ("key" TEXT PRIMARY KEY, "value" TEXT)`);
      await pgRunSql(`CREATE TABLE IF NOT EXISTS "counter" ("key" TEXT PRIMARY KEY, "seq" INTEGER)`);
      await pgRunSql(`CREATE TABLE IF NOT EXISTS "users" ("id" TEXT PRIMARY KEY, "username" TEXT UNIQUE, "email" TEXT UNIQUE, "password" TEXT, "role" TEXT, "createdAt" TEXT)`);

      const invCount = await pgQueryGet('SELECT COUNT(*) AS count FROM "inventory"');
      if (invCount && parseInt(invCount.count, 10) === 0) {
        for (const item of initialInventory) {
          await pgRunSql(
            `INSERT INTO "inventory" ("id", "itemCode", "itemName", "category", "mrp", "wholesalePrice", "defaultDiscountValue", "defaultDiscountType", "defaultGstRate", "isGstApplicable", "stockQty")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,
            [item.id, item.itemCode, item.itemName, item.category, item.mrp || 0, item.wholesalePrice || 0, item.defaultDiscountValue || 0, item.defaultDiscountType || 'percent', item.defaultGstRate || 0, item.isGstApplicable ? 1 : 0, item.stockQty || 0]
          );
        }
      }

      const settingsCount = await pgQueryGet('SELECT COUNT(*) AS count FROM "settings"');
      if (settingsCount && parseInt(settingsCount.count, 10) === 0) {
        await pgRunSql('INSERT INTO "settings" ("key", "value") VALUES ($1, $2) ON CONFLICT DO NOTHING', ['store', JSON.stringify(defaultStoreSettings)]);
      }

      const counterCount = await pgQueryGet('SELECT COUNT(*) AS count FROM "counter"');
      if (counterCount && parseInt(counterCount.count, 10) === 0) {
        await pgRunSql('INSERT INTO "counter" ("key", "seq") VALUES ($1, $2) ON CONFLICT DO NOTHING', ['inv', 100]);
      }

      const usersCount = await pgQueryGet('SELECT COUNT(*) AS count FROM "users"');
      if (usersCount && parseInt(usersCount.count, 10) === 0) {
        await pgRunSql(`INSERT INTO "users" ("id", "username", "email", "password", "role", "createdAt") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`, ['user-admin-1','Sathyapathi (Admin)','sathyapathi555@gmail.com','admin123','admin',new Date().toISOString()]);
        await pgRunSql(`INSERT INTO "users" ("id", "username", "email", "password", "role", "createdAt") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`, ['user-worker-1','Cashier One','cashier@store.com','worker123','worker',new Date().toISOString()]);
      }
    } catch (err) {
      console.error('PostgreSQL initialization error:', err);
    }
  })();
}

module.exports = {
  // Inventory
  getInventory: async () => {
    if (isPostgres) {
      const rows = await pgQueryAll('SELECT * FROM "inventory" ORDER BY "category" ASC, "itemCode" ASC');
      return rows.map(r => ({
        id: r.id,
        itemCode: r.itemCode,
        itemName: r.itemName,
        category: r.category,
        mrp: Number(r.mrp),
        wholesalePrice: Number(r.wholesalePrice || 0),
        defaultDiscountValue: Number(r.defaultDiscountValue || 0),
        defaultDiscountType: r.defaultDiscountType || 'percent',
        defaultGstRate: Number(r.defaultGstRate || 0),
        isGstApplicable: Boolean(r.isGstApplicable),
        stockQty: Number(r.stockQty || 0)
      }));
    } else {
      const rows = await sqliteQueryAll('SELECT * FROM inventory ORDER BY category ASC, itemCode ASC');
      return rows.map(r => ({ ...r, isGstApplicable: Boolean(r.isGstApplicable) }));
    }
  },

  saveInventoryItem: async (item) => {
    if (isPostgres) {
      const sql = `
        INSERT INTO "inventory" ("id", "itemCode", "itemName", "category", "mrp", "wholesalePrice", "defaultDiscountValue", "defaultDiscountType", "defaultGstRate", "isGstApplicable", "stockQty")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT ("id") DO UPDATE SET
          "itemCode"=EXCLUDED."itemCode",
          "itemName"=EXCLUDED."itemName",
          "category"=EXCLUDED."category",
          "mrp"=EXCLUDED."mrp",
          "wholesalePrice"=EXCLUDED."wholesalePrice",
          "defaultDiscountValue"=EXCLUDED."defaultDiscountValue",
          "defaultDiscountType"=EXCLUDED."defaultDiscountType",
          "defaultGstRate"=EXCLUDED."defaultGstRate",
          "isGstApplicable"=EXCLUDED."isGstApplicable",
          "stockQty"=EXCLUDED."stockQty"
      `;
      await pgRunSql(sql, [
        item.id,
        item.itemCode,
        item.itemName,
        item.category,
        item.mrp || 0,
        item.wholesalePrice || 0,
        item.defaultDiscountValue || 0,
        item.defaultDiscountType || 'percent',
        item.defaultGstRate || 0,
        item.isGstApplicable ? 1 : 0,
        item.stockQty || 0
      ]);
    } else {
      await sqliteRunSql(`
        INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          itemCode=excluded.itemCode,
          itemName=excluded.itemName,
          category=excluded.category,
          mrp=excluded.mrp,
          wholesalePrice=excluded.wholesalePrice,
          defaultDiscountValue=excluded.defaultDiscountValue,
          defaultDiscountType=excluded.defaultDiscountType,
          defaultGstRate=excluded.defaultGstRate,
          isGstApplicable=excluded.isGstApplicable,
          stockQty=excluded.stockQty
      `, [
        item.id,
        item.itemCode,
        item.itemName,
        item.category,
        item.mrp || 0,
        item.wholesalePrice || 0,
        item.defaultDiscountValue || 0,
        item.defaultDiscountType || 'percent',
        item.defaultGstRate || 0,
        item.isGstApplicable ? 1 : 0,
        item.stockQty || 0
      ]);
    }
  },

  deleteInventoryItem: async (id) => {
    if (isPostgres) {
      await pgRunSql('DELETE FROM "inventory" WHERE "id" = $1 OR "itemCode" = $2', [id, id]);
    } else {
      await sqliteRunSql('DELETE FROM inventory WHERE id = ? OR itemCode = ?', [id, id]);
    }
  },

  importInventory: async (items) => {
    if (isPostgres) {
      await pgRunSql('BEGIN');
      try {
        await pgRunSql('DELETE FROM "inventory"');
        const insertSql = `
          INSERT INTO "inventory" ("id", "itemCode", "itemName", "category", "mrp", "wholesalePrice", "defaultDiscountValue", "defaultDiscountType", "defaultGstRate", "isGstApplicable", "stockQty")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `;
        for (const item of items) {
          await pgRunSql(insertSql, [
            item.id || (Date.now().toString() + Math.random().toString().slice(2, 6)),
            item.itemCode,
            item.itemName,
            item.category || 'General',
            item.mrp || 0,
            item.wholesalePrice || 0,
            item.defaultDiscountValue || 0,
            item.defaultDiscountType || 'percent',
            item.defaultGstRate || 0,
            item.isGstApplicable ? 1 : 0,
            item.stockQty || 0
          ]);
        }
        await pgRunSql('COMMIT');
      } catch (e) {
        await pgRunSql('ROLLBACK');
        throw e;
      }
    } else {
      await sqliteRunSql('BEGIN TRANSACTION');
      try {
        await sqliteRunSql('DELETE FROM inventory');
        for (const item of items) {
          await sqliteRunSql(`
            INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.id || (Date.now().toString() + Math.random().toString().slice(2, 6)),
            item.itemCode,
            item.itemName,
            item.category || 'General',
            item.mrp || 0,
            item.wholesalePrice || 0,
            item.defaultDiscountValue || 0,
            item.defaultDiscountType || 'percent',
            item.defaultGstRate || 0,
            item.isGstApplicable ? 1 : 0,
            item.stockQty || 0
          ]);
        }
        await sqliteRunSql('COMMIT');
      } catch (err) {
        await sqliteRunSql('ROLLBACK');
        throw err;
      }
    }
  },

  resetInventory: async () => {
    if (isPostgres) {
      await pgRunSql('BEGIN');
      try {
        await pgRunSql('DELETE FROM "inventory"');
        const insertSql = `
          INSERT INTO "inventory" ("id", "itemCode", "itemName", "category", "mrp", "wholesalePrice", "defaultDiscountValue", "defaultDiscountType", "defaultGstRate", "isGstApplicable", "stockQty")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `;
        for (const item of initialInventory) {
          await pgRunSql(insertSql, [
            item.id,
            item.itemCode,
            item.itemName,
            item.category,
            item.mrp || 0,
            item.wholesalePrice || 0,
            item.defaultDiscountValue || 0,
            item.defaultDiscountType || 'percent',
            item.defaultGstRate || 0,
            item.isGstApplicable ? 1 : 0,
            item.stockQty || 0
          ]);
        }
        await pgRunSql('COMMIT');
      } catch (e) {
        await pgRunSql('ROLLBACK');
        throw e;
      }
    } else {
      await sqliteRunSql('DELETE FROM inventory');
      for (const item of initialInventory) {
        await sqliteRunSql(`
          INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.id,
          item.itemCode,
          item.itemName,
          item.category,
          item.mrp || 0,
          item.wholesalePrice || 0,
          item.defaultDiscountValue || 0,
          item.defaultDiscountType || 'percent',
          item.defaultGstRate || 0,
          item.isGstApplicable ? 1 : 0,
          item.stockQty || 0
        ]);
      }
    }
  },

  // Invoices
  getInvoices: async () => {
    if (isPostgres) {
      const rows = await pgQueryAll('SELECT * FROM "invoices" ORDER BY "createdAt" DESC');
      return rows.map(r => ({
        id: r.id,
        invoiceNo: r.invoiceNo,
        createdAt: r.createdAt,
        counterNo: r.counterNo,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        items: JSON.parse(r.items),
        subtotalMRP: Number(r.subtotalMRP),
        totalDiscount: Number(r.totalDiscount),
        taxableAmount: Number(r.taxableAmount),
        totalCGST: Number(r.totalCGST),
        totalSGST: Number(r.totalSGST),
        totalGST: Number(r.totalGST),
        grandTotal: Number(r.grandTotal),
        paymentMode: r.paymentMode,
        cashTendered: r.cashTendered ? Number(r.cashTendered) : null,
        changeReturned: r.changeReturned ? Number(r.changeReturned) : null
      }));
    } else {
      const rows = await sqliteQueryAll('SELECT * FROM invoices ORDER BY createdAt DESC');
      return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    }
  },

  resetInvoices: async () => {
    if (isPostgres) {
      await pgRunSql('BEGIN');
      try {
        await pgRunSql('DELETE FROM "invoices"');
        await pgRunSql('UPDATE "counter" SET "seq" = 100 WHERE "key" = $1', ['inv']);
        await pgRunSql('COMMIT');
      } catch (e) {
        await pgRunSql('ROLLBACK');
        throw e;
      }
    } else {
      await sqliteRunSql('BEGIN TRANSACTION');
      try {
        await sqliteRunSql('DELETE FROM invoices');
        await sqliteRunSql('UPDATE counter SET seq = 100 WHERE key = "inv"');
        await sqliteRunSql('COMMIT');
      } catch (err) {
        await sqliteRunSql('ROLLBACK');
        throw err;
      }
    }
  },

  saveInvoice: async (invoiceData) => {
    if (isPostgres) {
      await pgRunSql('BEGIN');
      try {
        const counterRow = await pgQueryGet('SELECT "seq" FROM "counter" WHERE "key" = $1', ['inv']);
        const seq = (counterRow ? parseInt(counterRow.seq, 10) : 100) + 1;
        await pgRunSql('UPDATE "counter" SET "seq" = $1 WHERE "key" = $2', [seq, 'inv']);

        const settingsRow = await pgQueryGet('SELECT "value" FROM "settings" WHERE "key" = $1', ['store']);
        const settings = settingsRow ? JSON.parse(settingsRow.value) : defaultStoreSettings;
        const invoiceNo = `${settings.invoicePrefix}${seq.toString().padStart(5, '0')}`;

        const invoice = {
          ...invoiceData,
          invoiceNo,
          createdAt: invoiceData.createdAt || new Date().toISOString(),
          counterNo: invoiceData.counterNo || 'Counter 1'
        };

        await pgRunSql(`
          INSERT INTO "invoices" ("id", "invoiceNo", "createdAt", "counterNo", "customerName", "customerPhone", "items", "subtotalMRP", "totalDiscount", "taxableAmount", "totalCGST", "totalSGST", "totalGST", "grandTotal", "paymentMode", "cashTendered", "changeReturned")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        `, [
          invoice.id, invoice.invoiceNo, invoice.createdAt, invoice.counterNo, invoice.customerName || null, invoice.customerPhone || null,
          JSON.stringify(invoice.items), invoice.subtotalMRP, invoice.totalDiscount, invoice.taxableAmount,
          invoice.totalCGST, invoice.totalSGST, invoice.totalGST, invoice.grandTotal, invoice.paymentMode,
          invoice.cashTendered || null, invoice.changeReturned || null
        ]);

        for (const item of invoice.items) {
          await pgRunSql('UPDATE "inventory" SET "stockQty" = GREATEST(0, "stockQty" - $1) WHERE "itemCode" = $2', [item.qty, item.itemCode]);
        }

        await pgRunSql('COMMIT');
        return invoice;
      } catch (e) {
        await pgRunSql('ROLLBACK');
        throw e;
      }
    } else {
      await sqliteRunSql('BEGIN TRANSACTION');
      try {
        const counterRow = await sqliteQueryGet('SELECT seq FROM counter WHERE key = "inv"');
        const seq = (counterRow ? counterRow.seq : 100) + 1;
        await sqliteRunSql('UPDATE counter SET seq = ? WHERE key = "inv"', [seq]);

        const prefixRow = await sqliteQueryGet('SELECT value FROM settings WHERE key = "store"');
        const settings = prefixRow ? JSON.parse(prefixRow.value) : defaultStoreSettings;
        const invoiceNo = `${settings.invoicePrefix}${seq.toString().padStart(5, '0')}`;

        const invoice = {
          ...invoiceData,
          invoiceNo,
          createdAt: invoiceData.createdAt || new Date().toISOString(),
          counterNo: invoiceData.counterNo || 'Counter 1'
        };

        await sqliteRunSql(`
          INSERT INTO invoices (id, invoiceNo, createdAt, counterNo, customerName, customerPhone, items, subtotalMRP, totalDiscount, taxableAmount, totalCGST, totalSGST, totalGST, grandTotal, paymentMode, cashTendered, changeReturned)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoice.id, invoice.invoiceNo, invoice.createdAt, invoice.counterNo, invoice.customerName || null, invoice.customerPhone || null,
          JSON.stringify(invoice.items), invoice.subtotalMRP, invoice.totalDiscount, invoice.taxableAmount,
          invoice.totalCGST, invoice.totalSGST, invoice.totalGST, invoice.grandTotal, invoice.paymentMode,
          invoice.cashTendered || null, invoice.changeReturned || null
        ]);

        for (const item of invoice.items) {
          await sqliteRunSql('UPDATE inventory SET stockQty = MAX(0, stockQty - ?) WHERE itemCode = ?', [item.qty, item.itemCode]);
        }

        await sqliteRunSql('COMMIT');
        return invoice;
      } catch (err) {
        await sqliteRunSql('ROLLBACK');
        throw err;
      }
    }
  },

  // Held bills
  getHeldBills: async () => {
    if (isPostgres) {
      const rows = await pgQueryAll('SELECT * FROM "held_bills" ORDER BY "createdAt" DESC');
      return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    } else {
      const rows = await sqliteQueryAll('SELECT * FROM held_bills ORDER BY createdAt DESC');
      return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    }
  },

  saveHeldBill: async (bill) => {
    if (isPostgres) {
      await pgRunSql(`
        INSERT INTO "held_bills" ("id", "holdName", "createdAt", "items")
        VALUES ($1,$2,$3,$4)
        ON CONFLICT ("id") DO UPDATE SET "holdName" = EXCLUDED."holdName", "createdAt" = EXCLUDED."createdAt", "items" = EXCLUDED."items"
      `, [bill.id, bill.holdName, bill.createdAt, JSON.stringify(bill.items)]);
    } else {
      await sqliteRunSql(`
        INSERT INTO held_bills (id, holdName, createdAt, items)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET items=excluded.items
      `, [bill.id, bill.holdName, bill.createdAt, JSON.stringify(bill.items)]);
    }
  },

  deleteHeldBill: async (id) => {
    if (isPostgres) {
      await pgRunSql('DELETE FROM "held_bills" WHERE "id" = $1', [id]);
    } else {
      await sqliteRunSql('DELETE FROM held_bills WHERE id = ?', [id]);
    }
  },

  // Expenses
  getExpenses: async () => {
    if (isPostgres) {
      const rows = await pgQueryAll('SELECT * FROM "expenses" ORDER BY "createdAt" DESC');
      return rows.map(r => ({ ...r, amount: Number(r.amount) }));
    } else {
      return await sqliteQueryAll('SELECT * FROM expenses ORDER BY createdAt DESC');
    }
  },

  saveExpense: async (exp) => {
    if (isPostgres) {
      await pgRunSql(`
        INSERT INTO "expenses" ("id", "createdAt", "category", "amount", "notes", "staffName")
        VALUES ($1,$2,$3,$4,$5,$6)
      `, [exp.id, exp.createdAt, exp.category, exp.amount, exp.notes || null, exp.staffName || null]);
    } else {
      await sqliteRunSql(`
        INSERT INTO expenses (id, createdAt, category, amount, notes, staffName)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [exp.id, exp.createdAt, exp.category, exp.amount, exp.notes || null, exp.staffName || null]);
    }
  },

  deleteExpense: async (id) => {
    if (isPostgres) {
      await pgRunSql('DELETE FROM "expenses" WHERE "id" = $1', [id]);
    } else {
      await sqliteRunSql('DELETE FROM expenses WHERE id = ?', [id]);
    }
  },

  // Settings
  getSettings: async () => {
    if (isPostgres) {
      const row = await pgQueryGet('SELECT "value" FROM "settings" WHERE "key" = $1', ['store']);
      return row ? JSON.parse(row.value) : defaultStoreSettings;
    } else {
      const row = await sqliteQueryGet('SELECT value FROM settings WHERE key = "store"');
      return row ? JSON.parse(row.value) : defaultStoreSettings;
    }
  },

  saveSettings: async (settings) => {
    if (isPostgres) {
      await pgRunSql('INSERT INTO "settings" ("key", "value") VALUES ($1,$2) ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"', ['store', JSON.stringify(settings)]);
    } else {
      await sqliteRunSql('INSERT INTO settings (key, value) VALUES ("store", ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [JSON.stringify(settings)]);
    }
  },

  // Auth & Users
  findUserByEmail: async (email) => {
    if (isPostgres) {
      return await pgQueryGet('SELECT * FROM "users" WHERE LOWER("email") = LOWER($1)', [email]);
    } else {
      return await sqliteQueryGet('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    }
  },

  findUserByUsername: async (username) => {
    if (isPostgres) {
      return await pgQueryGet('SELECT * FROM "users" WHERE LOWER("username") = LOWER($1)', [username]);
    } else {
      return await sqliteQueryGet('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
    }
  },

  createUser: async (user) => {
    if (isPostgres) {
      await pgRunSql(`
        INSERT INTO "users" ("id", "username", "email", "password", "role", "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6)
      `, [user.id, user.username, user.email, user.password, user.role, user.createdAt]);
      return user;
    } else {
      await sqliteRunSql(`
        INSERT INTO users (id, username, email, password, role, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.id, user.username, user.email, user.password, user.role, user.createdAt]);
      return user;
    }
  },

  getUsers: async () => {
    if (isPostgres) {
      return await pgQueryAll('SELECT "id", "username", "email", "role", "createdAt" FROM "users" ORDER BY "createdAt" DESC');
    } else {
      return await sqliteQueryAll('SELECT id, username, email, role, createdAt FROM users ORDER BY createdAt DESC');
    }
  }
};
