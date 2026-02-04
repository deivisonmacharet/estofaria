/* ============================================================
   utils/upload.js  —  configuração do Multer
   ============================================================ */
const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);                    // nome único → sem colisão
  }
});

// apenas imagens
const fileFilter = (_req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use jpg, png, gif ou webp.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }        // 10 MB máximo
});

module.exports = upload;
