/* ============================================================
   index.js  —  entrada do servidor Express
   ============================================================ */
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');

const db        = require('./db');               // pool mysql2
const authRoutes      = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const appointmentRoutes = require('./routes/appointments');
const fabricRoutes    = require('./routes/fabrics');
const simulationRoutes= require('./routes/simulations');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── middlewares globais ── */
app.use(cors());                                 // permite qualquer origem (ajuste em prod se quiser)

/* ── força charset UTF-8 para respostas JSON ── */
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  next();
});
app.use(express.json());

/* ── arquivos estáticos (uploads) ── */
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

/* ── rotas ── */
app.use('/auth',        authRoutes);
app.use('/portfolio',   portfolioRoutes);
app.use('/appointments',appointmentRoutes);
app.use('/fabrics',     fabricRoutes);
app.use('/simulations', simulationRoutes);

/* ── health-check ── */
app.get('/health', (_req, res) => res.json({ ok: true }));

/* ── erro genérico ── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── servir frontend build (produção) ──
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

/* ── inicia ── */
app.listen(PORT, () => {
  console.log(`[estofaria-backend] rodando na porta ${PORT}`);
});
