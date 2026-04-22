// backend/routes/payments-mtn.js
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

const MTN_API_KEY    = process.env.MTN_API_KEY    || 'sandbox_key';
const MTN_API_SECRET = process.env.MTN_API_SECRET || 'sandbox_secret';
const MTN_BASE_URL   = 'https://sandbox.momodeveloper.mtn.com';

router.post('/mtn', auth, async (req, res) => {
  try {
    const { adId, phone } = req.body;
    if (!adId || !phone)
      return res.status(400).json({ error: 'adId et phone requis' });

    const ad = await db('ads').where({ id: adId }).first();
    if (!ad) return res.status(404).json({ error: 'Annonce introuvable' });

    const transactionId = 'mtn-sandbox-' + Date.now();

    // En production : appeler MTN_BASE_URL/collection/token/ puis
    // MTN_BASE_URL/collection/v1_0/requesttopay avec les vraies clés

    await db('payments').insert({
      ad_id: adId,
      user_id: req.user.id,
      phone,
      amount: ad.price,
      provider: 'MTN',
      status: 'PENDING',
      transaction_id: transactionId
    });

    res.json({
      ok: true,
      provider: 'MTN',
      transactionId,
      message: 'Paiement MTN MoMo sandbox initié. Vérifiez votre téléphone.'
    });
  } catch (e) {
    console.error('MTN payment error:', e);
    res.status(500).json({ error: 'Erreur paiement MTN' });
  }
});

module.exports = router;
