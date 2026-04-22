// backend/routes/payments.js — simulation générique Mobile Money
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');
const { MOBILE_MONEY_PROVIDER } = require('../config');

const router = express.Router();

router.post('/mobile', auth, async (req, res) => {
  try {
    const { adId, phone } = req.body;
    if (!adId || !phone)
      return res.status(400).json({ error: 'adId et phone requis' });
    const ad = await db('ads').where({ id: adId }).first();
    if (!ad) return res.status(404).json({ error: 'Annonce introuvable' });

    const [id] = await db('payments').insert({
      ad_id: adId,
      user_id: req.user.id,
      phone,
      amount: ad.price,
      provider: MOBILE_MONEY_PROVIDER,
      status: 'PENDING',
      transaction_id: 'sim-' + Date.now()
    });
    res.json({ ok: true, paymentId: id, message: 'Paiement simulé initié.' });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur paiement' });
  }
});

module.exports = router;
