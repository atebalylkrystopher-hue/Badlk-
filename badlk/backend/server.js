// backend/server.js
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');
const db         = require('./db');
const { PORT }   = require('./config');

const authRoutes    = require('./routes/auth');
const adsRoutes     = require('./routes/ads');
const payRoutes     = require('./routes/payments');
const mtnRoutes     = require('./routes/payments-mtn');
const orangeRoutes  = require('./routes/payments-orange');
const webhookRoutes = require('./routes/payments-webhook');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ── Migrations ──────────────────────────────────────────────────────────────
// SQLite ne supporte pas plusieurs statements dans db.raw() → on découpe
async function runMigrations() {
  const migrationsPath = path.join(__dirname, 'migrations.sql');
  if (!fs.existsSync(migrationsPath)) return;
  const sql = fs.readFileSync(migrationsPath, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    await db.raw(stmt).catch(() => { /* table déjà existante */ });
  }
}

runMigrations()
  .then(() => console.log('✅ Migrations OK'))
  .catch(err => console.error('❌ Migrations error:', err));

// ── Routes API ──────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/ads',      adsRoutes);
app.use('/api/payments', payRoutes);      // POST /api/payments/mobile
app.use('/api/payments', mtnRoutes);      // POST /api/payments/mtn
app.use('/api/payments', orangeRoutes);   // POST /api/payments/orange
app.use('/api/payments', webhookRoutes);  // POST /api/payments/webhook

// ── Frontend statique ───────────────────────────────────────────────────────
app.use('/', express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => console.log(`🚀 BADLK backend → http://localhost:${PORT}`));
