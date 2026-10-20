import React from 'react';
import type { Invoice, StoreSettings } from '../types/pos';
import { LOGO_DATA_URI } from '../data/logoDataUri';

interface PrintableReceiptProps {
  invoice: Invoice | null;
  settings: StoreSettings;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ invoice, settings }) => {
  if (!invoice) return null;

  return (
    <div id="printable-receipt" className="print-only-container">
      {/* Receipt Header */}
      <div className="receipt-header">
        <div className="receipt-logo-wrap">
          <img
            src={LOGO_DATA_URI}
            alt={settings.storeName}
            className="receipt-logo-img"
            width="100"
            height="100"
            loading="eager"
            decoding="sync"
          />
        </div>
        <div className="receipt-store-name">{settings.storeName}</div>
        <div className="receipt-tagline">{settings.storeTagline}</div>
        <div className="receipt-address">{settings.addressLine1}</div>
        {settings.addressLine2 && <div className="receipt-address">{settings.addressLine2}</div>}
        <div className="receipt-phone">Ph: {settings.phone}</div>
        {settings.gstin && <div className="receipt-gstin">GSTIN: {settings.gstin}</div>}
      </div>

      <div className="receipt-divider-dashed" />

      {/* Invoice Meta */}
      <div className="receipt-meta">
        <div className="receipt-row font-bold">
          <span>Inv: {invoice.invoiceNo}</span>
          <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="receipt-row">
          <span>Pay: {invoice.paymentMode} ({invoice.counterNo || settings.counterNo || 'Counter 1'})</span>
          <span>{new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {invoice.customerName && (
          <div className="receipt-customer">
            Cust: {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
          </div>
        )}
      </div>

      <div className="receipt-divider-dashed" />

      {/* Itemized Table */}
      <table className="receipt-table">
        <thead>
          <tr className="receipt-table-head">
            <th className="text-left">Item Description</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="receipt-table-row">
              <td className="receipt-item-name">{item.itemName}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-right">Rs.{item.mrp.toFixed(2)}</td>
              <td className="text-right font-bold">Rs.{item.lineGrandTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-divider-dashed" />

      {/* Items Count Summary */}
      <div className="receipt-row font-bold" style={{ fontSize: '11px', padding: '2px 0' }}>
        <span>Total Items: {invoice.items.length}</span>
        <span>Total Qty: {invoice.items.reduce((sum, item) => sum + item.qty, 0)}</span>
      </div>

      <div className="receipt-divider-dashed" />

      {/* Financial Summary */}
      <div className="receipt-totals">
        <div className="receipt-row">
          <span>Subtotal:</span>
          <span>Rs.{invoice.subtotalMRP.toFixed(2)}</span>
        </div>
        {invoice.overallDiscountAmount && invoice.overallDiscountAmount > 0 && (
          <div className="receipt-row font-bold">
            <span>Extra Discount:</span>
            <span>-Rs.{invoice.overallDiscountAmount.toFixed(2)}</span>
          </div>
        )}
        {invoice.totalGST > 0 && (
          <>
            <div className="receipt-row text-xs">
              <span>Taxable Value:</span>
              <span>Rs.{invoice.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="receipt-row text-xs">
              <span>CGST (50%):</span>
              <span>Rs.{invoice.totalCGST.toFixed(2)}</span>
            </div>
            <div className="receipt-row text-xs">
              <span>SGST (50%):</span>
              <span>Rs.{invoice.totalSGST.toFixed(2)}</span>
            </div>
          </>
        )}
        
        <div className="receipt-divider-double" />

        <div className="receipt-row receipt-grand-total">
          <span>GRAND TOTAL:</span>
          <span>Rs.{invoice.grandTotal.toFixed(2)}</span>
        </div>

        {invoice.paymentMode === 'Cash' && invoice.cashTendered && (
          <div className="receipt-row text-xs">
            <span>Cash Recd: Rs.{invoice.cashTendered.toFixed(2)}</span>
            <span>Change: Rs.{(invoice.changeReturned || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="receipt-divider-dashed" />

      {/* Footer */}
      <div className="receipt-footer">
        <div>{settings.receiptFooterNote}</div>
        <div className="receipt-thankyou">*** THANK YOU FOR VISITING ***</div>
      </div>
    </div>
  );
};
