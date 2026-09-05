import React, { useState, useEffect } from 'react';
import type { Item, PriceTier, User } from '../types/pos';
import { LOGO_DATA_URI } from '../data/logoDataUri';
import { 
  Search, 
  Package, 
  History, 
  Settings as SettingsIcon, 
  PauseCircle, 
  RotateCcw,
  User as UserIcon,
  LogOut,
  ChevronDown,
  DollarSign,
  Monitor,
  Calendar,
  Wallet,
  ShieldCheck,
  UserCheck,
  Calculator,
  Printer
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
  printMode: 'usb' | 'serial' | 'browser';
  detectedPrinter?: { name: string; port: string; driver?: string; isTvs?: boolean } | null;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  lanConnected: boolean;
  lanIp: string;
  priceTier: PriceTier;
  onTogglePriceTier: (tier: PriceTier) => void;
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  inventory,
  onSelectItem,
  onNewBill,
  onOpenHeldBills,
  onOpenInventory,
  onOpenHistory,
  onOpenSettings,
  onOpenPettyExpenses,
  onOpenDayClosing,
  heldBillsCount,
  detectedPrinter,
  searchInputRef,
  lanConnected,
  lanIp,
  priceTier,
  onTogglePriceTier,
  currentUser,
  onOpenLoginModal,
  onLogout
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

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
      setResults(matched.slice(0, 50)); // Up to 50 matches
      setSelectedIndex(0);
      setIsOpen(true);
    } catch {
      setResults([]);
    }
  }, [query, inventory]);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close search panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll selected item into view when navigating with Arrow Up / Arrow Down
  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (item: Item, keepOpen = false) => {
    onSelectItem(item);
    if (!keepOpen) {
      setQuery('');
      setIsOpen(false);
    }
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
          handleSelect(exactCodeMatch, true); // Keep open on Enter so cashier can add more
        } else if (results[selectedIndex]) {
          handleSelect(results[selectedIndex], true); // Keep open on Enter
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 select-none shrink-0 shadow-md">
      {/* Top Row on Mobile: Logo & Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand & Store Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={LOGO_DATA_URI}
            alt="SRI AMMAN THAIS Traders Logo"
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain shadow-lg border border-amber-500/40 bg-slate-950 p-0.5"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm md:text-lg font-black tracking-tight text-white flex items-center gap-1">
                SRI AMMAN THAIS <span className="text-amber-400">Traders</span>
                <span className="text-[10px] md:text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">v3.0</span>
              </h1>
              {lanConnected ? (
                <span className="text-[9px] md:text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="hidden sm:inline">LAN ({lanIp}:5000)</span>
                </span>
              ) : (
                <span className="text-[9px] md:text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30">
                  Local
                </span>
              )}
            </div>
            <p className="hidden sm:block text-xs text-amber-300/80 font-semibold tracking-wide">Whole Sale & Retail Crackers Superstore</p>
          </div>
        </div>

        {/* Mobile Quick Auth Badge */}
        <div className="flex md:hidden items-center gap-1">
          {currentUser ? (
            <button onClick={onLogout} className="px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{currentUser.username.split(' ')[0]}</span>
              <LogOut className="w-3 h-3 text-red-400 ml-1" />
            </button>
          ) : (
            <button onClick={onOpenLoginModal} className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Global Touch & Keyboard Search Bar */}
      <div className="relative flex-1 max-w-xl" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Scan or Search Item / Code..."
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 text-slate-100 text-xs md:text-sm font-semibold rounded-xl pl-9 md:pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-500 shadow-inner"
          />
        </div>

        {/* Wide View Auto-complete Dropdown Panel */}
        {isOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 md:w-[720px] lg:w-[850px] md:-left-36 lg:-left-48 top-full mt-1.5 bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/80 max-h-96 overflow-y-auto backdrop-blur-md">
            <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{results.length} Items (Click <strong className="text-cyan-400">+ Add</strong> on any item to add multiple items)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition flex items-center gap-1 text-[11px]"
              >
                <span>Done / Close (Esc)</span>
              </button>
            </div>
            {results.map((item, idx) => {
              const displayPrice = (priceTier === 'wholesale' && item.wholesalePrice && item.wholesalePrice > 0) ? item.wholesalePrice : item.mrp;
              const isJustAdded = lastAddedId === item.id;
              return (
                <div
                  key={item.id}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  onClick={() => {
                    handleSelect(item, true);
                    setLastAddedId(item.id);
                    setTimeout(() => setLastAddedId(null), 1200);
                  }}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-4 transition-all ${
                    idx === selectedIndex ? 'bg-cyan-950/90 border-l-4 border-cyan-400 text-white' : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-950 rounded-lg text-amber-400 border border-slate-700 shrink-0">
                      {item.itemCode}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-xs md:text-sm text-slate-100 whitespace-normal break-words leading-snug">
                        {item.itemName}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded-md text-amber-300 font-bold border border-slate-700 text-[11px]">{item.category}</span>
                        <span className="text-[11px]">Stock: <strong className={item.stockQty < 10 ? 'text-red-400 text-xs' : 'text-emerald-400 font-bold'}>{item.stockQty}</strong></span>
                        {item.defaultGstRate > 0 && item.isGstApplicable && (
                          <span className="text-slate-500 font-mono text-[11px]">GST {item.defaultGstRate}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs md:text-base font-black text-amber-400">
                        ₹{displayPrice}
                      </div>
                      {item.wholesalePrice && item.wholesalePrice > 0 && priceTier === 'retail' && (
                        <div className="text-[10px] text-slate-400 font-mono font-bold">WS: ₹{item.wholesalePrice}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item, true);
                        setLastAddedId(item.id);
                        setTimeout(() => setLastAddedId(null), 1200);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wide shadow-md transition shrink-0 ${
                        isJustAdded
                          ? 'bg-emerald-500 text-slate-950 animate-bounce'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {isJustAdded ? '✓ Added!' : '+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Toolbar Actions (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {/* User Auth Profile Pill (Desktop) */}
        {currentUser ? (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 text-amber-400" title="Admin Account">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {currentUser.username}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">ADMIN</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">{currentUser.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400" title="Worker Account">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {currentUser.username}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">WORKER</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">{currentUser.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="ml-1 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-md transition shrink-0"
          >
            <UserIcon className="w-4 h-4" />
            <span>Staff Login</span>
          </button>
        )}

        {/* Wholesale vs Retail Price Mode Switch */}
        <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onTogglePriceTier('retail')}
            className={`px-2 py-1 rounded-lg font-bold text-[10px] md:text-[11px] transition ${
              priceTier === 'retail' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Retail
          </button>
          <button
            onClick={() => onTogglePriceTier('wholesale')}
            className={`px-2 py-1 rounded-lg font-bold text-[10px] md:text-[11px] transition ${
              priceTier === 'wholesale' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wholesale
          </button>
        </div>

        {/* Petty Expenses Button */}
        <button
          onClick={onOpenPettyExpenses}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition shrink-0"
          title="Expenses"
        >
          <Wallet className="w-3.5 h-3.5 text-rose-400" />
          <span>Expenses</span>
        </button>

        {/* Day Closing Z-Report Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onOpenDayClosing}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition shrink-0"
            title="Z-Report"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Z-Report</span>
          </button>
        )}

        {/* Held Bills Button */}
        <button
          onClick={onOpenHeldBills}
          className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition shrink-0"
          title="Held Bills"
        >
          <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Held</span>
          {heldBillsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px]">
              {heldBillsCount}
            </span>
          )}
        </button>

        {/* New Bill Button */}
        <button
          onClick={onNewBill}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition shrink-0"
          title="New Bill"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>New</span>
        </button>

        {/* Inventory Button */}
        <button
          onClick={onOpenInventory}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition shrink-0"
          title="Inventory"
        >
          <Package className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Stock</span>
        </button>

        {/* History / Bills Button */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition shrink-0"
          title="History"
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span>Bills</span>
        </button>

        {/* Printer Status Indicator */}
        {detectedPrinter ? (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 transition text-[11px] font-bold shrink-0 shadow-sm"
            title={`Connected Windows USB Thermal Printer: ${detectedPrinter.name} (${detectedPrinter.port}) - Click to configure`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">{detectedPrinter.name}</span>
            <span className="xl:hidden">USB Printer</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 transition shrink-0"
            title="Thermal Printer Settings"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">3" Printer</span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 shrink-0"
          title="Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
