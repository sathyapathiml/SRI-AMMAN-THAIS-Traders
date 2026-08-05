import React, { useState } from 'react';
import type { StoreSettings, PrinterConfig } from '../types/pos';
import { Settings as SettingsIcon, Printer, Store, Save, X, Cpu, CheckCircle } from 'lucide-react';
import { requestSerialPort, isWebSerialSupported, testSerialPrint } from '../services/serialPrinter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  printerConfig: PrinterConfig;
  onSavePrinterConfig: (config: PrinterConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  printerConfig,
  onSavePrinterConfig
}) => {
  const [storeForm, setStoreForm] = useState<StoreSettings>(settings);
  const [printerForm, setPrinterForm] = useState<PrinterConfig>(printerConfig);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'store' | 'printer'>('store');

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(storeForm);
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
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={storeForm.storeTagline}
                  onChange={(e) => setStoreForm({ ...storeForm, storeTagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={storeForm.addressLine1}
                    onChange={(e) => setStoreForm({ ...storeForm, addressLine1: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Address Line 2 / City</label>
                  <input
                    type="text"
                    value={storeForm.addressLine2}
                    onChange={(e) => setStoreForm({ ...storeForm, addressLine2: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Phone Number(s)</label>
                  <input
                    type="text"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={storeForm.gstin}
                    onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-amber-300 outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={storeForm.invoicePrefix}
                    onChange={(e) => setStoreForm({ ...storeForm, invoicePrefix: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-cyan-300 outline-none font-mono"
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
                  value={storeForm.receiptFooterNote}
                  onChange={(e) => setStoreForm({ ...storeForm, receiptFooterNote: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-400">Thermal Output Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrinterForm({ ...printerForm, printMode: 'browser' })}
                    className={`p-3 rounded-xl border font-bold text-left transition ${
                      printerForm.printMode === 'browser'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-sm">Browser 80mm Print</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Standard Windows print dialog (Works on all browsers)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrinterForm({ ...printerForm, printMode: 'serial' })}
                    className={`p-3 rounded-xl border font-bold text-left transition ${
                      printerForm.printMode === 'serial'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-sm flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span>Web Serial ESC/POS</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Direct raw byte output over USB/COM port</div>
                  </button>
                </div>
              </div>

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
