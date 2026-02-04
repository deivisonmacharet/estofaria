/* ============================================================
   db.js  —  pool de conexões MySQL
   ============================================================ */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:            process.env.DB_HOST || 'localhost',
  port:            Number(process.env.DB_PORT) || 3306,
  database:        process.env.DB_NAME || 'estofaria',
  user:            process.env.DB_USER || 'root',
  password:        process.env.DB_PASS || '',
  charset:         'utf8mb4',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

module.exports = pool;
