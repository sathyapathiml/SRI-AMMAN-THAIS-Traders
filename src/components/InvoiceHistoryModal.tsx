import React, { useState } from 'react';
import type { Invoice, StoreSettings } from '../types/pos';
import { History, Search, Printer, FileText, X, Banknote, QrCode, CreditCard, Sparkles, TrendingUp } from 'lucide-react';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  settings: StoreSettings;
  onSelectInvoiceToPrint: (invoice: Invoice) => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  settings,
  onSelectInvoiceToPrint
}) => {
  const [query, setQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter(inv => {
    const term = query.toLowerCase().trim();
    return (
      inv.invoiceNo.toLowerCase().includes(term) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(term)) ||
      (inv.customerPhone && inv.customerPhone.includes(term)) ||
      inv.paymentMode.toLowerCase().includes(term)
    );
  });

  // Calculate Sales Summary Statistics
  const totalRevenue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalDiscount = invoices.reduce((acc, i) => acc + i.totalDiscount, 0);
  const totalTax = invoices.reduce((acc, i) => acc + i.totalGST, 0);

  const cashTotal = invoices.filter(i => i.paymentMode === 'Cash').reduce((acc, i) => acc + i.grandTotal, 0);
  const upiTotal = invoices.filter(i => i.paymentMode === 'UPI').reduce((acc, i) => acc + i.grandTotal, 0);
  const cardTotal = invoices.filter(i => i.paymentMode === 'Card').reduce((acc, i) => acc + i.grandTotal, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-slate-100 text-base">Sales History & Financial Summary</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {invoices.length} Bills Total
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Analytics Summary Grid */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</div>
            <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Cash Received
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">₹{Math.round(cashTotal).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" /> UPI Payments
            </div>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">₹{Math.round(upiTotal).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Card / Tax Collected
            </div>
            <div className="text-xs font-mono font-bold text-purple-300 mt-1">
              Card: ₹{Math.round(cardTotal)} | GST: ₹{Math.round(totalTax)}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Invoice #, Customer, Phone, Pay Mode..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Content Split: Invoice List & Inspector */}
        <div className="flex-1 overflow-hidden flex divide-x divide-slate-800">
          {/* Invoices List */}
          <div className="w-1/2 overflow-y-auto p-3 space-y-2">
            {filteredInvoices.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-bold">No Invoices Found</div>
            ) : (
              filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedInvoice?.id === inv.id
                      ? 'bg-purple-950/40 border-purple-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-xs text-amber-400">{inv.invoiceNo}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(inv.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-slate-400">
                      {inv.customerName || 'Walk-in Customer'} • <span className="font-semibold text-slate-300">{inv.paymentMode}</span>
                    </div>
                    <div className="font-mono font-black text-sm text-cyan-400">₹{inv.grandTotal.toFixed(2)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Invoice Details Inspector */}
          <div className="w-1/2 p-4 overflow-y-auto bg-slate-950/40">
            {selectedInvoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-black text-base text-amber-400 font-mono">{selectedInvoice.invoiceNo}</h4>
                    <p className="text-xs text-slate-400">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onSelectInvoiceToPrint(selectedInvoice)}
                    className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Reprint Receipt</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-semibold">{selectedInvoice.customerName || 'Walk-in Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono">{selectedInvoice.customerPhone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="font-semibold text-cyan-400">{selectedInvoice.paymentMode}</span>
                  </div>
                </div>

                {/* Item List */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 text-slate-200 font-sans">{item.itemName}</td>
                          <td className="p-2 text-center">{item.qty}</td>
                          <td className="p-2 text-right font-bold text-cyan-400">₹{item.lineGrandTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal MRP:</span>
                    <span>₹{selectedInvoice.subtotalMRP.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Discount:</span>
                    <span>-₹{selectedInvoice.totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Total GST:</span>
                    <span>+₹{selectedInvoice.totalGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-white pt-1 border-t border-slate-800 font-sans">
                    <span>Grand Total:</span>
                    <span className="font-mono text-cyan-300">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs">
                Select an invoice from the left panel to inspect details and reprint receipt.
              </div>
            )}
          </div>
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
