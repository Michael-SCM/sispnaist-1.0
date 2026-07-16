import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pacientes = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'));

function buscarPaciente(cpfOuCns) {
  const busca = cpfOuCns.replace(/\D/g, '');
  return pacientes.find(
    (p) => p.cpf === busca || p.cns === busca
  );
}

let contadorNotificacao = 100;

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-sinan-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/sinan/notificacoes/:cpfOuCns', (req, res) => {
  const paciente = buscarPaciente(req.params.cpfOuCns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma notificação encontrada para o CPF/CNS informado',
    });
  }
  return res.json({
    status: 'sucesso',
    data: {
      cpf: paciente.cpf,
      cns: paciente.cns,
      nome: paciente.nome,
      notificacoes: paciente.notificacoes,
    },
  });
});

app.get('/api/v1/sinan/notificacoes/:cpfOuCns', (req, res) => {
  const paciente = buscarPaciente(req.params.cpfOuCns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma notificação encontrada para o CPF/CNS informado',
    });
  }
  return res.json({
    status: 'sucesso',
    data: {
      cpf: paciente.cpf,
      cns: paciente.cns,
      nome: paciente.nome,
      notificacoes: paciente.notificacoes,
    },
  });
});

app.post('/sinan/notificar', (req, res) => {
  const { tipoNotificacao, cpf, cns, nome } = req.body;
  if (!cpf && !cns) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'CPF ou CNS é obrigatório para notificação',
    });
  }
  contadorNotificacao++;
  const numero = `SINAN-2026-${contadorNotificacao.toString().padStart(3, '0')}`;
  return res.status(201).json({
    status: 'sucesso',
    data: {
      numero_notificacao: numero,
      data_notificacao: new Date().toISOString().split('T')[0],
      mensagem: 'Notificação registrada com sucesso no SINAN',
    },
  });
});

app.post('/api/v1/sinan/notificar', (req, res) => {
  const { tipoNotificacao, cpf, cns, nome } = req.body;
  if (!cpf && !cns) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'CPF ou CNS é obrigatório para notificação',
    });
  }
  contadorNotificacao++;
  const numero = `SINAN-2026-${contadorNotificacao.toString().padStart(3, '0')}`;
  return res.status(201).json({
    status: 'sucesso',
    data: {
      numero_notificacao: numero,
      data_notificacao: new Date().toISOString().split('T')[0],
      mensagem: 'Notificação registrada com sucesso no SINAN',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Mock SINAN API rodando na porta ${PORT}`);
});
