// backend/routes/auth.js
const express    = require('express');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const db         = require('../db');
const { JWT_SECRET } = require('../config');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [id] = await db('users').insert({ name, email, password_hash: hash, phone });
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id, name, email, phone } });
  } catch (err) {
    res.status(400).json({ error: 'Email déjà utilisé' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  const user = await db('users').where({ email }).first();
  if (!user) return res.status(400).json({ error: 'Identifiants invalides' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Identifiants invalides' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

module.exports = router;
