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
const pacientes = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

// GET /api/v1/internacoes/{cns}
app.get('/api/v1/internacoes/:cns', (req, res) => {
  const { cns } = req.params;
  const busca = cns.replace(/\D/g, '');

  const paciente = pacientes.find((p) => p.cns_paciente === busca);

  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma internação encontrada para o CNS informado',
    });
  }

  return res.json({
    status: 'sucesso',
    data: paciente,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Mock SIH API rodando na porta ${PORT}`);
});
