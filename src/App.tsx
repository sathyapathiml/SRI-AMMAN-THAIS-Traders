import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { 
  Item, 
  CartLineItem, 
  Invoice, 
  HeldBill, 
  StoreSettings, 
  PrinterConfig, 
  PaymentMode, 
  DiscountType,
  PriceTier,
  PettyExpense,
  User
} from './types/pos';
import { 
  getStoredInventory, 
  saveInventory, 
  getStoredInvoices, 
  saveInvoiceToDB, 
  getNextInvoiceNumber, 
  getStoredHeldBills, 
  saveHeldBillsToDB, 
  getStoredSettings, 
  saveSettingsToDB, 
  getStoredPrinterConfig, 
  savePrinterConfigToDB, 
  resetInventoryToDefault 
} from './services/db';
import { calculateCartTotals, createCartItemFromItem, calculateLineItem } from './utils/calculations';
import { printInvoiceViaSerial } from './services/serialPrinter';
import { 
  fetchLanHealth, 
  fetchLanInventory, 
  fetchLanInvoices, 
  postLanInvoice, 
  saveLanInventoryItem, 
  deleteLanInventoryItem, 
  resetLanInventory, 
  fetchLanSettings, 
  saveLanSettings,
  fetchLanExpenses,
  postLanExpense,
  deleteLanExpense
} from './services/api';

import { HeaderBar } from './components/HeaderBar';
import { BillingTable } from './components/BillingTable';
import { CheckoutPanel } from './components/CheckoutPanel';
import { CheckoutModal } from './components/CheckoutModal';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { BulkDiscountModal } from './components/BulkDiscountModal';
import { HeldBillsModal } from './components/HeldBillsModal';
import { InventoryModal } from './components/InventoryModal';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { PettyExpensesModal } from './components/PettyExpensesModal';
import { DayClosingModal } from './components/DayClosingModal';
import { LoginModal } from './components/LoginModal';

// Default pre-seeded admin profile for sathyapathi555@gmail.com
const DEFAULT_ADMIN: User = {
  id: 'user-admin-default',
  username: 'Sathyapathi (Admin)',
  email: 'sathyapathi555@gmail.com',
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Default pre-seeded worker profile for cashiers on other PCs
const DEFAULT_WORKER: User = {
  id: 'user-worker-default',
  username: 'Counter Cashier',
  email: 'cashier@store.com',
  role: 'worker',
  createdAt: new Date().toISOString()
};

export function App() {
  // Data state
  const [inventory, setInventory] = useState<Item[]>(() => getStoredInventory());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => getStoredHeldBills());
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(() => getStoredPrinterConfig());

  // Direct Admin Access on Main System (localhost), Direct Worker Access on Other Counter PCs
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pos_current_user');
      if (saved) return JSON.parse(saved);
      // Main system gets direct Admin access; other LAN/Cloud PCs get direct Worker access
      const isMainSystem = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      return isMainSystem ? DEFAULT_ADMIN : DEFAULT_WORKER;
    } catch {
      return DEFAULT_ADMIN;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Retail vs Wholesale Mode
  const [priceTier, setPriceTier] = useState<PriceTier>('retail');

  // Overall Bill-Level Discount state
  const [overallDiscountValue, setOverallDiscountValue] = useState<number>(0);
  const [overallDiscountType, setOverallDiscountType] = useState<DiscountType>('flat');

  // Petty Cash Expenses state
  const [expenses, setExpenses] = useState<PettyExpense[]>([]);

  // LAN Server Sync state
  const [lanConnected, setLanConnected] = useState<boolean>(false);
  const [lanIp, setLanIp] = useState<string>('');

  // Active cashier cart state
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isEstimateMode, setIsEstimateMode] = useState<boolean>(false);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBulkDiscountOpen, setIsBulkDiscountOpen] = useState(false);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPettyExpensesOpen, setIsPettyExpensesOpen] = useState(false);
  const [isDayClosingOpen, setIsDayClosingOpen] = useState(false);

  // Active printed invoice state
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Input ref for barcode search bar focus shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculated totals with Overall Bill-Level Discount
  const totals = useMemo(
    () => calculateCartTotals(cartItems, overallDiscountValue, overallDiscountType),
    [cartItems, overallDiscountValue, overallDiscountType]
  );

  // Handle Login Success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pos_current_user', JSON.stringify(user));
    } catch {}
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pos_current_user');
    } catch {}
    setIsLoginModalOpen(true);
  };

  // Periodic LAN Server Health & Multi-Counter Sync
  useEffect(() => {
    const syncWithLanServer = async () => {
      const health = await fetchLanHealth();
      if (health) {
        setLanConnected(true);
        setLanIp(health.lanIp);

        const lanInv = await fetchLanInventory();
        if (lanInv) {
          setInventory(lanInv);
          saveInventory(lanInv);
        }

        const lanInvs = await fetchLanInvoices();
        if (lanInvs) {
          setInvoices(lanInvs);
        }

        const lanExps = await fetchLanExpenses();
        if (lanExps) {
          setExpenses(lanExps);
        }

        const lanSet = await fetchLanSettings();
        if (lanSet) {
          setSettings(lanSet);
          saveSettingsToDB(lanSet);
        }
      } else {
        setLanConnected(false);
      }
    };

    syncWithLanServer();
    const timer = setInterval(syncWithLanServer, 4000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'f') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      if (e.key === 'F2') {
        e.preventDefault();
        handleNewBill();
      }

      if (e.key === 'F10' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        if (cartItems.length > 0) {
          setIsEstimateMode(false);
          setIsCheckoutOpen(true);
        }
      }

      if (e.key === 'F4') {
        e.preventDefault();
        if (cartItems.length > 0) {
          handleHoldBill();
        }
      }

      if (e.key === 'Escape') {
        if (isLoginModalOpen) setIsLoginModalOpen(false);
        else if (isReceiptModalOpen) setIsReceiptModalOpen(false);
        else if (isCheckoutOpen) setIsCheckoutOpen(false);
        else if (isBulkDiscountOpen) setIsBulkDiscountOpen(false);
        else if (isHeldBillsOpen) setIsHeldBillsOpen(false);
        else if (isInventoryOpen) setIsInventoryOpen(false);
        else if (isHistoryOpen) setIsHistoryOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isPettyExpensesOpen) setIsPettyExpensesOpen(false);
        else if (isDayClosingOpen) setIsDayClosingOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, isLoginModalOpen, isCheckoutOpen, isBulkDiscountOpen, isHeldBillsOpen, isInventoryOpen, isHistoryOpen, isSettingsOpen, isReceiptModalOpen, isPettyExpensesOpen, isDayClosingOpen]);

  // Price Tier Switch Handler
  const handleTogglePriceTier = (newTier: PriceTier) => {
    setPriceTier(newTier);
    // Recalculate existing cart items with new price tier
    setCartItems(prev =>
      prev.map(cartItem => {
        const masterItem = inventory.find(i => i.itemCode === cartItem.itemCode);
        const newPrice = (newTier === 'wholesale' && masterItem?.wholesalePrice && masterItem.wholesalePrice > 0)
          ? masterItem.wholesalePrice
          : (masterItem?.mrp || cartItem.mrp);

        return calculateLineItem(
          cartItem.itemCode,
          cartItem.itemName,
          newPrice,
          cartItem.qty,
          cartItem.stockQty,
          cartItem.discountValue,
          cartItem.discountType,
          cartItem.gstRate,
          cartItem.isGstApplicable,
          cartItem.id
        );
      })
    );
  };

  // Cart actions
  const handleSelectItem = (item: Item) => {
    setCartItems(prevItems => {
      const existingIdx = prevItems.findIndex(i => i.itemCode === item.itemCode);
      if (existingIdx >= 0) {
        const existing = prevItems[existingIdx];
        const newQty = existing.qty + 1;
        const updated = calculateLineItem(
          existing.itemCode,
          existing.itemName,
          existing.mrp,
          newQty,
          existing.stockQty,
          existing.discountValue,
          existing.discountType,
          existing.gstRate,
          existing.isGstApplicable,
          existing.id
        );
        const newArr = [...prevItems];
        newArr[existingIdx] = updated;
        return newArr;
      } else {
        const newItem = createCartItemFromItem(item, 1, priceTier);
        return [...prevItems, newItem];
      }
    });
  };

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return calculateLineItem(
            item.itemCode,
            item.itemName,
            item.mrp,
            qty,
            item.stockQty,
            item.discountValue,
            item.discountType,
            item.gstRate,
            item.isGstApplicable,
            item.id
          );
        }
        return item;
      })
    );
  };

  const handleUpdateDiscount = (id: string, discountValue: number, discountType: DiscountType) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return calculateLineItem(
            item.itemCode,
            item.itemName,
            item.mrp,
            item.qty,
            item.stockQty,
            discountValue,
            discountType,
            item.gstRate,
            item.isGstApplicable,
            item.id
          );
        }
        return item;
      })
    );
  };

  const handleUpdateGst = (id: string, isGstApplicable: boolean, gstRate: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return calculateLineItem(
            item.itemCode,
            item.itemName,
            item.mrp,
            item.qty,
            item.stockQty,
            item.discountValue,
            item.discountType,
            gstRate,
            isGstApplicable,
            item.id
          );
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleApplyBulkDiscount = (discountValue: number, discountType: DiscountType) => {
    setCartItems(prev =>
      prev.map(item =>
        calculateLineItem(
          item.itemCode,
          item.itemName,
          item.mrp,
          item.qty,
          item.stockQty,
          discountValue,
          discountType,
          item.gstRate,
          item.isGstApplicable,
          item.id
        )
      )
    );
  };

  const handleNewBill = () => {
    setCartItems([]);
    setCashTendered('');
    setPaymentMode('Cash');
    setOverallDiscountValue(0);
    setOverallDiscountType('flat');
    setIsEstimateMode(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleHoldBill = () => {
    if (cartItems.length === 0) return;
    const newHold: HeldBill = {
      id: `hold-${Date.now()}`,
      holdName: `Bill #${heldBills.length + 1} (${cartItems.length} items)`,
      createdAt: new Date().toISOString(),
      items: cartItems
    };
    const updated = [newHold, ...heldBills];
    setHeldBills(updated);
    saveHeldBillsToDB(updated);
    handleNewBill();
  };

  const handleRestoreHeldBill = (bill: HeldBill) => {
    setCartItems(bill.items);
    const updated = heldBills.filter(b => b.id !== bill.id);
    setHeldBills(updated);
    saveHeldBillsToDB(updated);
  };

  const handleDeleteHeldBill = (id: string) => {
    const updated = heldBills.filter(b => b.id !== id);
    setHeldBills(updated);
    saveHeldBillsToDB(updated);
  };

  // Complete Invoice transaction or Print Proforma Estimate
  const handleConfirmInvoice = async (customerName: string, customerPhone: string, isEstimate = false) => {
    const cashNum = parseFloat(cashTendered) || 0;

    const draftInvoice: Partial<Invoice> = {
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      items: cartItems,
      subtotalMRP: totals.subtotalMRP,
      itemDiscountsTotal: totals.itemDiscountsTotal,
      overallDiscountValue: totals.overallDiscountValue,
      overallDiscountType: totals.overallDiscountType,
      overallDiscountAmount: totals.overallDiscountAmount,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      totalCGST: totals.totalCGST,
      totalSGST: totals.totalSGST,
      totalGST: totals.totalGST,
      grandTotal: totals.grandTotal,
      paymentMode,
      cashTendered: paymentMode === 'Cash' ? cashNum : undefined,
      changeReturned: paymentMode === 'Cash' ? Math.max(0, cashNum - totals.grandTotal) : undefined,
      isEstimate
    };

    let finalInvoice: Invoice;

    if (isEstimate) {
      // Proforma Estimate: Do not increment invoice sequence or deduct stock
      finalInvoice = {
        ...draftInvoice,
        invoiceNo: `EST-${Date.now().toString().slice(-6)}`
      } as Invoice;
    } else if (lanConnected) {
      const res = await postLanInvoice(draftInvoice);
      if (res) {
        finalInvoice = res.invoice;
        setInvoices(res.invoices);
        setInventory(res.inventory);
        saveInventory(res.inventory);
      } else {
        const invNo = getNextInvoiceNumber(settings.invoicePrefix);
        finalInvoice = { ...draftInvoice, invoiceNo: invNo } as Invoice;
        const updated = saveInvoiceToDB(finalInvoice);
        setInvoices(updated);
        setInventory(getStoredInventory());
      }
    } else {
      const invNo = getNextInvoiceNumber(settings.invoicePrefix);
      finalInvoice = { ...draftInvoice, invoiceNo: invNo } as Invoice;
      const updated = saveInvoiceToDB(finalInvoice);
      setInvoices(updated);
      setInventory(getStoredInventory());
    }

    setCreatedInvoice(finalInvoice);
    setIsCheckoutOpen(false);
    setIsReceiptModalOpen(true);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (printerConfig.printMode === 'serial') {
      try {
        await printInvoiceViaSerial(finalInvoice, settings, printerConfig);
      } catch (err) {
        console.warn('Serial print fallback to browser modal receipt', err);
      }
    }

    if (!isEstimate) {
      handleNewBill();
    }
  };

  // Petty Expense actions
  const handleAddExpense = async (expData: Omit<PettyExpense, 'id' | 'createdAt'>) => {
    const newExp: PettyExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      staffName: expData.staffName || currentUser?.username || 'Cashier'
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);

    if (lanConnected) {
      const lanUpdated = await postLanExpense(newExp);
      if (lanUpdated) setExpenses(lanUpdated);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);

    if (lanConnected) {
      const lanUpdated = await deleteLanExpense(id);
      if (lanUpdated) setExpenses(lanUpdated);
    }
  };

  // Inventory Save handler
  const handleSaveItem = async (item: Item) => {
    const existingIdx = inventory.findIndex(i => i.id === item.id);
    let updated: Item[];
    if (existingIdx >= 0) {
      updated = [...inventory];
      updated[existingIdx] = item;
    } else {
      updated = [item, ...inventory];
    }
    setInventory(updated);
    saveInventory(updated);

    if (lanConnected) {
      const lanUpdated = await saveLanInventoryItem(item);
      if (lanUpdated) setInventory(lanUpdated);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    saveInventory(updated);

    if (lanConnected) {
      const lanUpdated = await deleteLanInventoryItem(id);
      if (lanUpdated) setInventory(lanUpdated);
    }
  };

  const handleResetInventory = async () => {
    const def = resetInventoryToDefault();
    setInventory(def);

    if (lanConnected) {
      const lanUpdated = await resetLanInventory();
      if (lanUpdated) setInventory(lanUpdated);
    }
  };

  const handleImportInventory = async (items: Item[]) => {
    setInventory(items);
    saveInventory(items);

    if (lanConnected) {
      for (const item of items) {
        await saveLanInventoryItem(item);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header Navbar */}
      <HeaderBar
        inventory={inventory}
        onSelectItem={handleSelectItem}
        onNewBill={handleNewBill}
        onOpenCheckout={() => {
          setIsEstimateMode(false);
          setIsCheckoutOpen(true);
        }}
        onOpenHeldBills={() => setIsHeldBillsOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPettyExpenses={() => setIsPettyExpensesOpen(true)}
        onOpenDayClosing={() => setIsDayClosingOpen(true)}
        heldBillsCount={heldBills.length}
        printerConnected={false}
        printMode={printerConfig.printMode}
        searchInputRef={searchInputRef}
        lanConnected={lanConnected}
        lanIp={lanIp}
        priceTier={priceTier}
        onTogglePriceTier={handleTogglePriceTier}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Split POS View */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-2 md:p-4 min-h-0 overflow-y-auto lg:overflow-hidden pb-16 lg:pb-4">
        <BillingTable
          cartItems={cartItems}
          onUpdateQty={handleUpdateQty}
          onUpdateDiscount={handleUpdateDiscount}
          onUpdateGst={handleUpdateGst}
          onRemoveItem={handleRemoveItem}
          onOpenBulkDiscount={() => setIsBulkDiscountOpen(true)}
        />

        <CheckoutPanel
          totals={totals}
          paymentMode={paymentMode}
          onSetPaymentMode={setPaymentMode}
          onOpenCheckoutModal={(isEstimate) => {
            setIsEstimateMode(!!isEstimate);
            setIsCheckoutOpen(true);
          }}
          onHoldBill={handleHoldBill}
          onClearCart={handleNewBill}
          cashTendered={cashTendered}
          onSetCashTendered={setCashTendered}
          overallDiscountValue={overallDiscountValue}
          overallDiscountType={overallDiscountType}
          onSetOverallDiscount={(val, type) => {
            setOverallDiscountValue(val);
            setOverallDiscountType(type);
          }}
        />
      </main>

      {/* Floating Sticky Mobile Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total ({totals.totalQty} items)
            </div>
            <div className="text-lg font-black font-mono text-cyan-400">
              ₹{totals.grandTotal.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => {
              setIsEstimateMode(false);
              setIsCheckoutOpen(true);
            }}
            className="py-2.5 px-5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950 flex items-center gap-2 active:scale-95 transition"
          >
            <span>Checkout Now</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Modals & Dialogs */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totals={totals}
        cartItems={cartItems}
        paymentMode={paymentMode}
        cashTendered={cashTendered}
        settings={settings}
        printerConfig={printerConfig}
        isEstimate={isEstimateMode}
        onConfirmInvoice={handleConfirmInvoice}
      />

      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoice={createdInvoice}
        settings={settings}
        onPrintSerial={
          printerConfig.printMode === 'serial' && createdInvoice
            ? () => printInvoiceViaSerial(createdInvoice, settings, printerConfig)
            : undefined
        }
      />

      <BulkDiscountModal
        isOpen={isBulkDiscountOpen}
        onClose={() => setIsBulkDiscountOpen(false)}
        onApplyBulkDiscount={handleApplyBulkDiscount}
      />

      <HeldBillsModal
        isOpen={isHeldBillsOpen}
        onClose={() => setIsHeldBillsOpen(false)}
        heldBills={heldBills}
        onRestoreBill={handleRestoreHeldBill}
        onDeleteHeldBill={handleDeleteHeldBill}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onSaveItem={handleSaveItem}
        onDeleteItem={handleDeleteItem}
        onResetInventory={handleResetInventory}
        onImportInventory={handleImportInventory}
      />

      <InvoiceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        invoices={invoices}
        settings={settings}
        onSelectInvoiceToPrint={(inv) => {
          setCreatedInvoice(inv);
          setIsReceiptModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(s) => {
          setSettings(s);
          saveSettingsToDB(s);
          if (lanConnected) saveLanSettings(s);
        }}
        printerConfig={printerConfig}
        onSavePrinterConfig={(c) => {
          setPrinterConfig(c);
          savePrinterConfigToDB(c);
        }}
      />

      <PettyExpensesModal
        isOpen={isPettyExpensesOpen}
        onClose={() => setIsPettyExpensesOpen(false)}
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <DayClosingModal
        isOpen={isDayClosingOpen}
        onClose={() => setIsDayClosingOpen(false)}
        invoices={invoices}
        expenses={expenses}
        settings={settings}
        printerConfig={printerConfig}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}

export default App;
