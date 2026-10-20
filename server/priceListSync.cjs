const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const priceListPath = path.join(__dirname, 'priceListData.cjs');
const initialInvPath = path.join(__dirname, '../src/data/initialInventory.ts');
const dbPath = path.join(__dirname, 'billing.db');

/**
 * Appends or updates an item in priceListData.cjs, initialInventory.ts, and SQLite billing.db
 */
function syncItemToPriceList(item) {
  const price = Number(item.wholesalePrice || item.mrp || 0);
  const cleanName = String(item.itemName || '').trim();
  const cleanCat = String(item.category || 'General').trim();
  const itemId = String(item.id || '').trim();
  const itemCode = String(item.itemCode || '').trim();

  if (!itemId || !cleanName) return false;

  // 1. Update server/priceListData.cjs
  try {
    if (fs.existsSync(priceListPath)) {
      let content = fs.readFileSync(priceListPath, 'utf8');
      const escapedName = cleanName.replace(/'/g, "\\'");
      const escapedCat = cleanCat.replace(/'/g, "\\'");
      const newLine = `  { id: '${itemId}', itemCode: '${itemCode}', itemName: '${escapedName}', category: '${escapedCat}', mrp: ${price}, wholesalePrice: ${price} },`;

      const idRegex = new RegExp(`\\{\\s*id:\\s*'${itemId}',[^\n]+\\}`, 'g');
      const codeRegex = new RegExp(`\\{\\s*id:[^,]+,\\s*itemCode:\\s*'${itemCode}',[^\n]+\\}`, 'g');

      if (idRegex.test(content)) {
        content = content.replace(idRegex, newLine.trim());
      } else if (codeRegex.test(content)) {
        content = content.replace(codeRegex, newLine.trim());
      } else {
        const closeIndex = content.lastIndexOf('];');
        if (closeIndex !== -1) {
          const before = content.slice(0, closeIndex).trimEnd();
          const separator = before.endsWith(',') ? '\n' : ',\n';
          content = before + separator + newLine + '\n' + content.slice(closeIndex);
        }
      }
      fs.writeFileSync(priceListPath, content, 'utf8');
    }
  } catch (e) {
    console.error('Error updating priceListData.cjs:', e);
  }

  // 2. Update src/data/initialInventory.ts
  try {
    if (fs.existsSync(initialInvPath)) {
      let tsContent = fs.readFileSync(initialInvPath, 'utf8');
      const escapedJsonName = JSON.stringify(cleanName);
      const escapedJsonCat = JSON.stringify(cleanCat);
      const newTsItem = `  {
    id: '${itemId}',
    itemCode: '${itemCode}',
    itemName: ${escapedJsonName},
    category: ${escapedJsonCat},
    mrp: ${price},
    wholesalePrice: ${price},
    defaultDiscountValue: 0,
    defaultDiscountType: 'percent',
    defaultGstRate: 0,
    isGstApplicable: false,
    stockQty: ${item.stockQty || 100}
  }`;

      const tsIdRegex = new RegExp(`\\{\\s*id:\\s*'${itemId}',[\\s\\S]*?stockQty:\\s*\\d+\\s*\\}`, 'g');
      if (tsIdRegex.test(tsContent)) {
        tsContent = tsContent.replace(tsIdRegex, newTsItem.trim());
      } else {
        const tsCloseIndex = tsContent.lastIndexOf('];');
        if (tsCloseIndex !== -1) {
          const before = tsContent.slice(0, tsCloseIndex).trimEnd();
          const separator = before.endsWith(',') ? '\n' : ',\n';
          tsContent = before + separator + newTsItem + ',\n' + tsContent.slice(tsCloseIndex);
        }
      }
      fs.writeFileSync(initialInvPath, tsContent, 'utf8');
    }
  } catch (e) {
    console.error('Error updating initialInventory.ts:', e);
  }

  // 3. Update SQLite billing.db
  try {
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      const sql = `
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
      `;
      db.run(sql, [
        itemId,
        itemCode,
        cleanName,
        cleanCat,
        price,
        price,
        0,
        'percent',
        0,
        0,
        item.stockQty || 100
      ], (err) => {
        if (err) console.error('Error upserting item into billing.db:', err);
        db.close();
      });
    });
  } catch (e) {
    console.error('Error connecting to billing.db:', e);
  }

  return true;
}

module.exports = { syncItemToPriceList };
