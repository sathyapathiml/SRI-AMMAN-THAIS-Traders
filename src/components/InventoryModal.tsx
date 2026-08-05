import React, { useState } from 'react';
import type { Item, DiscountType, User } from '../types/pos';
import { Package, Plus, Search, Download, Upload, RotateCcw, X, Edit, Trash2, Save, CheckSquare, Square, Layers, Percent, DollarSign, ArrowUpRight, ArrowDownRight, Tag, ShieldCheck } from 'lucide-react';
import { generateCategoryItemCode } from '../utils/categoryItemCode';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Item[];
  onSaveItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onResetInventory: () => void;
  onImportInventory: (items: Item[]) => void;
  currentUser?: User | null;
}

type BulkActionType = 'price' | 'stock' | 'category' | 'discount' | 'gst' | null;

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSaveItem,
  onDeleteItem,
  onResetInventory,
  onImportInventory,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Bulk Selection & Editing State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeBulkAction, setActiveBulkAction] = useState<BulkActionType>(null);
  const [isMultiInlineMode, setIsMultiInlineMode] = useState<boolean>(false);
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, Partial<Item>>>({});

  // Bulk Action Fields State
  const [bulkPriceType, setBulkPriceType] = useState<'adjust_percent' | 'adjust_flat' | 'set_mrp' | 'set_wholesale'>('adjust_percent');
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(10);
  const [bulkStockMode, setBulkStockMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [bulkStockValue, setBulkStockValue] = useState<number>(50);
  const [bulkCategoryValue, setBulkCategoryValue] = useState<string>('Ground Chakkars');
  const [bulkDiscountVal, setBulkDiscountVal] = useState<number>(15);
  const [bulkDiscountType, setBulkDiscountType] = useState<DiscountType>('percent');
  const [bulkGstRate, setBulkGstRate] = useState<number>(18);
  const [bulkIsGst, setBulkIsGst] = useState<boolean>(true);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))].sort();

  // Automatically arrange inventory items category-wise (Category A-Z, then Code)
  const sortedInventory = [...inventory].sort((a, b) => {
    const catCompare = (a.category || '').localeCompare(b.category || '');
    if (catCompare !== 0) return catCompare;
    return (a.itemCode || '').localeCompare(b.itemCode || '', undefined, { numeric: true });
  });

  const filteredItems = sortedInventory.filter(item => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(i => selectedIds.includes(i.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateNew = () => {
    const defaultCategory = 'Sparklers';
    const newCode = generateCategoryItemCode(defaultCategory, inventory);
    setEditingItem({
      id: Date.now().toString(),
      itemCode: newCode,
      itemName: '',
      category: defaultCategory,
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

  // Bulk Apply Handler
  const handleApplyBulkEdit = () => {
    if (selectedIds.length === 0 || !activeBulkAction) return;

    selectedIds.forEach(id => {
      const item = inventory.find(i => i.id === id);
      if (!item) return;

      const updated = { ...item };

      if (activeBulkAction === 'price') {
        if (bulkPriceType === 'adjust_percent') {
          const factor = 1 + (bulkPriceValue / 100);
          updated.mrp = Math.max(0, Math.round(item.mrp * factor));
        } else if (bulkPriceType === 'adjust_flat') {
          updated.mrp = Math.max(0, Math.round(item.mrp + bulkPriceValue));
        } else if (bulkPriceType === 'set_mrp') {
          updated.mrp = Math.max(0, bulkPriceValue);
        } else if (bulkPriceType === 'set_wholesale') {
          updated.wholesalePrice = Math.max(0, bulkPriceValue);
        }
      } else if (activeBulkAction === 'stock') {
        if (bulkStockMode === 'add') {
          updated.stockQty = Math.max(0, item.stockQty + bulkStockValue);
        } else if (bulkStockMode === 'subtract') {
          updated.stockQty = Math.max(0, item.stockQty - bulkStockValue);
        } else if (bulkStockMode === 'set') {
          updated.stockQty = Math.max(0, bulkStockValue);
        }
      } else if (activeBulkAction === 'category') {
        if (bulkCategoryValue.trim()) {
          updated.category = bulkCategoryValue.trim();
        }
      } else if (activeBulkAction === 'discount') {
        updated.defaultDiscountValue = Math.max(0, bulkDiscountVal);
        updated.defaultDiscountType = bulkDiscountType;
      } else if (activeBulkAction === 'gst') {
        updated.defaultGstRate = Math.max(0, bulkGstRate);
        updated.isGstApplicable = bulkIsGst;
      }

      onSaveItem(updated);
    });

    setActiveBulkAction(null);
    setSelectedIds([]);
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected inventory items?`)) {
      selectedIds.forEach(id => onDeleteItem(id));
      setSelectedIds([]);
    }
  };

  // Inline Multi-Row Save Handler
  const handleSaveAllInlineChanges = () => {
    Object.entries(inlineDrafts).forEach(([id, draft]) => {
      const existing = inventory.find(i => i.id === id);
      if (existing) {
        onSaveItem({ ...existing, ...draft });
      }
    });
    setInlineDrafts({});
    setIsMultiInlineMode(false);
  };

  const handleUpdateInlineDraft = (id: string, field: keyof Item, val: any) => {
    setInlineDrafts(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val
      }
    }));
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Inventory & Stock Management</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {inventory.length} Products
            </span>
            {selectedIds.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{selectedIds.length} Items Selected for Bulk Edit</span>
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
            {isAdmin && (
              <>
                {/* Toggle Inline Table Multi-Row Edit Mode */}
                <button
                  onClick={() => {
                    if (isMultiInlineMode) {
                      handleSaveAllInlineChanges();
                    } else {
                      setIsMultiInlineMode(true);
                    }
                  }}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    isMultiInlineMode
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                      : 'bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-300'
                  }`}
                >
                  {isMultiInlineMode ? <Save className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{isMultiInlineMode ? 'Save All Table Changes' : 'Fast Multi-Row Table Edit'}</span>
                </button>

                <button
                  onClick={handleCreateNew}
                  className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Cracker Item</span>
                </button>
              </>
            )}

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
          </div>
        </div>

        {/* Bulk Action Controls Bar (SHOWN WHEN 1 OR MORE ITEMS SELECTED) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-amber-950/40 border-b border-amber-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Bulk Edit Actions ({selectedIds.length} Selected):</span>
              </span>

              <button
                onClick={() => setActiveBulkAction(activeBulkAction === 'price' ? null : 'price')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  activeBulkAction === 'price' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-amber-300 border-amber-800/80 hover:bg-slate-800'
                }`}
              >
                ₹ Edit Prices
              </button>

              <button
                onClick={() => setActiveBulkAction(activeBulkAction === 'stock' ? null : 'stock')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  activeBulkAction === 'stock' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-emerald-300 border-emerald-800/80 hover:bg-slate-800'
                }`}
              >
                📦 Adjust Stock
              </button>

              <button
                onClick={() => setActiveBulkAction(activeBulkAction === 'category' ? null : 'category')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  activeBulkAction === 'category' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-cyan-300 border-cyan-800/80 hover:bg-slate-800'
                }`}
              >
                🏷️ Change Category
              </button>

              <button
                onClick={() => setActiveBulkAction(activeBulkAction === 'discount' ? null : 'discount')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  activeBulkAction === 'discount' ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-900 text-purple-300 border-purple-800/80 hover:bg-slate-800'
                }`}
              >
                % Default Discount
              </button>

              <button
                onClick={() => setActiveBulkAction(activeBulkAction === 'gst' ? null : 'gst')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  activeBulkAction === 'gst' ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-900 text-blue-300 border-blue-800/80 hover:bg-slate-800'
                }`}
              >
                📊 GST Rate
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="py-1 px-2.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold text-xs flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => { setSelectedIds([]); setActiveBulkAction(null); }}
                className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Bulk Action Form Drawer */}
        {activeBulkAction && selectedIds.length > 0 && (
          <div className="p-4 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-150">
            {/* Price Edit Option */}
            {activeBulkAction === 'price' && (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-300">Action:</span>
                <select
                  value={bulkPriceType}
                  onChange={(e) => setBulkPriceType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg p-2 outline-none"
                >
                  <option value="adjust_percent">Increase/Decrease MRP by % (e.g. +10% or -5%)</option>
                  <option value="adjust_flat">Add/Subtract MRP by Flat ₹ (e.g. +20 or -10)</option>
                  <option value="set_mrp">Set Specific Retail MRP (₹)</option>
                  <option value="set_wholesale">Set Specific Wholesale Rate (₹)</option>
                </select>
                <input
                  type="number"
                  value={bulkPriceValue}
                  onChange={(e) => setBulkPriceValue(parseFloat(e.target.value) || 0)}
                  placeholder="Value..."
                  className="w-28 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg p-2 font-mono text-amber-300 text-xs font-bold outline-none"
                />
              </div>
            )}

            {/* Stock Edit Option */}
            {activeBulkAction === 'stock' && (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-300">Stock Operation:</span>
                <select
                  value={bulkStockMode}
                  onChange={(e) => setBulkStockMode(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg p-2 outline-none"
                >
                  <option value="add">Add Stock (+) to existing Qty</option>
                  <option value="subtract">Subtract Stock (-) from existing Qty</option>
                  <option value="set">Set Exact Stock Quantity (=)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(parseInt(e.target.value, 10) || 0)}
                  className="w-28 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg p-2 font-mono text-emerald-400 text-xs font-bold outline-none"
                />
              </div>
            )}

            {/* Category Change Option */}
            {activeBulkAction === 'category' && (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-300">New Category:</span>
                <input
                  type="text"
                  value={bulkCategoryValue}
                  onChange={(e) => setBulkCategoryValue(e.target.value)}
                  placeholder="e.g. Ground Chakkars, Multi Shot Bombs..."
                  className="flex-1 max-w-sm bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg p-2 text-white text-xs outline-none"
                />
              </div>
            )}

            {/* Discount Option */}
            {activeBulkAction === 'discount' && (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-300">Default Discount:</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulkDiscountVal}
                  onChange={(e) => setBulkDiscountVal(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg p-2 font-mono text-amber-300 text-xs font-bold outline-none"
                />
                <select
                  value={bulkDiscountType}
                  onChange={(e) => setBulkDiscountType(e.target.value as DiscountType)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg p-2 outline-none"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            )}

            {/* GST Rate Option */}
            {activeBulkAction === 'gst' && (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-300">GST Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={bulkGstRate}
                  onChange={(e) => setBulkGstRate(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg p-2 font-mono text-cyan-300 text-xs font-bold outline-none"
                />
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkIsGst}
                    onChange={(e) => setBulkIsGst(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-0 accent-blue-500"
                  />
                  <span>Enable GST</span>
                </label>
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApplyBulkEdit}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition"
            >
              Apply to {selectedIds.length} Items
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {editingItem ? (
            /* Single Item Form */
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
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const autoCode = isAddingNew ? generateCategoryItemCode(newCat, inventory) : editingItem.itemCode;
                      setEditingItem({ ...editingItem, category: newCat, itemCode: autoCode });
                    }}
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
            /* Table View with Checkboxes & Multi-Row Fast Inline Edit Support */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <button onClick={handleToggleSelectAll} className="p-0.5 rounded text-amber-400 hover:text-amber-300">
                      {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Product Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                  <th className="py-2.5 px-3 text-right">Wholesale (₹)</th>
                  <th className="py-2.5 px-3 text-center">Default Disc</th>
                  <th className="py-2.5 px-3 text-center">GST Rate</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredItems.map((item, idx) => {
                  const prevCategory = idx > 0 ? filteredItems[idx - 1].category : null;
                  const isCategoryHeader = item.category !== prevCategory && selectedCategory === 'All';
                  const categoryCount = filteredItems.filter(i => i.category === item.category).length;

                  const isChecked = selectedIds.includes(item.id);
                  const draft = inlineDrafts[item.id] || {};
                  const currentMrp = draft.mrp !== undefined ? draft.mrp : item.mrp;
                  const currentWholesale = draft.wholesalePrice !== undefined ? draft.wholesalePrice : (item.wholesalePrice || 0);
                  const currentStock = draft.stockQty !== undefined ? draft.stockQty : item.stockQty;
                  const currentCategory = draft.category !== undefined ? draft.category : item.category;

                  return (
                    <React.Fragment key={item.id}>
                      {isCategoryHeader && (
                        <tr className="bg-slate-950/90 border-y border-slate-800">
                          <td colSpan={10} className="py-2 px-4 bg-slate-950 font-black text-xs text-amber-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <span>🎆 {item.category}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                                {categoryCount} {categoryCount === 1 ? 'Item' : 'Items'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        className={`transition ${isChecked ? 'bg-amber-950/30' : 'hover:bg-slate-800/40'}`}
                      >
                      {/* Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => handleToggleSelectRow(item.id)} className="p-0.5 rounded text-amber-400">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-700" />}
                        </button>
                      </td>

                      {/* Code */}
                      <td className="py-2 px-3">
                        <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {item.itemCode}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-2 px-3 font-semibold text-slate-200">
                        {isMultiInlineMode ? (
                          <input
                            type="text"
                            value={draft.itemName !== undefined ? draft.itemName : item.itemName}
                            onChange={(e) => handleUpdateInlineDraft(item.id, 'itemName', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          />
                        ) : (
                          item.itemName
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3 text-slate-400">
                        {isMultiInlineMode ? (
                          <input
                            type="text"
                            value={currentCategory}
                            onChange={(e) => handleUpdateInlineDraft(item.id, 'category', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          />
                        ) : (
                          item.category
                        )}
                      </td>

                      {/* MRP (₹) */}
                      <td className="py-2 px-3 text-right">
                        {isMultiInlineMode ? (
                          <input
                            type="number"
                            min="0"
                            value={currentMrp}
                            onChange={(e) => handleUpdateInlineDraft(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right font-mono font-bold bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-amber-300 outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold text-white">₹{item.mrp}</span>
                        )}
                      </td>

                      {/* Wholesale (₹) */}
                      <td className="py-2 px-3 text-right">
                        {isMultiInlineMode ? (
                          <input
                            type="number"
                            min="0"
                            value={currentWholesale}
                            onChange={(e) => handleUpdateInlineDraft(item.id, 'wholesalePrice', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right font-mono font-bold bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-cyan-300 outline-none"
                          />
                        ) : (
                          <span className="font-mono text-slate-400">₹{item.wholesalePrice || 0}</span>
                        )}
                      </td>

                      {/* Default Discount */}
                      <td className="py-2 px-3 text-center font-mono text-amber-300">
                        {item.defaultDiscountValue > 0 ? (
                          item.defaultDiscountType === 'percent' ? `${item.defaultDiscountValue}%` : `₹${item.defaultDiscountValue}`
                        ) : '-'}
                      </td>

                      {/* GST Rate */}
                      <td className="py-2 px-3 text-center font-mono text-cyan-300">
                        {item.isGstApplicable ? `${item.defaultGstRate}%` : 'Off'}
                      </td>

                      {/* Stock Qty */}
                      <td className="py-2 px-3 text-center">
                        {isMultiInlineMode ? (
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleUpdateInlineDraft(item.id, 'stockQty', parseInt(e.target.value, 10) || 0)}
                            className="w-16 text-center font-mono font-bold bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-emerald-400 outline-none"
                          />
                        ) : (
                          <span className={`font-mono font-bold ${item.stockQty < 10 ? 'text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded' : 'text-emerald-400'}`}>
                            {item.stockQty}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsAddingNew(false);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                              title="Single Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-medium">
            {selectedIds.length > 0
              ? `${selectedIds.length} item(s) selected for bulk action`
              : 'Select checkboxes to edit multiple items simultaneously'}
          </div>
          <div className="flex items-center gap-2">
            {isMultiInlineMode && (
              <button
                onClick={handleSaveAllInlineChanges}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow"
              >
                Save All Changes
              </button>
            )}
            <button onClick={onClose} className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
