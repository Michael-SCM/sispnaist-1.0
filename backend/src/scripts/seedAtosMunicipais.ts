import mongoose from 'mongoose';
import dns from 'node:dns';
import 'dotenv/config';

dns.setDefaultResultOrder('ipv4first');

import connectDB from '../config/database.js';
import AtoMunicipalInovacao from '../models/AtoMunicipalInovacao.js';

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildTexto(i, municipio, tipo) {
  return {
    texto_ementa: `Ementa ${municipio}: estabelece diretrizes para políticas de inovação, conforme ${tipo}.`,
    texto_legal:
      `Texto legal (seed) - ${municipio}\n\n` +
      `Art. 1º Ficam estabelecidas diretrizes e procedimentos para implementação do marco regulatório de inovação.\n` +
      `Art. 2º As ações previstas observarão critérios de transparência, monitoramento e avaliação.\n` +
      `Art. 3º Esta norma entra em vigor na data de sua publicação.\n\n` +
      `Observação: conteúdo sintético para uso em ambiente de desenvolvimento/seed.`,
  };
}

export async function seedAtosMunicipais(targetCount = 120) {
  console.log(`🌱 Iniciando seed de Atos Municipais (${targetCount})...`);

  console.log('🧹 Limpando coleção de atos municipais...');
  await AtoMunicipalInovacao.deleteMany({});
  console.log('🧹 Limpeza concluída.');

  const cidadesEstados = [
    { nm_cidade: 'São Paulo', nm_estado: 'SP' },
    { nm_cidade: 'Rio de Janeiro', nm_estado: 'RJ' },
    { nm_cidade: 'Belo Horizonte', nm_estado: 'MG' },
    { nm_cidade: 'Salvador', nm_estado: 'BA' },
    { nm_cidade: 'Curitiba', nm_estado: 'PR' },
    { nm_cidade: 'Fortaleza', nm_estado: 'CE' },
    { nm_cidade: 'Recife', nm_estado: 'PE' },
    { nm_cidade: 'Porto Alegre', nm_estado: 'RS' },
    { nm_cidade: 'Brasília', nm_estado: 'DF' },
    { nm_cidade: 'Manaus', nm_estado: 'AM' },
    { nm_cidade: 'Florianópolis', nm_estado: 'SC' },
    { nm_cidade: 'Goiânia', nm_estado: 'GO' },
    { nm_cidade: 'Belém', nm_estado: 'PA' },
    { nm_cidade: 'São Luís', nm_estado: 'MA' },
    { nm_cidade: 'Natal', nm_estado: 'RN' },
    { nm_cidade: 'João Pessoa', nm_estado: 'PB' },
    { nm_cidade: 'Aracaju', nm_estado: 'SE' },
    { nm_cidade: 'Cuiabá', nm_estado: 'MT' },
    { nm_cidade: 'Campo Grande', nm_estado: 'MS' },
    { nm_cidade: 'Teresina', nm_estado: 'PI' },
    { nm_cidade: 'Macapá', nm_estado: 'AP' },
    { nm_cidade: 'Boa Vista', nm_estado: 'RR' },
    { nm_cidade: 'Porto Velho', nm_estado: 'RO' },
    { nm_cidade: 'Rio Branco', nm_estado: 'AC' },
    { nm_cidade: 'Vitória', nm_estado: 'ES' },
    { nm_cidade: 'Palmas', nm_estado: 'TO' },
    { nm_cidade: 'Campinas', nm_estado: 'SP' },
    { nm_cidade: 'Santos', nm_estado: 'SP' },
    { nm_cidade: 'Ribeirão Preto', nm_estado: 'SP' },
  ];

  const tipos = ['Lei', 'Decreto', 'Portaria', 'Resolução'];
  const subtipos = ['Municipal', 'Regulamentadora', 'Complementar', 'Normativa'];
  const categorias = [
    'Inovação Aberta',
    'Ecossistemas de Inovação',
    'Compras Públicas Inovadoras',
    'Ambientes de Teste',
    'Políticas de Transformação Digital',
  ];
  const classes = ['Diretrizes', 'Procedimentos', 'Governança', 'Implementação', 'Monitoramento'];

  const linksBase = [
    'https://diariooficial.municipio.gov.br/',
    'https://www.exemplo-municipio.gov.br/atos-legais/',
    'https://www.cidadeexemplo.gov.br/legislacao/',
  ];

  const docs = [];

  for (let i = 0; i < targetCount; i++) {
    const { nm_cidade, nm_estado } = pick(cidadesEstados, i);
    const nm_tipo = pick(tipos, i);
    const nm_subtipo = pick(subtipos, i * 2);
    const nm_categoria = pick(categorias, i * 3);
    const nm_classe_categoria = pick(classes, i * 5);

    const ano_ato = 2021 + (i % 5);
    const nr_ato = `${1000 + i}/${ano_ato}`;

    const { texto_ementa, texto_legal } = buildTexto(i, nm_cidade, nm_tipo);

    const link_ato_legal =
      pick(linksBase, i) +
      `${nm_estado.toLowerCase()}/${encodeURIComponent(nm_cidade.toLowerCase())}/${nr_ato.replace('/', '-')}`;

    const sstRand = (i * 53 + 777) % 100;
    const classificacaoSst = sstRand < 30 ? 'analise_situacao' : sstRand < 60 ? 'plano_programa' : sstRand < 80 ? 'outro' : undefined;

    docs.push({
      nr_ato,
      ano_ato,
      link_ato_legal,
      nm_cidade,
      nm_estado,
      nm_tipo,
      nm_subtipo,
      nm_categoria,
      nm_classe_categoria,
      texto_legal,
      texto_ementa,
      classificacaoSst,
      papeisModoGovernanca: [],
      ativo: true,
    });
  }

  console.log('⚡ Inserindo registros em lote...');
  await AtoMunicipalInovacao.insertMany(docs);
  console.log(`✅ Concluído! Inseridos ${docs.length} atos municipais.`);
}

connectDB()
  .then(() => {
    seedAtosMunicipais(120).then(() => {
      console.log('🚀 Seed de Atos Municipais concluído. Fechando conexão...');
      mongoose.connection.close();
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('❌ Erro na seed de Atos Municipais:', err);
    process.exit(1);
  });


