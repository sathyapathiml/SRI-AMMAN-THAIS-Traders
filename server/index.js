const express = require('express');
const cors = require('cors');
const os = require('os');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Discover local network IPv4 address
const getLocalLanIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const lanIp = getLocalLanIp();

// API Health Check & Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lanIp,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Inventory APIs
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.getInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    await db.saveInventoryItem(req.body);
    const items = await db.getInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.deleteInventoryItem(req.params.id);
    const items = await db.getInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/reset', async (req, res) => {
  try {
    await db.resetInventory();
    const items = await db.getInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoice APIs
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await db.getInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = await db.saveInvoice(req.body);
    const invoices = await db.getInvoices();
    const inventory = await db.getInventory();
    res.json({ invoice: newInvoice, invoices, inventory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Held Bills APIs
app.get('/api/held-bills', async (req, res) => {
  try {
    const bills = await db.getHeldBills();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/held-bills', async (req, res) => {
  try {
    await db.saveHeldBill(req.body);
    const bills = await db.getHeldBills();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/held-bills/:id', async (req, res) => {
  try {
    await db.deleteHeldBill(req.params.id);
    const bills = await db.getHeldBills();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store Settings APIs
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await db.saveSettings(req.body);
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LOCAL LAN BILLING SERVER IS ACTIVE & RUNNING!`);
  console.log(`📡 Local Host:    http://localhost:${PORT}`);
  console.log(`🌐 Shop LAN IP:   http://${lanIp}:${PORT}`);
  console.log(`======================================================\n`);
});
