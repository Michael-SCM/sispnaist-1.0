import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ProgressoTreinamento from '../models/ProgressoTreinamento.js';
import Quiz from '../models/Quiz.js';
import Certificado from '../models/Certificado.js';
import VideoAula from '../models/VideoAula.js';
import User from '../models/User.js';
import { IAuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

function gerarCodigoCertificado(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefixo = 'SISPNAIST';
  return `${prefixo}-${timestamp}-${random}`;
}

export const obterProgresso = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;

  let progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });

  if (!progresso) {
    progresso = await ProgressoTreinamento.create({ usuarioId, videoAulaId }) as any;
  }

  return res.status(200).json(progresso);
});

export const listarProgresso = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;

  const progressos = await ProgressoTreinamento.find({ usuarioId }).sort({ dataAtualizacao: -1 }).lean();

  return res.status(200).json({ data: progressos });
});

export const marcarAssistido = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;

  let progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });

  if (!progresso) {
    progresso = await ProgressoTreinamento.create({ usuarioId, videoAulaId }) as any;
  }

  progresso.assistido = true;
  progresso.dataUltimaVisualizacao = new Date();
  await progresso.save();

  await logAction(req, 'UPDATE', 'ProgressoTreinamento', progresso._id.toString(), {
    acao: 'marcar_assistido',
    videoAulaId
  });

  return res.status(200).json(progresso);
});

export const alternarFavorito = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;

  let progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });

  if (!progresso) {
    progresso = await ProgressoTreinamento.create({ usuarioId, videoAulaId }) as any;
  }

  progresso.favorito = !progresso.favorito;
  await progresso.save();

  return res.status(200).json(progresso);
});

export const iniciarQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;

  let progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });
  if (!progresso || !progresso.assistido) {
    throw new AppError('Assista ao vídeo antes de iniciar o quiz', 400);
  }

  if (progresso.quizAprovado) {
    throw new AppError('Você já foi aprovado neste quiz', 400);
  }

  const quiz = await Quiz.findOne({ videoAulaId, ativo: true });
  if (!quiz) {
    throw new AppError('Nenhum quiz encontrado para esta video aula', 404);
  }

  if (quiz.questoes.length < 10) {
    throw new AppError('O quiz precisa ter pelo menos 10 perguntas cadastradas', 400);
  }

  if (progresso.tentativasQuiz.length >= quiz.tentativasPermitidas) {
    throw new AppError(`Número máximo de tentativas (${quiz.tentativasPermitidas}) atingido`, 400);
  }

  const indices = Array.from({ length: quiz.questoes.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const questoesSelecionadas = indices.slice(0, 10).sort((a, b) => a - b);

  progresso.sessaoAtiva = {
    questoesSelecionadas,
    dataInicio: new Date()
  };
  await progresso.save();

  const questoes = questoesSelecionadas.map(i => ({
    pergunta: quiz.questoes[i].pergunta,
    opcoes: quiz.questoes[i].opcoes,
    index: i
  }));

  return res.status(200).json({ questoes, totalQuestoes: 10 });
});

export const submeterQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;
  const { respostas } = req.body;

  if (!Array.isArray(respostas) || respostas.length !== 10) {
    throw new AppError('Respostas deve ser um array com 10 posições', 400);
  }

  const quiz = await Quiz.findOne({ videoAulaId, ativo: true });
  if (!quiz) {
    throw new AppError('Nenhum quiz ativo encontrado para esta video aula', 404);
  }

  const progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });
  if (!progresso || !progresso.sessaoAtiva) {
    throw new AppError('Nenhuma sessão de quiz ativa. Clique em "Fazer Prova" para iniciar.', 400);
  }

  const questoesSelecionadas = progresso.sessaoAtiva.questoesSelecionadas;

  let acertos = 0;
  const detalhes = questoesSelecionadas.map((qIndex, i) => {
    const questao = quiz.questoes[qIndex];
    const correta = respostas[i] === questao.opcaoCorreta;
    if (correta) acertos++;
    return {
      pergunta: questao.pergunta,
      opcoes: questao.opcoes,
      respostaUsuario: respostas[i],
      respostaCorreta: questao.opcaoCorreta,
      correta
    };
  });

  const pontuacao = Math.round((acertos / 10) * 100);
  const aprovado = pontuacao >= quiz.pontuacaoMinima;

  const tentativa = {
    tentativa: progresso.tentativasQuiz.length + 1,
    pontuacao,
    respostas,
    questoesSelecionadas,
    dataRealizacao: new Date()
  };

  progresso.tentativasQuiz.push(tentativa);
  progresso.quizRealizado = true;
  progresso.quizAprovado = aprovado;
  progresso.sessaoAtiva = undefined;

  if (progresso.melhormaPontuacao === undefined || pontuacao > progresso.melhormaPontuacao) {
    progresso.melhormaPontuacao = pontuacao;
  }

  if (aprovado) {
    progresso.dataConclusao = new Date();
  }

  await progresso.save();

  await logAction(req, 'UPDATE', 'ProgressoTreinamento', progresso._id.toString(), {
    acao: 'submeter_quiz',
    videoAulaId,
    pontuacao,
    aprovado
  });

  return res.status(200).json({
    pontuacao,
    aprovado,
    totalQuestoes: 10,
    acertos,
    tentativa: tentativa.tentativa,
    tentativasRestantes: quiz.tentativasPermitidas - progresso.tentativasQuiz.length,
    pontuacaoMinima: quiz.pontuacaoMinima,
    detalhes
  });
});

export const emitirCertificado = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;
  const { videoAulaId } = req.params;

  let progresso = await ProgressoTreinamento.findOne({ usuarioId, videoAulaId });
  if (!progresso || !progresso.quizAprovado) {
    throw new AppError('Você precisa ser aprovado no quiz para emitir o certificado', 400);
  }

  const certificadoExistente = await Certificado.findOne({ usuarioId, videoAulaId });
  if (certificadoExistente) {
    return res.status(200).json(certificadoExistente);
  }

  const videoAula = await VideoAula.findById(videoAulaId);
  if (!videoAula) {
    throw new AppError('Video aula não encontrada', 404);
  }

  const usuario = await User.findById(usuarioId);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const certificado = await Certificado.create({
    usuarioId,
    videoAulaId,
    nomeUsuario: usuario.nome,
    cpfUsuario: usuario.cpf,
    tituloTreinamento: videoAula.titulo,
    descricaoTreinamento: videoAula.descricao,
    categoriaTreinamento: videoAula.categoria,
    cargaHoraria: videoAula.duracao,
    pontuacaoQuiz: progresso.melhormaPontuacao || 0,
    codigoCertificado: gerarCodigoCertificado(),
    dataConclusao: progresso.dataConclusao || new Date(),
    emitidoPor: `SISPNAIST - ${req.user?.perfil || 'Sistema'}`
  });

  progresso.certificadoEmitido = true;
  await progresso.save();

  await logAction(req, 'CREATE', 'Certificado', certificado._id.toString(), {
    videoAulaId,
    codigoCertificado: certificado.codigoCertificado
  });

  return res.status(201).json(certificado);
});

export const listarCertificados = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const usuarioId = (req.user as any).id;

  const certificados = await Certificado.find({ usuarioId, ativo: true })
    .sort({ dataEmissao: -1 })
    .lean();

  return res.status(200).json({ data: certificados });
});

export const obterCertificado = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const certificado = await Certificado.findById(id);
  if (!certificado) {
    throw new AppError('Certificado não encontrado', 404);
  }

  return res.status(200).json(certificado);
});

export const listarCertificadosAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });

  const [certificados, total] = await Promise.all([
    Certificado.find({}).sort({ dataEmissao: -1 }).skip(skip).limit(limit).lean(),
    Certificado.countDocuments({})
  ]);

  return res.status(200).json({
    data: certificados,
    total,
    page,
    limit,
    totalPages: getPaginationResult(total, page, limit).pages
  });
});
