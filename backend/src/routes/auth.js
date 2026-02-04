/* ============================================================
   routes/auth.js
   POST   /auth/register   → cria usuário admin (apenas se não existir nenhum)
   POST   /auth/login      → retorna JWT
   GET    /auth/me         → dados do usuário logado
   ============================================================ */
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const authMW  = require('../middleware/auth');

/* ── POST /auth/register ── */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });

    // permite registro apenas se não houver usuários (primeiro setup)
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users');
    if (total > 0)
      return res.status(403).json({ error: 'Usuário já existe. Use login.' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, name]
    );

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

/* ── POST /auth/login ── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user)
      return res.status(401).json({ error: 'Email ou senha incorretos' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Email ou senha incorretos' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/* ── GET /auth/me ── (protegido) */
router.get('/me', authMW, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, email, name FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

module.exports = router;
