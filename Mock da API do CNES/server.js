import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const estabelecimentos = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

// GET /api/v1/cnes/estabelecimentos/{codigo_cnes}
app.get('/api/v1/cnes/estabelecimentos/:codigo', (req, res) => {
  const { codigo } = req.params;
  const busca = codigo.replace(/\D/g, '');

  const estabelecimento = estabelecimentos.find(
    (e) => e.codigo_cnes === busca
  );

  if (!estabelecimento) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Estabelecimento não encontrado na base do CNES',
    });
  }

  return res.json({
    status: 'sucesso',
    data: estabelecimento,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Mock CNES API rodando na porta ${PORT}`);
});
