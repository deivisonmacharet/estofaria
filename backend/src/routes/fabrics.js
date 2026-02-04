/* ============================================================
   routes/fabrics.js
   GET    /fabrics       → lista todos (público, usado pelo simulador)
   POST   /fabrics       → adiciona tecido (admin)
   DELETE /fabrics/:id   → remove tecido (admin)
   ============================================================ */
const router = require('express').Router();
const db     = require('../db');
const authMW = require('../middleware/auth');
const upload = require('../utils/upload');

/* ── GET /fabrics ── público */
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM fabrics ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tecidos' });
  }
});

/* ── POST /fabrics ── admin */
router.post('/', authMW, upload.single('image'), async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !req.file)
      return res.status(400).json({ error: 'Nome e imagem são obrigatórios' });

    const image_url = '/uploads/' + req.file.filename;
    await db.query(
      'INSERT INTO fabrics (name, color, image_url) VALUES (?, ?, ?)',
      [name, color || null, image_url]
    );

    res.status(201).json({ message: 'Tecido adicionado', image_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar tecido' });
  }
});

/* ── DELETE /fabrics/:id ── admin */
router.delete('/:id', authMW, async (req, res) => {
  try {
    await db.query('DELETE FROM fabrics WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tecido removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover tecido' });
  }
});

module.exports = router;
