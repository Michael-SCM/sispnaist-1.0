import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Carrega a base mockada
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cidadaos = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

// GET /api/v1/cadsus/usuarios/{cpf_ou_cns}
app.get('/api/v1/cadsus/usuarios/:cpfOuCns', (req, res) => {
  const { cpfOuCns } = req.params;
  const busca = cpfOuCns.replace(/\D/g, '');

  const cidadao = cidadaos.find(
    (c) => c.cpf === busca || c.cns_definitivo === busca
  );

  if (!cidadao) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Cidadão não encontrado na base do CADSUS',
    });
  }

  return res.json({
    status: 'sucesso',
    data: cidadao,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Mock CADSUS API rodando na porta ${PORT}`);
});
