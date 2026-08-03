import React, { useState, useEffect, useRef } from 'react';
import type { Item, PriceTier } from '../types/pos';
import { 
  Search, 
  Printer, 
  Package, 
  History, 
  Settings as SettingsIcon, 
  PauseCircle, 
  RotateCcw,
  Sparkles,
  Wallet,
  Calculator,
  Tag
} from 'lucide-react';

interface HeaderBarProps {
  inventory: Item[];
  onSelectItem: (item: Item) => void;
  onNewBill: () => void;
  onOpenCheckout: () => void;
  onOpenHeldBills: () => void;
  onOpenInventory: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenPettyExpenses: () => void;
  onOpenDayClosing: () => void;
  heldBillsCount: number;
  printerConnected: boolean;
  printMode: 'serial' | 'browser';
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  lanConnected: boolean;
  lanIp?: string;
  priceTier: PriceTier;
  onTogglePriceTier: (tier: PriceTier) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  inventory,
  onSelectItem,
  onNewBill,
  onOpenCheckout,
  onOpenHeldBills,
  onOpenInventory,
  onOpenHistory,
  onOpenSettings,
  onOpenPettyExpenses,
  onOpenDayClosing,
  heldBillsCount,
  printerConnected,
  printMode,
  searchInputRef,
  lanConnected,
  lanIp,
  priceTier,
  onTogglePriceTier
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Filter items matching itemCode or itemName via case-insensitive regex
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    try {
      const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matched = inventory.filter(
        item => regex.test(item.itemCode) || regex.test(item.itemName) || regex.test(item.category)
      );
      setResults(matched.slice(0, 10)); // Top 10 matches
      setSelectedIndex(0);
      setIsOpen(true);
    } catch {
      setResults([]);
    }
  }, [query, inventory]);

  const handleSelect = (item: Item) => {
    onSelectItem(item);
    setQuery('');
    setIsOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        const exactCodeMatch = results.find(i => i.itemCode.toLowerCase() === query.trim().toLowerCase());
        if (exactCodeMatch) {
          handleSelect(exactCodeMatch);
        } else if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 select-none shrink-0 shadow-md">
      {/* Brand & Store Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
              CRACKERS POS <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">v3.0 Ultra</span>
            </h1>
            {lanConnected ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LAN ({lanIp}:5000)</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30">
                Local Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">Fast Retail/Wholesale Multi-Counter POS</p>
        </div>
      </div>

      {/* Center: Global Keyboard-First Search & Barcode Scan Bar */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Scan Barcode or Type Code / Name (e.g. CRK001)... [Ctrl + F or /]"
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 text-slate-100 text-sm font-semibold rounded-xl pl-10 pr-24 py-2 outline-none transition-all placeholder:text-slate-500 shadow-inner"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded shadow">Ctrl + F</kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-1 text-[10px] font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded shadow">/</kbd>
          </div>
        </div>

        {/* Auto-complete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {results.map((item, idx) => {
              const displayPrice = (priceTier === 'wholesale' && item.wholesalePrice && item.wholesalePrice > 0) ? item.wholesalePrice : item.mrp;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                    idx === selectedIndex ? 'bg-cyan-950/80 border-l-4 border-cyan-400 text-white' : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-800 rounded text-amber-400 border border-slate-700">
                      {item.itemCode}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-slate-100">{item.itemName}</div>
                      <div className="text-xs text-slate-400">{item.category} • Stock: <span className={item.stockQty < 10 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{item.stockQty}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-amber-400">
                      ₹{displayPrice} {priceTier === 'wholesale' && <span className="text-[10px] text-cyan-400 font-bold">(WS)</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Wholesale vs Retail Price Mode Switch */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => onTogglePriceTier('retail')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              priceTier === 'retail' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Retail
          </button>
          <button
            onClick={() => onTogglePriceTier('wholesale')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              priceTier === 'wholesale' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wholesale
          </button>
        </div>

        {/* Petty Expenses Button */}
        <button
          onClick={onOpenPettyExpenses}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="Record Counter Petty Cash Expenses"
        >
          <Wallet className="w-4 h-4 text-rose-400" />
          <span className="hidden xl:inline">Expenses</span>
        </button>

        {/* Day Closing Z-Report Button */}
        <button
          onClick={onOpenDayClosing}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition"
          title="Night Register Z-Report Closing"
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">Z-Report</span>
        </button>

        {/* Held Bills Button */}
        <button
          onClick={onOpenHeldBills}
          className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="View Held Bills"
        >
          <PauseCircle className="w-4 h-4 text-amber-400" />
          {heldBillsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
              {heldBillsCount}
            </span>
          )}
        </button>

        {/* New Bill Button */}
        <button
          onClick={onNewBill}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="Clear Cart / New Bill (F2)"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <kbd className="px-1 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-cyan-300">F2</kbd>
        </button>

        {/* Inventory Button */}
        <button
          onClick={onOpenInventory}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="Manage Inventory Stock"
        >
          <Package className="w-4 h-4 text-emerald-400" />
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="Sales History"
        >
          <History className="w-4 h-4 text-purple-400" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
