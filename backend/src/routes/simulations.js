/* ============================================================
   routes/simulations.js
   POST  /simulations/generate  → recebe foto do sofá + foto do tecido,
                                   envia para OpenAI GPT-4o e retorna
                                   a URL da imagem gerada.
   GET   /simulations           → histórico de simulações (admin)
   ============================================================

   Como funciona:
   1. O front envia duas imagens (sofa + tecido) como multipart.
   2. O backend converte ambas para base64.
   3. Envia para a API da OpenAI usando o modelo gpt-4o com
      mensagens de visão (image_url base64) + prompt de instrução.
   4. A resposta textual da IA descreve a simulação visual;
      como a API não gera imagem diretamente neste endpoint,
      usamos DALL·E 3 via client.images.generate para criar
      a imagem final baseada na descrição + referências.
   5. Salva a URL da imagem no banco e retorna para o front.

   NOTA: Para um resultado ainda mais realista no futuro você pode
   trocar por um modelo de edição de imagem dedicado como o da
   API do Stability AI ou usar o endpoint images/generations do
   OpenAI com referências.  Esta implementação usa DALL·E 3 que
   já entrega resultados visuais convincentes.
   ============================================================ */
const router  = require('express').Router();
const fs      = require('fs');
const path    = require('path');
const OpenAI  = require('openai');
const db      = require('../db');
const authMW  = require('../middleware/auth');
const upload  = require('../utils/upload');

const client  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* helper: arquivo → base64 data-url */
function toBase64(filePath) {
  const buf  = fs.readFileSync(filePath);
  const ext  = path.extname(filePath).slice(1).replace('jpg','jpeg');
  return `data:image/${ext};base64,${buf.toString('base64')}`;
}

/* ── POST /simulations/generate ── */
router.post('/generate', authMW, upload.fields([
  { name: 'sofa',   maxCount: 1 },
  { name: 'fabric', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files?.sofa?.[0] || !req.files?.fabric?.[0])
      return res.status(400).json({ error: 'Envie as imagens do sofá e do tecido' });

    const sofaPath   = req.files.sofa[0].path;
    const fabricPath = req.files.fabric[0].path;

    /* 1) envia ambas as imagens para o GPT-4o para ele DESCREVER
           como ficaria o sofá com aquele tecido */
    const visionRes = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text:
              'Você é um especialista em design de interiores e reforma de estofados. '
            + 'Analise as duas imagens abaixo:\n'
            + '1ª imagem: um sofá (ou poltrona/cadeira) que será reformado.\n'
            + '2ª imagem: o tecido que será usado na reforma.\n\n'
            + 'Descreva DETALHADAMENTE como ficaria o sofá reformado com esse tecido. '
            + 'Mencione a cor exata, a textura, o padrão do tecido e como ele se adapta à forma do sofá. '
            + 'Sua descrição será usada para gerar uma imagem realista.'
            },
            {
              type: 'image_url',
              image_url: { url: toBase64(sofaPath) }
            },
            {
              type: 'text',
              text: 'Imagem 1: Sofá original'
            },
            {
              type: 'image_url',
              image_url: { url: toBase64(fabricPath) }
            },
            {
              type: 'text',
              text: 'Imagem 2: Tecido para reforma'
            }
          ]
        }
      ]
    });

    const description = visionRes.choices[0].message.content;

    /* 2) gera a imagem com DALL·E 3 usando a descrição */
    const imageRes = await client.images.generate({
      model: 'dall-e-3',
      prompt:
        'Foto realista de um sofá reformado. ' + description
        + '\nEstilo: fotografia profissional, iluminação natural, ambiente moderno.',
      size:    '1024x1024',
      quality: 'standard',
      n:       1
    });

    const generatedUrl = imageRes.data[0].url;  // URL temporária da OpenAI (válida ~1h)

    /* 3) salva no banco */
    const sofaUrl   = '/uploads/' + req.files.sofa[0].filename;
    const fabricUrl = '/uploads/' + req.files.fabric[0].filename;

    await db.query(
      'INSERT INTO simulations (sofa_image_url, fabric_id, result_url) VALUES (?, ?, ?)',
      [sofaUrl, req.body.fabric_id || null, generatedUrl]
    );

    res.json({
      sofa_url:      sofaUrl,
      fabric_url:    fabricUrl,
      result_url:    generatedUrl,
      description
    });

  } catch (err) {
    console.error('Erro na simulação:', err);
    res.status(500).json({ error: 'Erro ao gerar simulação. Verifique sua chave OpenAI.' });
  }
});

/* ── GET /simulations ── histórico (admin) */
router.get('/', authMW, async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM simulations ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar simulações' });
  }
});

module.exports = router;
