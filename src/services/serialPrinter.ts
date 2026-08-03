import type { Invoice, StoreSettings, PrinterConfig } from '../types/pos';
import { buildEscPosBuffer } from './escpos';

// TypeScript Web Serial API definitions interface extension
declare global {
  interface Navigator {
    serial?: {
      requestPort(options?: { filters?: Array<{ usbVendorId?: number }> }): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }

  interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream<Uint8Array> | null;
    getInfo(): { usbVendorId?: number; usbProductId?: number };
  }
}

let activeSerialPort: SerialPort | null = null;

export const isWebSerialSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
};

export const requestSerialPort = async (baudRate = 9600): Promise<SerialPort | null> => {
  if (!isWebSerialSupported()) {
    throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera on Desktop.');
  }

  try {
    const port = await navigator.serial!.requestPort();
    await port.open({ baudRate });
    activeSerialPort = port;
    return port;
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      console.log('No serial port selected by user.');
      return null;
    }
    throw err;
  }
};

export const sendEscPosBytes = async (escPosBytes: Uint8Array, baudRate = 9600): Promise<boolean> => {
  if (!isWebSerialSupported()) {
    throw new Error('Web Serial API unavailable');
  }

  let port = activeSerialPort;

  try {
    if (!port) {
      const ports = await navigator.serial!.getPorts();
      if (ports.length > 0) {
        port = ports[0];
        try {
          await port.open({ baudRate });
          activeSerialPort = port;
        } catch {
          // Port might already be open
        }
      } else {
        port = await requestSerialPort(baudRate);
      }
    }

    if (!port || !port.writable) {
      throw new Error('No writable serial port available.');
    }

    const writer = port.writable.getWriter();
    await writer.write(escPosBytes);
    writer.releaseLock();
    return true;
  } catch (err) {
    console.error('Serial writing error:', err);
    activeSerialPort = null;
    throw err;
  }
};

export const printInvoiceViaSerial = async (
  invoice: Invoice,
  settings: StoreSettings,
  config: PrinterConfig
): Promise<boolean> => {
  const escPosBytes = buildEscPosBuffer(invoice, settings, config.autoCut, config.openCashDrawer);
  return await sendEscPosBytes(escPosBytes, config.baudRate);
};

export const testSerialPrint = async (settings: StoreSettings, config: PrinterConfig): Promise<boolean> => {
  const dummyInvoice: Invoice = {
    id: 'test-01',
    invoiceNo: 'TEST-00001',
    createdAt: new Date().toISOString(),
    customerName: 'COUNTER TESTER',
    items: [
      {
        id: 't1',
        itemCode: 'CRK001',
        itemName: '10cm Electric Sparklers',
        mrp: 80,
        qty: 2,
        stockQty: 100,
        discountValue: 10,
        discountType: 'percent',
        gstRate: 18,
        isGstApplicable: true,
        lineSubtotalMRP: 160,
        lineDiscountAmount: 16,
        lineTaxableAmount: 122.03,
        lineGstAmount: 21.97,
        lineCgstAmount: 10.98,
        lineSgstAmount: 10.98,
        lineGrandTotal: 144
      }
    ],
    subtotalMRP: 160,
    itemDiscountsTotal: 16,
    totalDiscount: 16,
    taxableAmount: 122.03,
    totalCGST: 10.98,
    totalSGST: 10.98,
    totalGST: 21.97,
    grandTotal: 144,
    paymentMode: 'Cash'
  };

  return await printInvoiceViaSerial(dummyInvoice, settings, config);
};
