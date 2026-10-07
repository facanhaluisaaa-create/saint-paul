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
