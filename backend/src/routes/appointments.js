/* ============================================================
   routes/appointments.js
   GET    /appointments         → lista todos (admin)
   GET    /appointments/today   → só hoje (admin)
   GET    /appointments/upcoming → próximos 60 min (para notificação)
   POST   /appointments         → cria (admin)
   PUT    /appointments/:id     → atualiza (admin)
   DELETE /appointments/:id     → remove (admin)
   ============================================================ */
const router = require('express').Router();
const db     = require('../db');
const authMW = require('../middleware/auth');

/* ── GET /appointments ── todos */
router.get('/', authMW, async (req, res) => {
  try {
    const { status, date } = req.query;          // filtros opcionais
    let where = [];
    let vals  = [];

    if (status) { where.push('status = ?');                   vals.push(status); }
    if (date)   { where.push('DATE(scheduled_at) = ?');       vals.push(date); }

    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(`
      SELECT a.*, c.name AS category_name
      FROM appointments a
      LEFT JOIN categories c ON c.id = a.category_id
      ${clause}
      ORDER BY a.scheduled_at ASC
    `, vals);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

/* ── GET /appointments/today ── só hoje */
router.get('/today', authMW, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, c.name AS category_name
      FROM appointments a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE DATE(a.scheduled_at) = CURDATE()
      ORDER BY a.scheduled_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro' });
  }
});

/* ── GET /appointments/upcoming ── próximos 60 min (usada pelo front para notificação) */
router.get('/upcoming', authMW, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, c.name AS category_name
      FROM appointments a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE a.scheduled_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 60 MINUTE)
        AND a.status IN ('pendente','confirmado')
      ORDER BY a.scheduled_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro' });
  }
});

/* ── POST /appointments ── criar */
router.post('/', authMW, async (req, res) => {
  try {
    const { client_name, client_phone, category_id, scheduled_at, notes } = req.body;

    if (!client_name || !scheduled_at)
      return res.status(400).json({ error: 'Nome do cliente e data/hora são obrigatórios' });

    await db.query(
      `INSERT INTO appointments (client_name, client_phone, category_id, scheduled_at, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [client_name, client_phone || null, category_id || null, scheduled_at, notes || null]
    );

    res.status(201).json({ message: 'Agendamento criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

/* ── PUT /appointments/:id ── atualizar */
router.put('/:id', authMW, async (req, res) => {
  try {
    const { client_name, client_phone, category_id, scheduled_at, notes, status } = req.body;
    const sets = [];
    const vals = [];

    if (client_name)  { sets.push('client_name = ?');  vals.push(client_name); }
    if (client_phone) { sets.push('client_phone = ?'); vals.push(client_phone); }
    if (category_id)  { sets.push('category_id = ?');  vals.push(category_id); }
    if (scheduled_at) { sets.push('scheduled_at = ?'); vals.push(scheduled_at); }
    if (notes !== undefined) { sets.push('notes = ?'); vals.push(notes); }
    if (status)       { sets.push('status = ?');       vals.push(status); }

    if (sets.length === 0)
      return res.status(400).json({ error: 'Nada para atualizar' });

    vals.push(req.params.id);
    await db.query(`UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`, vals);

    res.json({ message: 'Agendamento atualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

/* ── DELETE /appointments/:id ── remover */
router.delete('/:id', authMW, async (req, res) => {
  try {
    await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Agendamento removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover' });
  }
});

module.exports = router;
