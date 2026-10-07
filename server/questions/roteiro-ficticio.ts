// CASOS FICTÍCIOS PARA TREINO DO FORMATO DA PROVA — roteiro de análise em 3 partes, com consulta ao anexo.
// Dois casos inventados (nenhuma empresa real): uma rede de varejo de vestuário (rot-varejo) e uma indústria
// de bens de capital (rot-industria). Valores em R$ milhões, 2025 × 2024. Subtotais são SOMADOS em código,
// de modo que Ativo = Passivo + PL e os degraus da DRE fecham exatamente.
import type { Question, DataTable, Rubric } from '../../shared/types';

// ---------------------------------------------------------------------------------------------
// Dados — Caso 1: Lojas Primavera S.A. (varejo de vestuário)
//
// Indicadores (calculados a partir dos números abaixo):
//                      2024        2025
//  Receita líquida   14.400      16.200   (A.H. +12,5%)
//  Ativo total       10.340      11.160   (A.H. +7,9%)
//  AC / PC → LC   6.260/5.790  6.190/6.260
//  LC                 1,08        0,99
//  Margem bruta      42,0%       41,5%   (CMV +13,5% > receita +12,5%)
//  Margem operac.     5,6%        5,9%   (despesas cresceram menos que a receita)
//  Margem líquida     3,4%        3,3%   (resultado financeiro −110 → −190, +72,7%)
//  ROE               14,3%       15,6%
//  Giro               1,39        1,45
//  Alavancagem        3,02        3,23
//  DuPont 2024: 3,40% × 1,39 × 3,02 = 14,3%  ·  2025: 3,33% × 1,45 × 3,23 = 15,6%
//  Leitura: ROE subiu por giro e alavancagem (dívida bancária 380 → 820), com margem líquida caindo.
// ---------------------------------------------------------------------------------------------

type Lines = Record<string, number>;

interface BP {
  ac: Lines;
  anc: Lines;
  pc: Lines;
  pnc: Lines;
  pl: Lines;
}

interface DRE {
  receitaLiquida: number;
  cmv: number;
  despesas: Lines; // negativas
  resultadoFinanceiro: number;
  irCs: number;
}

const sum = (l: Lines) => Object.values(l).reduce((a, b) => a + b, 0);

function buildBP(bp: BP) {
  const ativoCirculante = sum(bp.ac);
  const ativoNaoCirculante = sum(bp.anc);
  const passivoCirculante = sum(bp.pc);
  const passivoNaoCirculante = sum(bp.pnc);
  const patrimonioLiquido = sum(bp.pl);
  const ativoTotal = ativoCirculante + ativoNaoCirculante;
  const passivoTotal = passivoCirculante + passivoNaoCirculante;
  if (ativoTotal !== passivoTotal + patrimonioLiquido) {
    throw new Error(`BP fictício não fecha: A=${ativoTotal} ≠ P+PL=${passivoTotal + patrimonioLiquido}`);
  }
  return {
    ...bp.ac,
    ...bp.anc,
    ...bp.pc,
    ...bp.pnc,
    ...bp.pl,
    ativoCirculante,
    ativoNaoCirculante,
    ativoTotal,
    passivoCirculante,
    passivoNaoCirculante,
    passivoTotal,
    patrimonioLiquido,
  } as Lines;
}

function buildDRE(d: DRE) {
  const lucroBruto = d.receitaLiquida + d.cmv;
  const despesasOperacionais = sum(d.despesas);
  const lucroOperacional = lucroBruto + despesasOperacionais;
  const lair = lucroOperacional + d.resultadoFinanceiro;
  const lucroLiquido = lair + d.irCs;
  return {
    receitaLiquida: d.receitaLiquida,
    cmv: d.cmv,
    lucroBruto,
    ...d.despesas,
    despesasOperacionais,
    lucroOperacional,
    resultadoFinanceiro: d.resultadoFinanceiro,
    lair,
    irCs: d.irCs,
    lucroLiquido,
  } as Lines;
}

const VAREJO_BP24 = buildBP({
  ac: { caixa: 1420, aplicacoes: 380, contasReceber: 2750, estoques: 1310, tributosRecuperar: 290, outrosAC: 110 },
  anc: { tributosLP: 230, irDiferido: 340, investimentos: 40, imobilizado: 1520, direitoUso: 1080, intangivel: 870 },
  pc: { emprestimos: 260, arrendamentos: 400, fornecedores: 1690, cartoes: 2300, fiscais: 410, trabalhistas: 370, dividendos: 160, outrasPC: 200 },
  pnc: { emprestimosLP: 120, arrendamentosLP: 880, provisoesLP: 130 },
  pl: { capital: 2900, reservas: 520 },
});

const VAREJO_BP25 = buildBP({
  ac: { caixa: 930, aplicacoes: 300, contasReceber: 3090, estoques: 1430, tributosRecuperar: 310, outrosAC: 130 },
  anc: { tributosLP: 250, irDiferido: 360, investimentos: 40, imobilizado: 1970, direitoUso: 1370, intangivel: 980 },
  pc: { emprestimos: 480, arrendamentos: 450, fornecedores: 1860, cartoes: 2350, fiscais: 430, trabalhistas: 400, dividendos: 110, outrasPC: 180 },
  pnc: { emprestimosLP: 340, arrendamentosLP: 960, provisoesLP: 140 },
  pl: { capital: 2900, reservas: 560 },
});

const VAREJO_DRE24 = buildDRE({
  receitaLiquida: 14400,
  cmv: -8350,
  despesas: { despesasVendas: -3900, despesasAdm: -1340 },
  resultadoFinanceiro: -110,
  irCs: -210,
});

const VAREJO_DRE25 = buildDRE({
  receitaLiquida: 16200,
  cmv: -9480,
  despesas: { despesasVendas: -4300, despesasAdm: -1460 },
  resultadoFinanceiro: -190,
  irCs: -230,
});

// ---------------------------------------------------------------------------------------------
// Dados — Caso 2: Mecânica Pesada Araguaia S.A. (bens de capital)
//
// Indicadores (calculados a partir dos números abaixo):
//                      2024        2025
//  Receita líquida    9.600      10.400   (A.H. +8,3%)
//  Ativo total       24.000      25.500   (A.H. +6,3%; imobilizado 53,8% → 54,5% do ativo)
//  AC / PC → LC   8.200/5.200  8.540/5.500
//  LC                 1,58        1,55
//  Margem bruta      40,0%       36,0%   (CPV +15,6% > receita +8,3%)
//  Margem operac.    25,2%       21,3%
//  Margem líquida    13,0%        9,4%   (resultado financeiro −640 → −820, +28,1%)
//  ROE               10,7%        8,1%
//  Giro               0,40        0,41
//  Alavancagem        2,05        2,10
//  DuPont 2024: 13,02% × 0,40 × 2,05 = 10,7%  ·  2025: 9,42% × 0,41 × 2,10 = 8,1%
//  Leitura: ROE caiu porque a margem caiu (CPV cresceu mais que a receita), apesar de giro e alavancagem subirem.
// ---------------------------------------------------------------------------------------------

const INDUSTRIA_BP24 = buildBP({
  ac: { caixa: 1650, aplicacoes: 900, contasReceber: 2400, estoques: 2700, tributosRecuperar: 380, outrosAC: 170 },
  anc: { realizavelLP: 620, irDiferido: 480, investimentos: 350, imobilizado: 12900, intangivel: 1450 },
  pc: { emprestimos: 1350, fornecedores: 1420, adiantamentosClientes: 760, fiscais: 420, trabalhistas: 530, dividendos: 380, outrasPC: 340 },
  pnc: { emprestimosLP: 4700, debentures: 1600, provisoesLP: 450, irDiferidoLP: 350 },
  pl: { capital: 8000, reservas: 3700 },
});

const INDUSTRIA_BP25 = buildBP({
  ac: { caixa: 1380, aplicacoes: 820, contasReceber: 2690, estoques: 3050, tributosRecuperar: 410, outrosAC: 190 },
  anc: { realizavelLP: 650, irDiferido: 520, investimentos: 350, imobilizado: 13900, intangivel: 1540 },
  pc: { emprestimos: 1520, fornecedores: 1560, adiantamentosClientes: 700, fiscais: 400, trabalhistas: 570, dividendos: 300, outrasPC: 450 },
  pnc: { emprestimosLP: 5400, debentures: 1600, provisoesLP: 480, irDiferidoLP: 380 },
  pl: { capital: 8000, reservas: 4140 },
});

const INDUSTRIA_DRE24 = buildDRE({
  receitaLiquida: 9600,
  cmv: -5760,
  despesas: { despesasVendas: -640, despesasAdm: -780 },
  resultadoFinanceiro: -640,
  irCs: -530,
});

const INDUSTRIA_DRE25 = buildDRE({
  receitaLiquida: 10400,
  cmv: -6660,
  despesas: { despesasVendas: -690, despesasAdm: -830 },
  resultadoFinanceiro: -820,
  irCs: -420,
});

// ---------------------------------------------------------------------------------------------
// Formatação e tabelas no formato do anexo (Conta | 2025 | A.V.% 25 | 2024 | A.V.% 24 | A.H.%)

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const dec = (v: number, d = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v: number, d = 1) => `${dec(v, d)}%`;
const avNum = (v: number, base: number) => (v / base) * 100;
const ahNum = (a: number, b: number) => (Math.abs(a) / Math.abs(b) - 1) * 100;
const ahStr = (a: number, b: number) =>
  b === 0 ? '—' : a !== 0 && Math.sign(a) !== Math.sign(b) ? 'n.m.' : pct(ahNum(a, b));

function annexTable(caption: string, note: string, a: Lines, b: Lines, baseKey: string, rows: [string, string][], totals: string[]): DataTable {
  return {
    caption,
    note,
    headers: ['Conta', '2025', 'A.V.% 25', '2024', 'A.V.% 24', 'A.H.%'],
    rows: rows.map(([label, k]) => [label, fmt(a[k]), pct(avNum(a[k], a[baseKey])), fmt(b[k]), pct(avNum(b[k], b[baseKey])), ahStr(a[k], b[k])]),
    totalRows: rows.map(([label], i) => (totals.includes(label) ? i : -1)).filter((i) => i >= 0),
  };
}

interface Caso {
  tag: string;
  nome: string;
  setor: string;
  bp25: Lines;
  bp24: Lines;
  dre25: Lines;
  dre24: Lines;
  ativoRows: [string, string][];
  passivoRows: [string, string][];
  dreRows: [string, string][];
}

const NOTE = (nome: string) =>
  `CASO FICTÍCIO — ${nome}. Valores em R$ milhões. A.V. = conta ÷ total; A.H. = |2025| ÷ |2024| − 1 (n.m. = não significativo, sinal mudou).`;

function annex(c: Caso): DataTable[] {
  const note = NOTE(c.nome);
  return [
    annexTable(`${c.nome} — ATIVO 31/12`, note, c.bp25, c.bp24, 'ativoTotal', c.ativoRows, ['ATIVO TOTAL', 'ATIVO CIRCULANTE', 'ATIVO NÃO CIRCULANTE']),
    annexTable(`${c.nome} — PASSIVO + PL 31/12`, note, c.bp25, c.bp24, 'ativoTotal', c.passivoRows, [
      'PASSIVO TOTAL + PL',
      'PASSIVO CIRCULANTE',
      'PASSIVO NÃO CIRCULANTE',
      'PATRIMÔNIO LÍQUIDO',
    ]),
    annexTable(`${c.nome} — DRE 2025 × 2024`, note, c.dre25, c.dre24, 'receitaLiquida', c.dreRows, [
      'Receita líquida de vendas',
      '= Lucro Bruto',
      '= Lucro Operacional',
      '= Lucro antes do IR/CS',
      '= Lucro Líquido do exercício',
    ]),
  ];
}

function balanceCheck(c: Caso) {
  return [
    { label: `${c.nome} 31/12/2024`, ativo: c.bp24.ativoTotal, passivo: c.bp24.passivoTotal, pl: c.bp24.patrimonioLiquido },
    { label: `${c.nome} 31/12/2025`, ativo: c.bp25.ativoTotal, passivo: c.bp25.passivoTotal, pl: c.bp25.patrimonioLiquido },
  ];
}

const VAREJO: Caso = {
  tag: 'rot-varejo',
  nome: 'Lojas Primavera S.A.',
  setor: 'rede de varejo de vestuário',
  bp25: VAREJO_BP25,
  bp24: VAREJO_BP24,
  dre25: VAREJO_DRE25,
  dre24: VAREJO_DRE24,
  ativoRows: [
    ['ATIVO TOTAL', 'ativoTotal'],
    ['ATIVO CIRCULANTE', 'ativoCirculante'],
    ['  Caixa e equivalentes de caixa', 'caixa'],
    ['  Aplicações financeiras', 'aplicacoes'],
    ['  Contas a receber de clientes', 'contasReceber'],
    ['  Estoques', 'estoques'],
    ['  Tributos a recuperar', 'tributosRecuperar'],
    ['  Outros ativos', 'outrosAC'],
    ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'],
    ['  Tributos a recuperar (LP)', 'tributosLP'],
    ['  IR e CS diferidos', 'irDiferido'],
    ['  Investimentos', 'investimentos'],
    ['  Imobilizado', 'imobilizado'],
    ['  Direito de uso (lojas alugadas)', 'direitoUso'],
    ['  Intangível', 'intangivel'],
  ],
  passivoRows: [
    ['PASSIVO TOTAL + PL', 'ativoTotal'],
    ['PASSIVO CIRCULANTE', 'passivoCirculante'],
    ['  Empréstimos e financiamentos', 'emprestimos'],
    ['  Arrendamentos a pagar', 'arrendamentos'],
    ['  Fornecedores', 'fornecedores'],
    ['  Obrigações com administradoras de cartões', 'cartoes'],
    ['  Obrigações fiscais', 'fiscais'],
    ['  Obrigações sociais e trabalhistas', 'trabalhistas'],
    ['  Dividendos a pagar', 'dividendos'],
    ['  Outras obrigações', 'outrasPC'],
    ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'],
    ['  Empréstimos e financiamentos (LP)', 'emprestimosLP'],
    ['  Arrendamentos a pagar (LP)', 'arrendamentosLP'],
    ['  Provisões e outras obrigações (LP)', 'provisoesLP'],
    ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido'],
    ['  Capital social', 'capital'],
    ['  Reservas de lucros', 'reservas'],
  ],
  dreRows: [
    ['Receita líquida de vendas', 'receitaLiquida'],
    ['(−) Custo das mercadorias vendidas (CMV)', 'cmv'],
    ['= Lucro Bruto', 'lucroBruto'],
    ['(−) Despesas com vendas', 'despesasVendas'],
    ['(−) Despesas gerais e administrativas', 'despesasAdm'],
    ['= Lucro Operacional', 'lucroOperacional'],
    ['(+/−) Resultado financeiro', 'resultadoFinanceiro'],
    ['= Lucro antes do IR/CS', 'lair'],
    ['(−) IR e contribuição social', 'irCs'],
    ['= Lucro Líquido do exercício', 'lucroLiquido'],
  ],
};

const INDUSTRIA: Caso = {
  tag: 'rot-industria',
  nome: 'Mecânica Pesada Araguaia S.A.',
  setor: 'indústria de bens de capital — máquinas e equipamentos industriais',
  bp25: INDUSTRIA_BP25,
  bp24: INDUSTRIA_BP24,
  dre25: INDUSTRIA_DRE25,
  dre24: INDUSTRIA_DRE24,
  ativoRows: [
    ['ATIVO TOTAL', 'ativoTotal'],
    ['ATIVO CIRCULANTE', 'ativoCirculante'],
    ['  Caixa e equivalentes de caixa', 'caixa'],
    ['  Aplicações financeiras', 'aplicacoes'],
    ['  Contas a receber de clientes', 'contasReceber'],
    ['  Estoques (matéria-prima e produtos em elaboração)', 'estoques'],
    ['  Tributos a recuperar', 'tributosRecuperar'],
    ['  Outros ativos', 'outrosAC'],
    ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'],
    ['  Realizável a longo prazo (depósitos judiciais e tributos)', 'realizavelLP'],
    ['  IR e CS diferidos', 'irDiferido'],
    ['  Investimentos', 'investimentos'],
    ['  Imobilizado (fábricas, máquinas e equipamentos)', 'imobilizado'],
    ['  Intangível', 'intangivel'],
  ],
  passivoRows: [
    ['PASSIVO TOTAL + PL', 'ativoTotal'],
    ['PASSIVO CIRCULANTE', 'passivoCirculante'],
    ['  Empréstimos e financiamentos', 'emprestimos'],
    ['  Fornecedores', 'fornecedores'],
    ['  Adiantamentos de clientes', 'adiantamentosClientes'],
    ['  Obrigações fiscais', 'fiscais'],
    ['  Obrigações sociais e trabalhistas', 'trabalhistas'],
    ['  Dividendos a pagar', 'dividendos'],
    ['  Outras obrigações', 'outrasPC'],
    ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'],
    ['  Empréstimos e financiamentos (LP)', 'emprestimosLP'],
    ['  Debêntures (LP)', 'debentures'],
    ['  Provisões para riscos (LP)', 'provisoesLP'],
    ['  IR e CS diferidos (LP)', 'irDiferidoLP'],
    ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido'],
    ['  Capital social', 'capital'],
    ['  Reservas de lucros', 'reservas'],
  ],
  dreRows: [
    ['Receita líquida de vendas', 'receitaLiquida'],
    ['(−) Custo dos produtos vendidos (CPV)', 'cmv'],
    ['= Lucro Bruto', 'lucroBruto'],
    ['(−) Despesas com vendas', 'despesasVendas'],
    ['(−) Despesas gerais e administrativas', 'despesasAdm'],
    ['= Lucro Operacional', 'lucroOperacional'],
    ['(+/−) Resultado financeiro', 'resultadoFinanceiro'],
    ['= Lucro antes do IR/CS', 'lair'],
    ['(−) IR e contribuição social', 'irCs'],
    ['= Lucro Líquido do exercício', 'lucroLiquido'],
  ],
};

// ---------------------------------------------------------------------------------------------
// Indicadores (usados nos enunciados, rubricas e respostas-modelo)

function indicadores(bp: Lines, dre: Lines) {
  const mb = avNum(dre.lucroBruto, dre.receitaLiquida);
  const mo = avNum(dre.lucroOperacional, dre.receitaLiquida);
  const ml = avNum(dre.lucroLiquido, dre.receitaLiquida);
  const lc = bp.ativoCirculante / bp.passivoCirculante;
  const roe = (dre.lucroLiquido / bp.patrimonioLiquido) * 100;
  const giro = dre.receitaLiquida / bp.ativoTotal;
  const alav = bp.ativoTotal / bp.patrimonioLiquido;
  return { mb, mo, ml, lc, roe, giro, alav };
}

export const IND = {
  varejo: { 2024: indicadores(VAREJO_BP24, VAREJO_DRE24), 2025: indicadores(VAREJO_BP25, VAREJO_DRE25) },
  industria: { 2024: indicadores(INDUSTRIA_BP24, INDUSTRIA_DRE24), 2025: indicadores(INDUSTRIA_BP25, INDUSTRIA_DRE25) },
};

export const CASOS = { VAREJO, INDUSTRIA };

const VI24 = IND.varejo[2024];
const VI25 = IND.varejo[2025];
const II24 = IND.industria[2024];
const II25 = IND.industria[2025];

// ---------------------------------------------------------------------------------------------
// Helpers de rubrica: cada número gera variantes com vírgula e ponto (comparação por substring).

type Num = number | [number, number];
function K(term: string | string[], ...nums: Num[]): string[][] {
  const t = Array.isArray(term) ? term : [term];
  const out: string[][] = [];
  for (const n of nums) {
    const [v, d] = Array.isArray(n) ? n : [n, 1];
    const c = dec(Math.abs(v), d);
    out.push([...t, c], [...t, c.replace(',', '.')]);
  }
  return out;
}
/** Valores em R$ milhões: aceita "16.200" e "16200". */
function KV(term: string | string[], ...vals: number[]): string[][] {
  const t = Array.isArray(term) ? term : [term];
  const out: string[][] = [];
  for (const v of vals) out.push([...t, fmt(Math.abs(v))], [...t, String(Math.abs(Math.round(v)))]);
  return out;
}

const CTX = (c: Caso) =>
  `CASO FICTÍCIO PARA ESTUDO — ${c.nome} (${c.setor}). Roteiro de análise em 3 partes (formato da prova). Responda citando sempre os números; resposta sem número vale no máximo metade.`;

const SRC_ROTEIRO = 'Aula 5 — Roteiro de análise em 3 partes, o formato da prova (resumo da P1)';
const SRC_AVAH = 'Aulas 4 e 5 — A.V. e A.H. do Balanço e da DRE (resumo da P1)';
const SRC_MARGENS = 'Aulas 4 e 5 — Margens bruta, operacional e líquida (resumo da P1)';
const SRC_LC = 'Aula 5 — Liquidez Corrente e descasamento de prazos (resumo da P1)';
const SRC_ROE = 'Aula 5 — ROE e DuPont: margem, giro e alavancagem (resumo da P1)';
const SRC_ESTR = 'Aula 5 — Parte 3 do roteiro: estratégia, riscos e ações (resumo da P1)';

interface EssaySpec {
  id: string;
  topic: Question['topic'];
  subtopic: string;
  skill: string;
  part: 1 | 2 | 3;
  order: number;
  difficulty: 'medium' | 'hard';
  level: 'interpretation' | 'analysis';
  stem: string;
  rubric: Rubric;
  explanation: string;
  reasoningSteps: string[];
  commonMistake: string;
  rule: string;
  formula?: string;
  hint: string;
  concept: string;
  source: string;
}

function roteiroEssay(c: Caso, s: EssaySpec): Question {
  return {
    id: s.id,
    type: 'essay',
    topic: s.topic,
    subtopic: s.subtopic,
    skill: s.skill,
    caseTag: c.tag,
    roteiro: { case: c.tag, part: s.part, order: s.order },
    dataSource: 'ficticio',
    difficulty: s.difficulty,
    cognitiveLevel: s.level,
    context: CTX(c),
    stem: s.stem,
    tables: annex(c),
    rubric: { ...s.rubric, requireNumbers: true },
    explanation: s.explanation,
    reasoningSteps: s.reasoningSteps,
    commonMistake: s.commonMistake,
    rule: s.rule,
    formula: s.formula,
    hint: s.hint,
    concept: s.concept,
    sourceReference: s.source,
    balanceCheck: balanceCheck(c),
  };
}

// Erros graves reutilizados
const ERR_LC_INSOLVENCIA = {
  description: 'Lê Liquidez Corrente abaixo de 1 como insolvência/falência. A regra é "atenção": olhe a composição do AC e do PC e a velocidade do giro.',
  patterns: ['insolven', 'falencia', 'vai falir', 'vai quebrar', 'nao consegue pagar', 'incapaz de pagar', 'nao tem como pagar'],
  penalty: 2,
};
const ERR_MARGEM_ATIVO = {
  description: 'Calcula margem ou ROE dividindo o lucro pelo Ativo. Margem = lucro ÷ Receita líquida; ROE = Lucro Líquido ÷ PL.',
  patterns: ['lucro / ativo', 'lucro/ativo', 'lucro liquido / ativo', 'lucro liquido/ativo', 'lucro bruto / ativo', 'dividido pelo ativo', 'sobre o ativo total'],
  penalty: 2,
};
const ERR_ROE_EFICIENCIA_VAREJO = {
  description: 'Atribui a alta do ROE a "mais eficiência" quando ela veio de giro e alavancagem (dívida nova) com margem líquida caindo.',
  patterns: ['melhorou a eficiencia', 'mais eficiente', 'ganho de eficiencia', 'veio da margem', 'melhora da margem', 'margem melhorou', 'margem subiu', 'margem aumentou'],
  penalty: 2,
};
const ERR_JULGAMENTO_ABSOLUTO = {
  description: 'Julga o ROE em termos absolutos ("é ótimo", "é ruim") sem comparar com o ano anterior, o custo de capital ou os pares.',
  patterns: ['roe e otimo', 'roe e excelente', 'roe e ruim', 'roe e pessimo', 'roe esta otimo', 'retorno e otimo', 'retorno e excelente', 'roe e bom'],
  penalty: 1,
};

// ---------------------------------------------------------------------------------------------
// CASO 1 — Lojas Primavera S.A. (rot-varejo): 12 questões do roteiro

const V = VAREJO;

const VAREJO_ROTEIRO: Question[] = [
  roteiroEssay(V, {
    id: 'rotv-001',
    topic: 'av',
    subtopic: 'Parte 1 — onde a empresa investe',
    skill: 'rot-av-ativo',
    part: 1,
    order: 1,
    difficulty: 'medium',
    level: 'interpretation',
    stem: 'PARTE 1 — Decisões de investimento e financiamento (Balanço). Questão 1: Quais são as contas mais importantes do ativo da Lojas Primavera em 31/12/2025? Como a empresa distribui seus investimentos (use a A.V. do ativo) e essa distribuição faz sentido para uma rede de varejo de vestuário?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Identifica Contas a receber de clientes como a maior conta (R$ 3.090 = 27,7% do ativo).', points: 3, keywords: [...K('receb', 27.7), ...KV('receb', 3090)] },
        { id: 'c2', description: 'Cita o Imobilizado (R$ 1.970 = 17,7%) e/ou o Direito de uso das lojas (R$ 1.370 = 12,3%).', points: 2, keywords: [...K('imobiliz', 17.7), ...KV('imobiliz', 1970), ...K('direito de uso', 12.3), ...KV('direito de uso', 1370)] },
        { id: 'c3', description: 'Cita os Estoques (R$ 1.430 = 12,8%) e/ou o Caixa (R$ 930 = 8,3%).', points: 2, keywords: [...K('estoque', 12.8), ...KV('estoque', 1430), ...K('caixa', 8.3), ...KV('caixa', 930)] },
        { id: 'c4', description: 'Mostra a divisão Circulante 55,5% × Não Circulante 44,5% (ou 6.190 × 4.970).', points: 2, keywords: [...K('circulante', 55.5), ...K('circulante', 44.5), ...KV('circulante', 6190, 4970)] },
        { id: 'c5', description: 'Julga a coerência com o modelo de varejo (vendas a prazo/cartão, estoques girando, lojas) — sem julgamento absoluto.', points: 1, keywords: [['varejo'], ['faz sentido'], ['coerente'], ['giro'], ['lojas'], ['cartao'], ['crediario']] },
      ],
      seriousErrors: [
        { description: 'Aponta o Caixa como a maior conta do ativo (é 8,3%; a maior é Contas a receber, 27,7%).', patterns: ['caixa e a maior', 'caixa e a principal', 'maior conta e o caixa', 'maior conta do ativo e o caixa'], penalty: 2 },
        { description: 'Usa a Receita como base da A.V. do ativo (a base do Balanço é o Ativo Total).', patterns: ['dividido pela receita', 'sobre a receita liquida', '/ receita'], penalty: 2 },
      ],
      modelAnswer:
        'Em 31/12/2025 o ativo total da Lojas Primavera é de R$ 11.160 milhões, com 55,5% no Circulante (6.190) e 44,5% no Não Circulante (4.970). A maior conta é Contas a receber de clientes, R$ 3.090 (27,7% do ativo): o varejo de vestuário vende parcelado no cartão e no crediário. Em seguida vêm o Imobilizado, R$ 1.970 (17,7%), e o Direito de uso das lojas alugadas, R$ 1.370 (12,3%) — juntos, 30,0% do ativo são a rede de lojas. Os Estoques somam R$ 1.430 (12,8%) e o Intangível R$ 980 (8,8%). O Caixa é só R$ 930 (8,3%), e as aplicações financeiras R$ 300 (2,7%). A distribuição faz sentido para o modelo: uma rede de lojas precisa de pontos de venda (imobilizado e direito de uso), de mercadoria exposta (estoques) e de recebíveis de clientes; é um ativo de giro alto (Receita ÷ Ativo = 1,45) e margem fina, em que o dinheiro não fica parado em caixa. O ponto de atenção é a queda do caixa (13,7% do ativo em 2024 para 8,3%), que deve ser lida junto com a liquidez na Questão 4.',
    },
    explanation:
      'A Parte 1 começa pela pergunta "onde a empresa investe?": ordene as contas do ativo pela A.V. (conta ÷ Ativo Total) e confronte com a natureza do negócio. No varejo, recebíveis, estoques e lojas dominam; caixa pequeno e giro alto são típicos, não um defeito.',
    reasoningSteps: [
      'Calcule a A.V. de cada conta sobre o Ativo Total de 2025 (11.160).',
      'Ordene da maior para a menor e separe Circulante × Não Circulante.',
      'Pergunte: essas contas são as que um varejista precisa ter (lojas, mercadoria, recebíveis)?',
      'Compare com 2024 para ver o que mudou de peso (caixa caiu, imobilizado subiu).',
    ],
    commonMistake: 'Listar as contas sem o percentual ou usar a Receita como base da A.V. do Balanço.',
    rule: 'A.V. do Balanço = conta ÷ Ativo Total; cite as três ou quatro maiores com o percentual e diga se combinam com o modelo de negócio.',
    formula: 'A.V. = Conta ÷ Ativo Total × 100',
    hint: 'Comece pela maior conta do ativo e pergunte por que um varejista de roupas a tem tão grande.',
    concept: 'A análise vertical mostra a composição do ativo: onde cada R$ 100 investidos estão aplicados.',
    source: SRC_AVAH,
  }),
  roteiroEssay(V, {
    id: 'rotv-002',
    topic: 'ah',
    subtopic: 'Parte 1 — variação do ativo',
    skill: 'rot-ah-ativo',
    part: 1,
    order: 2,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 2: O ativo total da Lojas Primavera cresceu 7,9% em 2025 (de R$ 10.340 para R$ 11.160 milhões). Quais linhas explicam esse crescimento (use a A.H.)? Esse movimento é sinal de problema ou de expansão?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Cita a variação do ativo (+7,9% ou +R$ 820).', points: 2, keywords: [...K('ativo', 7.9), ...KV('ativo', 820)] },
        { id: 'c2', description: 'Atribui o crescimento ao Não Circulante (+21,8%): Imobilizado +29,6% (1.520 → 1.970) e Direito de uso +26,9% (1.080 → 1.370).', points: 3, keywords: [...K('imobiliz', 29.6), ...KV('imobiliz', 1970), ...K('direito de uso', 26.9), ...K('nao circulante', 21.8), ...KV('nao circulante', 890)] },
        { id: 'c3', description: 'Mostra a queda do Caixa (−34,5%: 1.420 → 930).', points: 2, keywords: [...K('caixa', 34.5), ...KV('caixa', 930)] },
        { id: 'c4', description: 'Cita Contas a receber (+12,4%) e/ou Estoques (+9,2%) crescendo com as vendas (+12,5%).', points: 2, keywords: [...K('receb', 12.4), ...K('estoque', 9.2), ...KV('receb', 3090), ...KV('estoque', 1430)] },
        { id: 'c5', description: 'Conclui: expansão da rede (investimento), não problema em si — com ressalva sobre o caixa consumido e a liquidez.', points: 1, keywords: [['expans'], ['abertura', 'loja'], ['novas lojas'], ['investiment', 'caixa'], ['cresciment', 'ressalva']] },
      ],
      seriousErrors: [
        { description: 'Diz que o ativo caiu ou que o caixa aumentou (leitura invertida das tabelas).', patterns: ['ativo caiu', 'ativo diminuiu', 'reducao do ativo', 'caixa aumentou', 'caixa cresceu', 'caixa subiu'], penalty: 2 },
        { description: 'Calcula a A.H. com a base invertida (2024 ÷ 2025).', patterns: ['2024 / 2025', '2024/2025', '10.340 / 11.160', '1.420 / 930'], penalty: 2 },
      ],
      modelAnswer:
        'O ativo total cresceu 7,9% (R$ 10.340 → 11.160 milhões, +820). A explicação está no Ativo Não Circulante, que subiu 21,8% (4.080 → 4.970, +890): o Imobilizado cresceu 29,6% (1.520 → 1.970) e o Direito de uso de lojas alugadas 26,9% (1.080 → 1.370) — a rede abriu/reformou lojas; o Intangível subiu 12,6% (870 → 980). O Ativo Circulante ficou praticamente estável (−1,1%: 6.260 → 6.190), mas com composição muito diferente: o Caixa caiu 34,5% (1.420 → 930) e as Aplicações 21,1% (380 → 300), enquanto Contas a receber subiram 12,4% (2.750 → 3.090) e Estoques 9,2% (1.310 → 1.430), acompanhando a receita (+12,5%). Portanto o crescimento é expansão: a empresa investiu em lojas e em capital de giro operacional e pagou parte disso com o próprio caixa. Não é um problema em si — a receita cresceu mais que o ativo e o giro subiu de 1,39 para 1,45 — mas a conta chega na liquidez: com o caixa menor e o Passivo Circulante maior, a LC caiu de 1,08 para 0,99, o que exige atenção (Questão 4).',
    },
    explanation:
      'A A.H. (|2025| ÷ |2024| − 1) diz de onde veio a variação do total. Aqui o ativo cresceu por lojas (imobilizado e direito de uso) e por recebíveis e estoques, enquanto o caixa financiou parte do movimento. Expansão não é problema por definição; o julgamento depende de como foi financiada e do retorno que gera.',
    reasoningSteps: [
      'Confirme a variação do total (+7,9%) e separe AC × ANC.',
      'Dentro de cada grupo, localize as linhas com maior A.H. e maior valor absoluto.',
      'Ligue cada linha a um fato do negócio (lojas novas, vendas maiores, caixa consumido).',
      'Julgue: investimento produtivo ou inchaço? Compare com o crescimento da receita (+12,5%).',
    ],
    commonMistake: 'Explicar a variação do total só pelo caixa (que caiu) ou confundir A.H. com variação de A.V. em pontos percentuais.',
    rule: 'Para explicar a variação do Ativo Total, decomponha pela A.H. das linhas e compare o crescimento do ativo com o da receita.',
    formula: 'A.H. = |2025| ÷ |2024| − 1',
    hint: 'Olhe primeiro o Não Circulante: qual linha cresceu quase 30%?',
    concept: 'A análise horizontal mede o crescimento de cada linha entre dois balanços e revela a origem da variação do total.',
    source: SRC_AVAH,
  }),
  roteiroEssay(V, {
    id: 'rotv-003',
    topic: 'alavancagem',
    subtopic: 'Parte 1 — quem financia',
    skill: 'rot-estrutura-capital',
    part: 1,
    order: 3,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 3: Quem financia a Lojas Primavera — terceiros ou os próprios sócios — e em que proporção (A.V. do Passivo + PL de 2025, comparando com 2024)? Quem é o maior financiador? Essa estrutura de capital é "de graça" ou cara, e o que ela significa em risco e retorno?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Terceiros 69,0% × PL 31,0% em 2025 (66,9% × 33,1% em 2024).', points: 3, keywords: [...K('terceiro', 69.0), ...K('pl', 31.0), ...K('proprio', 31.0), ...K('patrimonio', 31.0)] },
        { id: 'c2', description: 'Passivo Circulante é 56,1% do total (R$ 6.260) — financiamento de curto prazo.', points: 2, keywords: [...K('circulante', 56.1), ...KV('circulante', 6260)] },
        { id: 'c3', description: 'Maiores financiadores operacionais: administradoras de cartões 21,1% (2.350) e fornecedores 16,7% (1.860) — dívida "de graça".', points: 2, keywords: [...K('cart', 21.1), ...KV('cart', 2350), ...K('fornecedor', 16.7), ...KV('fornecedor', 1860)] },
        { id: 'c4', description: 'Dívida bancária subiu de R$ 380 para R$ 820 (4,3% + 3,0% do total) e a alavancagem de 3,02 para 3,23.', points: 2, keywords: [...K('alavanc', [3.23, 2], [3.02, 2], 3.2, 3.0), ...KV(['emprest'], 820, 480, 340), ...KV(['divida'], 820)] },
        { id: 'c5', description: 'Risco × retorno: alavancagem amplia o ROE enquanto a operação rende mais que o custo do dinheiro e amplia o prejuízo se vender menos.', points: 1, keywords: [['dois gumes'], ['amplia'], ['multiplica'], ['risco', 'retorno'], ['custo da divida'], ['custo do dinheiro']] },
      ],
      seriousErrors: [
        { description: 'Afirma que o capital próprio é a principal fonte de financiamento (é 31,0%; terceiros financiam 69,0%).', patterns: ['principalmente pelos socios', 'principalmente por capital proprio', 'capital proprio e a principal', 'maior parte e capital proprio', 'financiada pelos socios'], penalty: 2 },
        { description: 'Diz que a alavancagem caiu ou ficou estável (subiu de 3,02 para 3,23).', patterns: ['alavancagem caiu', 'alavancagem diminuiu', 'alavancagem ficou estavel', 'alavancagem estavel'], penalty: 2 },
      ],
      modelAnswer:
        'Em 2025, de cada R$ 100 de ativo, R$ 69,0 são financiados por terceiros (Passivo Circulante 56,1% + Não Circulante 12,9%) e R$ 31,0 pelos sócios (PL de R$ 3.460). Em 2024 eram 66,9% × 33,1%: a participação de terceiros aumentou, e a Alavancagem (Ativo ÷ PL) subiu de 3,02 para 3,23. O maior financiador individual é operacional: as obrigações com administradoras de cartões (R$ 2.350 = 21,1%) e os fornecedores (R$ 1.860 = 16,7%) somam 37,8% do total — dívida sem juros explícitos, típica do varejo, que paga o fornecedor depois de vender. Os arrendamentos das lojas (450 + 960 = 12,6%) também são financiamento. A dívida bancária era pequena, mas mais que dobrou: R$ 380 (260 + 120) em 2024 para R$ 820 (480 + 340) em 2025, 7,3% do total — e essa é cara: o resultado financeiro piorou de −110 para −190. Em risco e retorno: a estrutura é barata e sustenta um ROE de 15,6% com margem líquida de apenas 3,3%, mas é curta (56,1% vence em 12 meses) e depende de continuar vendendo para pagar cartões e fornecedores; a alavancagem de 3,23 multiplica tanto o lucro quanto o prejuízo se as vendas caírem. A leitura é comparativa: terceiros financiam mais que em 2024 e mais do que o PL — o acionista ganha retorno, mas com mais risco.',
    },
    explanation:
      'A estrutura de capital responde "quem financia?" pela A.V. do lado direito. No varejo, fornecedores e cartões financiam grande parte do ativo sem juros — o que é bom para o retorno, mas concentra as obrigações no curto prazo. A Alavancagem (Ativo ÷ PL) resume a proporção e deve ser lida como faca de dois gumes.',
    reasoningSteps: [
      'Some PC + PNC (terceiros) e compare com o PL, em A.V. do total.',
      'Identifique as maiores linhas do passivo e classifique: operacional (fornecedores, cartões) × financeira (bancos).',
      'Compare 2025 com 2024 (o que cresceu: dívida bancária +115,8%).',
      'Calcule a alavancagem dos dois anos e conclua sobre risco e retorno.',
    ],
    commonMistake: 'Somar só a dívida bancária como "terceiros" e esquecer que fornecedores, cartões, salários e impostos também são passivo.',
    rule: 'Terceiros = Passivo Circulante + Não Circulante; sócios = PL. Diga a proporção, quem é o maior financiador e se essa dívida tem custo.',
    formula: 'Alavancagem = Ativo Total ÷ PL',
    hint: 'Qual linha do passivo é maior: cartões, fornecedores ou bancos? E qual cresceu mais?',
    concept: 'A estrutura de capital mostra a proporção entre capital de terceiros e capital próprio e o prazo e custo de cada fonte.',
    source: SRC_ROTEIRO,
  }),
  roteiroEssay(V, {
    id: 'rotv-004',
    topic: 'liquidez',
    subtopic: 'Parte 1 — financiamento do crescimento e prazos',
    skill: 'rot-financiamento-prazos',
    part: 1,
    order: 4,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 4: Como o crescimento do ativo (+R$ 820 milhões) foi financiado pelo lado direito do Balanço (variação do PC, do PNC e do PL)? Há descasamento de prazos entre o que a empresa investiu e como financiou? Use a Liquidez Corrente de 2024 e 2025 e comente sua composição.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Calcula a LC dos dois anos: 1,08 (6.260 ÷ 5.790) → 0,99 (6.190 ÷ 6.260).', points: 3, keywords: [...K('liquidez', [0.99, 2], [1.08, 2]), ...K('lc', [0.99, 2], [1.08, 2]), ...K('corrente', [0.99, 2])] },
        { id: 'c2', description: 'Mostra que o PC cresceu R$ 470 (+8,1%: 5.790 → 6.260), com empréstimos de curto prazo +84,6% (260 → 480).', points: 2, keywords: [...KV('circulante', 470, 6260), ...K('circulante', 8.1), ...KV('emprest', 480), ...K('emprest', 84.6)] },
        { id: 'c3', description: 'Mostra o PNC +R$ 310 (+27,4%), com empréstimos LP de 120 para 340.', points: 2, keywords: [...KV('nao circulante', 310, 1440), ...K('nao circulante', 27.4), ...KV('longo prazo', 340), ...K('longo prazo', 183.3)] },
        { id: 'c4', description: 'PL praticamente estável (+R$ 40, +1,2%: 3.420 → 3.460) — o lucro foi distribuído.', points: 2, keywords: [...KV(['pl'], 40, 3460), ...K(['pl'], 1.2), ...KV('patrimonio', 40, 3460), ...K('patrimonio', 1.2)] },
        { id: 'c5', description: 'Conclui sobre o descasamento (ativo de longo prazo financiado em boa parte por curto prazo) com a ressalva: LC 0,99 é atenção, não insolvência — ver composição (cartões/fornecedores) e giro.', points: 1, keywords: [['descas'], ['atencao'], ['curto prazo', 'longo prazo'], ['composicao'], ['nao e insolv'], ['nao significa']] },
      ],
      seriousErrors: [
        ERR_LC_INSOLVENCIA,
        { description: 'Calcula a LC com o Ativo Total ou o Passivo Total (é AC ÷ PC).', patterns: ['ativo total / passivo', 'ativo total/passivo', '11.160 / 6.260', '11.160 / 7.700', 'ativo / passivo total'], penalty: 2 },
      ],
      modelAnswer:
        'O ativo cresceu R$ 820 milhões, e quase tudo foi investimento de longo prazo: o Não Circulante subiu R$ 890 (imobilizado +450, direito de uso +290, intangível +110), enquanto o Circulante caiu R$ 70 (o caixa financiou parte das lojas). Do lado direito, o crescimento foi pago assim: Passivo Circulante +R$ 470 (5.790 → 6.260, +8,1%), com empréstimos de curto prazo saltando 84,6% (260 → 480), cartões +50 e fornecedores +170; Passivo Não Circulante +R$ 310 (1.130 → 1.440, +27,4%), com empréstimos de longo prazo de 120 para 340 (+183,3%) e arrendamentos de 880 para 960; e PL apenas +R$ 40 (3.420 → 3.460, +1,2%), porque o lucro de 540 foi quase todo distribuído (reservas +40; dividendos a pagar 110). Há descasamento: R$ 890 de ativos de longo prazo foram financiados com R$ 470 de curto prazo, R$ 310 de longo prazo e R$ 40 de capital próprio, além do caixa. O efeito aparece na Liquidez Corrente: 6.260 ÷ 5.790 = 1,08 em 2024 (folga pequena) para 6.190 ÷ 6.260 = 0,99 em 2025 (no limite/atenção). Mas não se lê o número sozinho: 67% do PC são cartões (2.350) e fornecedores (1.860), que se renovam a cada venda, e o AC tem 3.090 de recebíveis que viram caixa rápido — o varejo convive com LC perto de 1. O sinal de alerta é a combinação caixa −34,5% + dívida bancária de curto prazo 480 + PL estável: se as vendas desacelerarem, a empresa dependerá de rolar dívida. Ações: alongar os 480 de curto prazo, segurar o ritmo de abertura de lojas ou reter mais lucro.',
    },
    explanation:
      'Expansão de longo prazo deve ser financiada por fontes de longo prazo (PNC ou PL). Quando o crescimento do ativo não circulante é pago com passivo circulante e caixa, a Liquidez Corrente cai — e é isso que a Questão 4 pede para enxergar. LC abaixo de 1 é "atenção", não sentença: depende da composição e do giro.',
    reasoningSteps: [
      'Calcule a variação de PC, PNC e PL e some: deve dar a variação do ativo (+820).',
      'Compare com a variação de AC e ANC: longo prazo financiado por curto prazo?',
      'Calcule a LC dos dois anos (AC ÷ PC) e veja o que mudou no numerador e no denominador.',
      'Julgue pela regra de bolso (> 1 folga, = 1 limite, < 1 atenção) e pela composição (cartões e fornecedores × bancos).',
    ],
    commonMistake: 'Concluir "LC < 1, a empresa não paga suas contas" sem olhar a composição do PC e a velocidade do giro.',
    rule: 'Descasamento = ativo de longo prazo financiado por passivo de curto prazo; confirme pela LC e pela composição do PC antes de julgar.',
    formula: 'LC = Ativo Circulante ÷ Passivo Circulante',
    hint: 'Some as variações de PC, PNC e PL: tem que dar +820. Qual delas é maior?',
    concept: 'A Liquidez Corrente compara recursos de curto prazo com obrigações de curto prazo; sua variação revela se o financiamento acompanhou o prazo dos investimentos.',
    source: SRC_LC,
  }),
  roteiroEssay(V, {
    id: 'rotv-005',
    topic: 'margens',
    subtopic: 'Parte 2 — margem bruta',
    skill: 'rot-margem-bruta',
    part: 2,
    order: 5,
    difficulty: 'medium',
    level: 'interpretation',
    stem: 'PARTE 2 — Resultados (DRE). Questão 5: Calcule e compare a margem bruta da Lojas Primavera em 2024 e 2025. O que a A.H. da receita e do CMV explica sobre essa variação? O produto continua rentável?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem bruta 2025 = 6.720 ÷ 16.200 = 41,5%.', points: 3, keywords: [...K('bruta', 41.5), ...K('bruta', 41.48)] },
        { id: 'c2', description: 'Margem bruta 2024 = 6.050 ÷ 14.400 = 42,0%.', points: 2, keywords: [...K('bruta', 42.0), ...K('2024', 42.0)] },
        { id: 'c3', description: 'Explica pela A.H.: CMV +13,5% (8.350 → 9.480) cresceu mais que a receita +12,5% (14.400 → 16.200).', points: 3, keywords: [...K('cmv', 13.5), ...K('custo', 13.5), ...K('receita', 12.5), ...KV('cmv', 9480), ...KV('custo', 9480)] },
        { id: 'c4', description: 'Conclui de forma comparativa: queda de 0,5 p.p., produto continua rentável (R$ 41,50 de cada R$ 100), mas o custo cresceu mais rápido que a venda.', points: 2, keywords: [['0,5'], ['0.5'], ['p.p.'], ['ponto percentual'], ['mais rapido'], ['mais depressa'], ['cresceu mais que a receita'], ['continua rentavel']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Diz que a margem bruta melhorou (caiu de 42,0% para 41,5%).', patterns: ['margem bruta melhorou', 'margem bruta subiu', 'margem bruta aumentou', 'margem bruta cresceu'], penalty: 2 },
      ],
      modelAnswer:
        'Margem bruta = Lucro Bruto ÷ Receita líquida. Em 2024: 6.050 ÷ 14.400 = 42,0%; em 2025: 6.720 ÷ 16.200 = 41,5% — queda de 0,5 ponto percentual. Em valor, o lucro bruto cresceu 11,1% (6.050 → 6.720), mas a receita cresceu 12,5% (14.400 → 16.200) e o CMV cresceu 13,5% (8.350 → 9.480): a linha de baixo cresceu mais rápido que a receita, e por isso a margem piorou (a A.V. do CMV subiu de 58,0% para 58,5%). Isso indica custo de mercadoria subindo acima do preço de venda — pressão de fornecedores, mix mais barato ou promoções para girar estoque. O produto continua rentável: de cada R$ 100 vendidos sobram R$ 41,50 depois do custo, nível comparável ao do ano anterior; a conclusão é "atenção à tendência", não "problema": se o CMV seguir crescendo 1 p.p. acima da receita, a margem fina da empresa (líquida de 3,3%) não absorve. Para julgar o nível, compare com pares do varejo de vestuário.',
    },
    explanation:
      'A margem bruta responde "o produto é rentável?". A regra de leitura: a margem melhora quando a linha de baixo (CMV) cresce mais devagar que a receita e piora quando cresce mais rápido — exatamente o caso (CMV +13,5% × receita +12,5%). Sempre cite os dois anos e a variação em p.p.',
    reasoningSteps: [
      'Calcule LB ÷ Receita para cada ano.',
      'Compare as A.H. da receita e do CMV: qual cresceu mais?',
      'Expresse a variação da margem em pontos percentuais.',
      'Julgue comparando com o ano anterior e com o setor, não em termos absolutos.',
    ],
    commonMistake: 'Olhar só o lucro bruto em reais (que cresceu) e concluir que a margem melhorou.',
    rule: 'Margem piora quando a linha de baixo cresce mais rápido que a receita — confira sempre as duas A.H.',
    formula: 'Margem Bruta = Lucro Bruto ÷ Receita Líquida × 100',
    hint: 'O lucro bruto cresceu, mas cresceu mais ou menos que a receita?',
    concept: 'A margem bruta mede quanto sobra de cada R$ 100 de receita depois do custo da mercadoria vendida.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(V, {
    id: 'rotv-006',
    topic: 'margens',
    subtopic: 'Parte 2 — margem operacional',
    skill: 'rot-margem-operacional',
    part: 2,
    order: 6,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 6: Calcule a margem operacional de 2024 e 2025. De onde veio a variação — do lucro bruto ou das despesas operacionais? Use a A.V. e a A.H. das despesas com vendas e administrativas para justificar.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem operacional 2025 = 960 ÷ 16.200 = 5,9%.', points: 3, keywords: [...K('operacional', 5.9), ...K('operacional', 5.93)] },
        { id: 'c2', description: 'Margem operacional 2024 = 810 ÷ 14.400 = 5,6%.', points: 2, keywords: [...K('operacional', 5.6), ...K('operacional', 5.63)] },
        { id: 'c3', description: 'Despesas cresceram menos que a receita: vendas +10,3% (A.V. 27,1% → 26,5%) e administrativas +9,0% (9,3% → 9,0%).', points: 2, keywords: [...K('vendas', 10.3), ...K('vendas', 26.5), ...K('administrativ', 9.0), ...K('administrativ', 9.0), ...KV('vendas', 4300), ...KV('administrativ', 1460)] },
        { id: 'c4', description: 'Lucro operacional +18,5% (810 → 960), mais que a receita (+12,5%).', points: 2, keywords: [...K('operacional', 18.5), ...KV('operacional', 960, 810)] },
        { id: 'c5', description: 'Conclui: a melhora veio da diluição das despesas (escala), apesar da margem bruta menor; margem continua fina — comparar com pares.', points: 1, keywords: [['dilui'], ['escala'], ['mais devagar'], ['menos que a receita'], ['cresceram menos'], ['apesar da margem bruta']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Diz que a margem operacional caiu (subiu de 5,6% para 5,9%).', patterns: ['margem operacional caiu', 'margem operacional piorou', 'margem operacional diminuiu', 'margem operacional reduziu'], penalty: 2 },
      ],
      modelAnswer:
        'Margem operacional = Lucro Operacional ÷ Receita. 2024: 810 ÷ 14.400 = 5,6%; 2025: 960 ÷ 16.200 = 5,9% — melhora de 0,3 p.p. O lucro operacional cresceu 18,5% (810 → 960), bem mais que a receita (+12,5%). A melhora NÃO veio do lucro bruto, cuja margem caiu de 42,0% para 41,5%; veio das despesas operacionais, que cresceram mais devagar que as vendas: despesas com vendas +10,3% (3.900 → 4.300), caindo de 27,1% para 26,5% da receita, e despesas administrativas +9,0% (1.340 → 1.460), de 9,3% para 9,0%. Em conjunto, as despesas operacionais passaram de 36,4% para 35,6% da receita: a estrutura (lojas, equipe, escritório) foi diluída por um volume maior — ganho de escala típico de varejo que abre lojas e vende mais. A operação "para em pé" com folga um pouco maior, mas a margem continua fina: R$ 5,90 de cada R$ 100 — qualquer recuo de 1 p.p. no CMV ou nas despesas com vendas a anula. O julgamento deve ser comparado com o ano anterior (melhorou) e com os pares do setor.',
    },
    explanation:
      'A margem operacional responde "a operação para em pé?". Para saber de onde veio a variação, compare a A.H. de cada degrau: aqui o lucro bruto cresceu 11,1% (menos que a receita) e as despesas 9,9% (menos ainda), logo a melhora é diluição de despesas, não ganho de margem bruta.',
    reasoningSteps: [
      'Calcule LO ÷ Receita nos dois anos.',
      'Veja a A.H. do LO contra a da receita.',
      'Compare a A.H. de cada despesa com a da receita: cresceu mais devagar = diluiu.',
      'Separe o efeito margem bruta (negativo) do efeito despesas (positivo) e conclua.',
    ],
    commonMistake: 'Atribuir a melhora da margem operacional ao lucro bruto, sem checar que a margem bruta caiu.',
    rule: 'Variação de margem operacional = efeito da margem bruta + efeito das despesas; confira a A.H. de cada um contra a receita.',
    formula: 'Margem Operacional = Lucro Operacional ÷ Receita Líquida × 100',
    hint: 'A margem bruta caiu e a operacional subiu: o que ficou entre as duas?',
    concept: 'Despesas operacionais são o custo de manter a estrutura e vender; quando crescem menos que a receita, a margem operacional melhora.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(V, {
    id: 'rotv-007',
    topic: 'margens',
    subtopic: 'Parte 2 — margem líquida, financeiro e IR',
    skill: 'rot-margem-liquida',
    part: 2,
    order: 7,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 7: Calcule a margem líquida de 2024 e 2025. Qual foi o papel do resultado financeiro e do IR/CS na passagem do lucro operacional ao lucro líquido? Por que a margem líquida caiu se a margem operacional subiu?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem líquida 2025 = 540 ÷ 16.200 = 3,3%.', points: 3, keywords: [...K('liquida', 3.3), ...K('liquida', 3.33)] },
        { id: 'c2', description: 'Margem líquida 2024 = 490 ÷ 14.400 = 3,4%.', points: 2, keywords: [...K('liquida', 3.4), ...K('liquida', 3.40)] },
        { id: 'c3', description: 'Resultado financeiro piorou de −110 para −190 (+72,7%; A.V. −0,8% → −1,2%) por causa da dívida bancária nova.', points: 3, keywords: [...KV('financeiro', 190, 110), ...K('financeiro', 72.7), ...K('financeiro', 1.2)] },
        { id: 'c4', description: 'IR/CS de 210 para 230 (+9,5%), cerca de 30% do LAIR nos dois anos — não explica a queda.', points: 1, keywords: [...KV(['ir'], 230, 210), ...K(['ir'], 9.5), ...K(['ir'], 30), ...KV('imposto', 230)] },
        { id: 'c5', description: 'Conclui: o lucro líquido cresceu 10,2% (490 → 540), menos que a receita (+12,5%), porque o financeiro consumiu a melhora operacional.', points: 1, keywords: [...K('liquido', 10.2), ...KV('liquido', 540), ['financeiro', 'consumiu'], ['financeiro', 'comeu'], ['juros', 'anulou']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Diz que o resultado financeiro melhorou ou que a margem líquida subiu.', patterns: ['resultado financeiro melhorou', 'financeiro melhorou', 'margem liquida subiu', 'margem liquida aumentou', 'margem liquida melhorou'], penalty: 2 },
      ],
      modelAnswer:
        'Margem líquida = Lucro Líquido ÷ Receita. 2024: 490 ÷ 14.400 = 3,4%; 2025: 540 ÷ 16.200 = 3,3% — queda de 0,1 p.p., embora o lucro líquido tenha crescido 10,2% (490 → 540). A margem operacional subiu (5,6% → 5,9%), então a perda ocorreu abaixo do lucro operacional. O responsável é o resultado financeiro: de −110 para −190 (+72,7%), passando de 0,8% para 1,2% da receita — reflexo da dívida bancária, que mais que dobrou (380 → 820) e paga juros. O lucro antes do IR cresceu só 10,0% (700 → 770), menos que o lucro operacional (+18,5%). O IR/CS foi de 210 para 230 (+9,5%), cerca de 30% do LAIR nos dois anos (30,0% e 29,9%) — alíquota estável, não explica a queda. Em resumo: a operação melhorou, mas o custo da dívida nova consumiu a melhora e o acionista ficou com R$ 3,30 de cada R$ 100 vendidos, contra R$ 3,40 em 2024. Margem líquida de 3,3% é fina mesmo para varejo — qualquer alta de juros ou queda de vendas a leva perto de zero; o julgamento deve ser feito contra os pares e contra o custo de capital, e não em termos absolutos.',
    },
    explanation:
      'A margem líquida é o fim do filme: inclui custo, despesas, juros e IR. Quando a margem operacional sobe e a líquida cai, o problema está entre as duas — resultado financeiro ou IR. Aqui foi o financeiro (+72,7%), consequência direta da dívida bancária nova vista no Balanço.',
    reasoningSteps: [
      'Calcule LL ÷ Receita nos dois anos.',
      'Compare com a margem operacional: a variação entre as duas está no financeiro e no IR.',
      'Calcule a A.H. do resultado financeiro e do IR; veja a alíquota efetiva (IR ÷ LAIR).',
      'Ligue o resultado financeiro à dívida do Balanço e conclua comparativamente.',
    ],
    commonMistake: 'Ver o lucro líquido crescendo em reais e concluir que a margem melhorou, sem comparar com o crescimento da receita.',
    rule: 'Margem operacional subiu e líquida caiu → procure a explicação no resultado financeiro e no IR, e ligue o financeiro à dívida do Balanço.',
    formula: 'Margem Líquida = Lucro Líquido ÷ Receita Líquida × 100',
    hint: 'Qual linha entre o lucro operacional e o lucro líquido cresceu 72,7%?',
    concept: 'O resultado financeiro é o efeito das dívidas e do caixa sobre o lucro; o IR é a fatia do governo sobre o lucro antes do imposto.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(V, {
    id: 'rotv-008',
    topic: 'roe',
    subtopic: 'Parte 2 — ROE e o acionista',
    skill: 'rot-roe-acionista',
    part: 2,
    order: 8,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 8: Calcule o ROE da Lojas Primavera em 2024 e 2025. Como acionista, você estaria satisfeito com esse retorno? Justifique comparando com o ano anterior, com o custo de oportunidade do capital e com a origem do resultado.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'ROE 2025 = 540 ÷ 3.460 = 15,6%.', points: 3, keywords: [...K('roe', 15.6), ...K('roe', 15.61), ...K('retorno', 15.6)] },
        { id: 'c2', description: 'ROE 2024 = 490 ÷ 3.420 = 14,3%.', points: 2, keywords: [...K('roe', 14.3), ...K('roe', 14.33), ...K('retorno', 14.3)] },
        { id: 'c3', description: 'Mostra a fórmula com os números (LL 540 e PL 3.460).', points: 2, keywords: [...KV('liquido', 540), ...KV(['pl'], 3460), ...KV('patrimonio', 3460)] },
        { id: 'c4', description: 'Julga de forma comparativa: ano anterior (+1,3 p.p.), custo de oportunidade/Selic/CDI, pares do varejo.', points: 2, keywords: [['custo de oportunidade'], ['custo de capital'], ['selic'], ['cdi'], ['renda fixa'], ['pares'], ['concorrente'], ['setor', 'compar']] },
        { id: 'c5', description: 'Observa a origem: a alta veio de giro e alavancagem (dívida nova), com margem líquida caindo e PL estável porque o lucro foi distribuído.', points: 1, keywords: [['alavanc'], ['divida'], ['giro'], ['distribui'], ['dividendo']] },
      ],
      seriousErrors: [ERR_MARGEM_ATIVO, ERR_JULGAMENTO_ABSOLUTO],
      modelAnswer:
        'ROE = Lucro Líquido ÷ Patrimônio Líquido. 2024: 490 ÷ 3.420 = 14,3%; 2025: 540 ÷ 3.460 = 15,6% — melhora de 1,3 p.p.: para cada R$ 100 deixados na empresa, voltaram R$ 15,60 em 2025. Como acionista, a satisfação depende de três comparações. (1) Com o ano anterior: melhorou. (2) Com o custo de oportunidade: se a renda fixa (Selic/CDI) rende na casa dos 14–15% ao ano com risco muito menor, 15,6% remunera apenas o risco de forma apertada; contra o custo de capital próprio exigido para varejo, está na linha. (3) Com os pares do varejo de vestuário, que é a referência de setor. E a origem importa: a margem líquida CAIU (3,4% → 3,3%); o ROE subiu porque o giro passou de 1,39 para 1,45 e a alavancagem de 3,02 para 3,23 — ou seja, mais vendas por real de ativo e mais dívida (bancária 380 → 820) sobre um PL que ficou parado em 3.460 porque quase todo o lucro foi distribuído (dividendos). É um retorno bom em relação a 2024, mas sustentado por mais risco: se as vendas caírem, a mesma alavancagem reduz o ROE na mesma proporção.',
    },
    explanation:
      'O ROE é a ponte entre DRE e Balanço e a pergunta do dono. Nunca se julga sozinho: compara-se com o ano anterior, com o custo de oportunidade (o que o dinheiro renderia fora) e com os pares — e pergunta-se de onde veio (margem, giro ou alavancagem).',
    reasoningSteps: [
      'Calcule LL ÷ PL em cada ano com os valores do mesmo ano.',
      'Compare 2025 com 2024 em pontos percentuais.',
      'Compare com o custo de oportunidade (renda fixa) e com os pares do setor.',
      'Pergunte de onde veio a variação (DuPont) antes de dizer se está satisfeito.',
    ],
    commonMistake: 'Dividir o lucro pelo Ativo Total (isso é retorno sobre o ativo, não ROE) ou julgar "15,6% é ótimo" sem comparação.',
    rule: 'ROE = LL ÷ PL; julgue sempre contra o ano anterior, o custo de capital e os pares, e verifique a origem.',
    formula: 'ROE = Lucro Líquido ÷ Patrimônio Líquido × 100',
    hint: 'Quanto renderia o mesmo dinheiro em renda fixa com menos risco? E o ROE subiu com margem caindo — o que isso diz?',
    concept: 'O ROE mede quanto o lucro do ano remunera o capital que os sócios deixaram na empresa.',
    source: SRC_ROE,
  }),
  roteiroEssay(V, {
    id: 'rotv-009',
    topic: 'dupont',
    subtopic: 'Parte 2 — DuPont 2025 × 2024',
    skill: 'rot-dupont-comparativo',
    part: 2,
    order: 9,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 9: Decomponha o ROE de 2025 pelo DuPont (Margem Líquida × Giro do Ativo × Alavancagem) e compare com 2024. Qual fator explica a variação do ROE e o que isso diz sobre a qualidade dessa variação?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem líquida: 3,4% (2024) → 3,3% (2025), caiu.', points: 2, keywords: [...K('margem', 3.3), ...K('margem', 3.4)] },
        { id: 'c2', description: 'Giro: 1,39 (14.400 ÷ 10.340) → 1,45 (16.200 ÷ 11.160), subiu.', points: 2, keywords: [...K('giro', [1.45, 2], [1.39, 2], 1.5, 1.4)] },
        { id: 'c3', description: 'Alavancagem: 3,02 (10.340 ÷ 3.420) → 3,23 (11.160 ÷ 3.460), subiu.', points: 2, keywords: [...K('alavanc', [3.23, 2], [3.02, 2], 3.2, 3.0)] },
        { id: 'c4', description: 'ROE 14,3% → 15,6% e o produto dos fatores confere com LL ÷ PL.', points: 2, keywords: [...K('roe', 15.6), ...K('roe', 14.3)] },
        { id: 'c5', description: 'Conclui: a alta veio do giro e da alavancagem (dívida nova, PL estável), não da margem — melhora com mais risco, não ganho de eficiência das vendas.', points: 2, keywords: [['giro', 'alavanc'], ['alavanc', 'risco'], ['nao veio da margem'], ['apesar da margem'], ['margem caiu', 'roe subiu'], ['divida', 'roe']] },
      ],
      seriousErrors: [ERR_ROE_EFICIENCIA_VAREJO, ERR_MARGEM_ATIVO],
      modelAnswer:
        'DuPont 2025: Margem líquida 540 ÷ 16.200 = 3,33% × Giro 16.200 ÷ 11.160 = 1,45 × Alavancagem 11.160 ÷ 3.460 = 3,23 → ROE = 15,6% (confere com 540 ÷ 3.460). DuPont 2024: 490 ÷ 14.400 = 3,40% × 14.400 ÷ 10.340 = 1,39 × 10.340 ÷ 3.420 = 3,02 → 14,3%. Fator a fator: a margem líquida CAIU (3,40% → 3,33%), por causa do resultado financeiro (−110 → −190); o giro SUBIU (1,39 → 1,45), porque a receita cresceu 12,5% e o ativo 7,9%; a alavancagem SUBIU (3,02 → 3,23), porque o ativo cresceu com dívida (bancária 380 → 820, PC +470) e o PL ficou estável (3.420 → 3.460). Logo a melhora de 1,3 p.p. no ROE veio do giro (vender mais com a mesma estrutura — um ganho legítimo de varejo) e da alavancagem (mais capital de terceiros por real dos sócios). Não veio de eficiência da operação no sentido de margem: a empresa ganha menos por real vendido. Qualidade: a parte do giro é sustentável; a parte da alavancagem é faca de dois gumes — amplia o ROE enquanto a operação rende mais que o custo da dívida (que já consumiu parte da margem) e amplia o prejuízo se as vendas caírem, com LC de 0,99 e caixa 34,5% menor.',
    },
    explanation:
      'O DuPont separa o ROE em três motores. Comparar fator a fator entre os anos mostra qual mudou: aqui margem caiu, giro e alavancagem subiram. ROE maior por alavancagem significa mais retorno com mais risco; ROE maior por margem significaria mais eficiência das vendas.',
    reasoningSteps: [
      'Calcule os três fatores de cada ano com os dados do próprio ano.',
      'Multiplique e confira com LL ÷ PL.',
      'Compare cada fator entre 2024 e 2025 e identifique quais subiram e quais caíram.',
      'Ligue cada movimento à sua causa (DRE ou Balanço) e julgue a qualidade: giro × alavancagem × margem.',
    ],
    commonMistake: 'Dizer que o ROE subiu "porque a empresa ficou mais eficiente" sem notar que a margem caiu e a alavancagem subiu.',
    rule: 'Para explicar a variação do ROE, compare os três fatores do DuPont entre os anos e atribua a variação apenas aos que mudaram.',
    formula: 'ROE = (LL ÷ Receita) × (Receita ÷ Ativo) × (Ativo ÷ PL)',
    hint: 'Três fatores, dois subiram e um caiu. Qual caiu?',
    concept: 'DuPont: ROE = margem (quanto sobra por venda) × giro (quanto vende por real de ativo) × alavancagem (quanto ativo cada real dos sócios sustenta).',
    source: SRC_ROE,
  }),
  roteiroEssay(V, {
    id: 'rotv-010',
    topic: 'estrategia',
    subtopic: 'Parte 3 — custo × diferenciação',
    skill: 'rot-custo-diferenciacao',
    part: 3,
    order: 10,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'PARTE 3 — Estratégia. Questão 10: Pelos números das demonstrações, a vantagem competitiva da Lojas Primavera está mais próxima de uma estratégia de custo/volume ou de diferenciação? Sustente a resposta com margens, giro e A.V. das despesas, e indique o que os números precisariam mostrar para ser o oposto.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Usa o giro (1,45) e/ou a margem líquida (3,3%) como evidência de modelo de volume.', points: 3, keywords: [...K('giro', [1.45, 2], 1.5, 1.4), ...K('liquida', 3.3)] },
        { id: 'c2', description: 'Cita a margem bruta (41,5%) e/ou as despesas com vendas (26,5% da receita) como custo de competir por volume (lojas, promoções).', points: 2, keywords: [...K('bruta', 41.5), ...K('vendas', 26.5), ...KV('vendas', 4300)] },
        { id: 'c3', description: 'Nomeia a estratégia (custo/volume/escala/giro) e justifica com o modelo (muitas lojas, financiamento por fornecedores e cartões, PC 56,1%).', points: 3, keywords: [['custo'], ['volume'], ['escala'], ['giro alto'], ['preco baixo']] },
        { id: 'c4', description: 'Descreve o contraste: diferenciação apareceria como margem bruta/líquida maior e giro menor (ou cita pares/outro setor para comparar).', points: 2, keywords: [['diferencia', 'margem'], ['diferencia', 'giro'], ['marca'], ['premium'], ['pares'], ['compar', 'setor']] },
      ],
      seriousErrors: [
        { description: 'Lê o giro de 1,45 como "baixo" ou a margem líquida de 3,3% como "alta" (inverte o perfil).', patterns: ['giro baixo', 'giro e baixo', 'margem liquida alta', 'margem liquida e alta', 'margens altas'], penalty: 1 },
      ],
      modelAnswer:
        'Os números apontam para uma estratégia de custo/volume (escala e giro), e não de diferenciação. Evidências: a margem líquida é fina, 3,3% (R$ 3,30 por R$ 100 vendidos), e o giro é alto, 1,45 (cada R$ 1 de ativo gera R$ 1,45 de vendas por ano, contra 0,41 numa indústria pesada); o ROE de 15,6% é construído por giro e alavancagem (3,23), não por margem — o jeito "barraca de praia que anda" de encher o bolso. A margem bruta de 41,5% é razoável para vestuário, mas as despesas com vendas consomem 26,5% da receita (4.300) e as administrativas 9,0%: a empresa gasta muito em lojas, equipe e promoção para girar mercadoria, e se financia com fornecedores (16,7%) e cartões (21,1%) — modelo de rede de lojas que compete por preço, sortimento e conveniência. Uma estratégia de diferenciação (marca premium) mostraria o oposto: margem bruta e líquida mais altas (por exemplo, líquida de dois dígitos), giro menor, menos dependência de volume e despesas de venda proporcionalmente menores. Risco dessa escolha: com 3,3% de margem, uma alta de 1 p.p. no CMV ou nos juros zera boa parte do lucro — a vantagem só se sustenta se o giro continuar subindo. A comparação correta é com os pares de varejo de vestuário, não com setores de margem alta.',
    },
    explanation:
      'As DFs revelam a estratégia: margem fina + giro alto = competir por volume e preço; margem alta + giro baixo = diferenciação ou ativos pesados. Use os fatores do DuPont e a A.V. das despesas como evidência e diga o que precisaria mudar para o perfil oposto.',
    reasoningSteps: [
      'Olhe os dois primeiros fatores do DuPont: margem líquida e giro.',
      'Veja a A.V. das despesas com vendas: muito gasto para vender é típico de volume.',
      'Veja quem financia (fornecedores e cartões) — modelo de rede de lojas.',
      'Nomeie a estratégia e descreva o perfil numérico oposto para justificar.',
    ],
    commonMistake: 'Responder "diferenciação porque é moda" sem olhar que a margem líquida é de 3,3% e o giro de 1,45.',
    rule: 'Estratégia de custo/volume aparece como margem fina e giro alto; diferenciação, como margem alta e giro baixo — prove com os números.',
    hint: 'Compare a margem líquida com o giro: qual dos dois sustenta o ROE?',
    concept: 'Custo × diferenciação são as duas vantagens competitivas básicas; cada uma deixa uma assinatura nas margens e no giro.',
    source: SRC_ESTR,
  }),
  roteiroEssay(V, {
    id: 'rotv-011',
    topic: 'estrategia',
    subtopic: 'Parte 3 — riscos do negócio',
    skill: 'rot-riscos',
    part: 3,
    order: 11,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 11: Aponte pelo menos três riscos relevantes do negócio da Lojas Primavera, cada um sustentado por números das demonstrações (valores, A.V. ou A.H.), e explique a consequência de cada risco para o lucro ou para o caixa.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Risco de liquidez: LC 0,99 (de 1,08), caixa −34,5% (930), PC 6.260 vencendo em 12 meses.', points: 2, keywords: [...K('liquidez', [0.99, 2]), ...K('caixa', 34.5), ...KV('caixa', 930), ...K('lc', [0.99, 2])] },
        { id: 'c2', description: 'Risco financeiro: dívida bancária 380 → 820, resultado financeiro −190 (+72,7%), alavancagem 3,23.', points: 2, keywords: [...KV('divida', 820), ...KV('emprest', 820), ...K('financeiro', 72.7), ...KV('financeiro', 190), ...K('alavanc', [3.23, 2], 3.2)] },
        { id: 'c3', description: 'Risco de margem: margem líquida 3,3% e CMV crescendo 13,5% contra receita 12,5%.', points: 2, keywords: [...K('margem', 3.3), ...K('cmv', 13.5), ...K('custo', 13.5), ...K('bruta', 41.5)] },
        { id: 'c4', description: 'Risco de crédito/estoque: contas a receber 3.090 (27,7% do ativo) e estoques 1.430 (12,8%) — inadimplência e moda parada.', points: 2, keywords: [...KV('receb', 3090), ...K('receb', 27.7), ...KV('estoque', 1430), ...K('estoque', 12.8), ['inadimpl']] },
        { id: 'c5', description: 'Explica a consequência (faca de dois gumes, queda de vendas amplifica o prejuízo, rolagem de dívida).', points: 2, keywords: [['dois gumes'], ['amplia'], ['queda de vendas'], ['vendas cairem'], ['vendas caem'], ['rolar'], ['refinanc'], ['consequencia']] },
      ],
      seriousErrors: [
        ERR_LC_INSOLVENCIA,
        { description: 'Afirma que não há riscos relevantes.', patterns: ['nao ha risco', 'sem riscos', 'nenhum risco', 'nao existe risco'], penalty: 2 },
      ],
      modelAnswer:
        'Riscos sustentados pelas demonstrações: (1) Liquidez: a LC caiu de 1,08 para 0,99, o caixa encolheu 34,5% (1.420 → 930) e o Passivo Circulante de 6.260 vence em 12 meses — se as vendas desacelerarem, cartões (2.350) e fornecedores (1.860) não se renovam e a empresa precisa rolar os 480 de empréstimos de curto prazo. (2) Endividamento e juros: a dívida bancária mais que dobrou (380 → 820), o resultado financeiro piorou 72,7% (−110 → −190) e a alavancagem subiu para 3,23; com margem líquida de 3,3%, cada R$ 100 a mais de juros tira quase 20% do lucro líquido (540). (3) Margem fina: a margem bruta caiu de 42,0% para 41,5% porque o CMV cresceu 13,5% contra 12,5% da receita; com 3,3% de margem líquida, mais 1 p.p. de custo ou de promoções reduz o lucro em cerca de um terço. (4) Crédito e estoque: contas a receber de 3.090 (27,7% do ativo) expõem a empresa à inadimplência dos clientes, e estoques de 1.430 (12,8%) em moda viram remarcação se a coleção encalha. (5) Expansão com caixa alheio: o imobilizado cresceu 29,6% e o direito de uso 26,9% financiados por passivo de curto prazo e caixa — lojas novas demoram a maturar, e a alavancagem de 3,23 multiplica o prejuízo de uma temporada ruim. A gravidade de cada risco deve ser comparada com os pares do setor e com o histórico da própria empresa.',
    },
    explanation:
      'Riscos na Parte 3 não são opinião: cada um precisa de uma linha das DFs que o sustente e de uma consequência explícita. Liquidez, dívida, margem, crédito/estoque e expansão são os eixos naturais de um varejista alavancado com caixa em queda.',
    reasoningSteps: [
      'Percorra as Partes 1 e 2 e marque os números que pioraram (caixa, LC, financeiro, margem bruta).',
      'Transforme cada número em um risco: o que acontece se a tendência continuar?',
      'Quantifique a consequência (quanto do lucro de 540 some com mais R$ 100 de juros?).',
      'Priorize: os riscos ligados à alavancagem são os que se amplificam.',
    ],
    commonMistake: 'Listar riscos genéricos ("concorrência", "economia") sem número e sem ligação com as linhas das DFs.',
    rule: 'Cada risco = número da DF + mecanismo + consequência no lucro ou no caixa.',
    hint: 'Comece pelos números que pioraram entre 2024 e 2025: caixa, LC, resultado financeiro, margem bruta.',
    concept: 'Risco do negócio é a possibilidade de um número das DFs se mover contra a empresa; a alavancagem amplia esse efeito.',
    source: SRC_ESTR,
  }),
  roteiroEssay(V, {
    id: 'rotv-012',
    topic: 'estrategia',
    subtopic: 'Parte 3 — ações concretas',
    skill: 'rot-acoes',
    part: 3,
    order: 12,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 12: Proponha pelo menos três ações concretas para melhorar as margens e a rentabilidade da Lojas Primavera, indicando para cada uma a linha da DRE ou do Balanço afetada, o número atual dessa linha e o efeito esperado (margem, LC, ROE).',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Ação sobre o CMV (58,5% da receita; 9.480; +13,5%): negociação com fornecedores, mix, menos remarcação → margem bruta.', points: 3, keywords: [...K('cmv', 58.5), ...KV('cmv', 9480), ...K('cmv', 13.5), ...K('custo', 58.5), ...KV('custo', 9480), ...K('bruta', 41.5)] },
        { id: 'c2', description: 'Ação sobre despesas com vendas (26,5%; 4.300) e/ou administrativas (9,0%; 1.460) → margem operacional.', points: 2, keywords: [...K('vendas', 26.5), ...KV('vendas', 4300), ...K('administrativ', 9.0), ...KV('administrativ', 1460), ...K('operacional', 5.9)] },
        { id: 'c3', description: 'Ação sobre liquidez: reduzir estoques (1.430) e recebíveis (3.090) ou recompor caixa (930) → LC de 0,99.', points: 2, keywords: [...KV('estoque', 1430), ...KV('receb', 3090), ...KV('caixa', 930), ...K('liquidez', [0.99, 2]), ...K('lc', [0.99, 2])] },
        { id: 'c4', description: 'Ação sobre a dívida/payout: alongar os 480 de curto prazo, reduzir o financeiro (−190) ou reter lucro (dividendos 110; PL 3.460) → alavancagem 3,23 e margem líquida.', points: 2, keywords: [...KV('emprest', 480, 820), ...KV('financeiro', 190), ...KV('dividend', 110), ...K('alavanc', [3.23, 2], 3.2), ['alongar'], ['reter', 'lucro']] },
        { id: 'c5', description: 'Explicita a linha afetada e o efeito esperado em cada ação.', points: 1, keywords: [['linha'], ['afeta'], ['impacto'], ['efeito'], ['reflete']] },
      ],
      seriousErrors: [
        { description: 'Propõe mais dívida de curto prazo ou mais dividendos numa empresa com LC 0,99, caixa em queda e PL estável.', patterns: ['mais emprestimos de curto prazo', 'aumentar o passivo circulante', 'distribuir mais dividendos', 'aumentar os dividendos', 'pagar mais dividendos'], penalty: 1 },
      ],
      modelAnswer:
        'Ações ligadas às linhas: (1) Atacar o CMV, hoje 58,5% da receita (9.480, +13,5% contra receita +12,5%): renegociar compras com os fornecedores (que a empresa já financia em 1.860), melhorar o mix e reduzir remarcações de coleção; cada 1 p.p. de CMV sobre 16.200 de receita vale R$ 162 milhões de lucro bruto — a margem bruta voltaria de 41,5% para 42,5%. (2) Continuar diluindo despesas com vendas (26,5%; 4.300) e administrativas (9,0%; 1.460): crescer vendas nas lojas existentes antes de abrir novas, para que a margem operacional siga acima de 5,9%. (3) Recompor liquidez: reduzir estoques (1.430, +9,2%) e acelerar recebíveis (3.090, +12,4%) para repor o caixa (930) e levar a LC de 0,99 de volta acima de 1,0 — isso afeta o Ativo Circulante e reduz a necessidade de dívida. (4) Alongar a dívida: trocar os 480 de empréstimos de curto prazo por longo prazo e reduzir o custo do financeiro (−190, 1,2% da receita), o que devolve margem líquida (3,3%) e tira pressão do PC. (5) Rever o payout: o PL ficou em 3.460 porque quase todo o lucro de 540 foi distribuído; reter parte reduz a alavancagem (3,23) e financia a expansão (imobilizado +29,6%) com capital próprio. Efeito combinado: margem líquida de volta a 3,4%+ e ROE sustentado por giro, não por dívida — resultado a ser comparado com o do ano anterior e com os pares.',
    },
    explanation:
      'Ações da Parte 3 precisam de endereço: a linha da DF, seu número atual e o indicador que muda. CMV → margem bruta; despesas → margem operacional; estoques/recebíveis/caixa → LC; dívida e payout → financeiro, alavancagem e ROE.',
    reasoningSteps: [
      'Liste as linhas que pioraram ou pesam mais (CMV 58,5%, despesas com vendas 26,5%, financeiro, caixa).',
      'Para cada linha, proponha uma ação administrável (compras, mix, lojas, prazo da dívida, payout).',
      'Diga o indicador afetado (margem bruta, operacional, líquida, LC, alavancagem, ROE).',
      'Quando possível, estime o efeito (1 p.p. de CMV = R$ 162 milhões).',
    ],
    commonMistake: 'Propor "aumentar as vendas" ou "reduzir custos" sem dizer qual linha, qual número e qual indicador muda.',
    rule: 'Ação concreta = linha da DF + número atual + medida + indicador afetado.',
    hint: 'Comece pela maior linha de custo (CMV) e pela que mais piorou (resultado financeiro).',
    concept: 'Margens e rentabilidade melhoram quando alguma linha específica das DFs muda; a ação deve apontar essa linha.',
    source: SRC_ESTR,
  }),
];

// ---------------------------------------------------------------------------------------------
// CASO 2 — Mecânica Pesada Araguaia S.A. (rot-industria): 12 questões do roteiro

const I = INDUSTRIA;

const ERR_ROE_INDUSTRIA = {
  description: 'Atribui a queda do ROE à alavancagem ou às despesas operacionais; ela veio da margem (CPV +15,6% contra receita +8,3%).',
  patterns: ['alavancagem caiu', 'alavancagem diminuiu', 'menos alavancada', 'reduziu a alavancagem', 'despesas operacionais explicam', 'culpa das despesas', 'giro caiu', 'giro diminuiu'],
  penalty: 2,
};

const INDUSTRIA_ROTEIRO: Question[] = [
  roteiroEssay(I, {
    id: 'roti-001',
    topic: 'av',
    subtopic: 'Parte 1 — onde a empresa investe',
    skill: 'rot-av-ativo',
    part: 1,
    order: 1,
    difficulty: 'medium',
    level: 'interpretation',
    stem: 'PARTE 1 — Decisões de investimento e financiamento (Balanço). Questão 1: Quais são as contas mais importantes do ativo da Mecânica Pesada Araguaia em 31/12/2025? Como a empresa distribui seus investimentos (A.V. do ativo) e isso faz sentido para uma indústria de bens de capital?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Identifica o Imobilizado como a maior conta (R$ 13.900 = 54,5% do ativo).', points: 3, keywords: [...K('imobiliz', 54.5), ...KV('imobiliz', 13900)] },
        { id: 'c2', description: 'Mostra a divisão Não Circulante 66,5% × Circulante 33,5% (16.960 × 8.540).', points: 2, keywords: [...K('circulante', 66.5), ...K('circulante', 33.5), ...KV('circulante', 16960, 8540)] },
        { id: 'c3', description: 'Cita Estoques (3.050 = 12,0%) e/ou Contas a receber (2.690 = 10,5%).', points: 2, keywords: [...K('estoque', 12.0), ...KV('estoque', 3050), ...K('receb', 10.5), ...KV('receb', 2690)] },
        { id: 'c4', description: 'Cita Caixa + aplicações (1.380 + 820 = 2.200, 8,6%) e/ou Intangível (1.540 = 6,0%).', points: 2, keywords: [...KV('caixa', 1380, 2200), ...K('caixa', 5.4), ...K('caixa', 8.6), ...K('intang', 6.0), ...KV('intang', 1540)] },
        { id: 'c5', description: 'Julga a coerência com o modelo: indústria pesada, ativos enormes e venda lenta — giro baixo (0,41) exige margem maior.', points: 1, keywords: [['industria'], ['faz sentido'], ['coerente'], ['giro baixo'], ['fabrica'], ['maquinas'], ['intensiv', 'capital']] },
      ],
      seriousErrors: [
        { description: 'Aponta o Circulante ou os estoques como a parte dominante do ativo (o Imobilizado sozinho é 54,5%).', patterns: ['maior conta e o estoque', 'estoques sao a maior', 'maior parte esta no circulante', 'circulante e a maior parte', 'maior conta e o caixa'], penalty: 2 },
        { description: 'Usa a Receita como base da A.V. do ativo.', patterns: ['dividido pela receita', 'sobre a receita liquida', '/ receita'], penalty: 2 },
      ],
      modelAnswer:
        'Em 31/12/2025 o ativo total é de R$ 25.500 milhões, com 66,5% no Não Circulante (16.960) e 33,5% no Circulante (8.540). A conta dominante é o Imobilizado — fábricas, máquinas e equipamentos — com R$ 13.900 (54,5% do ativo; 53,8% em 2024), mais que todo o Circulante junto. Depois vêm os Estoques, R$ 3.050 (12,0%), matéria-prima e produtos em elaboração de máquinas que levam meses para ficar prontas; as Contas a receber, R$ 2.690 (10,5%); o Intangível, R$ 1.540 (6,0%, tecnologia e projetos); e Caixa + aplicações, R$ 2.200 (8,6%). A distribuição faz sentido para bens de capital: é um negócio intensivo em ativos, em que cada R$ 1 de ativo gera apenas R$ 0,41 de receita por ano (giro baixo) — por isso a empresa precisa de margem alta (bruta de 36,0%, operacional de 21,3%) para remunerar tanto capital imobilizado. O contraste com um varejista (giro 1,45 e margem fina) mostra que a leitura "faz sentido?" depende do segmento. Ponto de atenção: o imobilizado continua crescendo (+7,8%) enquanto o caixa cai (−16,4%).',
    },
    explanation:
      'Na indústria pesada, o ativo é dominado pelo Imobilizado e a A.V. mostra isso de cara. A pergunta do roteiro é se a composição combina com o modelo: ativos enormes e venda lenta exigem margem maior — a lógica do DuPont já aparece na Parte 1.',
    reasoningSteps: [
      'Calcule a A.V. de cada conta sobre o Ativo Total de 2025 (25.500).',
      'Separe Circulante × Não Circulante e identifique a conta dominante.',
      'Relacione a composição com o modelo (fábrica, estoques em elaboração, tecnologia).',
      'Ligue o giro baixo à necessidade de margem alta.',
    ],
    commonMistake: 'Descrever o ativo sem a A.V. ou achar que estoques e recebíveis dominam por serem "operacionais".',
    rule: 'A.V. do Balanço = conta ÷ Ativo Total; identifique a conta dominante e pergunte se ela é a cara do setor.',
    formula: 'A.V. = Conta ÷ Ativo Total × 100',
    hint: 'Uma única conta vale mais da metade do ativo. Qual?',
    concept: 'A análise vertical mostra a composição do ativo e, com ela, o tipo de negócio: intensivo em ativos ou em giro.',
    source: SRC_AVAH,
  }),
  roteiroEssay(I, {
    id: 'roti-002',
    topic: 'ah',
    subtopic: 'Parte 1 — variação do ativo',
    skill: 'rot-ah-ativo',
    part: 1,
    order: 2,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 2: O ativo total da Mecânica Pesada Araguaia cresceu 6,3% em 2025 (de R$ 24.000 para R$ 25.500 milhões). Quais linhas explicam o crescimento (A.H.)? O movimento é sinal de problema ou de investimento saudável? Compare com o crescimento da receita.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Cita a variação do ativo (+6,3% ou +R$ 1.500).', points: 2, keywords: [...K('ativo', 6.3), ...KV('ativo', 1500)] },
        { id: 'c2', description: 'Imobilizado +7,8% (12.900 → 13.900, +1.000) explica a maior parte.', points: 3, keywords: [...K('imobiliz', 7.8), ...KV('imobiliz', 13900, 1000)] },
        { id: 'c3', description: 'Estoques +13,0% (2.700 → 3.050) e Contas a receber +12,1% (2.400 → 2.690) crescendo mais que a receita (+8,3%).', points: 2, keywords: [...K('estoque', 13.0), ...KV('estoque', 3050), ...K('receb', 12.1), ...KV('receb', 2690)] },
        { id: 'c4', description: 'Caixa −16,4% (1.650 → 1.380) e aplicações −8,9%.', points: 2, keywords: [...K('caixa', 16.4), ...KV('caixa', 1380), ...K('aplica', 8.9)] },
        { id: 'c5', description: 'Conclui comparando com a receita (+8,3%) e com o retorno: investimento, mas estoques e recebíveis crescem mais que as vendas e o ROE caiu.', points: 1, keywords: [...K('receita', 8.3), ['mais que a receita'], ['mais rapido que a receita'], ['acima da receita'], ['roe', 'caiu']] },
      ],
      seriousErrors: [
        { description: 'Diz que o ativo caiu ou que o caixa aumentou.', patterns: ['ativo caiu', 'ativo diminuiu', 'reducao do ativo', 'caixa aumentou', 'caixa cresceu', 'caixa subiu'], penalty: 2 },
        { description: 'Calcula a A.H. com a base invertida (2024 ÷ 2025).', patterns: ['2024 / 2025', '2024/2025', '24.000 / 25.500', '12.900 / 13.900'], penalty: 2 },
      ],
      modelAnswer:
        'O ativo cresceu 6,3% (24.000 → 25.500, +R$ 1.500 milhões). O Não Circulante respondeu por +1.160 (+7,3%): o Imobilizado subiu 7,8% (12.900 → 13.900, +1.000) — ampliação de capacidade fabril — e o Intangível 6,2% (1.450 → 1.540). O Circulante subiu +340 (+4,1%), mas com troca de composição: Estoques +13,0% (2.700 → 3.050) e Contas a receber +12,1% (2.400 → 2.690) cresceram, enquanto o Caixa caiu 16,4% (1.650 → 1.380) e as aplicações 8,9% (900 → 820). A receita cresceu 8,3% (9.600 → 10.400): o ativo total cresceu menos que as vendas (giro de 0,40 para 0,41, leve melhora), o que em si é investimento saudável. Os sinais de atenção estão na composição: estoques e recebíveis crescem mais rápido que a receita (produção acumulada ou prazos maiores a clientes), o caixa financia parte disso, e o retorno sobre o ativo novo ainda não apareceu — o lucro líquido caiu 21,6% e o ROE de 10,7% para 8,1%. Não é problema de tamanho, mas de rentabilidade do que foi investido: ativo maior precisa render mais, não menos.',
    },
    explanation:
      'A A.H. decompõe a variação do total. Investimento em imobilizado é natural em indústria, mas a leitura exige duas comparações: crescimento do ativo × crescimento da receita (giro) e crescimento do ativo × lucro (retorno). Estoques e recebíveis crescendo acima das vendas são sinal de capital parado.',
    reasoningSteps: [
      'Confirme a variação do total e separe AC × ANC.',
      'Identifique a linha com maior variação absoluta (imobilizado +1.000).',
      'Compare a A.H. de estoques e recebíveis com a da receita.',
      'Julgue pelo retorno: o ativo maior gerou mais lucro? (não — LL −21,6%).',
    ],
    commonMistake: 'Chamar o crescimento do ativo de "bom" sem comparar com a receita e com o lucro.',
    rule: 'Variação do Ativo: decomponha pela A.H., compare com a A.H. da receita e pergunte se o ativo novo está rendendo.',
    formula: 'A.H. = |2025| ÷ |2024| − 1',
    hint: 'Qual linha cresceu R$ 1.000 milhões? E quais cresceram mais rápido que a receita?',
    concept: 'A análise horizontal revela a origem da variação do total e permite comparar o ritmo do ativo com o das vendas.',
    source: SRC_AVAH,
  }),
  roteiroEssay(I, {
    id: 'roti-003',
    topic: 'alavancagem',
    subtopic: 'Parte 1 — quem financia',
    skill: 'rot-estrutura-capital',
    part: 1,
    order: 3,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 3: Quem financia a Mecânica Pesada Araguaia — terceiros ou sócios — e em que proporção (A.V. do Passivo + PL de 2025, comparando com 2024)? Qual o peso da dívida bancária (empréstimos de curto e longo prazo e debêntures)? Essa dívida é cara ou "de graça", e o que isso implica em risco e retorno?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Terceiros 52,4% × PL 47,6% em 2025 (51,2% × 48,8% em 2024).', points: 3, keywords: [...K('terceiro', 52.4), ...K('pl', 47.6), ...K('proprio', 47.6), ...K('patrimonio', 47.6), ...KV('patrimonio', 12140), ...KV('pl', 12140)] },
        { id: 'c2', description: 'Passivo Não Circulante 30,8% (7.860) maior que o Circulante 21,6% (5.500): financiamento majoritariamente de longo prazo.', points: 2, keywords: [...K('nao circulante', 30.8), ...KV('nao circulante', 7860), ...K('circulante', 21.6), ...KV('circulante', 5500)] },
        { id: 'c3', description: 'Dívida bancária = 1.520 + 5.400 + 1.600 = 8.520 (33,4% do total), contra 7.650 em 2024 (+11,4%) — maior financiador de terceiros.', points: 2, keywords: [...KV(['divida'], 8520), ...K('divida', 33.4), ...KV('emprest', 5400, 8520), ...K('emprest', 21.2), ...KV('debent', 1600)] },
        { id: 'c4', description: 'Dívida cara: resultado financeiro −820 (+28,1%), cerca de 9,6% sobre a dívida; alavancagem 2,05 → 2,10.', points: 2, keywords: [...KV('financeiro', 820), ...K('financeiro', 28.1), ...K('alavanc', [2.10, 2], [2.05, 2], 2.1), ...K('juros', 9.6), ...K('custo', 9.6)] },
        { id: 'c5', description: 'Risco × retorno: alavancagem amplia o ROE só se a operação render mais que o custo da dívida; em 2025 o ROE caiu com mais dívida.', points: 1, keywords: [['dois gumes'], ['amplia'], ['custo da divida'], ['custo do dinheiro'], ['rende mais que'], ['rende menos que'], ['risco', 'retorno']] },
      ],
      seriousErrors: [
        { description: 'Diz que fornecedores são o maior financiador ou que a dívida é "de graça" (fornecedores são só 6,1%; bancos e debêntures 33,4%, com juros de 820).', patterns: ['fornecedores sao o maior', 'maior financiador sao os fornecedores', 'maior financiador e o fornecedor', 'divida de graca', 'sem custo', 'nao paga juros'], penalty: 2 },
        { description: 'Diz que a alavancagem caiu (subiu de 2,05 para 2,10).', patterns: ['alavancagem caiu', 'alavancagem diminuiu', 'menos alavancada'], penalty: 2 },
      ],
      modelAnswer:
        'Em 2025 terceiros financiam 52,4% do ativo (Passivo Circulante 21,6% = 5.500 + Não Circulante 30,8% = 7.860) e os sócios 47,6% (PL de R$ 12.140); em 2024 eram 51,2% × 48,8%. A estrutura é quase meio a meio, mas inclinou-se um pouco para terceiros: a Alavancagem (Ativo ÷ PL) subiu de 2,05 para 2,10. O maior financiador de terceiros é o mercado financeiro, não a operação: empréstimos de curto prazo 1.520 (6,0%) + empréstimos de longo prazo 5.400 (21,2%) + debêntures 1.600 (6,3%) = R$ 8.520, 33,4% de todo o passivo + PL (7.650 = 31,9% em 2024, +11,4%). Fornecedores são apenas 1.560 (6,1%) e adiantamentos de clientes 700 (2,7%). Essa dívida é cara: o resultado financeiro foi −820 em 2025 (+28,1% sobre −640), o equivalente a cerca de 9,6% sobre o estoque de dívida, e consome 7,9% da receita. O lado positivo é o prazo: 7.000 dos 8.520 vencem no longo prazo, casados com o imobilizado (54,5% do ativo), e a LC se mantém em 1,55. Em risco e retorno: a alavancagem de 2,10 só amplia o ROE se a operação render mais que o custo da dívida; em 2025 a margem × giro (retorno sobre o ativo) caiu para 3,8% líquidos e o ROE recuou de 10,7% para 8,1% mesmo com mais dívida — a alavanca está trabalhando contra o acionista. Comparar com pares do setor de bens de capital, que costumam ter dívida longa, é a referência adequada.',
    },
    explanation:
      'A estrutura de capital da indústria pesada é o espelho do varejo: terceiros financiam via bancos e debêntures (dívida cara e longa), não via fornecedores. Alavancagem perto de 2 significa que cada R$ 1 dos sócios sustenta R$ 2,10 de ativo — bom quando a operação rende mais que os juros, ruim quando rende menos.',
    reasoningSteps: [
      'Some PC + PNC e compare com o PL em A.V.',
      'Some todas as linhas de dívida financeira (CP, LP, debêntures) e calcule seu peso no total.',
      'Confira o custo pelo resultado financeiro da DRE.',
      'Calcule a alavancagem dos dois anos e cruze com a variação do ROE.',
    ],
    commonMistake: 'Olhar só os empréstimos de curto prazo e subestimar a dívida financeira (a maior parte está no PNC e nas debêntures).',
    rule: 'Dívida financeira = empréstimos CP + LP + debêntures; compare seu peso e seu custo (resultado financeiro) com o retorno da operação.',
    formula: 'Alavancagem = Ativo Total ÷ PL',
    hint: 'Some as três linhas de dívida com juros. Quanto do passivo + PL elas representam?',
    concept: 'Capital de terceiros pode ser operacional (fornecedores, sem juros explícitos) ou financeiro (bancos, debêntures, com juros); a proporção e o custo definem o risco.',
    source: SRC_ROTEIRO,
  }),
  roteiroEssay(I, {
    id: 'roti-004',
    topic: 'liquidez',
    subtopic: 'Parte 1 — financiamento do crescimento e prazos',
    skill: 'rot-financiamento-prazos',
    part: 1,
    order: 4,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 4: Como o crescimento do ativo (+R$ 1.500 milhões) foi financiado pelo lado direito do Balanço (variação do PC, do PNC e do PL)? Os prazos estão casados com o tipo de ativo que cresceu? Use a Liquidez Corrente de 2024 e 2025 e comente sua composição.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'LC 2024 = 8.200 ÷ 5.200 = 1,58; LC 2025 = 8.540 ÷ 5.500 = 1,55.', points: 3, keywords: [...K('liquidez', [1.55, 2], [1.58, 2], 1.6), ...K('lc', [1.55, 2], [1.58, 2]), ...K('corrente', [1.55, 2])] },
        { id: 'c2', description: 'PNC +R$ 760 (+10,7%: 7.100 → 7.860), com empréstimos LP de 4.700 para 5.400 (+14,9%).', points: 2, keywords: [...KV('nao circulante', 760, 7860), ...K('nao circulante', 10.7), ...KV('longo prazo', 5400, 700), ...K('longo prazo', 14.9)] },
        { id: 'c3', description: 'PL +R$ 440 (+3,8%: 11.700 → 12.140) por lucros retidos (reservas +440).', points: 2, keywords: [...KV(['pl'], 440, 12140), ...K(['pl'], 3.8), ...KV('patrimonio', 440, 12140), ...KV('reserva', 440, 4140)] },
        { id: 'c4', description: 'PC +R$ 300 (+5,8%: 5.200 → 5.500), com empréstimos CP 1.350 → 1.520.', points: 2, keywords: [...KV('circulante', 300, 5500), ...K('circulante', 5.8), ...KV('emprest', 1520)] },
        { id: 'c5', description: 'Conclui: prazos casados (ANC +1.160 financiado por PNC +760 e PL +440); folga mantida acima de 1,5; ressalva sobre caixa menor e estoques maiores no numerador.', points: 1, keywords: [['casad'], ['folga'], ['longo prazo', 'longo prazo'], ['composicao'], ['estoque', 'caixa']] },
      ],
      seriousErrors: [
        ERR_LC_INSOLVENCIA,
        { description: 'Calcula a LC com o Ativo Total ou o Passivo Total (é AC ÷ PC).', patterns: ['ativo total / passivo', 'ativo total/passivo', '25.500 / 5.500', '25.500 / 13.360', 'ativo / passivo total'], penalty: 2 },
        { description: 'Afirma que houve descasamento grave (o crescimento foi financiado majoritariamente por longo prazo e PL).', patterns: ['descasamento grave', 'forte descasamento', 'financiado com curto prazo', 'financiado por curto prazo', 'financiou com curto prazo'], penalty: 1 },
      ],
      modelAnswer:
        'O ativo cresceu R$ 1.500 milhões: R$ 1.160 no Não Circulante (imobilizado +1.000, intangível +90, RLP +30, IR diferido +40) e R$ 340 no Circulante. Do lado direito: Passivo Não Circulante +R$ 760 (7.100 → 7.860, +10,7%), com empréstimos de longo prazo de 4.700 para 5.400 (+14,9%); PL +R$ 440 (11.700 → 12.140, +3,8%), por lucros retidos (reservas 3.700 → 4.140 — do lucro de 980, cerca de 540 foram distribuídos); e Passivo Circulante +R$ 300 (5.200 → 5.500, +5,8%), com empréstimos de curto prazo de 1.350 para 1.520 e fornecedores de 1.420 para 1.560. Ou seja, R$ 1.200 de fontes de longo prazo (PNC + PL) cobriram os R$ 1.160 de ativos de longo prazo: prazos casados. A Liquidez Corrente confirma: 8.200 ÷ 5.200 = 1,58 em 2024 e 8.540 ÷ 5.500 = 1,55 em 2025 — folga mantida (acima de 1), leve recuo. Olhando a composição: o numerador ganhou estoques (+350) e recebíveis (+290) e perdeu caixa (−270) e aplicações (−80) — ativos que viram dinheiro mais devagar — e o denominador tem 1.520 de dívida bancária de curto prazo. A folga é real, mas de qualidade um pouco pior: caixa + aplicações (2.200) cobrem 40% do PC, contra 49% em 2024. A comparação relevante é com o próprio histórico e com pares de bens de capital, que operam com ciclos longos de produção.',
    },
    explanation:
      'Aqui o roteiro mostra o caso "bem financiado": ativos de longo prazo pagos com PNC e lucro retido, LC acima de 1,5. A leitura fina está na composição do numerador — estoques crescendo e caixa caindo pioram a qualidade da liquidez mesmo com o índice quase igual.',
    reasoningSteps: [
      'Calcule a variação de PC, PNC e PL e confira que soma +1.500.',
      'Compare com a variação de AC e ANC: longo com longo?',
      'Calcule a LC dos dois anos (AC ÷ PC).',
      'Analise a composição do AC (caixa × estoques) antes de concluir.',
    ],
    commonMistake: 'Parar no índice (1,55 = folga) sem notar que o caixa caiu e os estoques subiram dentro do AC.',
    rule: 'Casamento de prazos: compare a variação do ANC com a de PNC + PL; confirme pela LC e pela composição do AC.',
    formula: 'LC = Ativo Circulante ÷ Passivo Circulante',
    hint: 'Some PNC + PL: cobre o crescimento do Não Circulante?',
    concept: 'A Liquidez Corrente mede a folga de curto prazo; a composição do AC (caixa × estoques) diz a qualidade dessa folga.',
    source: SRC_LC,
  }),
  roteiroEssay(I, {
    id: 'roti-005',
    topic: 'margens',
    subtopic: 'Parte 2 — margem bruta',
    skill: 'rot-margem-bruta',
    part: 2,
    order: 5,
    difficulty: 'medium',
    level: 'interpretation',
    stem: 'PARTE 2 — Resultados (DRE). Questão 5: Calcule e compare a margem bruta da Mecânica Pesada Araguaia em 2024 e 2025. Use a A.H. da receita e do CPV para explicar a variação. O produto continua rentável?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem bruta 2025 = 3.740 ÷ 10.400 = 36,0%.', points: 3, keywords: [...K('bruta', 36.0), ...K('bruta', 35.96)] },
        { id: 'c2', description: 'Margem bruta 2024 = 3.840 ÷ 9.600 = 40,0%.', points: 2, keywords: [...K('bruta', 40.0), ...K('2024', 40.0)] },
        { id: 'c3', description: 'CPV +15,6% (5.760 → 6.660) contra receita +8,3% (9.600 → 10.400); A.V. do CPV 60,0% → 64,0%.', points: 3, keywords: [...K('cpv', 15.6), ...K('custo', 15.6), ...K('receita', 8.3), ...KV('cpv', 6660), ...K('cpv', 64.0), ...K('custo', 64.0)] },
        { id: 'c4', description: 'Conclui comparativamente: queda de 4,0 p.p.; lucro bruto caiu 2,6% em valor apesar de vender mais; produto ainda rentável, mas perdendo repasse de custo.', points: 2, keywords: [['4,0'], ['4.0'], ['4 p.p'], ['p.p.'], ['ponto percentual'], ['mais rapido'], ['cresceu mais que a receita'], ['repass']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Diz que a margem bruta melhorou (caiu de 40,0% para 36,0%).', patterns: ['margem bruta melhorou', 'margem bruta subiu', 'margem bruta aumentou', 'margem bruta cresceu'], penalty: 2 },
      ],
      modelAnswer:
        'Margem bruta = Lucro Bruto ÷ Receita líquida. 2024: 3.840 ÷ 9.600 = 40,0%; 2025: 3.740 ÷ 10.400 = 36,0% — queda de 4,0 pontos percentuais. A receita cresceu 8,3% (9.600 → 10.400), mas o CPV cresceu 15,6% (5.760 → 6.660): a linha de baixo cresceu quase o dobro da receita, e a A.V. do custo passou de 60,0% para 64,0%. Resultado: o lucro bruto CAIU 2,6% em valor (3.840 → 3.740) mesmo com a empresa vendendo mais — vendeu mais máquinas, mas cada uma deixou menos. As causas típicas numa indústria de bens de capital são aço, energia e mão de obra industrial subindo sem repasse integral aos preços (contratos fechados antes), ou um mix com equipamentos de menor valor agregado. O produto continua rentável — sobram R$ 36,00 de cada R$ 100 depois do custo, margem alta se comparada a um varejista (41,5% bruta, mas 3,3% líquida) —, porém a tendência é o problema: em negócio de giro baixo (0,41), a margem é o que sustenta o ROE, e 4 p.p. a menos aqui explicam quase toda a queda do lucro líquido (−21,6%). O julgamento deve ser feito contra o próprio histórico (piorou) e contra pares de bens de capital.',
    },
    explanation:
      'A margem bruta cai quando o custo cresce mais rápido que a receita. Aqui a receita subiu 8,3% e o CPV 15,6%: 4 p.p. de margem a menos, com lucro bruto caindo em valor absoluto apesar das vendas maiores — o alerta mais importante de toda a DRE deste caso.',
    reasoningSteps: [
      'Calcule LB ÷ Receita em cada ano.',
      'Compare as A.H. da receita (+8,3%) e do CPV (+15,6%).',
      'Expresse a variação da margem em p.p. e veja o efeito em valor (LB −2,6%).',
      'Julgue comparando com o ano anterior e com o setor; em giro baixo, margem é tudo.',
    ],
    commonMistake: 'Ver a receita crescendo e supor que o lucro bruto também cresceu.',
    rule: 'Margem piora quando a linha de baixo cresce mais rápido que a receita — confira as duas A.H. antes de concluir.',
    formula: 'Margem Bruta = Lucro Bruto ÷ Receita Líquida × 100',
    hint: 'A receita subiu 8,3%. O CPV subiu quanto?',
    concept: 'A margem bruta mede a rentabilidade do produto em si, antes das despesas de estrutura.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(I, {
    id: 'roti-006',
    topic: 'margens',
    subtopic: 'Parte 2 — margem operacional',
    skill: 'rot-margem-operacional',
    part: 2,
    order: 6,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 6: Calcule a margem operacional de 2024 e 2025. A queda veio do lucro bruto ou das despesas operacionais? Use a A.V. e a A.H. das despesas com vendas e administrativas para provar.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem operacional 2025 = 2.220 ÷ 10.400 = 21,3%.', points: 3, keywords: [...K('operacional', 21.3), ...K('operacional', 21.35), ...K('operacional', 21.4)] },
        { id: 'c2', description: 'Margem operacional 2024 = 2.420 ÷ 9.600 = 25,2%.', points: 2, keywords: [...K('operacional', 25.2), ...K('operacional', 25.21)] },
        { id: 'c3', description: 'Despesas cresceram menos que a receita: vendas +7,8% (A.V. 6,7% → 6,6%) e administrativas +6,4% (8,1% → 8,0%) — não são a causa.', points: 2, keywords: [...K('vendas', 7.8), ...K('vendas', 6.6), ...K('administrativ', 6.4), ...K('administrativ', 8.0), ...KV('vendas', 690), ...KV('administrativ', 830)] },
        { id: 'c4', description: 'Lucro operacional −8,3% (2.420 → 2.220), consequência do lucro bruto −2,6% / margem bruta −4,0 p.p.', points: 2, keywords: [...K('operacional', 8.3), ...KV('operacional', 2220, 2420), ...K('bruto', 2.6), ...K('bruta', 36.0)] },
        { id: 'c5', description: 'Conclui: a queda de 3,9 p.p. veio inteiramente da margem bruta (CPV); as despesas até ajudaram (diluição).', points: 1, keywords: [['veio do cpv'], ['veio do custo'], ['margem bruta', 'causa'], ['nao foram as despesas'], ['despesas nao'], ['dilui'], ['3,9'], ['3.9']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Atribui a queda da margem operacional às despesas operacionais (elas cresceram menos que a receita; a causa é o CPV).', patterns: ['culpa das despesas', 'despesas operacionais explicam', 'por causa das despesas', 'despesas cresceram mais que a receita', 'despesas subiram mais que a receita', 'margem operacional subiu', 'margem operacional melhorou'], penalty: 2 },
      ],
      modelAnswer:
        'Margem operacional = Lucro Operacional ÷ Receita. 2024: 2.420 ÷ 9.600 = 25,2%; 2025: 2.220 ÷ 10.400 = 21,3% — queda de 3,9 p.p.; o lucro operacional caiu 8,3% em valor (2.420 → 2.220). A causa NÃO está nas despesas operacionais: despesas com vendas cresceram 7,8% (640 → 690) e administrativas 6,4% (780 → 830), ambas abaixo da receita (+8,3%), de modo que a A.V. delas caiu (vendas 6,7% → 6,6%; administrativas 8,1% → 8,0%; total 14,8% → 14,6%). A estrutura foi diluída pelo volume maior — isso ajudou 0,2 p.p. A queda veio inteiramente do degrau de cima: a margem bruta recuou 4,0 p.p. (40,0% → 36,0%) porque o CPV cresceu 15,6%. Em outras palavras, a operação "para em pé" com folga menor — R$ 21,30 de cada R$ 100 contra R$ 25,20 em 2024 — e o diagnóstico é de custo industrial, não de estrutura comercial ou administrativa. Comparada a um varejista (operacional 5,9%), a margem segue alta; comparada ao próprio histórico, piorou — e o remédio está no CPV, não em cortar despesas que já estão controladas.',
    },
    explanation:
      'Para localizar a origem de uma variação de margem operacional, compare a A.H. de cada degrau com a da receita. Despesas que crescem menos que a receita diluem; se a margem caiu mesmo assim, o problema está no lucro bruto. É o diagnóstico que direciona a ação da Parte 3.',
    reasoningSteps: [
      'Calcule LO ÷ Receita nos dois anos.',
      'Confira a A.H. das despesas contra a da receita.',
      'Confira a variação da margem bruta.',
      'Atribua a queda ao degrau que de fato piorou e descarte os que melhoraram.',
    ],
    commonMistake: 'Propor corte de despesas porque "a margem operacional caiu", sem ver que as despesas até melhoraram em A.V.',
    rule: 'Variação da margem operacional = efeito da margem bruta + efeito das despesas; identifique qual dos dois mudou.',
    formula: 'Margem Operacional = Lucro Operacional ÷ Receita Líquida × 100',
    hint: 'As despesas cresceram mais ou menos que a receita? Então de onde veio a queda?',
    concept: 'Despesas operacionais são o custo de manter a estrutura e vender; sua A.V. mostra se a estrutura está sendo diluída ou inchando.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(I, {
    id: 'roti-007',
    topic: 'margens',
    subtopic: 'Parte 2 — margem líquida, financeiro e IR',
    skill: 'rot-margem-liquida',
    part: 2,
    order: 7,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 7: Calcule a margem líquida de 2024 e 2025. Qual foi o papel do resultado financeiro e do IR/CS na passagem do lucro operacional ao lucro líquido? Quanto da queda da margem líquida é operação e quanto é financeiro?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem líquida 2025 = 980 ÷ 10.400 = 9,4%.', points: 3, keywords: [...K('liquida', 9.4), ...K('liquida', 9.42)] },
        { id: 'c2', description: 'Margem líquida 2024 = 1.250 ÷ 9.600 = 13,0%.', points: 2, keywords: [...K('liquida', 13.0), ...K('liquida', 13.02)] },
        { id: 'c3', description: 'Resultado financeiro piorou de −640 para −820 (+28,1%; A.V. 6,7% → 7,9% da receita) com a dívida maior (7.650 → 8.520).', points: 3, keywords: [...KV('financeiro', 820, 640), ...K('financeiro', 28.1), ...K('financeiro', 7.9)] },
        { id: 'c4', description: 'IR/CS caiu de 530 para 420 (−20,8%) porque o LAIR caiu 21,3% (1.780 → 1.400); alíquota efetiva ~30% nos dois anos.', points: 1, keywords: [...KV(['ir'], 420, 530), ...K(['ir'], 20.8), ...K(['ir'], 30), ...KV('imposto', 420), ...K('lair', 21.3), ...KV('lair', 1400)] },
        { id: 'c5', description: 'Separa os efeitos: margem operacional −3,9 p.p. (operação/CPV) e financeiro −1,2 p.p.; lucro líquido −21,6% (1.250 → 980).', points: 1, keywords: [...K('liquido', 21.6), ...KV('liquido', 980), ['3,9', '1,2'], ['3.9', '1.2'], ['operacao', 'financeiro', 'p.p']] },
      ],
      seriousErrors: [
        ERR_MARGEM_ATIVO,
        { description: 'Diz que o resultado financeiro melhorou, que a margem líquida subiu ou que o IR menor é "boa notícia" (caiu porque o lucro caiu).', patterns: ['resultado financeiro melhorou', 'financeiro melhorou', 'margem liquida subiu', 'margem liquida aumentou', 'margem liquida melhorou', 'ir caiu, o que e bom', 'economia de imposto'], penalty: 2 },
      ],
      modelAnswer:
        'Margem líquida = Lucro Líquido ÷ Receita. 2024: 1.250 ÷ 9.600 = 13,0%; 2025: 980 ÷ 10.400 = 9,4% — queda de 3,6 p.p.; o lucro líquido caiu 21,6% (1.250 → 980) enquanto a receita subiu 8,3%. Decompondo a passagem do lucro operacional ao líquido: o resultado financeiro piorou de −640 para −820 (+28,1%), passando de 6,7% para 7,9% da receita — consequência da dívida financeira maior (7.650 → 8.520) e mais cara; o lucro antes do IR caiu 21,3% (1.780 → 1.400). O IR/CS caiu de 530 para 420 (−20,8%), mas isso não é melhora: a alíquota efetiva ficou em ~30% nos dois anos (29,8% e 30,0%); o imposto caiu porque o lucro tributável caiu. Separando os efeitos: da queda de 3,6 p.p. na margem líquida, cerca de 3,9 p.p. vieram da operação (margem operacional 25,2% → 21,3%, por causa do CPV), o financeiro tirou mais 1,2 p.p. (6,7% → 7,9%) e o IR devolveu ~1,5 p.p. (5,5% → 4,0% da receita) por ser proporcional ao lucro menor. O acionista ficou com R$ 9,40 de cada R$ 100 vendidos, contra R$ 13,00 em 2024 — ainda uma margem alta frente a um varejista (3,3%), mas em deterioração clara, com o custo industrial como causa principal e os juros como agravante.',
    },
    explanation:
      'A margem líquida junta operação, financeiro e imposto. Para dizer "quanto é cada coisa", compare a variação da margem operacional (operação), da A.V. do resultado financeiro (dívida) e da A.V. do IR (que acompanha o lucro). IR menor com lucro menor não é economia.',
    reasoningSteps: [
      'Calcule LL ÷ Receita nos dois anos.',
      'Calcule a variação da margem operacional (efeito operação).',
      'Calcule a variação da A.V. do resultado financeiro (efeito dívida).',
      'Confira a alíquota efetiva (IR ÷ LAIR) para ver se o IR mudou de verdade.',
    ],
    commonMistake: 'Comemorar a queda do IR como se fosse eficiência tributária, quando ele só acompanhou o lucro menor.',
    rule: 'Margem operacional, A.V. do financeiro e alíquota efetiva do IR — três números que explicam toda a diferença entre margem operacional e líquida.',
    formula: 'Margem Líquida = Lucro Líquido ÷ Receita Líquida × 100',
    hint: 'O IR caiu 20,8%: a alíquota mudou ou o lucro mudou?',
    concept: 'O resultado financeiro é o efeito das dívidas sobre o lucro; o IR é proporcional ao lucro antes do imposto.',
    source: SRC_MARGENS,
  }),
  roteiroEssay(I, {
    id: 'roti-008',
    topic: 'roe',
    subtopic: 'Parte 2 — ROE e o acionista',
    skill: 'rot-roe-acionista',
    part: 2,
    order: 8,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'Questão 8: Calcule o ROE da Mecânica Pesada Araguaia em 2024 e 2025. Como acionista, você estaria satisfeito? Justifique comparando com o ano anterior, com o custo de oportunidade do capital e com o custo da dívida que a empresa paga.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'ROE 2025 = 980 ÷ 12.140 = 8,1%.', points: 3, keywords: [...K('roe', 8.1), ...K('roe', 8.07), ...K('retorno', 8.1)] },
        { id: 'c2', description: 'ROE 2024 = 1.250 ÷ 11.700 = 10,7%.', points: 2, keywords: [...K('roe', 10.7), ...K('roe', 10.68), ...K('retorno', 10.7)] },
        { id: 'c3', description: 'Mostra a fórmula com os números (LL 980 e PL 12.140).', points: 2, keywords: [...KV('liquido', 980), ...KV(['pl'], 12140), ...KV('patrimonio', 12140)] },
        { id: 'c4', description: 'Julga comparativamente: queda de 2,6 p.p.; custo de oportunidade (Selic/CDI/renda fixa); custo da dívida (~9,6%) acima do ROE; pares do setor.', points: 2, keywords: [['custo de oportunidade'], ['custo de capital'], ['selic'], ['cdi'], ['renda fixa'], ['pares'], ['custo da divida'], ['juros', 'maior que o roe'], ['abaixo do custo']] },
        { id: 'c5', description: 'Identifica a origem: a queda veio da margem (CPV), com PL maior (lucro retido) e mais dívida — alavancagem trabalhando contra.', points: 1, keywords: [['margem'], ['cpv'], ['custo'], ['retido'], ['alavanc']] },
      ],
      seriousErrors: [ERR_MARGEM_ATIVO, ERR_JULGAMENTO_ABSOLUTO, ERR_ROE_INDUSTRIA],
      modelAnswer:
        'ROE = Lucro Líquido ÷ Patrimônio Líquido. 2024: 1.250 ÷ 11.700 = 10,7%; 2025: 980 ÷ 12.140 = 8,1% — queda de 2,6 p.p.: cada R$ 100 deixados na empresa devolveram R$ 8,10, contra R$ 10,70 no ano anterior. Como acionista, dificilmente satisfeito, por três comparações. (1) Com o ano anterior: piorou, e piorou com a empresa vendendo mais (+8,3%) e com mais capital próprio aplicado (PL +440, lucro retido). (2) Com o custo de oportunidade: se a renda fixa (Selic/CDI) paga algo na casa de dois dígitos com risco baixo, 8,1% não remunera o risco de uma indústria cíclica. (3) Com o custo da própria dívida: o resultado financeiro de −820 sobre uma dívida de 8.520 equivale a cerca de 9,6% ao ano — a empresa paga aos credores mais do que entrega aos sócios, sinal de que a alavancagem (2,10) está trabalhando contra o acionista. A origem da queda está na margem: a margem líquida caiu de 13,0% para 9,4% porque o CPV cresceu 15,6% contra 8,3% da receita; giro (0,40 → 0,41) e alavancagem (2,05 → 2,10) até subiram. Para fechar o julgamento, comparar com pares de bens de capital — mas, por qualquer referência, a tendência é de deterioração e exige ação no custo industrial e na dívida.',
    },
    explanation:
      'ROE é a pergunta do dono e se julga por comparação: ano anterior, custo de oportunidade, custo da dívida e pares. Quando o custo da dívida supera o ROE, a alavancagem destrói valor para o acionista — é o caso aqui, e isso muda a prioridade das ações da Parte 3.',
    reasoningSteps: [
      'Calcule LL ÷ PL em cada ano.',
      'Compare 2025 com 2024 em p.p. e note que o PL cresceu (lucro retido) enquanto o lucro caiu.',
      'Compare com o custo de oportunidade e com o custo da dívida (financeiro ÷ dívida).',
      'Pergunte de onde veio a queda (DuPont) antes de julgar.',
    ],
    commonMistake: 'Dividir o lucro pelo Ativo (25.500) ou dizer "8,1% é ruim" sem explicar em relação a quê.',
    rule: 'ROE = LL ÷ PL; compare com ano anterior, custo de capital, custo da dívida e pares — e explique a origem.',
    formula: 'ROE = Lucro Líquido ÷ Patrimônio Líquido × 100',
    hint: 'Quanto a empresa paga de juros em relação à dívida? É mais ou menos que o ROE?',
    concept: 'O ROE mede o retorno do capital dos sócios; alavancagem só ajuda quando o retorno da operação supera o custo da dívida.',
    source: SRC_ROE,
  }),
  roteiroEssay(I, {
    id: 'roti-009',
    topic: 'dupont',
    subtopic: 'Parte 2 — DuPont 2025 × 2024',
    skill: 'rot-dupont-comparativo',
    part: 2,
    order: 9,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 9: Decomponha o ROE de 2025 pelo DuPont (Margem Líquida × Giro do Ativo × Alavancagem) e compare com 2024. Qual fator explica a queda do ROE e o que os outros dois fatores dizem sobre a alavancagem como "faca de dois gumes"?',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Margem líquida 13,0% (2024) → 9,4% (2025): o fator que caiu.', points: 2, keywords: [...K('margem', 9.4), ...K('margem', 13.0)] },
        { id: 'c2', description: 'Giro 0,40 (9.600 ÷ 24.000) → 0,41 (10.400 ÷ 25.500): praticamente estável, leve alta.', points: 2, keywords: [...K('giro', [0.41, 2], [0.4, 2], 0.4)] },
        { id: 'c3', description: 'Alavancagem 2,05 (24.000 ÷ 11.700) → 2,10 (25.500 ÷ 12.140): subiu.', points: 2, keywords: [...K('alavanc', [2.10, 2], [2.05, 2], 2.1)] },
        { id: 'c4', description: 'ROE 10,7% → 8,1% e o produto confere com LL ÷ PL.', points: 2, keywords: [...K('roe', 8.1), ...K('roe', 10.7)] },
        { id: 'c5', description: 'Conclui: a queda veio da margem (CPV); giro e alavancagem subiram e não compensaram — mais dívida com retorno menor é a faca de dois gumes cortando contra.', points: 2, keywords: [['margem', 'caiu'], ['veio da margem'], ['cpv'], ['dois gumes'], ['alavanc', 'contra'], ['nao compens']] },
      ],
      seriousErrors: [ERR_ROE_INDUSTRIA, ERR_MARGEM_ATIVO],
      modelAnswer:
        'DuPont 2025: Margem líquida 980 ÷ 10.400 = 9,42% × Giro 10.400 ÷ 25.500 = 0,41 × Alavancagem 25.500 ÷ 12.140 = 2,10 → ROE = 8,1% (confere com 980 ÷ 12.140). DuPont 2024: 1.250 ÷ 9.600 = 13,02% × 9.600 ÷ 24.000 = 0,40 × 24.000 ÷ 11.700 = 2,05 → 10,7%. Fator a fator: a margem líquida CAIU de 13,0% para 9,4% (−3,6 p.p.), porque o CPV cresceu 15,6% contra 8,3% da receita e o financeiro piorou 28,1%; o giro SUBIU levemente (0,40 → 0,41), pois a receita (+8,3%) cresceu mais que o ativo (+6,3%); a alavancagem SUBIU (2,05 → 2,10), com a dívida financeira indo de 7.650 para 8.520. Se margem tivesse ficado em 13,0%, o ROE de 2025 seria 13,0% × 0,41 × 2,10 = 11,2% — ou seja, giro e alavancagem teriam elevado o retorno; foi a margem que derrubou tudo. Sobre a faca de dois gumes: a alavancagem maior deveria multiplicar o ROE, mas só multiplica o que a operação entrega acima do custo da dívida; com margem × giro (retorno sobre o ativo) caindo de 5,2% para 3,8% líquidos e juros de ~9,6% sobre a dívida, cada real emprestado a mais rendeu menos do que custou — a mesma alavanca que amplia o lucro nos anos bons amplia a queda nos anos ruins. Qualidade: o problema é operacional (custo industrial), e a dívida o agrava.',
    },
    explanation:
      'O DuPont isola o fator responsável: aqui margem caiu, giro e alavancagem subiram. Quando o ROE cai apesar de mais alavancagem, o retorno da operação ficou abaixo do custo da dívida — o lado ruim da faca de dois gumes. Simular "e se a margem fosse a de 2024?" ajuda a provar a conclusão.',
    reasoningSteps: [
      'Calcule os três fatores de cada ano com dados do mesmo ano.',
      'Multiplique e confira com LL ÷ PL.',
      'Compare fator a fator e identifique o que caiu (margem) e o que subiu (giro, alavancagem).',
      'Simule o ROE com a margem antiga para medir o peso do fator; relacione alavancagem com custo da dívida.',
    ],
    commonMistake: 'Atribuir a queda do ROE à alavancagem ou ao giro — ambos subiram; o que caiu foi a margem.',
    rule: 'Para explicar a variação do ROE, compare os três fatores do DuPont e atribua a variação apenas ao que mudou na direção do ROE.',
    formula: 'ROE = (LL ÷ Receita) × (Receita ÷ Ativo) × (Ativo ÷ PL)',
    hint: 'Dois fatores subiram e o ROE caiu. Qual é o terceiro?',
    concept: 'DuPont: ROE = margem × giro × alavancagem; a alavancagem multiplica o retorno sobre o ativo, para cima ou para baixo.',
    source: SRC_ROE,
  }),
  roteiroEssay(I, {
    id: 'roti-010',
    topic: 'estrategia',
    subtopic: 'Parte 3 — custo × diferenciação',
    skill: 'rot-custo-diferenciacao',
    part: 3,
    order: 10,
    difficulty: 'medium',
    level: 'analysis',
    stem: 'PARTE 3 — Estratégia. Questão 10: Pelos números das demonstrações, a vantagem competitiva da Mecânica Pesada Araguaia está mais próxima de diferenciação (margem) ou de custo/volume (giro)? Sustente com margens, giro e A.V. do ativo, e explique o que a queda da margem bruta significa para essa estratégia.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Usa o giro baixo (0,41) e/ou a margem bruta (36,0%) e operacional (21,3%) altas como evidência.', points: 3, keywords: [...K('giro', [0.41, 2], 0.4), ...K('bruta', 36.0), ...K('operacional', 21.3)] },
        { id: 'c2', description: 'Cita o imobilizado (54,5% do ativo) ou a margem líquida (9,4%) como assinatura de negócio intensivo em capital e margem.', points: 2, keywords: [...K('imobiliz', 54.5), ...KV('imobiliz', 13900), ...K('liquida', 9.4)] },
        { id: 'c3', description: 'Nomeia a estratégia (diferenciação/margem/valor agregado/sob encomenda) e justifica.', points: 3, keywords: [['diferencia'], ['valor agregado'], ['sob encomenda'], ['tecnolog'], ['premium'], ['margem alta']] },
        { id: 'c4', description: 'Liga a queda da margem bruta (40,0% → 36,0%; CPV +15,6%) à perda de poder de repasse — ameaça ao núcleo da estratégia; compara com o perfil de custo/volume (giro alto, margem fina).', points: 2, keywords: [...K('bruta', 40.0), ...K('cpv', 15.6), ['repass'], ['preco', 'custo'], ['giro alto', 'margem'], ['volume', 'margem fina']] },
      ],
      seriousErrors: [
        { description: 'Lê o giro de 0,41 como "alto" ou a margem líquida de 9,4% como "fina" (inverte o perfil).', patterns: ['giro alto', 'giro e alto', 'margem fina', 'margem liquida baixa', 'margens baixas'], penalty: 1 },
      ],
      modelAnswer:
        'Os números apontam para uma estratégia de diferenciação (margem), não de custo/volume. Evidências: o giro é baixo, 0,41 (cada R$ 1 de ativo gera apenas R$ 0,41 de vendas por ano, contra 1,45 num varejista), porque 54,5% do ativo são fábricas e máquinas (13.900) e os estoques são produtos em elaboração de longo ciclo; para remunerar tanto capital a empresa precisa — e tem — margens altas: bruta de 36,0%, operacional de 21,3% e líquida de 9,4% (um varejista opera com 3,3% líquida). A presença de adiantamentos de clientes (700) e de intangível (1.540, tecnologia/projetos) sugere equipamentos sob encomenda, com valor agregado e preço negociado por projeto — o cliente paga pela especificação, não pelo menor preço. O ROE depende da margem, não do giro: é o jeito "caipirinha" da barraca de praia. Por isso a queda da margem bruta de 40,0% para 36,0% (CPV +15,6% contra receita +8,3%) ataca o núcleo da estratégia: se a empresa não consegue repassar aço, energia e mão de obra ao preço, a diferenciação está perdendo força — ou os contratos foram fechados a preços antigos, ou a concorrência pressiona. Uma estratégia de custo/volume mostraria giro alto e margem fina, o oposto deste perfil. Comparar com pares de bens de capital é a referência para saber se 36,0% de margem bruta ainda é diferenciação ou já é média de mercado.',
    },
    explanation:
      'Margem alta + giro baixo + ativo dominado por imobilizado é a assinatura de diferenciação/valor agregado em negócio intensivo em capital. Quando a margem bruta cai 4 p.p., a estratégia está sendo testada: diferenciação só existe se o preço acompanha o custo.',
    reasoningSteps: [
      'Compare margem líquida e giro: qual sustenta o ROE?',
      'Veja a A.V. do ativo (imobilizado) e as linhas típicas (adiantamentos, intangível).',
      'Nomeie a estratégia e descreva o perfil numérico oposto.',
      'Relacione a tendência da margem bruta com a sustentabilidade da estratégia.',
    ],
    commonMistake: 'Dizer "custo, porque o CPV é a maior linha" — toda indústria tem CPV grande; o que define a estratégia é a combinação margem × giro.',
    rule: 'Diferenciação aparece como margem alta e giro baixo; custo/volume, como margem fina e giro alto — prove com os números e teste a tendência.',
    hint: 'Com giro de 0,41, de onde pode vir o ROE senão da margem?',
    concept: 'Custo × diferenciação são as duas vantagens competitivas básicas, e cada uma deixa uma assinatura nas margens, no giro e na composição do ativo.',
    source: SRC_ESTR,
  }),
  roteiroEssay(I, {
    id: 'roti-011',
    topic: 'estrategia',
    subtopic: 'Parte 3 — riscos do negócio',
    skill: 'rot-riscos',
    part: 3,
    order: 11,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 11: Aponte pelo menos três riscos relevantes do negócio da Mecânica Pesada Araguaia, cada um sustentado por números das demonstrações (valores, A.V. ou A.H.), e explique a consequência de cada um para o lucro ou para o caixa.',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Risco de custo/margem: CPV +15,6% contra receita +8,3%; margem bruta 36,0% (de 40,0%).', points: 2, keywords: [...K('cpv', 15.6), ...K('custo', 15.6), ...K('bruta', 36.0), ...K('cpv', 64.0)] },
        { id: 'c2', description: 'Risco financeiro: dívida 8.520 (33,4% do total), resultado financeiro −820 (+28,1%), alavancagem 2,10, custo da dívida acima do ROE de 8,1%.', points: 2, keywords: [...KV('divida', 8520), ...K('divida', 33.4), ...KV('financeiro', 820), ...K('financeiro', 28.1), ...K('alavanc', [2.10, 2], 2.1), ...K('roe', 8.1)] },
        { id: 'c3', description: 'Risco de ativos fixos/giro: imobilizado 13.900 (54,5%), giro 0,41 — custos fixos altos se a demanda por bens de capital cair (ciclo, juros).', points: 2, keywords: [...KV('imobiliz', 13900), ...K('imobiliz', 54.5), ...K('giro', [0.41, 2], 0.4), ['ciclo'], ['custos fixos'], ['capacidade ociosa']] },
        { id: 'c4', description: 'Risco de capital de giro: estoques +13,0% (3.050) e recebíveis +12,1% (2.690) acima da receita; caixa −16,4% (1.380).', points: 2, keywords: [...KV('estoque', 3050), ...K('estoque', 13.0), ...KV('receb', 2690), ...K('receb', 12.1), ...KV('caixa', 1380), ...K('caixa', 16.4)] },
        { id: 'c5', description: 'Explica a consequência (alavancagem amplia a queda, juros maiores que o retorno, caixa para rolar dívida, estoque encalhado).', points: 2, keywords: [['dois gumes'], ['amplia'], ['queda de vendas'], ['demanda cair'], ['rolar'], ['refinanc'], ['consequencia'], ['encalh']] },
      ],
      seriousErrors: [
        ERR_LC_INSOLVENCIA,
        { description: 'Afirma que não há riscos relevantes ou aponta liquidez como o risco principal (LC 1,55 é folga; os riscos estão em margem e dívida).', patterns: ['nao ha risco', 'sem riscos', 'nenhum risco', 'principal risco e a liquidez', 'maior risco e a liquidez'], penalty: 2 },
      ],
      modelAnswer:
        'Riscos sustentados pelas demonstrações: (1) Custo industrial sem repasse: o CPV cresceu 15,6% contra 8,3% da receita e a margem bruta caiu de 40,0% para 36,0% (A.V. do CPV 60,0% → 64,0%); mais 4 p.p. de perda levariam o lucro operacional (2.220) para perto de 1.800 e o lucro líquido (980) para cerca de 700. (2) Dívida cara e crescente: a dívida financeira é de 8.520 (33,4% do passivo + PL; +11,4%), o resultado financeiro piorou 28,1% (−640 → −820), consome 7,9% da receita e custa cerca de 9,6% ao ano — mais que o ROE de 8,1%; com alavancagem de 2,10, a alavanca amplia a queda do lucro e qualquer alta de juros reduz diretamente o lucro líquido. (3) Ativos fixos e giro baixo: imobilizado de 13.900 (54,5% do ativo) e giro de 0,41 significam custos fixos elevados (depreciação, fábrica); bens de capital são cíclicos — se as empresas clientes adiarem investimentos (juros altos, recessão), a receita cai e os custos fixos não — a margem operacional de 21,3% derrete rápido. (4) Capital de giro inchando: estoques +13,0% (3.050) e recebíveis +12,1% (2.690) crescem acima da receita enquanto o caixa cai 16,4% (1.380) — produto em elaboração sem contrato firme vira encalhe, e o caixa menor reduz a capacidade de amortizar os 1.520 de dívida de curto prazo (a LC de 1,55 ainda é folga, mas de qualidade menor). (5) Dependência de poucos clientes/projetos grandes, sugerida pelos adiantamentos (700) — cancelamento de um contrato afeta estoques e receita. A gravidade deve ser comparada com os pares do setor e com o histórico da empresa.',
    },
    explanation:
      'Na indústria pesada os riscos nascem da margem (custo sem repasse), da dívida (juros acima do retorno) e dos ativos fixos (ciclo e capacidade ociosa). Cada risco precisa do número que o sustenta e da consequência no lucro ou no caixa; a liquidez aqui é folga, não o risco principal.',
    reasoningSteps: [
      'Marque os números que pioraram (CPV, margem bruta, financeiro, caixa, estoques).',
      'Transforme cada um em mecanismo: o que acontece se a tendência continuar?',
      'Quantifique: quanto do lucro de 980 some com mais 1 p.p. de CPV (104) ou com mais R$ 100 de juros?',
      'Ordene pela gravidade e ligue à alavancagem (amplificador).',
    ],
    commonMistake: 'Listar "liquidez" como risco principal por reflexo, quando a LC é 1,55 e o problema está na margem e na dívida.',
    rule: 'Cada risco = número da DF + mecanismo + consequência no lucro ou no caixa; priorize os que a alavancagem amplia.',
    hint: 'Comece pelo que mais piorou: margem bruta (−4 p.p.) e resultado financeiro (+28,1%).',
    concept: 'Risco do negócio é a chance de um número das DFs se mover contra a empresa; ativos fixos e dívida ampliam o efeito.',
    source: SRC_ESTR,
  }),
  roteiroEssay(I, {
    id: 'roti-012',
    topic: 'estrategia',
    subtopic: 'Parte 3 — ações concretas',
    skill: 'rot-acoes',
    part: 3,
    order: 12,
    difficulty: 'hard',
    level: 'analysis',
    stem: 'Questão 12: Proponha pelo menos três ações concretas para recuperar as margens e a rentabilidade da Mecânica Pesada Araguaia, indicando para cada uma a linha da DRE ou do Balanço afetada, o número atual dessa linha e o efeito esperado (margem, ROE, resultado financeiro, giro).',
    rubric: {
      criteria: [
        { id: 'c1', description: 'Ação sobre o CPV (64,0% da receita; 6.660; +15,6%): repasse de preço/reajuste contratual, insumos, produtividade → margem bruta de volta aos 40%.', points: 3, keywords: [...K('cpv', 64.0), ...KV('cpv', 6660), ...K('cpv', 15.6), ...K('custo', 64.0), ...KV('custo', 6660), ...K('bruta', 36.0), ...K('bruta', 40.0)] },
        { id: 'c2', description: 'Ação sobre a dívida: amortizar/renegociar os 8.520 (usar parte dos 2.200 de caixa + aplicações, trocar dívida cara), reduzindo o financeiro de −820 → margem líquida e ROE.', points: 3, keywords: [...KV('divida', 8520), ...KV('financeiro', 820), ...KV('emprest', 5400, 1520), ...KV('caixa', 2200, 1380), ['amortiz'], ['renegoci'], ['alongar']] },
        { id: 'c3', description: 'Ação sobre o giro/ativo: reduzir estoques (3.050, +13,0%), acelerar recebíveis (2.690), vender ativo ocioso (imobilizado 13.900) → giro acima de 0,41 e caixa.', points: 2, keywords: [...KV('estoque', 3050), ...K('estoque', 13.0), ...KV('receb', 2690), ...KV('imobiliz', 13900), ...K('giro', [0.41, 2], 0.4), ['ocioso']] },
        { id: 'c4', description: 'Ação sobre dividendos/PL ou sobre mix e preço: reter mais lucro (dividendos 300; PL 12.140) enquanto o ROE (8,1%) está abaixo do custo da dívida; ou priorizar projetos de maior valor agregado.', points: 1, keywords: [...KV('dividend', 300), ...KV(['pl'], 12140), ...K('roe', 8.1), ['mix'], ['valor agregado'], ['reter', 'lucro']] },
        { id: 'c5', description: 'Explicita a linha afetada e o efeito esperado em cada ação.', points: 1, keywords: [['linha'], ['afeta'], ['impacto'], ['efeito'], ['reflete']] },
      ],
      seriousErrors: [
        { description: 'Propõe tomar mais dívida ou cortar as despesas operacionais como ação principal (as despesas já caíram em A.V.; a dívida já custa mais que o ROE).', patterns: ['tomar mais emprestimos', 'aumentar a divida', 'mais divida', 'cortar as despesas administrativas como principal', 'principal acao e cortar despesas'], penalty: 1 },
      ],
      modelAnswer:
        'Ações ligadas às linhas: (1) Atacar o CPV, hoje 64,0% da receita (6.660, +15,6%): incluir cláusulas de reajuste de aço e energia nos contratos de venda, renegociar insumos, ganhar produtividade na fábrica e priorizar projetos de maior valor agregado; cada 1 p.p. de CPV sobre 10.400 de receita vale R$ 104 milhões de lucro bruto — voltar à margem bruta de 40,0% devolveria cerca de R$ 420 milhões e levaria a operacional de 21,3% de volta a ~25%. (2) Reduzir e baratear a dívida: a dívida financeira de 8.520 custa −820 por ano (7,9% da receita, ~9,6% a.a.), mais que o ROE de 8,1%; usar parte do caixa + aplicações (2.200) para amortizar os 1.520 de curto prazo e trocar debêntures/empréstimos caros por linhas mais baratas e longas reduz o resultado financeiro e recupera margem líquida (9,4%) — cada R$ 100 a menos de juros são ~R$ 70 a mais de lucro líquido. (3) Aumentar o giro: reduzir estoques (3.050, +13,0%, acima da receita) produzindo contra pedido firme, acelerar recebíveis (2.690) e vender máquinas ociosas do imobilizado (13.900) — isso levanta caixa, diminui o ativo e eleva o giro acima de 0,41, além de reduzir a necessidade de dívida. (4) Rever a distribuição: com o ROE em 8,1% abaixo do custo da dívida, reter mais lucro (dividendos a pagar 300; PL 12.140) e usá-lo para amortizar dívida reduz a alavancagem (2,10) e os juros. (5) Manter as despesas sob controle (vendas 6,6% e administrativas 8,0% da receita), que já foram diluídas — não é aí que está o problema. Efeito combinado: margem líquida de volta a dois dígitos e ROE acima do custo da dívida, a ser comparado com o ano anterior e com os pares.',
    },
    explanation:
      'As ações da Parte 3 decorrem do diagnóstico: margem bruta caiu (CPV), juros superam o ROE (dívida) e capital de giro inchou (estoques, recebíveis). Cada ação precisa indicar a linha, o número atual e o indicador que muda — e evitar remédios para o que não está doente (despesas).',
    reasoningSteps: [
      'Volte ao diagnóstico: quais linhas pioraram (CPV, financeiro, estoques, caixa)?',
      'Proponha uma medida administrável para cada linha (preço/contrato, dívida, estoques, payout).',
      'Diga o indicador afetado (margem bruta, líquida, ROE, giro, alavancagem).',
      'Estime o efeito (1 p.p. de CPV = R$ 104 milhões; R$ 100 de juros = ~R$ 70 de lucro líquido).',
    ],
    commonMistake: 'Propor "cortar despesas" por reflexo, quando a A.V. das despesas já caiu e o problema está no CPV e nos juros.',
    rule: 'Ação concreta = linha da DF + número atual + medida + indicador afetado; ataque o que piorou.',
    hint: 'Comece pela linha que mais cresceu (CPV +15,6%) e pela que custa mais que o ROE (juros).',
    concept: 'Margens e rentabilidade mudam quando uma linha específica muda; a ação deve apontar essa linha e o efeito esperado.',
    source: SRC_ESTR,
  }),
];

// ---------------------------------------------------------------------------------------------
// Questões objetivas de treino sobre os dois casos (rot-001 … rot-008)

const VB25 = VAREJO_BP25;
const VD25 = VAREJO_DRE25;
const IB25 = INDUSTRIA_BP25;
const ID25 = INDUSTRIA_DRE25;

const TREINO: Question[] = [
  {
    id: 'rot-001',
    type: 'numeric',
    topic: 'liquidez',
    subtopic: 'LC do caso de varejo',
    skill: 'lc-calculo',
    caseTag: V.tag,
    dataSource: 'ficticio',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX(V),
    stem: 'Com base no Balanço de 31/12/2025 da Lojas Primavera, calcule a Liquidez Corrente. Arredonde para 2 casas decimais.',
    tables: [annex(V)[0], annex(V)[1]],
    correct: 0.99,
    unit: 'ratio',
    decimals: 2,
    calc: { fn: 'liquidezCorrente', args: [VB25.ativoCirculante, VB25.passivoCirculante] },
    solution: {
      formula: 'LC = Ativo Circulante ÷ Passivo Circulante',
      substitution: `${fmt(VB25.ativoCirculante)} ÷ ${fmt(VB25.passivoCirculante)}`,
      computation: `= ${dec(VI25.lc, 4)}`,
      result: dec(VI25.lc),
      unit: 'vezes (R$ de AC por R$ 1 de PC)',
      interpretation: `Para cada R$ 1 de obrigação de curto prazo há R$ ${dec(VI25.lc)} de recursos de curto prazo — no limite (era ${dec(VI24.lc)} em 2024). Atenção, não insolvência: 67% do PC são cartões e fornecedores que se renovam com as vendas.`,
    },
    explanation:
      'A Liquidez Corrente compara o que vira dinheiro em 12 meses (AC) com o que vence em 12 meses (PC). Use os subtotais dos grupos, não o Ativo Total nem o Passivo Total. O índice caiu de 1,08 para 0,99 porque o caixa caiu e o PC cresceu com empréstimos de curto prazo.',
    reasoningSteps: ['Localize o subtotal do Ativo Circulante (6.190).', 'Localize o subtotal do Passivo Circulante (6.260).', 'Divida AC por PC.', 'Leia pela regra de bolso e pela composição.'],
    commonMistake: 'Usar Ativo Total ÷ Passivo Total (11.160 ÷ 7.700 = 1,45), que não mede prazo.',
    rule: 'LC = AC ÷ PC, sempre com os subtotais dos circulantes do mesmo balanço.',
    formula: 'LC = Ativo Circulante ÷ Passivo Circulante',
    hint: 'Os dois subtotais estão em negrito nas tabelas: Circulante do ativo e Circulante do passivo.',
    concept: 'Liquidez Corrente mede quantos reais de curto prazo existem para cada real de obrigação de curto prazo.',
    sourceReference: SRC_LC,
    balanceCheck: balanceCheck(V),
  },
  {
    id: 'rot-002',
    type: 'multiple-choice',
    topic: 'margens',
    subtopic: 'Margem bruta do caso industrial',
    skill: 'margem-bruta-calculo',
    caseTag: I.tag,
    dataSource: 'ficticio',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX(I),
    stem: 'Qual é a margem bruta da Mecânica Pesada Araguaia em 2025?',
    tables: [annex(I)[2]],
    options: [
      { id: 'A', text: '40,0%', whyWrong: 'É a margem bruta de 2024 (3.840 ÷ 9.600). A pergunta é sobre 2025.' },
      { id: 'B', text: '64,0%', whyWrong: 'É a A.V. do CPV (6.660 ÷ 10.400), ou seja, a parte da receita consumida pelo custo — a margem bruta é o complemento.' },
      { id: 'C', text: '36,0%' },
      { id: 'D', text: '21,3%', whyWrong: 'É a margem operacional (2.220 ÷ 10.400), que já desconta as despesas com vendas e administrativas.' },
      { id: 'E', text: '−2,6%', whyWrong: 'É a A.H. do lucro bruto (3.740 ÷ 3.840 − 1), uma variação no tempo, não uma margem.' },
    ],
    correct: 'C',
    calc: { fn: 'margem', args: [ID25.lucroBruto, ID25.receitaLiquida] },
    solution: {
      formula: 'Margem Bruta = Lucro Bruto ÷ Receita Líquida × 100',
      substitution: `${fmt(ID25.lucroBruto)} ÷ ${fmt(ID25.receitaLiquida)} × 100`,
      computation: `= ${pct(II25.mb, 2)}`,
      result: pct(II25.mb),
      unit: '% da receita líquida',
      interpretation: `De cada R$ 100 vendidos sobram R$ ${dec(II25.mb)} depois do CPV — eram R$ ${dec(II24.mb)} em 2024: o custo cresceu mais rápido que a receita.`,
    },
    explanation:
      'Margem bruta é Lucro Bruto sobre Receita Líquida. A tabela do anexo já traz a A.V. do lucro bruto (36,0%), que é exatamente a margem bruta; a A.V. do CPV (64,0%) é o complemento, e a A.H. mede variação, não margem.',
    reasoningSteps: ['Localize Lucro Bruto e Receita líquida de 2025.', 'Divida e multiplique por 100.', 'Confira com a coluna A.V.% 25 da linha do Lucro Bruto.', 'Compare com 2024 (40,0%).'],
    commonMistake: 'Confundir a A.V. do CPV (64,0%) com a margem bruta, ou pegar a A.H. (−2,6%).',
    rule: 'Margem = lucro do degrau ÷ receita líquida; a coluna A.V. da DRE já é a margem de cada degrau.',
    formula: 'MB = LB ÷ Receita Líquida × 100',
    hint: 'Olhe a coluna A.V.% 25 na linha "= Lucro Bruto".',
    concept: 'A margem bruta responde "o produto é rentável?" — quanto sobra de cada R$ 100 depois do custo do produto.',
    sourceReference: SRC_MARGENS,
  },
  {
    id: 'rot-003',
    type: 'numeric',
    topic: 'roe',
    subtopic: 'ROE do caso industrial',
    skill: 'roe-calculo',
    caseTag: I.tag,
    dataSource: 'ficticio',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX(I),
    stem: 'Calcule o ROE da Mecânica Pesada Araguaia em 2025, usando o Patrimônio Líquido de 31/12/2025. Responda em %, com 2 casas decimais.',
    tables: [annex(I)[1], annex(I)[2]],
    correct: 8.07,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'roe', args: [ID25.lucroLiquido, IB25.patrimonioLiquido] },
    solution: {
      formula: 'ROE = Lucro Líquido ÷ Patrimônio Líquido × 100',
      substitution: `${fmt(ID25.lucroLiquido)} ÷ ${fmt(IB25.patrimonioLiquido)} × 100`,
      computation: `= ${pct(II25.roe, 2)}`,
      result: pct(II25.roe, 2),
      unit: '% sobre o capital próprio',
      interpretation: `Cada R$ 100 dos sócios renderam R$ ${dec(II25.roe)} em 2025, contra R$ ${dec(II24.roe)} em 2024 — queda explicada pela margem (CPV +15,6%). Julgue comparando com o custo de capital e com os pares.`,
    },
    explanation:
      'O ROE divide o lucro líquido da DRE pelo PL do Balanço — a ponte entre as duas demonstrações. O denominador é o PL (12.140), não o Ativo Total (25.500): lucro sobre ativo seria outro indicador (margem × giro).',
    reasoningSteps: ['Pegue o Lucro Líquido de 2025 na DRE (980).', 'Pegue o PL de 31/12/2025 no Balanço (12.140).', 'Divida e multiplique por 100.', 'Compare com 2024 antes de julgar.'],
    commonMistake: 'Dividir pelo Ativo Total (980 ÷ 25.500 = 3,84%) ou usar o PL de 2024.',
    rule: 'ROE = LL ÷ PL do mesmo ano; o PL é o capital dos sócios, não o ativo.',
    formula: 'ROE = LL ÷ PL × 100',
    hint: 'O denominador é o subtotal "PATRIMÔNIO LÍQUIDO" da tabela do passivo.',
    concept: 'ROE mede o retorno sobre o capital que os sócios deixaram na empresa.',
    sourceReference: SRC_ROE,
    balanceCheck: balanceCheck(I),
  },
  {
    id: 'rot-004',
    type: 'multiple-choice',
    topic: 'ah',
    subtopic: 'A.H. do caixa no caso de varejo',
    skill: 'ah-calculo-bp',
    caseTag: V.tag,
    dataSource: 'ficticio',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX(V),
    stem: 'Qual é a análise horizontal (A.H.) da conta Caixa e equivalentes de caixa da Lojas Primavera entre 2024 e 2025?',
    tables: [annex(V)[0]],
    options: [
      { id: 'A', text: '−5,4%', whyWrong: 'É a variação da A.V. do caixa em pontos percentuais (13,7% → 8,3%), não a A.H. da conta.' },
      { id: 'B', text: '+52,7%', whyWrong: 'Base invertida: 1.420 ÷ 930 − 1. A A.H. usa o ano anterior (2024) como base.' },
      { id: 'C', text: '−65,5%', whyWrong: '930 ÷ 1.420 = 65,5% é o quanto o caixa de 2025 representa do de 2024; faltou subtrair 1 (a variação é −34,5%).' },
      { id: 'D', text: '−34,5%' },
      { id: 'E', text: '−8,3%', whyWrong: 'É a A.V. do caixa em 2025 (930 ÷ 11.160), com sinal trocado; A.V. é composição, não variação.' },
    ],
    correct: 'D',
    calc: { fn: 'analiseHorizontal', args: [VB25.caixa, VAREJO_BP24.caixa] },
    solution: {
      formula: 'A.H. = |2025| ÷ |2024| − 1',
      substitution: `${fmt(VB25.caixa)} ÷ ${fmt(VAREJO_BP24.caixa)} − 1`,
      computation: `= ${dec(VB25.caixa / VAREJO_BP24.caixa, 4)} − 1 = ${pct(ahNum(VB25.caixa, VAREJO_BP24.caixa))}`,
      result: pct(ahNum(VB25.caixa, VAREJO_BP24.caixa)),
      unit: '% de variação sobre 2024',
      interpretation: 'O caixa encolheu um terço em um ano: financiou a expansão das lojas e a dívida nova ainda não repôs. Ligue isso à queda da LC (1,08 → 0,99).',
    },
    explanation:
      'A A.H. mede a variação de uma linha entre dois anos, com o ano anterior como base. Variação de A.V. (em p.p.) e A.V. do ano são conceitos diferentes, e a base invertida troca o sinal e o tamanho da variação.',
    reasoningSteps: ['Pegue o valor de 2025 (930) e o de 2024 (1.420).', 'Divida 2025 por 2024 (0,655).', 'Subtraia 1 e multiplique por 100.', 'Confira com a coluna A.H.% da tabela.'],
    commonMistake: 'Inverter a base (2024 ÷ 2025) ou confundir a variação da A.V. em p.p. com a A.H.',
    rule: 'A.H. = |atual| ÷ |anterior| − 1; o ano antigo é sempre a base.',
    formula: 'A.H. = |2025| ÷ |2024| − 1',
    hint: 'O número da coluna A.H.% da linha do caixa é negativo e grande: por quê?',
    concept: 'A análise horizontal mostra o crescimento ou a queda de cada linha no tempo.',
    sourceReference: SRC_AVAH,
  },
  {
    id: 'rot-005',
    type: 'numeric',
    topic: 'giro',
    subtopic: 'Giro do ativo no caso de varejo',
    skill: 'giro-calculo',
    caseTag: V.tag,
    dataSource: 'ficticio',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX(V),
    stem: 'Calcule o Giro do Ativo da Lojas Primavera em 2025 (receita líquida de 2025 sobre o ativo total de 31/12/2025). Arredonde para 2 casas decimais.',
    tables: [annex(V)[0], annex(V)[2]],
    correct: 1.45,
    unit: 'times',
    decimals: 2,
    calc: { fn: 'giro', args: [VD25.receitaLiquida, VB25.ativoTotal] },
    solution: {
      formula: 'Giro = Receita Líquida ÷ Ativo Total',
      substitution: `${fmt(VD25.receitaLiquida)} ÷ ${fmt(VB25.ativoTotal)}`,
      computation: `= ${dec(VI25.giro, 4)}`,
      result: `${dec(VI25.giro)}x`,
      unit: 'vezes (R$ de receita por R$ 1 de ativo)',
      interpretation: `Cada R$ 1 investido no ativo gerou R$ ${dec(VI25.giro)} de vendas em 2025 (R$ ${dec(VI24.giro)} em 2024). Giro alto é a cara do varejo — a indústria do outro caso gira ${dec(II25.giro)}.`,
    },
    explanation:
      'O giro mede quantos reais de venda cada real de ativo gera por ano. Subiu porque a receita cresceu 12,5% e o ativo 7,9%. É o segundo fator do DuPont: no varejo, é ele (e não a margem) que sustenta o ROE.',
    reasoningSteps: ['Pegue a Receita líquida de 2025 (16.200).', 'Pegue o Ativo Total de 31/12/2025 (11.160).', 'Divida.', 'Compare com 2024 e com o setor.'],
    commonMistake: 'Inverter (Ativo ÷ Receita = 0,69) ou usar o lucro no numerador.',
    rule: 'Giro = Receita ÷ Ativo Total, sempre em vezes; compare com o ano anterior e com o tipo de negócio.',
    formula: 'Giro = Receita Líquida ÷ Ativo Total',
    hint: 'É receita (DRE) sobre ativo (Balanço), não o contrário.',
    concept: 'Giro do Ativo mede a intensidade de uso dos ativos: quantos reais de venda por real investido.',
    sourceReference: SRC_ROE,
  },
  {
    id: 'rot-006',
    type: 'multiple-choice',
    topic: 'alavancagem',
    subtopic: 'Alavancagem do caso industrial',
    skill: 'alavancagem-calculo',
    caseTag: I.tag,
    dataSource: 'ficticio',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX(I),
    stem: 'Qual é a Alavancagem (Ativo Total ÷ Patrimônio Líquido) da Mecânica Pesada Araguaia em 31/12/2025?',
    tables: [annex(I)[1]],
    options: [
      { id: 'A', text: '2,10' },
      { id: 'B', text: '1,10', whyWrong: 'É Passivo ÷ PL (13.360 ÷ 12.140). A alavancagem da disciplina usa o Ativo Total no numerador.' },
      { id: 'C', text: '0,48', whyWrong: 'É PL ÷ Ativo (a A.V. do PL, 47,6%) — o inverso da alavancagem.' },
      { id: 'D', text: '2,05', whyWrong: 'É a alavancagem de 2024 (24.000 ÷ 11.700). A pergunta é sobre 31/12/2025.' },
      { id: 'E', text: '0,41', whyWrong: 'É o Giro do Ativo (10.400 ÷ 25.500), outro fator do DuPont.' },
    ],
    correct: 'A',
    calc: { fn: 'alavancagem', args: [IB25.ativoTotal, IB25.patrimonioLiquido] },
    solution: {
      formula: 'Alavancagem = Ativo Total ÷ PL',
      substitution: `${fmt(IB25.ativoTotal)} ÷ ${fmt(IB25.patrimonioLiquido)}`,
      computation: `= ${dec(II25.alav, 4)}`,
      result: `${dec(II25.alav)}x`,
      unit: 'vezes (R$ de ativo por R$ 1 dos sócios)',
      interpretation: `Cada R$ 1 dos sócios sustenta R$ ${dec(II25.alav)} de ativo (${dec(II24.alav)} em 2024). Subiu com a dívida nova — mas o ROE caiu: a alavanca trabalhou contra.`,
    },
    explanation:
      'Alavancagem = Ativo Total ÷ PL: igual a 1 seria 100% capital próprio; 2,10 significa que terceiros financiam pouco mais da metade do ativo. A A.V. do PL (47,6%) é o inverso desse número.',
    reasoningSteps: ['Pegue o Ativo Total (= Passivo + PL) de 2025 (25.500).', 'Pegue o PL de 2025 (12.140).', 'Divida.', 'Leia junto com o ROE: a alavanca ampliou ou reduziu o retorno?'],
    commonMistake: 'Usar Passivo ÷ PL ou inverter a fração.',
    rule: 'Alavancagem = Ativo ÷ PL; confira que 1 ÷ alavancagem = A.V. do PL.',
    formula: 'Alavancagem = Ativo Total ÷ PL',
    hint: 'O numerador é o total do lado direito (Passivo + PL), que é igual ao Ativo Total.',
    concept: 'Alavancagem mede quantos reais de ativo cada real dos sócios sustenta; amplia o ROE para cima ou para baixo.',
    sourceReference: SRC_ROE,
  },
  {
    id: 'rot-007',
    type: 'multiple-choice',
    topic: 'av',
    subtopic: 'A.V. do imobilizado no caso industrial',
    skill: 'av-calculo-bp',
    caseTag: I.tag,
    dataSource: 'ficticio',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX(I),
    stem: 'Qual é a análise vertical (A.V.) do Imobilizado da Mecânica Pesada Araguaia em 31/12/2025, e o que ela diz sobre o modelo de negócio?',
    tables: [annex(I)[0]],
    options: [
      { id: 'A', text: '7,8% — o imobilizado é pequeno e a empresa é leve em ativos.', whyWrong: '7,8% é a A.H. do imobilizado (crescimento sobre 2024), não a A.V.; a conclusão também está invertida.' },
      { id: 'B', text: '54,5% — mais da metade do ativo está em fábricas e máquinas: negócio intensivo em capital, de giro baixo, que precisa de margem alta.' },
      { id: 'C', text: '82,0% — quase todo o ativo é imobilizado.', whyWrong: '82,0% é o imobilizado sobre o Ativo Não Circulante (13.900 ÷ 16.960); a base da A.V. do Balanço é o Ativo Total.' },
      { id: 'D', text: '133,7% — o imobilizado supera a receita anual.', whyWrong: '13.900 ÷ 10.400 compara Balanço com DRE (é o inverso do giro do imobilizado), não é A.V.' },
      { id: 'E', text: '53,8% — o peso do imobilizado caiu em 2025.', whyWrong: '53,8% é a A.V. de 2024; em 2025 o peso subiu para 54,5%.' },
    ],
    correct: 'B',
    calc: { fn: 'analiseVertical', args: [IB25.imobilizado, IB25.ativoTotal] },
    solution: {
      formula: 'A.V. = Conta ÷ Ativo Total × 100',
      substitution: `${fmt(IB25.imobilizado)} ÷ ${fmt(IB25.ativoTotal)} × 100`,
      computation: `= ${pct(avNum(IB25.imobilizado, IB25.ativoTotal), 2)}`,
      result: pct(avNum(IB25.imobilizado, IB25.ativoTotal)),
      unit: '% do Ativo Total',
      interpretation: 'Mais da metade do ativo é fábrica e máquina: cada R$ 1 de ativo gera só R$ 0,41 de receita (giro baixo), então o ROE depende da margem.',
    },
    explanation:
      'A A.V. do Balanço usa o Ativo Total como base e mostra a composição do investimento. Imobilizado acima de 50% é a assinatura de indústria pesada: ativos enormes, venda lenta, necessidade de margem maior — exatamente o oposto do varejo.',
    reasoningSteps: ['Pegue o Imobilizado (13.900) e o Ativo Total (25.500) de 2025.', 'Divida e multiplique por 100.', 'Compare com 2024 (53,8%).', 'Relacione com o giro (0,41) e com a margem necessária.'],
    commonMistake: 'Usar o ANC ou a receita como base, ou confundir A.V. com A.H.',
    rule: 'A.V. do Balanço = conta ÷ Ativo Total; A.H. = variação no tempo. Não misture.',
    formula: 'A.V. = Conta ÷ Ativo Total × 100',
    hint: 'A coluna A.V.% 25 da linha do Imobilizado responde; a coluna A.H.% é outra coisa.',
    concept: 'A análise vertical mostra quanto cada conta pesa no total e revela o tipo de negócio.',
    sourceReference: SRC_AVAH,
  },
  {
    id: 'rot-008',
    type: 'multi-part',
    topic: 'dupont',
    subtopic: 'DuPont do caso de varejo',
    skill: 'dupont-origem-roe',
    caseTag: V.tag,
    dataSource: 'ficticio',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX(V),
    stem: `Monte o DuPont da Lojas Primavera para 2025 e explique a variação do ROE em relação a 2024 (ROE 2024 = ${pct(VI24.roe)}: margem ${pct(VI24.ml, 2)} × giro ${dec(VI24.giro)} × alavancagem ${dec(VI24.alav)}). Use os valores de 31/12/2025.`,
    tables: annex(V),
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Margem Líquida de 2025 (%, 2 casas).',
        correct: 3.33,
        unit: 'percent',
        decimals: 2,
        points: 2,
        calc: { fn: 'margem', args: [VD25.lucroLiquido, VD25.receitaLiquida] },
        solution: {
          formula: 'ML = LL ÷ Receita Líquida × 100',
          substitution: `${fmt(VD25.lucroLiquido)} ÷ ${fmt(VD25.receitaLiquida)} × 100`,
          computation: `= ${pct(VI25.ml, 2)}`,
          result: pct(VI25.ml, 2),
          unit: '% da receita',
          interpretation: `R$ ${dec(VI25.ml)} de cada R$ 100 vendidos viraram lucro (R$ ${dec(VI24.ml)} em 2024): a margem caiu.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) Giro do Ativo de 2025 (vezes, 2 casas).',
        correct: 1.45,
        unit: 'times',
        decimals: 2,
        points: 2,
        calc: { fn: 'giro', args: [VD25.receitaLiquida, VB25.ativoTotal] },
        solution: {
          formula: 'Giro = Receita Líquida ÷ Ativo Total',
          substitution: `${fmt(VD25.receitaLiquida)} ÷ ${fmt(VB25.ativoTotal)}`,
          computation: `= ${dec(VI25.giro, 4)}`,
          result: `${dec(VI25.giro)}x`,
          unit: 'vezes',
          interpretation: `Subiu de ${dec(VI24.giro)} para ${dec(VI25.giro)}: a receita (+12,5%) cresceu mais que o ativo (+7,9%).`,
        },
      },
      {
        id: 'c',
        kind: 'numeric',
        prompt: 'c) Alavancagem de 2025 (vezes, 2 casas).',
        correct: 3.23,
        unit: 'times',
        decimals: 2,
        points: 2,
        calc: { fn: 'alavancagem', args: [VB25.ativoTotal, VB25.patrimonioLiquido] },
        solution: {
          formula: 'Alavancagem = Ativo Total ÷ PL',
          substitution: `${fmt(VB25.ativoTotal)} ÷ ${fmt(VB25.patrimonioLiquido)}`,
          computation: `= ${dec(VI25.alav, 4)}`,
          result: `${dec(VI25.alav)}x`,
          unit: 'vezes',
          interpretation: `Subiu de ${dec(VI24.alav)} para ${dec(VI25.alav)}: ativo maior financiado por dívida (bancária 380 → 820) com PL estável.`,
        },
      },
      {
        id: 'd',
        kind: 'numeric',
        prompt: 'd) ROE de 2025 pelo DuPont (%, 2 casas).',
        correct: 15.61,
        unit: 'percent',
        decimals: 2,
        points: 2,
        calc: { fn: 'dupontDemonstracoes', args: [VD25.lucroLiquido, VD25.receitaLiquida, VB25.ativoTotal, VB25.patrimonioLiquido] },
        solution: {
          formula: 'ROE = ML × Giro × Alavancagem',
          substitution: `${pct(VI25.ml, 2)} × ${dec(VI25.giro, 4)} × ${dec(VI25.alav, 4)}`,
          computation: `= ${pct(VI25.roe, 2)}`,
          result: pct(VI25.roe, 2),
          unit: '% sobre o capital próprio',
          interpretation: `Confere com LL ÷ PL = ${fmt(VD25.lucroLiquido)} ÷ ${fmt(VB25.patrimonioLiquido)}.`,
        },
      },
      {
        id: 'e',
        kind: 'choice',
        prompt: `e) O ROE subiu de ${pct(VI24.roe)} para ${pct(VI25.roe)}. De onde veio a alta?`,
        points: 2,
        options: [
          { id: 'A', text: 'Da margem líquida: a empresa ficou mais eficiente em cada venda.', whyWrong: `A margem líquida CAIU (${pct(VI24.ml, 2)} → ${pct(VI25.ml, 2)}); ela puxou o ROE para baixo, não para cima.` },
          { id: 'B', text: `Do giro (${dec(VI24.giro)} → ${dec(VI25.giro)}) e da alavancagem (${dec(VI24.alav)} → ${dec(VI25.alav)}), apesar da margem menor — mais vendas por real de ativo e mais dívida sobre um PL estável.` },
          { id: 'C', text: 'Do aumento do Patrimônio Líquido.', whyWrong: 'O PL quase não mudou (3.420 → 3.460); PL maior com o mesmo lucro reduziria o ROE.' },
          { id: 'D', text: 'Da redução das despesas financeiras.', whyWrong: 'O resultado financeiro PIOROU (−110 → −190, +72,7%) por causa da dívida nova.' },
        ],
        correct: 'B',
      },
    ],
    explanation:
      'O DuPont separa o ROE em três motores. Na Lojas Primavera a margem caiu e o ROE subiu mesmo assim, porque o giro e a alavancagem subiram: a melhora veio de volume e de dívida, não de eficiência por venda — um retorno maior com mais risco.',
    reasoningSteps: ['Calcule os três fatores de 2025 com os dados de 2025.', 'Multiplique e confira com LL ÷ PL.', 'Compare cada fator com 2024.', 'Atribua a variação do ROE aos fatores que subiram e qualifique o risco.'],
    commonMistake: 'Dizer que o ROE subiu "porque a empresa ficou mais eficiente", sem notar que a margem caiu.',
    rule: 'Para explicar a variação do ROE, compare os três fatores do DuPont entre os anos e atribua a variação só aos que mudaram.',
    formula: 'ROE = ML × Giro × Alavancagem',
    hint: 'Dos três fatores, um caiu. Qual? Os outros dois explicam a alta.',
    concept: 'DuPont: o ROE pode vir de margem (eficiência por venda), giro (volume por ativo) ou alavancagem (dívida) — e cada origem tem um risco diferente.',
    sourceReference: SRC_ROE,
    balanceCheck: balanceCheck(V),
  },
];

export const questions: Question[] = [...VAREJO_ROTEIRO, ...INDUSTRIA_ROTEIRO, ...TREINO];
