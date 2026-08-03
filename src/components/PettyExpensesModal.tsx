import React, { useState } from 'react';
import type { PettyExpense } from '../types/pos';
import { DollarSign, Plus, Trash2, X, Wallet, ReceiptText, Tag } from 'lucide-react';

interface PettyExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: PettyExpense[];
  onAddExpense: (expense: Omit<PettyExpense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const PettyExpensesModal: React.FC<PettyExpensesModalProps> = ({
  isOpen,
  onClose,
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  const [category, setCategory] = useState<PettyExpense['category']>('Tea & Snacks');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    onAddExpense({
      category,
      amount: numAmount,
      notes: notes || undefined,
      staffName: staffName || undefined
    });

    setAmount('');
    setNotes('');
    setStaffName('');
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-slate-100 text-base">Petty Cash Expenses Tracker</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expenses Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-2 text-xs font-semibold text-white outline-none"
              >
                <option value="Tea & Snacks">Tea & Snacks</option>
                <option value="Staff Salary / Advance">Staff Salary / Advance</option>
                <option value="Transport & Freight">Transport & Freight</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-2 text-xs font-mono font-bold text-rose-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Staff / Person Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Notes / Description</label>
              <input
                type="text"
                placeholder="e.g. Evening tea for staff"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>

        {/* Expenses List & Total */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recorded Expenses</span>
            <span className="text-xs font-mono font-bold text-rose-400">Total Deducted: ₹{totalExpenses.toFixed(2)}</span>
          </div>

          {expenses.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">No petty cash expenses logged for today.</div>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800/60">
                      {exp.category}
                    </span>
                    {exp.staffName && <span className="text-slate-400 text-[11px]">by {exp.staffName}</span>}
                  </div>
                  {exp.notes && <p className="text-slate-300 mt-1">{exp.notes}</p>}
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(exp.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-rose-400">₹{exp.amount.toFixed(2)}</span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
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
