import React, { useState } from 'react';
import type { StoreSettings, PrinterConfig, User, Invoice } from '../types/pos';
import { Settings as SettingsIcon, Printer, Store, Save, X, Cpu, CheckCircle, Zap } from 'lucide-react';
import { requestSerialPort, isWebSerialSupported, testSerialPrint } from '../services/serialPrinter';
import { printViaUsbApi } from '../services/api';
import { buildEscPosBuffer, bufferToBase64 } from '../services/escpos';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  printerConfig: PrinterConfig;
  onSavePrinterConfig: (config: PrinterConfig) => void;
  currentUser?: User | null;
  detectedPrinter?: { name: string; port: string; driver?: string; isTvs?: boolean } | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  printerConfig,
  onSavePrinterConfig,
  currentUser,
  detectedPrinter
}) => {
  const [storeForm, setStoreForm] = useState<StoreSettings>(settings);
  const [printerForm, setPrinterForm] = useState<PrinterConfig>(printerConfig);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'store' | 'printer'>('store');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      onSaveSettings(storeForm);
    } else {
      // Workers can only update their local counter number
      onSaveSettings({
        ...settings,
        counterNo: storeForm.counterNo || 'Counter 1'
      });
    }
    onSavePrinterConfig(printerForm);
    setStatusMsg('Settings saved successfully!');
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 1000);
  };

  const handleConnectPort = async () => {
    try {
      const port = await requestSerialPort(printerForm.baudRate);
      if (port) {
        setPrinterForm(prev => ({
          ...prev,
          printMode: 'serial',
          connectedPortName: 'COM / USB Serial Thermal Printer'
        }));
        setStatusMsg('Successfully connected to Web Serial thermal printer port!');
      }
    } catch (err: any) {
      alert(`Serial Port Connection Error: ${err.message}`);
    }
  };

  const handleTestPrint = async () => {
    try {
      setStatusMsg('Sending test print ESC/POS bytes...');
      await testSerialPrint(storeForm, printerForm);
      setStatusMsg('Test print command sent successfully!');
    } catch (err: any) {
      alert(`Test Print Error: ${err.message}`);
    }
  };

  const handleUsbTestPrint = async () => {
    try {
      const dummyInvoice: Invoice = {
        id: 'test-01',
        invoiceNo: 'TEST-00001',
        createdAt: new Date().toISOString(),
        customerName: 'TVSE RP-3200 LITE TEST',
        items: [
          {
            id: 't-1',
            itemCode: 'TEST01',
            itemName: 'TVS RP-3200 Lite 3-Inch Test Item',
            mrp: 100,
            qty: 1,
            stockQty: 50,
            discountValue: 0,
            discountType: 'percent',
            lineSubtotalMRP: 100,
            lineDiscountAmount: 0,
            lineTaxableAmount: 100,
            gstRate: 0,
            isGstApplicable: false,
            lineGstAmount: 0,
            lineCgstAmount: 0,
            lineSgstAmount: 0,
            lineGrandTotal: 100
          }
        ],
        subtotalMRP: 100,
        itemDiscountsTotal: 0,
        totalDiscount: 0,
        taxableAmount: 100,
        totalCGST: 0,
        totalSGST: 0,
        totalGST: 0,
        grandTotal: 100,
        paymentMode: 'Cash'
      };

      const escPosBytes = buildEscPosBuffer(dummyInvoice, storeForm, printerForm.autoCut, printerForm.openCashDrawer);
      const base64 = bufferToBase64(escPosBytes);
      const ok = await printViaUsbApi(detectedPrinter?.name || 'TVSE RP3200 Lite', base64);
      if (ok) {
        setStatusMsg('Test receipt sent to TVSE RP3200 Lite over USB!');
      } else {
        setStatusMsg('Could not send USB test print. Ensure TVSE printer is connected and turned on.');
      }
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      setStatusMsg('Print error: ' + err.message);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-base">Store & ESC/POS Printer Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 shrink-0">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'store'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Store Header Info</span>
          </button>
          <button
            onClick={() => setActiveTab('printer')}
            className={`flex-1 py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'printer'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Web Serial & ESC/POS Hardware</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAll} className="p-6 overflow-y-auto flex-1 space-y-4">
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {activeTab === 'store' ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 font-bold text-white outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeForm.storeTagline}
                  onChange={(e) => setStoreForm({ ...storeForm, storeTagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 outline-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeForm.addressLine1}
                    onChange={(e) => setStoreForm({ ...storeForm, addressLine1: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Address Line 2 / City</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeForm.addressLine2}
                    onChange={(e) => setStoreForm({ ...storeForm, addressLine2: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Phone Number(s)</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeForm.gstin}
                    onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-amber-300 outline-none font-mono uppercase disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeForm.invoicePrefix}
                    onChange={(e) => setStoreForm({ ...storeForm, invoicePrefix: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-cyan-300 outline-none font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-400 mb-1">Counter Name / Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Counter 1, Counter 2"
                    value={storeForm.counterNo || 'Counter 1'}
                    onChange={(e) => setStoreForm({ ...storeForm, counterNo: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Receipt Footer Message</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeForm.receiptFooterNote}
                  onChange={(e) => setStoreForm({ ...storeForm, receiptFooterNote: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none disabled:opacity-60"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Detected Windows USB Thermal Printer Banner */}
              {detectedPrinter ? (
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 rounded-xl border border-emerald-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-sm flex items-center gap-2">
                          <span>{detectedPrinter.name}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                            Port: {detectedPrinter.port}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Ready
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Windows USB Printing Spooler detected • 3-Inch (80mm) Thermal Roll
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPrinterForm({
                          ...printerForm,
                          baudRate: 9600,
                          autoCut: true,
                          openCashDrawer: true,
                          printMode: 'usb',
                          usbPrinterName: detectedPrinter.name
                        });
                        setStatusMsg('TVS RP-3200 Lite USB configuration active!');
                        setTimeout(() => setStatusMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition shadow flex items-center gap-1 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Use This Printer</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-emerald-300">💡 USB Connection Status:</div>
                    <div className="text-slate-400">
                      Your TVS RP-3200 Lite is connected via <strong>USB ({detectedPrinter.port})</strong> with the official Windows driver.
                      You can print directly using <strong>Direct Windows USB Print</strong> (1-click silent print) or <strong>Browser 80mm Print</strong> (standard print preview).
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Checking for connected Windows USB thermal printers...</span>
                </div>
              )}

              {/* Thermal Output Methods */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <label className="block font-bold text-slate-300 text-xs">Choose Thermal Print Mode</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Mode 1: Direct USB */}
                  <button
                    type="button"
                    onClick={() => setPrinterForm({ ...printerForm, printMode: 'usb' })}
                    className={`p-3 rounded-xl border font-bold text-left transition ${
                      printerForm.printMode === 'usb'
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1 text-emerald-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Direct USB (TVSE)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-1">
                      1-click instant print to TVSE RP3200 Lite on USB001 (Recommended!)
                    </div>
                  </button>

                  {/* Mode 2: Browser 80mm */}
                  <button
                    type="button"
                    onClick={() => setPrinterForm({ ...printerForm, printMode: 'browser' })}
                    className={`p-3 rounded-xl border font-bold text-left transition ${
                      printerForm.printMode === 'browser'
                        ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1 text-cyan-300">
                      <Printer className="w-3.5 h-3.5" />
                      <span>Browser 80mm</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-1">
                      Standard Windows print dialog preview for 80mm rolls
                    </div>
                  </button>

                  {/* Mode 3: Web Serial */}
                  <button
                    type="button"
                    onClick={() => setPrinterForm({ ...printerForm, printMode: 'serial' })}
                    className={`p-3 rounded-xl border font-bold text-left transition ${
                      printerForm.printMode === 'serial'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1 text-purple-300">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Web Serial Port</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-1">
                      For older RS-232 COM cables (not for USB001)
                    </div>
                  </button>
                </div>
              </div>

              {/* Direct USB Test & Settings */}
              {printerForm.printMode === 'usb' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Direct USB Thermal Printing</div>
                      <div className="text-slate-400 text-[11px]">
                        Target: <strong className="text-emerald-300">{detectedPrinter?.name || 'TVSE RP3200 Lite'}</strong> on port <strong className="text-cyan-300">{detectedPrinter?.port || 'USB001'}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUsbTestPrint}
                      className="py-2 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Send USB Test Print</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printerForm.autoCut}
                        onChange={(e) => setPrinterForm({ ...printerForm, autoCut: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded accent-emerald-500"
                      />
                      <span>Auto-Cut Paper on Print (GS V)</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printerForm.openCashDrawer}
                        onChange={(e) => setPrinterForm({ ...printerForm, openCashDrawer: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded accent-emerald-500"
                      />
                      <span>Kick Cash Drawer Pulse (ESC p)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Serial Connection Settings */}
              {printerForm.printMode === 'serial' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 text-sm">USB / COM Port Pairing</div>
                      <div className="text-slate-400 text-[11px]">
                        {isWebSerialSupported()
                          ? 'Web Serial API is available.'
                          : 'Web Serial API requires desktop Chrome/Edge browser.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectPort}
                      className="py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Select Serial Port</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Serial Baud Rate</label>
                      <select
                        value={printerForm.baudRate}
                        onChange={(e) => setPrinterForm({ ...printerForm, baudRate: parseInt(e.target.value, 10) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      >
                        <option value={9600}>9600 Baud (Standard 80mm thermal)</option>
                        <option value={19200}>19200 Baud</option>
                        <option value={38400}>38400 Baud</option>
                        <option value={57600}>57600 Baud</option>
                        <option value={115200}>115200 Baud (High speed serial)</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={printerForm.autoCut}
                          onChange={(e) => setPrinterForm({ ...printerForm, autoCut: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 rounded accent-emerald-500"
                        />
                        <span>Send Auto-Cut Paper Command (0x1D 0x56)</span>
                      </label>
                      <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={printerForm.openCashDrawer}
                          onChange={(e) => setPrinterForm({ ...printerForm, openCashDrawer: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 rounded accent-emerald-500"
                        />
                        <span>Send Cash Drawer Pulse (0x1B 0x70)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleTestPrint}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Send ESC/POS Test Print</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-950"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
