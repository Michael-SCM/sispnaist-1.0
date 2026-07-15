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

function buscarEstabelecimento(codigo) {
  const busca = codigo.replace(/\D/g, '');
  return estabelecimentos.find((e) => e.codigo_cnes === busca);
}

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-cnes-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/cnes/estabelecimentos/:codigo', (req, res) => {
  const estabelecimento = buscarEstabelecimento(req.params.codigo);
  if (!estabelecimento) {
    return res.status(404).json({ status: 'erro', mensagem: 'Estabelecimento não encontrado na base do CNES' });
  }
  return res.json({ status: 'sucesso', data: estabelecimento });
});

app.get('/api/v1/cnes/estabelecimentos/:codigo', (req, res) => {
  const estabelecimento = buscarEstabelecimento(req.params.codigo);
  if (!estabelecimento) {
    return res.status(404).json({ status: 'erro', mensagem: 'Estabelecimento não encontrado na base do CNES' });
  }
  return res.json({ status: 'sucesso', data: estabelecimento });
});

app.listen(PORT, () => {
  console.log(`Mock CNES API rodando na porta ${PORT}`);
});
