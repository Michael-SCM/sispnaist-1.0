export type TipoFormula = 'simple' | 'percentage' | 'ratio' | 'difference';

export interface IFormulaIndicador {
  type: TipoFormula;
  metric?: string;
  numerator?: string;
  denominator?: string;
  metric1?: string;
  metric2?: string;
}

export interface IIndicador {
  _id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  tipo: 'quantitativo' | 'percentual';
  formula: IFormulaIndicador;
  meta?: number;
  unidade?: string;
  periodicidade: string;
  uf?: string;
  icone: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  valorCalculado?: number;
  alcancouMeta?: boolean | null;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IMetricaDisponivel {
  chave: string;
  nome: string;
  descricao: string;
  categoria: string;
}

export const CATEGORIAS = [
  { value: 'acidente', label: 'Acidente' },
  { value: 'doenca', label: 'Doença' },
  { value: 'vacinacao', label: 'Vacinação' },
  { value: 'absenteismo', label: 'Absenteísmo' },
  { value: 'geral', label: 'Geral' }
] as const;

export const PERIODICIDADES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
] as const;

export const CORES = ['blue', 'green', 'red', 'yellow', 'purple', 'orange'] as const;

const EMOJIS = [
  '📊', '📈', '📉', '🎯', '⚡', '🔥', '💉', '🏥', '👷', '🛡️',
  '⚠️', '✅', '❌', '📋', '🔍', '💊', '🧪', '🚑', '🧑‍⚕️', '📅'
];

export const ICONES = EMOJIS.map(e => ({ value: e, label: e }));

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
