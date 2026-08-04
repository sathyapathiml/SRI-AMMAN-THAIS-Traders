import React, { useState } from 'react';
import type { Invoice, PettyExpense, StoreSettings, PrinterConfig, User } from '../types/pos';
import { Printer, X, Banknote, QrCode, Wallet, Calculator, ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { sendEscPosBytes } from '../services/serialPrinter';
import { buildZReportEscPosBuffer } from '../services/escpos';

interface DayClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  expenses: PettyExpense[];
  settings: StoreSettings;
  printerConfig: PrinterConfig;
  currentUser?: User | null;
  onOpenLoginModal?: () => void;
}

export const DayClosingModal: React.FC<DayClosingModalProps> = ({
  isOpen,
  onClose,
  invoices,
  expenses,
  settings,
  printerConfig,
  currentUser,
  onOpenLoginModal
}) => {
  const [openingCash, setOpeningCash] = useState<string>(settings.openingCashDrawer ? settings.openingCashDrawer.toString() : '2000');
  const [actualDrawerCash, setActualDrawerCash] = useState<string>('');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const numOpeningCash = parseFloat(openingCash) || 0;
  const numActualCash = parseFloat(actualDrawerCash) || 0;

  // Calculate today's totals
  const totalRevenue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalDiscount = invoices.reduce((acc, i) => acc + i.totalDiscount, 0);
  const totalGst = invoices.reduce((acc, i) => acc + i.totalGST, 0);

  const cashSales = invoices.filter(i => i.paymentMode === 'Cash').reduce((acc, i) => acc + i.grandTotal, 0);
  const upiSales = invoices.filter(i => i.paymentMode === 'UPI').reduce((acc, i) => acc + i.grandTotal, 0);
  const cardSales = invoices.filter(i => i.paymentMode === 'Card').reduce((acc, i) => acc + i.grandTotal, 0);

  const totalPettyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const expectedDrawerCash = numOpeningCash + cashSales - totalPettyExpenses;
  const difference = numActualCash - expectedDrawerCash;

  const handlePrintZReport = async () => {
    if (printerConfig.printMode === 'serial') {
      try {
        const buffer = buildZReportEscPosBuffer({
          storeName: settings.storeName,
          closedAt: new Date().toLocaleString(),
          openingCash: numOpeningCash,
          cashSales,
          upiSales,
          cardSales,
          totalPettyExpenses,
          expectedDrawerCash,
          actualDrawerCash: numActualCash,
          difference,
          totalInvoices: invoices.length,
          totalRevenue,
          totalDiscount,
          totalGst
        }, printerConfig);
        await sendEscPosBytes(buffer);
      } catch (err: any) {
        alert(`Serial Z-Report Print Error: ${err.message}`);
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Day-End Cash Register Closing (Z-Report)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdmin ? (
          /* WORKER RESTRICTION LOCK SCREEN */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col items-center justify-center bg-slate-950/60">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-700/80 flex items-center justify-center shadow-xl shadow-amber-950/50">
              <ShieldAlert className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-xl font-extrabold text-white">Admin Authorization Required</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Day-End Z-Report drawer balancing and register closing totals are restricted to <strong className="text-amber-400 font-mono">ADMIN</strong> accounts.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 mt-4">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Credentials:</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Email: <strong className="text-white font-mono">sathyapathi555@gmail.com</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Return to Counter
              </button>
              {onOpenLoginModal && (
                <button
                  onClick={() => { onClose(); onOpenLoginModal(); }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950/50 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Log In as Admin</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ADMIN UNLOCKED Z-REPORT CONTENT */
          <>
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Sales</div>
                  <div className="text-lg font-black text-cyan-400 mt-0.5 font-mono">₹{Math.round(totalRevenue)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{invoices.length} Bills Billed</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Banknote className="w-3 h-3 text-emerald-400" /> Cash Sales
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">₹{Math.round(cashSales)}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-cyan-400" /> Digital Sales
                  </div>
                  <div className="text-sm font-bold text-cyan-300 mt-1 font-mono">UPI: ₹{Math.round(upiSales)}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Card: ₹{Math.round(cardSales)}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-rose-400" /> Expenses
                  </div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5 font-mono">-₹{Math.round(totalPettyExpenses)}</div>
                </div>
              </div>

              {/* Register Drawer Reconciliation Formula */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Cash Drawer Reconciliation</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Opening Cash Drawer float (₹)</label>
                    <input
                      type="number"
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Counted Actual Drawer Cash (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 5450"
                      value={actualDrawerCash}
                      onChange={(e) => setActualDrawerCash(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg p-2 font-mono font-black text-amber-300 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Opening Cash Float:</span>
                    <span>+ ₹{numOpeningCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Net Cash Sales Collected:</span>
                    <span>+ ₹{cashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Petty Cash Expenses Deducted:</span>
                    <span>- ₹{totalPettyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 border-t border-slate-800 pt-1">
                    <span>Expected Cash in Drawer:</span>
                    <span className="text-amber-400 font-black">₹{expectedDrawerCash.toFixed(2)}</span>
                  </div>
                  {actualDrawerCash && (
                    <div className={`flex justify-between font-bold pt-1 border-t border-slate-800 ${difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span>Cash Variance (Difference):</span>
                      <span>{difference >= 0 ? `+₹${difference.toFixed(2)} (Excess)` : `-₹${Math.abs(difference).toFixed(2)} (Shortage)`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
              <div className="text-xs text-slate-400">
                Z-Report print includes register balancing & financial ledger totals.
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
                  Close
                </button>
                <button
                  onClick={handlePrintZReport}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Z-Report</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
