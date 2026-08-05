import React from 'react';
import type { Invoice, StoreSettings } from '../types/pos';
import { Printer, X, Sparkles } from 'lucide-react';
import { STORE_LOGO_DATA_URI } from '../data/logoDataUri';

interface PrintReceiptModalProps {
  invoice: Invoice | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onPrintSerial?: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  invoice,
  settings,
  isOpen,
  onClose,
  onPrintSerial
}) => {
  if (!isOpen || !invoice) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <>
      {/* On-screen Modal View */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">Invoice Created #{invoice.invoiceNo}</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt On-Screen Scrollable Container */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-950/60 flex justify-center">
            <div className="w-[80mm] bg-white text-slate-950 p-4 text-xs font-mono rounded shadow-lg border border-slate-300 select-text leading-tight">
              {/* Header */}
              <div className="text-center space-y-0.5 border-b border-slate-300 pb-2">
                <div className="flex justify-center mb-2">
                  <img
                    src={STORE_LOGO_DATA_URI}
                    alt="SRI AMMAN THAIS Logo"
                    className="w-28 h-28 object-contain mx-auto"
                  />
                </div>
                <div className="font-black text-sm uppercase">{settings.storeName}</div>
                <div className="text-[10px] text-slate-600 font-semibold">{settings.storeTagline}</div>
                <div className="text-[10px] text-slate-600">{settings.addressLine1}</div>
                <div className="text-[10px] text-slate-600">{settings.addressLine2}</div>
                <div className="text-[10px] text-slate-700 font-bold">Ph: {settings.phone}</div>
                {settings.gstin && <div className="text-[10px] text-slate-700">GSTIN: {settings.gstin}</div>}
              </div>

              {/* Meta */}
              <div className="py-2 border-b border-slate-300 space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Inv: {invoice.invoiceNo}</span>
                  <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Mode: {invoice.paymentMode} ({invoice.counterNo || settings.counterNo || 'Counter 1'})</span>
                  <span>{new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {invoice.customerName && (
                  <div className="text-[10px] text-slate-800 font-semibold">
                    Cust: {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-slate-300">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold uppercase text-slate-700">
                      <th className="pb-1">Item</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Disc</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-1 font-semibold pr-1 break-words">{item.itemName}</td>
                        <td className="py-1 text-center font-mono">{item.qty}</td>
                        <td className="py-1 text-right font-mono">
                          {item.lineDiscountAmount > 0 ? (item.discountType === 'percent' ? `${item.discountValue}%` : `₹${item.discountValue}`) : '-'}
                        </td>
                        <td className="py-1 text-right font-mono font-bold">₹{item.lineGrandTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="py-2 space-y-1 text-[11px] border-b border-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal MRP:</span>
                  <span className="font-mono">₹{invoice.subtotalMRP.toFixed(2)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Total Discount:</span>
                    <span className="font-mono">-₹{invoice.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.totalGST > 0 && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Taxable Value:</span>
                      <span className="font-mono">₹{invoice.taxableAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>CGST (Half):</span>
                      <span className="font-mono">₹{invoice.totalCGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>SGST (Half):</span>
                      <span className="font-mono">₹{invoice.totalSGST.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-900">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono">₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
                {invoice.paymentMode === 'Cash' && invoice.cashTendered && (
                  <div className="flex justify-between text-[10px] text-slate-700 pt-0.5">
                    <span>Cash Tendered: ₹{invoice.cashTendered.toFixed(2)}</span>
                    <span>Change: ₹{(invoice.changeReturned || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-600 pt-2 space-y-0.5">
                <div>{settings.receiptFooterNote}</div>
                <div className="font-bold">*** THANK YOU FOR VISITING ***</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Close
            </button>
            {onPrintSerial && (
              <button
                onClick={onPrintSerial}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Raw ESC/POS Thermal</span>
              </button>
            )}
            <button
              onClick={handleBrowserPrint}
              className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-950"
            >
              <Printer className="w-4 h-4" />
              <span>Print (Browser)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable receipt for window.print() */}
      <div id="printable-receipt" className="hidden print:block">
        <div className="text-center pb-2">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
            <img
              src={STORE_LOGO_DATA_URI}
              alt="SRI AMMAN THAIS Logo"
              style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto' }}
            />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{settings.storeName}</div>
          <div>{settings.storeTagline}</div>
          <div>{settings.addressLine1}</div>
          <div>{settings.addressLine2}</div>
          <div>Ph: {settings.phone}</div>
          {settings.gstin && <div>GSTIN: {settings.gstin}</div>}
        </div>
        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>
        <div className="flex justify-between font-bold">
          <span>Inv: {invoice.invoiceNo}</span>
          <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Pay: {invoice.paymentMode} ({invoice.counterNo || settings.counterNo || 'Counter 1'})</span>
          <span>{new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {invoice.customerName && <div>Cust: {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}</div>}
        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>
        
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Disc</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td style={{ textAlign: 'right' }}>
                  {item.lineDiscountAmount > 0 ? (item.discountType === 'percent' ? `${item.discountValue}%` : `Rs.${item.discountValue}`) : '-'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rs.{item.lineGrandTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>
        <div className="flex justify-between">
          <span>Subtotal MRP:</span>
          <span>Rs.{invoice.subtotalMRP.toFixed(2)}</span>
        </div>
        {invoice.totalDiscount > 0 && (
          <div className="flex justify-between font-bold">
            <span>Total Discount:</span>
            <span>-Rs.{invoice.totalDiscount.toFixed(2)}</span>
          </div>
        )}
        {invoice.totalGST > 0 && (
          <>
            <div className="flex justify-between">
              <span>Taxable Subtotal:</span>
              <span>Rs.{invoice.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (50%):</span>
              <span>Rs.{invoice.totalCGST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (50%):</span>
              <span>Rs.{invoice.totalSGST.toFixed(2)}</span>
            </div>
          </>
        )}
        <div style={{ borderBottom: '2px solid #000', margin: '4px 0' }}></div>
        <div className="flex justify-between text-sm font-bold">
          <span>GRAND TOTAL:</span>
          <span>Rs.{invoice.grandTotal.toFixed(2)}</span>
        </div>
        {invoice.paymentMode === 'Cash' && invoice.cashTendered && (
          <div className="flex justify-between text-xs">
            <span>Cash Recd: Rs.{invoice.cashTendered.toFixed(2)}</span>
            <span>Change: Rs.{(invoice.changeReturned || 0).toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10px' }}>
          <div>{settings.receiptFooterNote}</div>
          <div style={{ fontWeight: 'bold' }}>*** THANK YOU ***</div>
        </div>
      </div>
    </>
  );
};
