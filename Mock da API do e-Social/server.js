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

app.get('/api/v1/esocial/eventos/:cpf', (req, res) => {
  const { cpf } = req.params;
  const busca = cpf.replace(/\D/g, '');

  const trabalhador = trabalhadores.find((t) => t.cpf === busca);

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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Mock e-Social API rodando na porta ${PORT}`);
});
