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
const cidadaos = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

function buscarCidadao(cpfOuCns) {
  const busca = cpfOuCns.replace(/\D/g, '');
  return cidadaos.find((c) => c.cpf === busca || c.cns_definitivo === busca);
}

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-cadsus-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/cadsus/usuarios/:cpfOuCns', (req, res) => {
  const cidadao = buscarCidadao(req.params.cpfOuCns);
  if (!cidadao) {
    return res.status(404).json({ status: 'erro', mensagem: 'Cidadão não encontrado na base do CADSUS' });
  }
  return res.json({ status: 'sucesso', data: cidadao });
});

app.get('/api/v1/cadsus/usuarios/:cpfOuCns', (req, res) => {
  const cidadao = buscarCidadao(req.params.cpfOuCns);
  if (!cidadao) {
    return res.status(404).json({ status: 'erro', mensagem: 'Cidadão não encontrado na base do CADSUS' });
  }
  return res.json({ status: 'sucesso', data: cidadao });
});

app.listen(PORT, () => {
  console.log(`Mock CADSUS API rodando na porta ${PORT}`);
});
