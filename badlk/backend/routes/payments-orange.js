// backend/routes/payments-orange.js
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

const ORANGE_API_KEY    = process.env.ORANGE_API_KEY    || 'sandbox_key';
const ORANGE_API_SECRET = process.env.ORANGE_API_SECRET || 'sandbox_secret';
const ORANGE_BASE_URL   = 'https://api.orange.com';

router.post('/orange', auth, async (req, res) => {
  try {
    const { adId, phone } = req.body;
    if (!adId || !phone)
      return res.status(400).json({ error: 'adId et phone requis' });

    const ad = await db('ads').where({ id: adId }).first();
    if (!ad) return res.status(404).json({ error: 'Annonce introuvable' });

    const transactionId = 'orange-sandbox-' + Date.now();

    // En production : obtenir un token OAuth depuis ORANGE_BASE_URL/oauth/v3/token
    // puis appeler ORANGE_BASE_URL/orange-money-webpay/cm/v1/webpayment

    await db('payments').insert({
      ad_id: adId,
      user_id: req.user.id,
      phone,
      amount: ad.price,
      provider: 'Orange',
      status: 'PENDING',
      transaction_id: transactionId
    });

    res.json({
      ok: true,
      provider: 'Orange',
      transactionId,
      message: 'Paiement Orange Money sandbox initié. Vérifiez votre téléphone.'
    });
  } catch (e) {
    console.error('Orange payment error:', e);
    res.status(500).json({ error: 'Erreur paiement Orange' });
  }
});

module.exports = router;
