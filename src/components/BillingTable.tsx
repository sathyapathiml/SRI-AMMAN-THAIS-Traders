import React from 'react';
import type { CartLineItem, DiscountType } from '../types/pos';
import { Trash2, Plus, Minus, Percent, DollarSign, Tag, Check, Sparkles } from 'lucide-react';

interface BillingTableProps {
  cartItems: CartLineItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onUpdateDiscount: (id: string, discountValue: number, discountType: DiscountType) => void;
  onUpdateGst: (id: string, isGstApplicable: boolean, gstRate: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenBulkDiscount: () => void;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  cartItems,
  onUpdateQty,
  onUpdateDiscount,
  onUpdateGst,
  onRemoveItem,
  onOpenBulkDiscount
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Table Top Controls Header */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-wide text-slate-200 uppercase flex items-center gap-2">
            <span>Billing Items</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono text-xs border border-slate-700">
              {cartItems.length} {cartItems.length === 1 ? 'Line Item' : 'Line Items'}
            </span>
          </h2>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onOpenBulkDiscount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition shadow-sm"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Apply Flat Discount To All</span>
          </button>
        )}
      </div>

      {/* Main Line Items Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 select-none">
            <div className="w-16 h-16 rounded-2xl bg-slate-850 flex items-center justify-center mb-3 border border-slate-800 text-slate-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-300">Cart is Empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Scan item barcode or search item name using <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-400 font-mono text-xs">Ctrl + F</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-400 font-mono text-xs">/</kbd> to add items.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="sticky top-0 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 z-10">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 w-24">Code</th>
                <th className="py-2.5 px-3 min-w-[180px]">Item Description</th>
                <th className="py-2.5 px-3 w-16 text-center">Stock</th>
                <th className="py-2.5 px-3 w-20 text-right">MRP (₹)</th>
                <th className="py-2.5 px-3 w-32 text-center">Quantity</th>
                <th className="py-2.5 px-3 w-40 text-center">Line Discount</th>
                <th className="py-2.5 px-3 w-32 text-center">GST Rate (%)</th>
                <th className="py-2.5 px-3 w-28 text-right">Line Total (₹)</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-xs text-slate-200">
              {cartItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Row index */}
                  <td className="py-2 px-3 text-center text-slate-500 font-mono text-xs font-bold">
                    {index + 1}
                  </td>

                  {/* Item Code */}
                  <td className="py-2 px-3">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block">
                      {item.itemCode}
                    </span>
                  </td>

                  {/* Item Name */}
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-100 text-xs">{item.itemName}</div>
                  </td>

                  {/* Stock */}
                  <td className="py-2 px-3 text-center">
                    <span className={`font-mono text-[11px] font-bold ${item.stockQty < 10 ? 'text-red-400' : 'text-slate-400'}`}>
                      {item.stockQty}
                    </span>
                  </td>

                  {/* Base MRP */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-200">
                    ₹{item.mrp.toFixed(2)}
                  </td>

                  {/* Editable Quantity */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700 active:scale-95 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stockQty > 0 ? item.stockQty : 9999}
                        value={item.qty}
                        onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value, 10) || 1)}
                        className="w-12 text-center bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded py-1 font-mono font-bold text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700 active:scale-95 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Per-Item Editable Discount */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.discountValue}
                        onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0, item.discountType)}
                        className="w-14 text-center bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded py-1 font-mono font-bold text-xs text-amber-300 outline-none"
                      />
                      {/* Type Toggle (% or ₹) */}
                      <button
                        onClick={() =>
                          onUpdateDiscount(
                            item.id,
                            item.discountValue,
                            item.discountType === 'percent' ? 'flat' : 'percent'
                          )
                        }
                        className={`px-1.5 py-1 rounded font-mono text-[11px] font-extrabold flex items-center gap-0.5 border transition ${
                          item.discountType === 'percent'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                        title="Toggle % or ₹ Discount"
                      >
                        {item.discountType === 'percent' ? '%' : '₹'}
                      </button>
                    </div>
                    {item.lineDiscountAmount > 0 && (
                      <div className="text-[10px] text-center text-amber-400/80 font-mono mt-0.5">
                        -₹{item.lineDiscountAmount.toFixed(2)} Total
                      </div>
                    )}
                  </td>

                  {/* Per-Item Editable GST */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isGstApplicable}
                          onChange={(e) => onUpdateGst(item.id, e.target.checked, item.gstRate)}
                          className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                        />
                      </label>
                      {item.isGstApplicable ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.gstRate}
                          onChange={(e) => onUpdateGst(item.id, true, parseFloat(e.target.value) || 0)}
                          className="w-12 text-center bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded py-1 font-mono font-bold text-xs text-cyan-300 outline-none"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono italic">No GST</span>
                      )}
                    </div>
                    {item.isGstApplicable && item.lineGstAmount > 0 && (
                      <div className="text-[10px] text-center text-cyan-400/80 font-mono mt-0.5">
                        +₹{item.lineGstAmount.toFixed(2)} Tax
                      </div>
                    )}
                  </td>

                  {/* Line Total */}
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-sm text-cyan-400">
                    ₹{item.lineGrandTotal.toFixed(2)}
                  </td>

                  {/* Remove Row Button */}
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
