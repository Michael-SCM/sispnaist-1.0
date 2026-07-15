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
const trabalhadores = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

function buscarTrabalhador(cpf) {
  const busca = cpf.replace(/\D/g, '');
  return trabalhadores.find((t) => t.cpf === busca);
}

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-esocial-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/v1/esocial/eventos/:cpf', (req, res) => {
  const trabalhador = buscarTrabalhador(req.params.cpf);
  if (!trabalhador) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Trabalhador não encontrado na base do e-Social',
    });
  }
  return res.json({
    status: 'sucesso',
    data: {
      cpf: trabalhador.cpf,
      cns: trabalhador.cns,
      nome: trabalhador.nome,
      eventos: trabalhador.eventos,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Mock e-Social API rodando na porta ${PORT}`);
});
