/**
 * Redação de PII / credenciais / dados clínicos para eventos de auditoria.
 *
 * O audit log precisa registrar AÇÃO + ENTIDADE + IDENTIFICADOR + CAMPOS
 * ALTERADOS + RESULTADO — e nada que identifique uma pessoa ou revele
 * conteúdo clínico.
 *
 * Estratégia em três camadas, decididas por FOLHA (valor primitivo):
 *
 *   1. Chave BLOQUEADA (PII, credencial, dado clínico) -> '[REDACTED]' (subárvore inteira)
 *   2. Folha cuja chave está na LISTA PERMITIDA        -> valor preservado (após máscara)
 *   3. Qualquer outra folha                           -> '[OCULTO]' (nome do campo fica)
 *
 * Camada extra, independente da chave: todo string que sobreviver passa por
 * `mascararValor()`, que detecta CPF, CNPJ, e-mail, telefone, JWT e segredos
 * longos por padrão — defesa contra chaves inesperadas.
 *
 * LIMITES: profundidade, quantidade de chaves, tamanho de array e tamanho final
 * serializado são limitados — um documento clínico grande nunca cabe por inteiro.
 */

export const REDACTED = '[REDACTED]';
export const HIDDEN = '[OCULTO]';
export const TRUNCATED = '[TRUNCADO]';

export const MAX_PROFUNDIDADE = 4;
export const MAX_CHAVES = 60;
export const MAX_ARRAY = 25;
export const MAX_BYTES_DETALHES = 4096;

/**
 * Termos bloqueados.
 *  - termos com >= 4 chars: casam se aparecem no nome da chave "compactado"
 *  - termos com < 4 chars:  casam apenas como token exato da chave
 *
 * Assim `dataNascimento`, `nomeMae` e `enderecoCep` são atingidos, enquanto
 * termos curtos como `rg` só casam quando são um token (evita falso positivo
 * em `perfil`, `arranjo`, etc.).
 */
export const TERMOS_BLOQUEADOS: string[] = [
  // credenciais / tokens / segredos
  'senha', 'password', 'passwd', 'pwd', 'hash', 'token', 'jwt', 'secret',
  'apikey', 'api key', 'authorization', 'cookie', 'csrf', 'refresh token',
  'access token', 'preauth', 'otp', 'pin', 'mfa', 'segredo', 'credencial',
  'privatekey', 'chave', 'bearer', 'assinatura',

  // identificadores pessoais
  'cpf', 'cnpj', 'rg', 'rne', 'pis', 'pasep', 'cns', 'cartao sus', 'cnh',
  'passaporte', 'titulo eleitoral', 'cep',

  // contato
  'email', 'e mail', 'mail', 'telefone', 'celular', 'phone', 'whatsapp',
  'contato', 'messenger',

  // endereço / localização
  'endereco', 'logradouro', 'rua', 'avenida', 'bairro', 'complemento',
  'municipio', 'cidade', 'lote', 'quadra',

  // dados cadastrais da pessoa
  'nome', 'nascimento', 'nomemae', 'nomepai', 'estado civil', 'genero',
  'sexo', 'raca', 'escolaridade', 'nacionalidade',

  // dados clínicos / de saúde
  'relato', 'relatorio', 'descricao clinica', 'diagnostico', 'hipotese',
  'tratamento', 'medicamento', 'prescricao', 'remedio', 'sintoma',
  'laudo', 'prontuario', 'aso', 'exame', 'exames', 'cid10', 'conduta',
  'evolucao', 'atestado', 'lesao', 'agente causador',

  // conteúdo livre — pode conter qualquer coisa
  'descricao', 'observacao', 'observacoes', 'comentario', 'conteudo',
  'texto', 'mensagem', 'historico', 'anexo', 'detalhe',
];

/**
 * Lista permitida: somente estes nomes de campo têm o valor preservado.
 * É lista de NOMES DE CAMPO, não de valores — valores ainda passam por
 * `mascararValor()`. O que não está aqui vira '[OCULTO]'.
 */
export const CAMPOS_PERMITIDOS = new Set<string>([
  // identificação do evento
  'acao', 'entidade', 'entidadeid', 'resultado', 'motivo', 'evento',
  'sensivel', 'resumo', 'operacao',
  // indicadores booleanos sobre texto livre (o texto em si nunca é logado)
  'temmotivoinformado',

  // campos alterados: nomes de campo (nunca valores)
  'camposmudados', 'camposalterados', 'alterados',

  // contexto de requisição (URL sem query string)
  'metodo', 'rota', 'status', 'statuscode', 'codigohttp',

  // identificadores opacos (ObjectId) — pseudônimos, necessários ao rastreio
  'id', '_id', 'empresaid', 'unidadeid', 'trabalhadorid', 'usuarioid',
  'uploadid', 'fileid', 'registroid', 'itemid',
  // escopo organizacional aplicado ao filtro (o objeto é recursivo; os filhos
  // continuam sujeitos à lista permitida/bloqueada)
  'empresa', 'unidade', 'setor', 'cargo', 'funcao',

  // paginação / agregação / retenção
  'page', 'limit', 'total', 'totalpages', 'skip', 'quantidade', 'count',
  'dias', 'diasretidos', 'dryrun', 'validadesegundos', 'retidos',

  // campos operacionais enumerados (não identificam pessoa)
  'tipo', 'situacao', 'categoria', 'prioridade', 'perfil', 'papel', 'role',
  'ativo', 'inativo', 'enabled', 'bloqueado', 'origem', 'fonte',
  'storagebackend', 'mimetype', 'tamanho', 'etapa', 'passo',

  // comparação: preserva antes/depois apenas para chaves permitidas,
  // pois chaves bloqueadas retornam '[REDACTED]' antes de chegar aqui
  'antes', 'depois',

  // datas (ISO) úteis para janelas de retenção
  'datainicio', 'datafim', 'ate', 'desde', 'geradoem', 'expiraem',
]);

/** Nome da chave normalizado (`dataNascimento` -> `datanascimento`). */
export function normalizarChave(chave: string): string {
  return String(chave)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.:/]+/g, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
}

export function chaveBloqueada(chave: string): boolean {
  const compacta = normalizarChave(chave);
  const tokens = String(chave)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[\s\-_./:]+/)
    .filter(Boolean);

  for (const termo of TERMOS_BLOQUEADOS) {
    const t = termo.toLowerCase().replace(/\s+/g, '');
    if (t.length >= 4) {
      if (compacta.includes(t)) return true;
    } else if (tokens.includes(t)) {
      return true;
    }
  }
  return false;
}

export function chavePermitida(chave: string): boolean {
  return CAMPOS_PERMITIDOS.has(normalizarChave(chave));
}

// ---------------------------------------------------------------------------
// Máscara de valor — aplicada a TODO string que será preservado
// ---------------------------------------------------------------------------

const RE_JWT = /\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b/g;
const RE_BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi;
const RE_CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const RE_CNPJ = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
const RE_EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
const RE_TELEFONE =
  /\+\d{1,3}[ .-]?\(?\d{2}\)?[ .-]?\d{4,5}[ .-]?\d{4}\b|\b\(?\d{2}\)?[ .-]?\d{4,5}[ .-]?\d{4}\b/g;
const RE_SEGREDO_LONGO = /\b[A-Fa-f0-9]{32,}\b|\b[A-Za-z0-9+/]{48,}={0,2}\b/g;

/** Mascara PII e segredos detectados dentro de um string. */
export function mascararValor(valor: string): string {
  return valor
    .replace(RE_JWT, REDACTED)
    .replace(RE_BEARER, `Bearer ${REDACTED}`)
    .replace(RE_CPF, REDACTED)
    .replace(RE_CNPJ, REDACTED)
    .replace(RE_EMAIL, REDACTED)
    .replace(RE_TELEFONE, REDACTED)
    .replace(RE_SEGREDO_LONGO, REDACTED);
}

// ---------------------------------------------------------------------------
// Redação recursiva
// ---------------------------------------------------------------------------

interface Contexto {
  profundidade: number;
  chavesVisitadas: number;
}

function ehBuffer(value: unknown): boolean {
  return (
    (typeof Buffer !== 'undefined' && Buffer.isBuffer(value as any)) ||
    (value as any)?.type === 'Buffer'
  );
}

function ehObjectId(value: any): boolean {
  return (
    typeof value?.toHexString === 'function' &&
    typeof value?.getTimestamp === 'function'
  );
}

/**
 * Redige estruturas arbitrárias para uso em `AuditLog.detalhes`.
 * Nunca lança exceção: falha vira `'[ERRO_REDUCAO]'`.
 */
export function redigirDetalhes(entrada: unknown): Record<string, any> {
  try {
    const plano = paraObjetoPlano(entrada);
    const resultado = redigir(plano, { profundidade: 0, chavesVisitadas: 0 }, null);

    if (resultado === null || typeof resultado !== 'object' || Array.isArray(resultado)) {
      return { valor: resultado };
    }
    return limitarTamanho(resultado as Record<string, any>);
  } catch {
    return { erro: '[ERRO_REDUCAO]' };
  }
}

function paraObjetoPlano(entrada: unknown): unknown {
  if (entrada === null || entrada === undefined) return {};
  if (typeof (entrada as any)?.toObject === 'function') {
    return (entrada as any).toObject({ flattenObjectIds: true, depopulate: true });
  }
  if (typeof (entrada as any)?.toJSON === 'function') {
    return (entrada as any).toJSON();
  }
  if (Array.isArray(entrada) || typeof entrada === 'object') return entrada;
  return { valor: entrada };
}

/**
 * @param chavePai nome da chave que conduz a este valor; `null` na raiz.
 *                 Determina a decisão de folha para itens de array.
 */
function redigir(valor: any, ctx: Contexto, chavePai: string | null): any {
  if (ctx.profundidade > MAX_PROFUNDIDADE) return TRUNCATED;
  if (valor === null || valor === undefined) return null;

  if (ehBuffer(valor)) return '[BINARIO_REMOVIDO]';
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'function') return undefined;
  if (ehObjectId(valor)) return valor.toHexString();

  if (typeof valor === 'string') {
    // folha chegou sem chave própria (item de array): aplica a decisão da chave pai
    if (chavePai !== null && !chavePermitida(chavePai) && !chaveBloqueada(chavePai)) {
      return HIDDEN;
    }
    return mascararValor(valor);
  }
  if (typeof valor === 'number' || typeof valor === 'boolean') return valor;
  if (typeof valor === 'bigint') return String(valor);

  if (Array.isArray(valor)) {
    const limitado = valor.slice(0, MAX_ARRAY).map((item) =>
      redigir(item, { ...ctx, profundidade: ctx.profundidade + 1 }, chavePai)
    );
    if (valor.length > MAX_ARRAY) limitado.push(`[+${valor.length - MAX_ARRAY} itens]`);
    return limitado;
  }

  if (typeof valor === 'object') {
    const saida: Record<string, any> = {};
    const chaves = Object.keys(valor).slice(0, MAX_CHAVES);

    for (const chave of chaves) {
      if (ctx.chavesVisitadas >= MAX_CHAVES) {
        saida['demais'] = TRUNCATED;
        break;
      }
      ctx.chavesVisitadas++;

      const filho = valor[chave];

      // 1) chave bloqueada -> subárvore inteira redigida
      if (chaveBloqueada(chave)) {
        saida[chave] = REDACTED;
        continue;
      }

      // URL: mantém só o caminho (a query string pode filtrar por CPF)
      if (/^url$/i.test(chave) && typeof filho === 'string') {
        saida[chave] = filho.split('?')[0];
        continue;
      }

      if (filho !== null && typeof filho === 'object' && !ehBuffer(filho)) {
        saida[chave] = redigir(filho, { ...ctx, profundidade: ctx.profundidade + 1 }, chave);
        continue;
      }

      // 2) folha com chave permitida -> valor preservado (mascarado)
      if (chavePermitida(chave)) {
        saida[chave] = redigir(filho, { ...ctx, profundidade: ctx.profundidade + 1 }, chave);
        continue;
      }

      // 3) qualquer outra folha -> valor oculto, nome do campo preservado
      saida[chave] = HIDDEN;
    }

    return saida;
  }

  return HIDDEN;
}

function limitarTamanho(obj: Record<string, any>): Record<string, any> {
  let serializado: string;
  try {
    serializado = JSON.stringify(obj);
  } catch {
    return { erro: '[ERRO_REDUCAO]' };
  }

  if (serializado.length <= MAX_BYTES_DETALHES) return obj;

  return {
    resumo: TRUNCATED,
    tamanhoOriginal: serializado.length,
    chaves: Object.keys(obj).slice(0, 20),
  };
}
