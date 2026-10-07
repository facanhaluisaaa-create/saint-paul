// Fórmulas da disciplina. Percentuais são retornados em "pontos percentuais"
// (ex.: margem de 18% → 18), índices em vezes (ex.: 0,96).

/** A.V. = Conta / Base × 100 (base = Ativo Total, Passivo + PL Total ou Receita Líquida). */
export function analiseVertical(conta: number, base: number): number {
  return (conta / base) * 100;
}

/**
 * A.H. conforme a planilha da disciplina: |Atual| ÷ |Anterior| − 1 (× 100).
 * Para linhas positivas é o mesmo que (Atual − Anterior) / Anterior. Para linhas negativas da DRE
 * (custos, despesas, resultado financeiro negativo) mede a variação do VALOR da linha: CPV de −43.615
 * para −42.864 → −1,72% (o custo caiu); resultado financeiro de −2.318 para −4.002 → +72,6% (a despesa
 * financeira líquida cresceu). Quando o sinal muda (ex.: +61,7 → −82,5) a A.H. não é significativa (n.m.).
 */
export function analiseHorizontal(atual: number, anterior: number): number {
  if (anterior === 0) return NaN;
  if (atual !== 0 && Math.sign(atual) !== Math.sign(anterior)) return NaN;
  return (Math.abs(atual) / Math.abs(anterior) - 1) * 100;
}

/** Variação simples com sinal: (Atual − Anterior) / |Anterior| × 100 — usada quando a questão pede "variação em R$ e %". */
export function variacaoPct(atual: number, anterior: number): number {
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

/** Margem (bruta, operacional ou líquida) = Lucro / Receita Líquida × 100. */
export function margem(lucro: number, receitaLiquida: number): number {
  return (lucro / receitaLiquida) * 100;
}

/** Liquidez Corrente = Ativo Circulante / Passivo Circulante. */
export function liquidezCorrente(ac: number, pc: number): number {
  return ac / pc;
}

/** ROE = Lucro Líquido / Patrimônio Líquido × 100. */
export function roe(lucroLiquido: number, pl: number): number {
  return (lucroLiquido / pl) * 100;
}

/** Giro do Ativo = Receita / Ativo Total. */
export function giro(receita: number, ativoTotal: number): number {
  return receita / ativoTotal;
}

/** Alavancagem = Ativo Total / Patrimônio Líquido. */
export function alavancagem(ativoTotal: number, pl: number): number {
  return ativoTotal / pl;
}

/** DuPont a partir dos fatores: ROE (%) = Margem Líquida (%) × Giro × Alavancagem. */
export function dupont(margemLiquidaPct: number, giroAtivo: number, alav: number): number {
  return margemLiquidaPct * giroAtivo * alav;
}

/** DuPont a partir das demonstrações: (LL/Receita) × (Receita/Ativo) × (Ativo/PL) × 100. */
export function dupontDemonstracoes(ll: number, receita: number, ativo: number, pl: number): number {
  return (ll / receita) * (receita / ativo) * (ativo / pl) * 100;
}

/** Margem de contribuição unitária = Preço − Custo variável unitário. */
export function margemContribuicaoUnitaria(preco: number, custoVariavel: number): number {
  return preco - custoVariavel;
}

/** Ponto de equilíbrio (unidades) = Gastos Fixos / Margem de Contribuição Unitária. */
export function pontoEquilibrio(gastosFixos: number, preco: number, custoVariavel: number): number {
  return gastosFixos / (preco - custoVariavel);
}

/** Equivalência patrimonial = Lucro da investida × % de participação. */
export function equivalencia(lucroInvestida: number, participacaoPct: number): number {
  return lucroInvestida * (participacaoPct / 100);
}

/** Variação em pontos percentuais entre dois percentuais. */
export function variacaoPp(atualPct: number, anteriorPct: number): number {
  return atualPct - anteriorPct;
}

export function soma(...valores: number[]): number {
  return valores.reduce((a, b) => a + b, 0);
}

/** Primeiro valor menos os demais (ex.: Receita − Custo − Despesas). */
export function subtrai(primeiro: number, ...demais: number[]): number {
  return demais.reduce((a, b) => a - b, primeiro);
}

export function divide(a: number, b: number): number {
  return a / b;
}

export function multiplica(...valores: number[]): number {
  return valores.reduce((a, b) => a * b, 1);
}

export const CALC = {
  analiseVertical,
  analiseHorizontal,
  variacaoPct,
  margem,
  liquidezCorrente,
  roe,
  giro,
  alavancagem,
  dupont,
  dupontDemonstracoes,
  margemContribuicaoUnitaria,
  pontoEquilibrio,
  equivalencia,
  variacaoPp,
  soma,
  subtrai,
  divide,
  multiplica,
} as const;

export type CalcFn = keyof typeof CALC;

export function runCalc(fn: CalcFn, args: number[]): number {
  const f = CALC[fn] as (...a: number[]) => number;
  return f(...args);
}

/** Arredonda com meia para cima (evita 0,1 + 0,2 de ponto flutuante). */
export function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value)) * f) / f;
}
