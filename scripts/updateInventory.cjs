const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { items } = require('../server/priceListData.cjs');

console.log(`Processing ${items.length} items from 2026 Price List...`);

// 1. Generate src/data/initialInventory.ts
const tsItems = items.map(item => `  {
    id: '${item.id}',
    itemCode: '${item.itemCode}',
    itemName: ${JSON.stringify(item.itemName)},
    category: ${JSON.stringify(item.category)},
    mrp: ${item.mrp},
    wholesalePrice: ${item.wholesalePrice},
    defaultDiscountValue: 0,
    defaultDiscountType: 'percent',
    defaultGstRate: 0,
    isGstApplicable: false,
    stockQty: 100
  }`).join(',\n');

const tsContent = `import type { Item } from '../types/pos';

export const initialInventory: Item[] = [
${tsItems}
];
`;

const tsFilePath = path.join(__dirname, '../src/data/initialInventory.ts');
fs.writeFileSync(tsFilePath, tsContent, 'utf-8');
console.log(`Updated ${tsFilePath} with ${items.length} items.`);

// 2. Update SQLite billing.db
const dbPath = path.join(__dirname, '../server/billing.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
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

  db.run('DELETE FROM inventory', (err) => {
    if (err) {
      console.error('Error clearing inventory table:', err);
      return;
    }
    console.log('Cleared existing inventory in billing.db');

    const stmt = db.prepare(`
      INSERT INTO inventory (id, itemCode, itemName, category, mrp, wholesalePrice, defaultDiscountValue, defaultDiscountType, defaultGstRate, isGstApplicable, stockQty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      stmt.run(
        item.id,
        item.itemCode,
        item.itemName,
        item.category,
        item.mrp,
        item.wholesalePrice,
        0,
        'percent',
        0,
        0,
        100
      );
    });

    stmt.finalize(() => {
      console.log('Successfully inserted 178 items into billing.db!');
      db.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
        console.log('Total items in SQLite DB:', row ? row.count : 0);
        db.close();
      });
    });
  });
});
