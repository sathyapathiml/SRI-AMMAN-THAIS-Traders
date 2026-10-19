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
  Printer,
  X,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ShoppingCart,
  Layers,
  Filter,
  Check
} from 'lucide-react';

interface HeaderBarProps {
  inventory: Item[];
  onSelectItem: (item: Item, qty?: number) => void;
  onSelectMultipleItems?: (itemsWithQty: { item: Item; qty: number }[]) => void;
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

// Parse smart search syntax with quantity like "5*101" or "101*5" or "5 x 101"
const parseSearchInput = (input: string): { searchTerm: string; parsedQty: number } => {
  const trimmed = input.trim();
  if (!trimmed) return { searchTerm: '', parsedQty: 1 };

  // Prefix match: "5*101" or "5 * 101" or "5x101" or "5 x 101"
  const prefixMatch = trimmed.match(/^(\d+)\s*[*xX]\s*(.+)$/);
  if (prefixMatch) {
    const qty = parseInt(prefixMatch[1], 10);
    const term = prefixMatch[2].trim();
    if (qty > 0 && term) {
      return { searchTerm: term, parsedQty: qty };
    }
  }

  // Suffix match: "101*5" or "101 * 5" or "101x5" or "101 x 5"
  const suffixMatch = trimmed.match(/^(.+?)\s*[*xX]\s*(\d+)$/);
  if (suffixMatch) {
    const term = suffixMatch[1].trim();
    const qty = parseInt(suffixMatch[2], 10);
    if (qty > 0 && term) {
      return { searchTerm: term, parsedQty: qty };
    }
  }

  return { searchTerm: trimmed, parsedQty: 1 };
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  inventory,
  onSelectItem,
  onSelectMultipleItems,
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
  const [lastAddedInfo, setLastAddedInfo] = useState<{ id: string; qty: number } | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Unique list of categories in inventory for category-wise quick selection
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    inventory.forEach(i => {
      if (i.category) set.add(i.category.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [inventory]);

  // Parse smart quantity syntax like "5*101" or "101*5"
  const { searchTerm, parsedQty } = React.useMemo(() => {
    return parseSearchInput(query);
  }, [query]);

  const getItemQty = (itemId: string) => itemQuantities[itemId] || parsedQty || 1;
  const setItemQty = (itemId: string, qty: number) => {
    setItemQuantities(prev => ({ ...prev, [itemId]: Math.max(1, qty) }));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      results.forEach(i => next.add(i.id));
      return next;
    });
  };

  const deselectAll = () => {
    setSelectedItemIds(new Set());
  };

  // Filter items matching searchTerm and selectedCategory
  useEffect(() => {
    if (!searchTerm.trim() && !isOpen) {
      setResults([]);
      return;
    }

    try {
      let filtered = inventory;

      if (selectedCategory !== 'All') {
        filtered = filtered.filter(i => i.category === selectedCategory);
      }

      if (searchTerm.trim()) {
        const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filtered = filtered.filter(
          item => regex.test(item.itemCode) || regex.test(item.itemName) || regex.test(item.category)
        );
      }

      setResults(filtered.slice(0, 100)); // Up to 100 items for multi-selection
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
  }, [searchTerm, selectedCategory, inventory, isOpen]);

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

  // Selected items with their quantities for bulk adding
  const selectedItemsList = React.useMemo(() => {
    return Array.from(selectedItemIds).map(id => {
      const item = inventory.find(i => i.id === id);
      return item ? { item, qty: getItemQty(id) } : null;
    }).filter((x): x is { item: Item; qty: number } => x !== null);
  }, [selectedItemIds, itemQuantities, parsedQty, inventory]);

  const selectedTotalQty = React.useMemo(() => {
    return selectedItemsList.reduce((sum, i) => sum + i.qty, 0);
  }, [selectedItemsList]);

  const selectedTotalPrice = React.useMemo(() => {
    return selectedItemsList.reduce((sum, { item, qty }) => {
      const price = (priceTier === 'wholesale' && item.wholesalePrice && item.wholesalePrice > 0)
        ? item.wholesalePrice
        : item.mrp;
      return sum + (price * qty);
    }, 0);
  }, [selectedItemsList, priceTier]);

  const handleAddSelectedItems = () => {
    if (selectedItemsList.length === 0) return;
    if (onSelectMultipleItems) {
      onSelectMultipleItems(selectedItemsList);
    } else {
      selectedItemsList.forEach(({ item, qty }) => onSelectItem(item, qty));
    }
    setSelectedItemIds(new Set());
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
    setItemQuantities({});
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelect = (item: Item, qty?: number, closeAndClear = true) => {
    const finalQty = qty !== undefined ? qty : getItemQty(item.id);
    onSelectItem(item, finalQty);
    setLastAddedInfo({ id: item.id, qty: finalQty });
    setTimeout(() => setLastAddedInfo(null), 1500);

    if (closeAndClear) {
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(0);
      setItemQuantities({});
      setSelectedItemIds(new Set());
    } else {
      if (searchInputRef.current) {
        searchInputRef.current.select();
      }
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
      // If multiple items are checked, Enter adds all checked items!
      if (selectedItemIds.size > 0) {
        handleAddSelectedItems();
        return;
      }
      if (results.length > 0) {
        const exactCodeMatch = results.find(
          i => i.itemCode.toLowerCase() === searchTerm.toLowerCase()
        );
        const targetItem = exactCodeMatch || results[selectedIndex] || results[0];
        if (targetItem) {
          const qty = getItemQty(targetItem.id);
          handleSelect(targetItem, qty, true);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
      setItemQuantities({});
      setSelectedItemIds(new Set());
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

      {/* Center: Global Touch & Keyboard Search Bar with Multi-Select Catalog */}
      <div className="relative flex-1 max-w-2xl" ref={searchContainerRef}>
        <div className="relative flex items-center gap-1.5">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                e.target.select();
                setIsOpen(true);
              }}
              placeholder="Scan or Search (e.g. 101 or 5*101) or Browse..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 text-slate-100 text-xs md:text-sm font-semibold rounded-xl pl-9 md:pl-10 pr-24 py-2 outline-none transition-all placeholder:text-slate-500 shadow-inner"
            />
            {parsedQty > 1 && (
              <span className="absolute right-10 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] md:text-[11px] font-bold border border-amber-500/30 pointer-events-none">
                Qty: {parsedQty}x
              </span>
            )}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setItemQuantities({});
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Toggle Browse / Multi-Select Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(prev => !prev);
              if (!isOpen && searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
            className={`px-2.5 md:px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
              isOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Browse Categories & Multi-Select Items"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Browse</span>
            {selectedItemIds.size > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                {selectedItemIds.size}
              </span>
            )}
          </button>
        </div>

        {/* Wide View Auto-complete Dropdown Panel with Multi-Select */}
        {isOpen && (
          <div className="absolute left-0 right-0 md:w-[780px] lg:w-[920px] md:-left-36 lg:-left-56 top-full mt-1.5 bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[75vh] backdrop-blur-md">
            {/* Header: Category Filter Pills */}
            <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                <span>Category:</span>
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-header Controls Bar */}
            <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition flex items-center gap-1 text-[11px]"
                  title="Select all currently visible matching items"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All ({results.length})</span>
                </button>
                {selectedItemIds.size > 0 && (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700 transition text-[11px]"
                  >
                    Deselect All
                  </button>
                )}
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  • Tick checkboxes to multi-select items and add all together
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedItemIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleAddSelectedItems}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg shadow-md flex items-center gap-1 text-xs transition active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add Selected ({selectedItemIds.size})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                    setItemQuantities({});
                    setSelectedItemIds(new Set());
                    searchInputRef.current?.focus();
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition flex items-center gap-1 text-[11px]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 min-h-0">
              {results.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-bold text-slate-400 text-sm">No items found matching "{searchTerm}"</p>
                  <p className="text-xs mt-1">Try switching category or clearing the search box.</p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const displayPrice = (priceTier === 'wholesale' && item.wholesalePrice && item.wholesalePrice > 0) ? item.wholesalePrice : item.mrp;
                  const currentQty = getItemQty(item.id);
                  const isJustAdded = lastAddedInfo?.id === item.id;
                  const isSelected = selectedItemIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      onClick={() => {
                        // If user is actively multi-selecting, clicking row toggles checkbox;
                        // Otherwise, clicking row adds single item and clears.
                        if (selectedItemIds.size > 0) {
                          toggleSelectItem(item.id);
                        } else {
                          handleSelect(item, currentQty, true);
                        }
                      }}
                      className={`px-3 md:px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? 'bg-cyan-950/80 border-l-4 border-cyan-400 text-white'
                          : idx === selectedIndex
                            ? 'bg-slate-800/90 text-white'
                            : 'hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      {/* Left: Selection Checkbox & Item Info */}
                      <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(item.id);
                          }}
                          className="p-1 text-slate-400 hover:text-cyan-400 transition shrink-0"
                          title={isSelected ? 'Deselect item' : 'Select item for multi-add'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>

                        <span className="font-mono text-xs font-black px-2 py-1 bg-slate-950 rounded-lg text-amber-400 border border-slate-700 shrink-0">
                          {item.itemCode}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-xs md:text-sm text-slate-100 whitespace-normal break-words leading-snug">
                            {item.itemName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2.5 flex-wrap">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold border border-slate-700 text-[10px] md:text-[11px]">{item.category}</span>
                            <span className="text-[10px] md:text-[11px]">Stock: <strong className={item.stockQty < 10 ? 'text-red-400 text-xs' : 'text-emerald-400 font-bold'}>{item.stockQty}</strong></span>
                            {item.defaultGstRate > 0 && item.isGstApplicable && (
                              <span className="text-slate-500 font-mono text-[10px] md:text-[11px]">GST {item.defaultGstRate}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price, Quantity Stepper, & Add Button */}
                      <div className="flex items-center gap-2 md:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          <div className="text-xs md:text-sm font-black text-amber-400">
                            ₹{displayPrice}
                          </div>
                          {item.wholesalePrice && item.wholesalePrice > 0 && priceTier === 'retail' && (
                            <div className="text-[10px] text-slate-400 font-mono font-bold">WS: ₹{item.wholesalePrice}</div>
                          )}
                        </div>

                        {/* Quantity Stepper & Input */}
                        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5 shadow-inner">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemQty(item.id, currentQty - 1);
                            }}
                            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stockQty > 0 ? item.stockQty : 9999}
                            value={currentQty}
                            onChange={(e) => {
                              e.stopPropagation();
                              setItemQty(item.id, parseInt(e.target.value, 10) || 1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(item, currentQty, true);
                              }
                            }}
                            className="w-9 md:w-11 text-center bg-transparent text-xs font-black font-mono text-cyan-300 outline-none p-0"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemQty(item.id, currentQty + 1);
                            }}
                            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                            title="Increase Quantity"
                          >
                            <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                        </div>

                        {/* Add Single Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(item, currentQty, true);
                          }}
                          className={`px-2.5 md:px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wide shadow-md transition flex items-center gap-1 shrink-0 ${
                            isJustAdded
                              ? 'bg-emerald-500 text-slate-950 animate-bounce'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95'
                          }`}
                        >
                          {isJustAdded ? `✓ Added ${lastAddedInfo?.qty}x!` : `+ Add (${currentQty})`}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Bottom Action Bar for Multi-Item Adding */}
            {selectedItemIds.size > 0 && (
              <div className="bg-slate-950 px-4 py-3 border-t-2 border-emerald-500/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xl shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <span className="text-emerald-400">{selectedItemIds.size} Items Selected</span>
                      <span className="text-slate-400">• Total Qty: <strong className="text-cyan-300 font-mono">{selectedTotalQty} pcs</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Estimated Subtotal: <strong className="text-amber-400 font-mono font-bold">₹{selectedTotalPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedItems}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Add All {selectedItemIds.size} Selected Items to Bill</span>
                  </button>
                </div>
              </div>
            )}
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
