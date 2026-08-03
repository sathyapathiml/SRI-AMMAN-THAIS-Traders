import React, { useState } from 'react';
import type { Invoice, StoreSettings, PrinterConfig, PaymentMode, CartTotals, CartLineItem } from '../types/pos';
import { User, Phone, Printer, CheckCircle, X, FileText } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totals: CartTotals;
  cartItems: CartLineItem[];
  paymentMode: PaymentMode;
  cashTendered: string;
  settings: StoreSettings;
  printerConfig: PrinterConfig;
  isEstimate?: boolean;
  onConfirmInvoice: (customerName: string, customerPhone: string, isEstimate?: boolean) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  totals,
  cartItems,
  paymentMode,
  cashTendered,
  settings,
  printerConfig,
  isEstimate = false,
  onConfirmInvoice
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  if (!isOpen) return null;

  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashNum - totals.grandTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmInvoice(customerName.trim(), customerPhone.trim(), isEstimate);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEstimate ? <FileText className="w-5 h-5 text-cyan-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <h3 className="font-bold text-slate-100 text-base">
              {isEstimate ? 'Print Proforma Estimate / Quotation' : 'Complete Payment & Print Receipt'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                {isEstimate ? 'Total Estimated Value' : 'Payable Amount'}
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">₹{totals.grandTotal.toLocaleString('en-IN')}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Mode: <strong className="text-white">{paymentMode}</strong></span>
                <span>•</span>
                <span>Items: <strong className="text-white">{totals.itemCount}</strong></span>
              </div>
            </div>

            {paymentMode === 'Cash' && cashNum > 0 && !isEstimate && (
              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-[11px] text-slate-400">Change Return</div>
                <div className="text-lg font-bold font-mono text-emerald-400">₹{changeDue.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Optional Customer Information */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Details {isEstimate ? '(Recommended for Quotes)' : '(Optional)'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="tel"
                placeholder="Mobile Number (10 digits)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Thermal Printer Output Mode Badge */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Thermal Receipt Output:</span>
            </div>
            <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
              {printerConfig.printMode === 'serial' ? 'ESC/POS Web Serial' : 'Browser 80mm Thermal'}
            </span>
          </div>

          {/* Action Buttons */}
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
              className={`w-2/3 py-2.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
                isEstimate 
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/50'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{isEstimate ? 'Print Estimate Quote' : 'Confirm & Print Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
