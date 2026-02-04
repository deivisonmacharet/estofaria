/* ============================================================
   routes/portfolio.js
   GET    /portfolio            → lista todos (público)
   GET    /portfolio/:category  → filtra por categoria (público)
   POST   /portfolio            → adiciona item (admin)
   PUT    /portfolio/:id        → atualiza (admin)
   DELETE /portfolio/:id        → remove (admin)
   ============================================================ */
const router = require('express').Router();
const db     = require('../db');
const authMW = require('../middleware/auth');
const upload = require('../utils/upload');

/* ── GET /portfolio ── público */
router.get('/', async (_req, res) => {
  try {
    const [items] = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM portfolio_items p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar portfolio' });
  }
});

/* ── GET /portfolio/:category ── público, filtra por slug */
router.get('/:category', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM portfolio_items p
      JOIN categories c ON c.id = p.category_id
      WHERE c.slug = ?
      ORDER BY p.created_at DESC
    `, [req.params.category]);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar portfolio' });
  }
});

/* ── POST /portfolio ── admin */
router.post('/', authMW, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    if (!title || !category_id || !req.file)
      return res.status(400).json({ error: 'Título, categoria e imagem são obrigatórios' });

    const image_url = '/uploads/' + req.file.filename;

    await db.query(
      'INSERT INTO portfolio_items (category_id, title, description, image_url) VALUES (?, ?, ?, ?)',
      [category_id, title, description || null, image_url]
    );

    res.status(201).json({ message: 'Item adicionado', image_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

/* ── PUT /portfolio/:id ── admin */
router.put('/:id', authMW, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    const sets = [];
    const vals = [];

    if (title)       { sets.push('title = ?');       vals.push(title); }
    if (description) { sets.push('description = ?'); vals.push(description); }
    if (category_id) { sets.push('category_id = ?'); vals.push(category_id); }
    if (req.file)    { sets.push('image_url = ?');   vals.push('/uploads/' + req.file.filename); }

    if (sets.length === 0)
      return res.status(400).json({ error: 'Nada para atualizar' });

    vals.push(req.params.id);
    await db.query(`UPDATE portfolio_items SET ${sets.join(', ')} WHERE id = ?`, vals);

    res.json({ message: 'Item atualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

/* ── DELETE /portfolio/:id ── admin */
router.delete('/:id', authMW, async (req, res) => {
  try {
    await db.query('DELETE FROM portfolio_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

module.exports = router;
