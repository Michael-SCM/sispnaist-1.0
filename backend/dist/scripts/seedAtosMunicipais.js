"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAtosMunicipais = seedAtosMunicipais;
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
require("dotenv/config");
node_dns_1.default.setDefaultResultOrder('ipv4first');
const database_js_1 = __importDefault(require("../config/database.js"));
const AtoMunicipalInovacao_js_1 = __importDefault(require("../models/AtoMunicipalInovacao.js"));
function pick(arr, i) {
    return arr[i % arr.length];
}
function buildTexto(i, municipio, tipo) {
    return {
        texto_ementa: `Ementa ${municipio}: estabelece diretrizes para políticas de inovação, conforme ${tipo}.`,
        texto_legal: `Texto legal (seed) - ${municipio}\n\n` +
            `Art. 1º Ficam estabelecidas diretrizes e procedimentos para implementação do marco regulatório de inovação.\n` +
            `Art. 2º As ações previstas observarão critérios de transparência, monitoramento e avaliação.\n` +
            `Art. 3º Esta norma entra em vigor na data de sua publicação.\n\n` +
            `Observação: conteúdo sintético para uso em ambiente de desenvolvimento/seed.`,
    };
}
async function seedAtosMunicipais(targetCount = 120) {
    console.log(`🌱 Iniciando seed de Atos Municipais (${targetCount})...`);
    console.log('🧹 Limpando coleção de atos municipais...');
    await AtoMunicipalInovacao_js_1.default.deleteMany({});
    console.log('🧹 Limpeza concluída.');
    const cidades = [
        'São Paulo',
        'Campinas',
        'Santos',
        'Ribeirão Preto',
        'Sorocaba',
        'Guarulhos',
        'São José dos Campos',
        'Osasco',
        'Santo André',
        'São Bernardo do Campo',
        'Jundiaí',
        'Piracicaba',
        'Taubaté',
        'Mogi das Cruzes',
        'Carapicuíba',
    ];
    const estados = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE'];
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
        const nm_cidade = pick(cidades, i);
        const nm_estado = pick(estados, i * 7 + 3);
        const nm_tipo = pick(tipos, i);
        const nm_subtipo = pick(subtipos, i * 2);
        const nm_categoria = pick(categorias, i * 3);
        const nm_classe_categoria = pick(classes, i * 5);
        const ano_ato = 2021 + (i % 5);
        const nr_ato = `${1000 + i}/${ano_ato}`;
        const { texto_ementa, texto_legal } = buildTexto(i, nm_cidade, nm_tipo);
        const link_ato_legal = pick(linksBase, i) +
            `${nm_estado.toLowerCase()}/${encodeURIComponent(nm_cidade.toLowerCase())}/${nr_ato.replace('/', '-')}`;
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
            papeisModoGovernanca: [],
            ativo: true,
        });
    }
    console.log('⚡ Inserindo registros em lote...');
    await AtoMunicipalInovacao_js_1.default.insertMany(docs);
    console.log(`✅ Concluído! Inseridos ${docs.length} atos municipais.`);
}
(0, database_js_1.default)()
    .then(() => {
    seedAtosMunicipais(120).then(() => {
        console.log('🚀 Seed de Atos Municipais concluído. Fechando conexão...');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
})
    .catch((err) => {
    console.error('❌ Erro na seed de Atos Municipais:', err);
    process.exit(1);
});
