// Temas da P1 e agrupamentos usados na montagem dos simulados e no painel de domínio.

export const TOPICS = {
  fundamentos: { label: 'Contabilidade e Decisão', group: 'fundamentos-bp', aula: 'Aula 1' },
  bp: { label: 'Balanço Patrimonial', group: 'fundamentos-bp', aula: 'Aula 2' },
  classificacao: { label: 'Ativo / Passivo / PL', group: 'fundamentos-bp', aula: 'Aula 2' },
  circulante: { label: 'Circulante × Não Circulante', group: 'fundamentos-bp', aula: 'Aula 2' },
  pl: { label: 'Patrimônio Líquido', group: 'fundamentos-bp', aula: 'Aula 2' },
  'debito-credito': { label: 'Débito e Crédito', group: 'debito-credito', aula: 'Aula 3' },
  razonetes: { label: 'Razonetes', group: 'debito-credito', aula: 'Aula 3' },
  balancete: { label: 'Balancete', group: 'debito-credito', aula: 'Aula 3' },
  dre: { label: 'DRE', group: 'dre', aula: 'Aula 4' },
  'custo-despesa': { label: 'Custo × Despesa', group: 'dre', aula: 'Aula 4' },
  'competencia-caixa': { label: 'Competência × Caixa', group: 'dre', aula: 'Aula 4' },
  av: { label: 'Análise Vertical (A.V.)', group: 'av-ah', aula: 'Aula 5' },
  ah: { label: 'Análise Horizontal (A.H.)', group: 'av-ah', aula: 'Aula 5' },
  margens: { label: 'Margens', group: 'margens', aula: 'Aula 5' },
  liquidez: { label: 'Liquidez Corrente', group: 'liquidez', aula: 'Aula 5' },
  roe: { label: 'ROE', group: 'roe-dupont', aula: 'Aula 5' },
  giro: { label: 'Giro do Ativo', group: 'roe-dupont', aula: 'Aula 5' },
  alavancagem: { label: 'Alavancagem', group: 'roe-dupont', aula: 'Aula 5' },
  dupont: { label: 'DuPont', group: 'roe-dupont', aula: 'Aula 5' },
  'resultado-financeiro': { label: 'Resultado Financeiro', group: 'estrategia', aula: 'Aula 4' },
  equivalencia: { label: 'Equivalência Patrimonial', group: 'estrategia', aula: 'Aula 4' },
  'mc-pe': { label: 'Margem de Contribuição e Ponto de Equilíbrio', group: 'estrategia', aula: 'Aula 4' },
  estrategia: { label: 'Estratégia e Decisão', group: 'estrategia', aula: 'Aula 5' },
} as const;

export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];

export const GROUPS = {
  'fundamentos-bp': { label: 'Fundamentos e BP', short: 'BP', p1Weight: 3 },
  'debito-credito': { label: 'Débito, Crédito e Razonetes', short: 'Débito/Crédito', p1Weight: 4 },
  dre: { label: 'DRE e Competência', short: 'DRE', p1Weight: 4 },
  'av-ah': { label: 'Análise Vertical e Horizontal', short: 'A.V./A.H.', p1Weight: 3 },
  margens: { label: 'Margens', short: 'Margens', p1Weight: 3 },
  liquidez: { label: 'Liquidez Corrente', short: 'Liquidez', p1Weight: 2 },
  'roe-dupont': { label: 'ROE, Giro, Alavancagem e DuPont', short: 'ROE/DuPont', p1Weight: 4 },
  estrategia: { label: 'Estratégia e Interpretação', short: 'Estratégia', p1Weight: 2 },
} as const;

export type GroupId = keyof typeof GROUPS;
export const GROUP_IDS = Object.keys(GROUPS) as GroupId[];

export function groupOf(topic: TopicId): GroupId {
  return TOPICS[topic].group;
}

/**
 * Pré-requisitos usados pela prova adaptativa: ao errar um tema composto,
 * o aluno volta aos componentes antes de recompor o tema.
 */
export const PREREQUISITES: Partial<Record<TopicId, TopicId[]>> = {
  dupont: ['margens', 'giro', 'alavancagem'],
  roe: ['dre', 'pl'],
  margens: ['dre'],
  liquidez: ['circulante'],
  av: ['bp'],
  ah: ['bp'],
  'debito-credito': ['classificacao'],
  razonetes: ['debito-credito'],
  balancete: ['razonetes'],
  dre: ['custo-despesa'],
  circulante: ['classificacao'],
  'resultado-financeiro': ['dre'],
  estrategia: ['dupont', 'liquidez'],
};
