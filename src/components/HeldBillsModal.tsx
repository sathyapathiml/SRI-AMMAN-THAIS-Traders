import React from 'react';
import type { HeldBill } from '../types/pos';
import { PauseCircle, Trash2, ArrowRight, X, Clock, ShoppingCart } from 'lucide-react';

interface HeldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBill[];
  onRestoreBill: (bill: HeldBill) => void;
  onDeleteHeldBill: (id: string) => void;
}

export const HeldBillsModal: React.FC<HeldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onRestoreBill,
  onDeleteHeldBill
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Held / Pending Bills ({heldBills.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {heldBills.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-slate-300">No Held Bills</p>
              <p className="text-xs text-slate-500">You can hold an active bill anytime using the "Hold Bill" button in checkout.</p>
            </div>
          ) : (
            heldBills.map((bill) => {
              const totalItems = bill.items.reduce((acc, i) => acc + i.qty, 0);
              const grandTotal = bill.items.reduce((acc, i) => acc + i.lineGrandTotal, 0);

              return (
                <div
                  key={bill.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-amber-300">{bill.holdName}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {totalItems} Items • {bill.items.map(i => `${i.qty}x ${i.itemName.split(' ')[0]}`).join(', ').substring(0, 45)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-cyan-400">₹{Math.round(grandTotal)}</div>
                    </div>
                    <button
                      onClick={() => {
                        onRestoreBill(bill);
                        onClose();
                      }}
                      className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-950 transition"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteHeldBill(bill.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete Held Bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
