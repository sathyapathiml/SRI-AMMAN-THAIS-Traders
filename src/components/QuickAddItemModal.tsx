import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';

interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAndSave: (data: { itemName: string; price: number; qty: number; category: string }) => void;
  existingCategories: string[];
  initialName?: string;
  initialQty?: number;
}

export const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({
  isOpen,
  onClose,
  onAddAndSave,
  existingCategories,
  initialName = '',
  initialQty = 1
}) => {
  const [itemName, setItemName] = useState(initialName);
  const [price, setPrice] = useState<string>('');
  const [qty, setQty] = useState<number>(initialQty);
  const [category, setCategory] = useState<string>('General');
  const [error, setError] = useState<string>('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setItemName(initialName);
      setPrice('');
      setQty(initialQty || 1);
      setCategory(existingCategories[0] || 'General');
      setError('');

      setTimeout(() => {
        if (!initialName) {
          nameInputRef.current?.focus();
        } else {
          priceInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, initialName, initialQty]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!itemName.trim()) {
      setError('Please enter item name');
      nameInputRef.current?.focus();
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price (greater than 0)');
      priceInputRef.current?.focus();
      return;
    }

    onAddAndSave({
      itemName: itemName.trim(),
      price: numPrice,
      qty: Math.max(1, qty || 1),
      category: category.trim() || 'General'
    });

    onClose();
  };

  // Filter out 'All' from suggestions
  const categorySuggestions = existingCategories.filter(c => c && c !== 'All').slice(0, 8);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Add New Item to Bill</h3>
              <p className="text-[11px] text-cyan-400 font-semibold">Automatically updates price list & inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 10cm Color Sparklers (10 Pcs)"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none transition"
            />
          </div>

          {/* Price & Quantity Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
                Selling Price (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  ref={priceInputRef}
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono font-bold text-amber-300 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
                Quantity for Bill
              </label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-cyan-300 text-center outline-none transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Sparklers, Fancy Fountains, Sky Shots"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-200 outline-none transition mb-2"
            />

            {/* Quick Category Suggestions */}
            {categorySuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categorySuggestions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                      category === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Information badge */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl flex items-start gap-2 text-[11px] text-cyan-200/90">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              This item will be added to the current customer's bill at <strong>₹{price || '0'}</strong>, and permanently saved to the price list and database for future searches.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add to Bill & Save to Price List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
