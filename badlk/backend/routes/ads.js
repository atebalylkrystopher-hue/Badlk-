// backend/routes/ads.js
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q        = req.query.q        || '';
    const category = req.query.category || '';
    let query = db('ads').select('*');
    if (category) query = query.where('category', category);
    if (q)        query = query.whereRaw('(title || " " || description) LIKE ?', [`%${q}%`]);
    const ads = await query.orderBy('created_at', 'desc');
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, category, price, location, photos } = req.body;
  if (!title || !category)
    return res.status(400).json({ error: 'Titre et catégorie requis' });
  const photosStr = Array.isArray(photos) ? photos.join(',') : (photos || '');
  try {
    const [id] = await db('ads').insert({
      user_id: req.user.id,
      title, description, category,
      price: Number(price) || 0,
      location, photos: photosStr
    });
    const ad = await db('ads').where({ id }).first();
    res.json(ad);
  } catch (e) {
    res.status(400).json({ error: "Erreur lors de la création de l'annonce" });
  }
});

router.get('/:id', async (req, res) => {
  const ad = await db('ads').where({ id: req.params.id }).first();
  if (!ad) return res.status(404).json({ error: 'Annonce introuvable' });
  res.json(ad);
});

router.post('/:id/report', async (req, res) => {
  await db('ads').where({ id: req.params.id }).update({ reported: 1 });
  res.json({ ok: true });
});

router.delete('/:id', auth, async (req, res) => {
  const ad = await db('ads').where({ id: req.params.id }).first();
  if (!ad) return res.status(404).json({ error: 'Annonce introuvable' });
  if (ad.user_id !== req.user.id)
    return res.status(403).json({ error: 'Non autorisé' });
  await db('ads').where({ id: req.params.id }).del();
  res.json({ ok: true });
});

module.exports = router;
