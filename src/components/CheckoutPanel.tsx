import React from 'react';
import type { CartTotals, PaymentMode, DiscountType } from '../types/pos';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  PauseCircle, 
  RotateCcw, 
  Receipt,
  FileText,
  Tag,
  Percent
} from 'lucide-react';

interface CheckoutPanelProps {
  totals: CartTotals;
  paymentMode: PaymentMode;
  onSetPaymentMode: (mode: PaymentMode) => void;
  onOpenCheckoutModal: (isEstimate?: boolean) => void;
  onHoldBill: () => void;
  onClearCart: () => void;
  cashTendered: string;
  onSetCashTendered: (val: string) => void;
  overallDiscountValue: number;
  overallDiscountType: DiscountType;
  onSetOverallDiscount: (val: number, type: DiscountType) => void;
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  totals,
  paymentMode,
  onSetPaymentMode,
  onOpenCheckoutModal,
  onHoldBill,
  onClearCart,
  cashTendered,
  onSetCashTendered,
  overallDiscountValue,
  overallDiscountType,
  onSetOverallDiscount
}) => {
  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashNum - totals.grandTotal);

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between shadow-xl shrink-0 overflow-hidden">
      {/* Panel Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-cyan-400" />
          <span>Checkout & Summary</span>
        </h3>
        <div className="text-xs font-mono font-bold text-slate-400">
          {totals.itemCount} Items
        </div>
      </div>

      {/* Financial Breakdown List */}
      <div className="p-4 space-y-2.5 text-xs text-slate-300 divide-y divide-slate-800/80">
        <div className="flex justify-between items-center pt-1">
          <span className="text-slate-400">Subtotal (MRP):</span>
          <span className="font-mono font-bold text-slate-200">₹{totals.subtotalMRP.toFixed(2)}</span>
        </div>

        {/* Overall Bill Discount Control */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Extra Bill Discount:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onSetOverallDiscount(overallDiscountValue, 'flat')}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${overallDiscountType === 'flat' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                ₹ Flat
              </button>
              <button
                type="button"
                onClick={() => onSetOverallDiscount(overallDiscountValue, 'percent')}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${overallDiscountType === 'percent' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                % Percent
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={overallDiscountValue || ''}
              onChange={(e) => onSetOverallDiscount(parseFloat(e.target.value) || 0, overallDiscountType)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-1.5 font-mono font-bold text-amber-300 text-xs outline-none"
            />
            {totals.overallDiscountAmount > 0 && (
              <span className="font-mono font-bold text-amber-400 shrink-0">
                -₹{totals.overallDiscountAmount.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {totals.totalDiscount > 0 && (
          <div className="flex justify-between items-center pt-2 text-amber-400 font-medium">
            <span>Total Savings (Items + Bill):</span>
            <span className="font-mono font-bold">-₹{totals.totalDiscount.toFixed(2)}</span>
          </div>
        )}

        {totals.totalGST > 0 && (
          <div className="space-y-1.5 pt-2 text-slate-400">
            <div className="flex justify-between items-center">
              <span>Taxable Value:</span>
              <span className="font-mono text-slate-300">₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>CGST (Split 50%):</span>
              <span className="font-mono text-cyan-400">₹{totals.totalCGST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>SGST (Split 50%):</span>
              <span className="font-mono text-cyan-400">₹{totals.totalSGST.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Prominent High-Visibility Grand Total Box */}
      <div className="mx-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/40 shadow-inner text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">Net Grand Total</div>
        <div className="text-4xl font-black font-mono text-white tracking-tight my-1 text-cyan-40">
          ₹{totals.grandTotal.toLocaleString('en-IN')}
        </div>
        {totals.totalDiscount > 0 && (
          <div className="text-[11px] font-bold text-emerald-400">
            Customer Saves ₹{totals.totalDiscount.toFixed(2)}!
          </div>
        )}
      </div>

      {/* Payment Mode Selector */}
      <div className="p-4 space-y-3">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Cash', 'UPI', 'Card'] as PaymentMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetPaymentMode(mode)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                paymentMode === mode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {mode === 'Cash' && <Banknote className="w-4 h-4" />}
              {mode === 'UPI' && <QrCode className="w-4 h-4" />}
              {mode === 'Card' && <CreditCard className="w-4 h-4" />}
              <span>{mode}</span>
            </button>
          ))}
        </div>

        {/* Cash Tendered Calculator if Cash selected */}
        {paymentMode === 'Cash' && (
          <div className="pt-2 space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-400">Cash Received (₹):</label>
              <input
                type="number"
                placeholder="0.00"
                value={cashTendered}
                onChange={(e) => onSetCashTendered(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg py-1 px-2 text-right font-mono font-bold text-sm text-amber-300 outline-none"
              />
            </div>
            {cashNum > 0 && (
              <div className="flex justify-between items-center text-xs font-mono font-bold border-t border-slate-850 pt-1.5">
                <span className="text-slate-400">Return Change:</span>
                <span className={changeDue > 0 ? 'text-emerald-400 text-sm' : 'text-slate-400'}>
                  ₹{changeDue.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
        {/* Save & Print Button */}
        <button
          onClick={() => onOpenCheckoutModal(false)}
          disabled={totals.itemCount === 0}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-98"
        >
          <Printer className="w-5 h-5" />
          <span>Pay & Print Bill</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenCheckoutModal(true)}
            disabled={totals.itemCount === 0}
            className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 transition"
            title="Print Proforma Estimate / Quotation without tax invoice counter increment"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Estimate Quote</span>
          </button>
          <button
            onClick={onHoldBill}
            disabled={totals.itemCount === 0}
            className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 transition"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Hold Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
