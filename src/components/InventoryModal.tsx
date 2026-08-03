import React, { useState } from 'react';
import type { Item, DiscountType } from '../types/pos';
import { Package, Plus, Search, Download, Upload, RotateCcw, X, Edit, Trash2, Save, Sparkles } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Item[];
  onSaveItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onResetInventory: () => void;
  onImportInventory: (items: Item[]) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSaveItem,
  onDeleteItem,
  onResetInventory,
  onImportInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateNew = () => {
    const nextNum = inventory.length + 1;
    const newCode = `CRK${nextNum.toString().padStart(3, '0')}`;
    setEditingItem({
      id: Date.now().toString(),
      itemCode: newCode,
      itemName: '',
      category: 'Sparklers',
      mrp: 100,
      defaultDiscountValue: 10,
      defaultDiscountType: 'percent',
      defaultGstRate: 18,
      isGstApplicable: true,
      stockQty: 50
    });
    setIsAddingNew(true);
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.itemName.trim() || !editingItem.itemCode.trim()) return;
    onSaveItem(editingItem);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleExportCSV = () => {
    const headers = ['ItemCode', 'ItemName', 'Category', 'MRP', 'DiscountValue', 'DiscountType', 'GSTRate', 'IsGSTApplicable', 'StockQty'];
    const rows = inventory.map(i => [
      i.itemCode,
      `"${i.itemName.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.mrp,
      i.defaultDiscountValue,
      i.defaultDiscountType,
      i.defaultGstRate,
      i.isGstApplicable,
      i.stockQty
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crackers_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) return;

        const imported: Item[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 8) {
            imported.push({
              id: `${cols[0]}-${Date.now()}-${i}`,
              itemCode: cols[0],
              itemName: cols[1],
              category: cols[2] || 'General',
              mrp: parseFloat(cols[3]) || 0,
              defaultDiscountValue: parseFloat(cols[4]) || 0,
              defaultDiscountType: (cols[5] === 'flat' ? 'flat' : 'percent') as DiscountType,
              defaultGstRate: parseFloat(cols[6]) || 18,
              isGstApplicable: cols[7].toLowerCase() === 'true',
              stockQty: parseInt(cols[8], 10) || 0
            });
          }
        }
        if (imported.length > 0) {
          onImportInventory(imported);
        }
      } catch (err) {
        alert('Failed to parse CSV file. Ensure valid headers.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Inventory & Stock Management</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {inventory.length} Products
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Code or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none font-bold"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cracker Item</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <label className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            </label>
            <button
              onClick={onResetInventory}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 text-slate-400 hover:text-rose-300 font-bold text-xs flex items-center gap-1 transition"
              title="Reset Sample Fireworks Catalog"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {editingItem ? (
            /* Add / Edit Form */
            <form onSubmit={handleFormSave} className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
              <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">
                {isAddingNew ? 'Create New Cracker Product' : `Edit Item: ${editingItem.itemName}`}
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Item Barcode / Code *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.itemCode}
                    onChange={(e) => setEditingItem({ ...editingItem, itemCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono font-bold text-amber-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-400 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.itemName}
                    onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Retail MRP (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editingItem.mrp}
                    onChange={(e) => setEditingItem({ ...editingItem, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Wholesale Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editingItem.wholesalePrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg p-2 font-mono text-cyan-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Available Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingItem.stockQty}
                    onChange={(e) => setEditingItem({ ...editingItem, stockQty: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono text-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Default Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingItem.defaultDiscountValue}
                    onChange={(e) => setEditingItem({ ...editingItem, defaultDiscountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono text-amber-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Discount Type</label>
                  <select
                    value={editingItem.defaultDiscountType}
                    onChange={(e) => setEditingItem({ ...editingItem, defaultDiscountType: e.target.value as DiscountType })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Default GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingItem.defaultGstRate}
                    onChange={(e) => setEditingItem({ ...editingItem, defaultGstRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono text-cyan-300 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isGstApplicable}
                      onChange={(e) => setEditingItem({ ...editingItem, isGstApplicable: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-0 accent-emerald-500"
                    />
                    <span>Is GST Applicable?</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="py-2 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Item</span>
                </button>
              </div>
            </form>
          ) : (
            /* Table View */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Product Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                  <th className="py-2.5 px-3 text-center">Default Disc</th>
                  <th className="py-2.5 px-3 text-center">GST Rate</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.itemCode}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-200">{item.itemName}</td>
                    <td className="py-2 px-3 text-slate-400">{item.category}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">₹{item.mrp}</td>
                    <td className="py-2 px-3 text-center font-mono text-amber-300">
                      {item.defaultDiscountValue > 0 ? (
                        item.defaultDiscountType === 'percent' ? `${item.defaultDiscountValue}%` : `₹${item.defaultDiscountValue}`
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-cyan-300">
                      {item.isGstApplicable ? `${item.defaultGstRate}%` : 'Off'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`font-mono font-bold ${item.stockQty < 10 ? 'text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded' : 'text-emerald-400'}`}>
                        {item.stockQty}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsAddingNew(false);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button onClick={onClose} className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
