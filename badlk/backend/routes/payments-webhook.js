// backend/routes/payments-webhook.js
const express = require('express');
const db      = require('../db');

const router = express.Router();

// Appelé par MTN / Orange pour confirmer un paiement
router.post('/webhook', async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    if (!transactionId || !status)
      return res.status(400).json({ error: 'transactionId et status requis' });
    await db('payments').where({ transaction_id: transactionId }).update({ status });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur webhook' });
  }
});

module.exports = router;
