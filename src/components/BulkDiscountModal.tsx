import React, { useState } from 'react';
import type { DiscountType } from '../types/pos';
import { Tag, X, Check } from 'lucide-react';

interface BulkDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBulkDiscount: (discountValue: number, discountType: DiscountType) => void;
}

export const BulkDiscountModal: React.FC<BulkDiscountModalProps> = ({
  isOpen,
  onClose,
  onApplyBulkDiscount
}) => {
  const [val, setVal] = useState<string>('15');
  const [type, setType] = useState<DiscountType>('percent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(val) || 0;
    onApplyBulkDiscount(num, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Apply Blanket Discount To All</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            This bulk action will overwrite the discount on every item currently added to the cashier cart.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('percent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'percent'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Percentage (%)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('flat')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'flat'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Flat Amount (₹)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400">
              {type === 'percent' ? 'Discount Percentage (%):' : 'Flat Discount Value (₹ per item):'}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl py-2 px-3 text-lg font-mono font-bold text-amber-300 outline-none"
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply Discount To Cart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
