const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lanIp,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API Routes
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

app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await db.getExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    await db.saveExpense(req.body);
    const expenses = await db.getExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await db.deleteExpense(req.params.id);
    const expenses = await db.getExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// User Authentication Endpoints
const ADMIN_EMAIL = 'sathyapathi555@gmail.com';

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    let user = await db.findUserByEmail(identifier);
    if (!user) {
      user = await db.findUserByUsername(identifier);
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Force sathyapathi555@gmail.com to be admin if email matches
    const role = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : user.role;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, Email, and Password are required.' });
    }

    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Auto-assign admin role ONLY to sathyapathi555@gmail.com
    const role = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'worker';

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    res.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Static Built Vite Frontend in Cloud Production Mode
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Fallback for SPA routing in Express v5
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CLOUD / LAN BILLING SERVER ACTIVE!`);
  console.log(`📡 Local Host:    http://localhost:${PORT}`);
  console.log(`🌐 Network IP:    http://${lanIp}:${PORT}`);
  console.log(`======================================================\n`);
});
