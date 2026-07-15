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

function buscarPaciente(cns) {
  const busca = cns.replace(/\D/g, '');
  return pacientes.find((p) => p.cns_paciente === busca);
}

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-sih-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/internacoes/:cns', (req, res) => {
  const paciente = buscarPaciente(req.params.cns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma internação encontrada para o CNS informado',
    });
  }
  return res.json({ status: 'sucesso', data: paciente });
});

app.get('/api/v1/internacoes/:cns', (req, res) => {
  const paciente = buscarPaciente(req.params.cns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma internação encontrada para o CNS informado',
    });
  }
  return res.json({ status: 'sucesso', data: paciente });
});

app.listen(PORT, () => {
  console.log(`Mock SIH API rodando na porta ${PORT}`);
});
