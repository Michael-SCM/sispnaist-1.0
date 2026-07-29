import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const cidadaos = JSON.parse(readFileSync(join(__dirname, 'data', 'cadsus.json'), 'utf-8'));
const estabelecimentos = JSON.parse(readFileSync(join(__dirname, 'data', 'cnes.json'), 'utf-8'));
const trabalhadores = JSON.parse(readFileSync(join(__dirname, 'data', 'esocial.json'), 'utf-8'));
const pacientesSih = JSON.parse(readFileSync(join(__dirname, 'data', 'sih.json'), 'utf-8'));
const pacientesSinan = JSON.parse(readFileSync(join(__dirname, 'data', 'sinan.json'), 'utf-8'));

app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'mock-apis-sispnaist', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

function buscarCidadao(cpfOuCns) {
  const busca = cpfOuCns.replace(/\D/g, '');
  return cidadaos.find((c) => c.cpf === busca || c.cns_definitivo === busca);
}

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

function buscarEstabelecimento(codigo) {
  const busca = codigo.replace(/\D/g, '');
  return estabelecimentos.find((e) => e.codigo_cnes === busca);
}

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

function buscarTrabalhador(cpf) {
  const busca = cpf.replace(/\D/g, '');
  return trabalhadores.find((t) => t.cpf === busca);
}

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

function buscarPacienteSih(cns) {
  const busca = cns.replace(/\D/g, '');
  return pacientesSih.find((p) => p.cns_paciente === busca);
}

app.get('/internacoes/:cns', (req, res) => {
  const paciente = buscarPacienteSih(req.params.cns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma internação encontrada para o CNS informado',
    });
  }
  return res.json({ status: 'sucesso', data: paciente });
});

app.get('/api/v1/internacoes/:cns', (req, res) => {
  const paciente = buscarPacienteSih(req.params.cns);
  if (!paciente) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhuma internação encontrada para o CNS informado',
    });
  }
  return res.json({ status: 'sucesso', data: paciente });
});

function buscarPacienteSinan(cpfOuCns) {
  const busca = cpfOuCns.replace(/\D/g, '');
  return pacientesSinan.find((p) => p.cpf === busca || p.cns === busca);
}

let contadorNotificacao = 100;

app.get('/sinan/notificacoes/:cpfOuCns', (req, res) => {
  const paciente = buscarPacienteSinan(req.params.cpfOuCns);
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
  const paciente = buscarPacienteSinan(req.params.cpfOuCns);
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
  console.log(`Mock APIs unificadas rodando na porta ${PORT}`);
});
