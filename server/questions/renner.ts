import type { Question, DataTable } from '../../shared/types';
import { RENNER, RENNER_SOURCE, rennerIncomeTable, rennerAssetTable, rennerLiabilityTable, rennerAnnex } from '../../shared/renner';

// Caso Renner — DADOS REAIS (slides da Aula 4: DRE, Ativo e Passivo + PL consolidados 2025 × 2024, R$ milhões).
// Parte A: treino sobre a Renner (ren-001…ren-018). Parte B: roteiro da prova em 3 partes (ren-019…ren-030).
// Parte C: conceitos da Aula 5 (a5-001…a5-012). Todos os números dos textos saem de RENNER.

const D25 = RENNER.dre[2025];
const D24 = RENNER.dre[2024];
const B25 = RENNER.bp[2025];
const B24 = RENNER.bp[2024];

const CTX = 'DADOS REAIS — Lojas Renner S.A., DFs consolidadas 2025 × 2024 (slides da Aula 4; valores em R$ milhões)';
const CTX_ROTEIRO =
  'CASO RENNER — roteiro de análise em 3 partes (formato da prova). Responda citando sempre os números; resposta sem número vale no máximo metade.';
const NOTE = 'Valores em R$ milhões. ' + RENNER_SOURCE;
const SRC_A4 = 'Aula 4 — Caso real Renner';

/** Número com 1 casa em pt-BR (ex.: 15.829,5). */
const f1 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Número com 2 casas em pt-BR (ex.: 1,69). */
const f2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Percentual com 1 casa (ex.: 9,2%). */
const p1 = (v: number) => `${f1(v)}%`;
/** Valor absoluto formatado com 1 casa (para custos e despesas, que são negativos na DRE). */
const a1 = (v: number) => f1(Math.abs(v));

// Indicadores derivados (só para montar textos; os gabaritos são recalculados pelo validador).
const av = (conta: number, base: number) => (Math.abs(conta) / Math.abs(base)) * 100;
const ah = (atual: number, anterior: number) => (Math.abs(atual) / Math.abs(anterior) - 1) * 100;

const MB25 = av(D25.lucroBruto, D25.receitaLiquida);
const MB24 = av(D24.lucroBruto, D24.receitaLiquida);
const MO25 = av(D25.lucroOperacional, D25.receitaLiquida);
const MO24 = av(D24.lucroOperacional, D24.receitaLiquida);
const ML25 = av(D25.lucroLiquido, D25.receitaLiquida);
const ML24 = av(D24.lucroLiquido, D24.receitaLiquida);
const AVC25 = av(D25.custoVendas, D25.receitaLiquida);
const AVC24 = av(D24.custoVendas, D24.receitaLiquida);
const AV_MERC = av(D25.vendaMercadorias, D25.receitaLiquida);
const AV_SERV = av(D25.vendaServicos, D25.receitaLiquida);
const AV_DV25 = av(D25.despesasVendas, D25.receitaLiquida);
const AV_PERDAS25 = av(D25.perdasCredito, D25.receitaLiquida);
const PERDAS_SERV = av(D25.perdasCredito, D25.vendaServicos);
const DESPOP25 = D25.lucroBruto - D25.lucroOperacional;
const DESPOP24 = D24.lucroBruto - D24.lucroOperacional;
const AV_DESPOP25 = av(DESPOP25, D25.receitaLiquida);
const AV_DESPOP24 = av(DESPOP24, D24.receitaLiquida);
const LAIR25 = D25.lucroOperacional + D25.resultadoFinanceiro;
const LAIR24 = D24.lucroOperacional + D24.resultadoFinanceiro;
const ALIQ25 = av(D25.irCs, LAIR25);
const ALIQ24 = av(D24.irCs, LAIR24);

const AH_REC = ah(D25.receitaLiquida, D24.receitaLiquida);
const AH_MERC = ah(D25.vendaMercadorias, D24.vendaMercadorias);
const AH_SERV = ah(D25.vendaServicos, D24.vendaServicos);
const AH_CUSTO = ah(D25.custoVendas, D24.custoVendas);
const AH_LB = ah(D25.lucroBruto, D24.lucroBruto);
const AH_LO = ah(D25.lucroOperacional, D24.lucroOperacional);
const AH_LL = ah(D25.lucroLiquido, D24.lucroLiquido);
const AH_IR = ah(D25.irCs, D24.irCs);
const AH_DV = ah(D25.despesasVendas, D24.despesasVendas);
const AH_DA = ah(D25.despesasAdministrativas, D24.despesasAdministrativas);
const AH_DEP = ah(D25.depreciacoes, D24.depreciacoes);
const AH_PERDAS = ah(D25.perdasCredito, D24.perdasCredito);
const AH_OUT = ah(D25.outrosOperacionais, D24.outrosOperacionais);
const AH_DESPOP = ah(DESPOP25, DESPOP24);
const AH_LAIR = ah(LAIR25, LAIR24);

const ROE25 = av(D25.lucroLiquido, B25.patrimonioLiquido);
const ROE24 = av(D24.lucroLiquido, B24.patrimonioLiquido);
const AV_AC25 = av(B25.ativoCirculante, B25.ativoTotal);
const AV_AC24 = av(B24.ativoCirculante, B24.ativoTotal);
const AV_CR25 = av(B25.contasReceber, B25.ativoTotal);
const AV_CR24 = av(B24.contasReceber, B24.ativoTotal);
const AV_CAIXA25 = av(B25.caixa, B25.ativoTotal);
const AV_APLIC25 = av(B25.aplicacoesFinanceiras, B25.ativoTotal);
const AV_EST25 = av(B25.estoques, B25.ativoTotal);
const AV_IMOB25 = av(B25.imobilizado, B25.ativoTotal);
const AV_DUSO25 = av(B25.direitoUso, B25.ativoTotal);
const AV_INTANG25 = av(B25.intangivel, B25.ativoTotal);
const AV_PC25 = av(B25.passivoCirculante, B25.ativoTotal);
const AV_PC24 = av(B24.passivoCirculante, B24.ativoTotal);
const AV_PNC25 = av(B25.passivoNaoCirculante, B25.ativoTotal);
const AV_PNC24 = av(B24.passivoNaoCirculante, B24.ativoTotal);
const AV_PL25 = av(B25.patrimonioLiquido, B25.ativoTotal);
const AV_PL24 = av(B24.patrimonioLiquido, B24.ativoTotal);
const TERC25 = B25.passivoCirculante + B25.passivoNaoCirculante;
const AV_TERC25 = av(TERC25, B25.ativoTotal);
const AV_CART25 = av(B25.administradorasCartoes, B25.ativoTotal);
const CART_PC25 = av(B25.administradorasCartoes, B25.passivoCirculante);
const FORN_PC25 = av(B25.fornecedores, B25.passivoCirculante);
const AV_FORN25 = av(B25.fornecedores, B25.ativoTotal);
const ARREND25 = B25.arrendamentos + B25.arrendamentosLP;
const AV_ARREND25 = av(ARREND25, B25.ativoTotal);
const AH_ATIVO = ah(B25.ativoTotal, B24.ativoTotal);
const AH_AC = ah(B25.ativoCirculante, B24.ativoCirculante);
const AH_CAIXA = ah(B25.caixa, B24.caixa);
const AH_CR = ah(B25.contasReceber, B24.contasReceber);
const AH_EST = ah(B25.estoques, B24.estoques);
const AH_PC = ah(B25.passivoCirculante, B24.passivoCirculante);
const AH_PNC = ah(B25.passivoNaoCirculante, B24.passivoNaoCirculante);
const AH_PL = ah(B25.patrimonioLiquido, B24.patrimonioLiquido);
const LC25 = B25.ativoCirculante / B25.passivoCirculante;
const LC24 = B24.ativoCirculante / B24.passivoCirculante;
const GIRO25 = D25.receitaLiquida / B25.ativoTotal;
const GIRO24 = D24.receitaLiquida / B24.ativoTotal;
const ALAV25 = B25.ativoTotal / B25.patrimonioLiquido;
const ALAV24 = B24.ativoTotal / B24.patrimonioLiquido;
const VAR_ATIVO = B25.ativoTotal - B24.ativoTotal;
const VAR_CAIXA = B25.caixa - B24.caixa;
const VAR_PC = B25.passivoCirculante - B24.passivoCirculante;
const VAR_PNC = B25.passivoNaoCirculante - B24.passivoNaoCirculante;
const VAR_PL = B25.patrimonioLiquido - B24.patrimonioLiquido;
const VAR_TESOURARIA = B25.acoesTesouraria - B24.acoesTesouraria;
const VAR_RF = D25.resultadoFinanceiro - D24.resultadoFinanceiro;

// Referências da lista de ROEs apresentada em aula (data-base anterior à das DFs).
const ROE_REF = { ambev: 18, itau: 24, rennerAnterior: 16, bradesco: 15, casasBahia: -15, azul: -22 };
const GIRO_AMBEV_2025 = 0.61;

type DreKey = keyof typeof D25;
type BpKey = keyof typeof B25;

/** Tabela só com os valores (sem A.V./A.H.), para as questões de cálculo. */
function dreTable(caption: string, lines: [string, DreKey][], totalRows?: number[]): DataTable {
  return {
    caption,
    note: NOTE,
    headers: ['Linha', '2025', '2024'],
    rows: lines.map(([label, k]) => [label, f1(D25[k]), f1(D24[k])]),
    ...(totalRows ? { totalRows } : {}),
  };
}
function bpTable(caption: string, lines: [string, BpKey][], totalRows?: number[]): DataTable {
  return {
    caption,
    note: NOTE,
    headers: ['Conta', '31/12/2025', '31/12/2024'],
    rows: lines.map(([label, k]) => [label, f1(B25[k]), f1(B24[k])]),
    ...(totalRows ? { totalRows } : {}),
  };
}

const DRE_LINES: [string, DreKey][] = [
  ['  Venda de mercadorias', 'vendaMercadorias'],
  ['  Venda de serviços (Realize)', 'vendaServicos'],
  ['Receita operacional líquida', 'receitaLiquida'],
  ['(−) Custo das vendas', 'custoVendas'],
  ['= Lucro Bruto', 'lucroBruto'],
  ['(−) Despesas com vendas', 'despesasVendas'],
  ['(−) Despesas gerais e administrativas', 'despesasAdministrativas'],
  ['(−) Depreciações e amortizações', 'depreciacoes'],
  ['(−) Perdas em crédito, líquidas', 'perdasCredito'],
  ['(−) Outros resultados operacionais', 'outrosOperacionais'],
  ['= Lucro Operacional', 'lucroOperacional'],
  ['(+/−) Resultado financeiro', 'resultadoFinanceiro'],
  ['(−) IR e contribuição social', 'irCs'],
  ['= Lucro Líquido do exercício', 'lucroLiquido'],
];
const DRE_TOTALS = [2, 4, 10, 13];

const BAL = [
  { label: 'Renner 31/12/2025', ativo: B25.ativoTotal, passivo: B25.passivoCirculante + B25.passivoNaoCirculante, pl: B25.patrimonioLiquido, tolerance: 1.5 },
  { label: 'Renner 31/12/2024', ativo: B24.ativoTotal, passivo: B24.passivoCirculante + B24.passivoNaoCirculante, pl: B24.patrimonioLiquido, tolerance: 1.5 },
];

const RUBRIC_NOTE = 'Regra da disciplina: nunca "ótimo" ou "ruim" sem comparação (ano anterior, pares, natureza do negócio, custo do capital).';

export const questions: Question[] = [
  // =====================================================================================
  // PARTE A — Renner, treino
  // =====================================================================================
  {
    id: 'ren-001',
    type: 'numeric',
    topic: 'av',
    subtopic: 'A.V. da DRE — custo das vendas',
    skill: 'ren-av-dre',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Análise Vertical (A.V.) do Custo das vendas da Renner em 2025, isto é, quanto do que a empresa vendeu foi consumido pelo custo. Responda em %, com 1 casa decimal (valor absoluto, sem sinal).',
    tables: [dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida'], ['(−) Custo das vendas', 'custoVendas'], ['= Lucro Bruto', 'lucroBruto']], [0, 2])],
    correct: 38.3,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [Math.abs(D25.custoVendas), D25.receitaLiquida] },
    solution: {
      formula: 'A.V. = Linha / Receita líquida × 100',
      substitution: `A.V. custo 2025 = ${a1(D25.custoVendas)} / ${f1(D25.receitaLiquida)} × 100`,
      computation: `${(Math.abs(D25.custoVendas) / D25.receitaLiquida).toFixed(4).replace('.', ',')} × 100 = ${p1(AVC25)}`,
      result: p1(AVC25),
      unit: '% da receita líquida',
      interpretation: `De cada R$ 100 vendidos, R$ ${f1(AVC25).replace(',', ',')} são consumidos pelo custo das mercadorias e serviços; sobram R$ ${f1(MB25)} de Lucro Bruto (Margem Bruta de ${p1(MB25)}). Em 2024 o custo pesava ${p1(AVC24)}.`,
    },
    explanation: `Na DRE, a base da Análise Vertical é sempre a Receita líquida (100%). O custo das vendas de ${a1(D25.custoVendas)} sobre a receita de ${f1(D25.receitaLiquida)} dá ${p1(AVC25)}: é a fatia da venda que "gruda" no produto (tecido, confecção, custo do serviço). O complemento, ${p1(MB25)}, é a Margem Bruta.`,
    reasoningSteps: [
      'Identifique a base: na DRE, cada linha é dividida pela Receita líquida.',
      'Use o valor absoluto do custo (o sinal negativo da DRE só indica que ele é subtraído).',
      'Divida, multiplique por 100 e arredonde na casa pedida.',
      'Confira: A.V. do custo + Margem Bruta = 100%.',
    ],
    commonMistake: 'Dividir o custo pelo Lucro Bruto ou pela Venda de mercadorias (uma das duas receitas) em vez de pela Receita líquida total.',
    rule: 'A.V. da DRE: toda linha ÷ Receita líquida × 100 — a receita é o "R$ 100" que será consumido degrau por degrau.',
    formula: 'A.V. = Conta / Receita líquida × 100',
    hint: 'A base é a receita total (mercadorias + serviços), não só uma delas.',
    concept: 'A A.V. da DRE mostra onde cada R$ 100 de receita é consumido: custo, despesas, juros, imposto — e o que sobra como lucro.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-002',
    type: 'numeric',
    topic: 'margens',
    subtopic: 'Margem Líquida',
    skill: 'ren-margens',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Margem Líquida da Renner em 2025. Responda em %, com 1 casa decimal.',
    tables: [dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida'], ['= Lucro Operacional', 'lucroOperacional'], ['= Lucro Líquido do exercício', 'lucroLiquido']], [0, 2])],
    correct: 9.2,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'margem', args: [D25.lucroLiquido, D25.receitaLiquida] },
    solution: {
      formula: 'Margem Líquida = Lucro Líquido / Receita líquida × 100',
      substitution: `ML 2025 = ${f1(D25.lucroLiquido)} / ${f1(D25.receitaLiquida)} × 100`,
      computation: `${(D25.lucroLiquido / D25.receitaLiquida).toFixed(4).replace('.', ',')} × 100 = ${p1(ML25)}`,
      result: p1(ML25),
      unit: '% da receita líquida',
      interpretation: `De cada R$ 100 vendidos, R$ ${f1(ML25)} chegam ao acionista depois de custo, despesas, juros e IR. Em 2024 a margem era ${p1(ML24)}: melhora de ${f1(ML25 - ML24)} p.p.`,
    },
    explanation: `A Margem Líquida é o fim do filme da DRE: ${f1(D25.lucroLiquido)} de lucro sobre ${f1(D25.receitaLiquida)} de receita = ${p1(ML25)}. É a leitura do slide: "de cada R$ 100 vendidos, R$ ${f1(ML25)} chegam ao acionista". Se esse lucro remunera bem quem investiu é outra pergunta — respondida pelo ROE, não pela margem.`,
    reasoningSteps: [
      'Pegue o último "=" da DRE: Lucro Líquido do exercício.',
      'Divida pela Receita líquida (não pelo Lucro Bruto nem pelo Ativo).',
      'Multiplique por 100 e arredonde.',
      'Compare com o ano anterior para dizer se melhorou ou piorou.',
    ],
    commonMistake: 'Usar o Lucro Operacional (1.797,2) no numerador — isso é a Margem Operacional, 11,4%.',
    rule: 'Margem = lucro do degrau ÷ Receita líquida; Margem Líquida usa o último degrau (Lucro Líquido).',
    formula: 'ML = Lucro Líquido / Receita líquida × 100',
    hint: 'O numerador é o último "=" da DRE.',
    concept: 'A Margem Líquida mede a eficiência de todos os degraus da DRE: quanto de cada R$ 100 de receita vira lucro para os sócios.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-003',
    type: 'numeric',
    topic: 'ah',
    subtopic: 'A.H. da receita',
    skill: 'ren-ah-dre',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Análise Horizontal (A.H.) da Receita operacional líquida da Renner de 2024 para 2025. Responda em %, com 1 casa decimal.',
    tables: [dreTable('Lojas Renner — DRE (recorte)', [['  Venda de mercadorias', 'vendaMercadorias'], ['  Venda de serviços (Realize)', 'vendaServicos'], ['Receita operacional líquida', 'receitaLiquida']], [2])],
    correct: 9.6,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseHorizontal', args: [D25.receitaLiquida, D24.receitaLiquida] },
    solution: {
      formula: 'A.H. = Atual / Anterior − 1 (× 100)',
      substitution: `A.H. receita = ${f1(D25.receitaLiquida)} / ${f1(D24.receitaLiquida)} − 1`,
      computation: `${(D25.receitaLiquida / D24.receitaLiquida).toFixed(4).replace('.', ',')} − 1 = ${p1(AH_REC)}`,
      result: `+${p1(AH_REC)}`,
      unit: '% de variação sobre 2024',
      interpretation: `A receita cresceu ${p1(AH_REC)}: mercadorias +${p1(AH_MERC)} e serviços da Realize +${p1(AH_SERV)}. Esse é o número de referência para julgar todas as outras linhas: o que cresceu mais que ${p1(AH_REC)} pesou mais na receita; o que cresceu menos, aliviou.`,
    },
    explanation: `A A.H. compara a mesma linha em dois anos, usando o ano anterior como base: ${f1(D25.receitaLiquida)} ÷ ${f1(D24.receitaLiquida)} − 1 = ${p1(AH_REC)}. É o "filme" entre as duas fotos: a Renner vendeu ${p1(AH_REC)} a mais em 2025.`,
    reasoningSteps: [
      'A base da A.H. é sempre o ano ANTERIOR (2024).',
      'Divida 2025 por 2024 e subtraia 1.',
      'Multiplique por 100; o sinal diz se cresceu ou caiu.',
      'Guarde esse número: é a régua para comparar o crescimento das outras linhas.',
    ],
    commonMistake: 'Dividir pela receita de 2025 (base errada) ou calcular a diferença em R$ sem dividir pela base.',
    rule: 'A.H. = valor atual ÷ valor anterior − 1; a base é sempre o período mais antigo.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'Qual ano é a base? O mais antigo.',
    concept: 'A A.H. mede a variação de cada linha entre períodos e mostra o que cresce mais rápido: receita, custo ou despesa.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-004',
    type: 'multiple-choice',
    topic: 'ah',
    subtopic: 'A.H. do custo × A.H. da receita',
    skill: 'ren-ah-dre',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `A receita da Renner cresceu ${p1(AH_REC)} em 2025. Calcule a A.H. do Custo das vendas (2 casas decimais) e escolha a leitura correta sobre a Margem Bruta.`,
    tables: [dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida'], ['(−) Custo das vendas', 'custoVendas'], ['= Lucro Bruto', 'lucroBruto']], [0, 2])],
    options: [
      {
        id: 'A',
        text: `O custo variou −6,45%: como caiu, a Margem Bruta só poderia melhorar.`,
        whyWrong: 'O custo CRESCEU (5.694,4 → 6.061,6). O sinal negativo da DRE indica subtração, não queda; a A.H. compara os valores absolutos da linha.',
      },
      {
        id: 'B',
        text: `O custo cresceu 9,65%, o mesmo que a receita, então a Margem Bruta ficou estável em torno de 60%.`,
        whyWrong: '9,65% é a A.H. da receita, não do custo. O custo cresceu menos que a receita, e por isso a margem mudou.',
      },
      {
        id: 'C',
        text: `O custo cresceu 6,45%, menos que a receita (9,65%); por isso a Margem Bruta subiu de ${p1(MB24)} para ${p1(MB25)} — a margem melhora quando a linha de baixo cresce mais devagar que a receita.`,
      },
      {
        id: 'D',
        text: `O custo cresceu 6,45%, logo a Margem Bruta caiu 6,45 pontos percentuais.`,
        whyWrong: 'Confunde A.H. (variação do valor da linha) com variação da A.V. (peso da linha na receita). A margem subiu, porque o custo cresceu menos que a receita.',
      },
      {
        id: 'E',
        text: `A A.H. do custo é de 1,15 ponto percentual, que é a melhora da Margem Bruta.`,
        whyWrong: '1,15 p.p. é a diferença entre as A.V. do custo nos dois anos (39,4% → 38,3%), não a A.H. do custo. São medidas diferentes: uma compara pesos, a outra compara valores.',
      },
    ],
    correct: 'C',
    calc: { fn: 'analiseHorizontal', args: [D25.custoVendas, D24.custoVendas] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1',
      substitution: `A.H. custo = ${a1(D25.custoVendas)} / ${a1(D24.custoVendas)} − 1`,
      computation: `${(Math.abs(D25.custoVendas) / Math.abs(D24.custoVendas)).toFixed(4).replace('.', ',')} − 1 = ${f2(AH_CUSTO)}%`,
      result: `+${f2(AH_CUSTO)}%`,
      unit: '% de variação sobre 2024',
      interpretation: `Custo +${f2(AH_CUSTO)}% contra receita +${f2(AH_REC)}%: a linha de baixo cresceu mais devagar que a receita, e a Margem Bruta subiu de ${p1(MB24)} para ${p1(MB25)} (A.V. do custo caiu de ${p1(AVC24)} para ${p1(AVC25)}).`,
    },
    explanation: `A regra de leitura da Aula 4: a margem melhora quando a linha de baixo cresce mais devagar que a receita. Receita +${f2(AH_REC)}% e custo +${f2(AH_CUSTO)}% → o custo perdeu peso na receita (${p1(AVC24)} → ${p1(AVC25)}) e o Lucro Bruto cresceu ${p1(AH_LB)}, mais que a receita. A.H. e A.V. respondem a perguntas diferentes: a A.H. diz quanto a linha cresceu; a A.V. diz quanto ela pesa.`,
    reasoningSteps: [
      'Calcule a A.H. do custo pelos valores absolutos: 6.061,6 ÷ 5.694,4 − 1.',
      'Compare com a A.H. da receita: qual cresceu mais?',
      'Se o custo cresceu menos que a receita, a Margem Bruta sobe; se cresceu mais, cai.',
      'Confirme pela A.V.: o peso do custo na receita caiu de 39,4% para 38,3%.',
    ],
    commonMistake: 'Ler o sinal negativo do custo na DRE como "queda" do custo, ou confundir a variação em pontos percentuais da A.V. com a A.H.',
    rule: 'Para saber se uma margem melhorou, compare a A.H. da linha com a A.H. da receita: linha crescendo menos que a receita = margem sobe.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'O custo saiu de 5.694,4 para 6.061,6: ele subiu ou caiu?',
    concept: 'A A.H. de custos e despesas é lida contra a A.H. da receita: é essa comparação que explica a origem da melhora ou piora das margens.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-005',
    type: 'multi-part',
    topic: 'margens',
    subtopic: 'Margem Operacional 2024 × 2025',
    skill: 'ren-margens',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'Com a DRE da Renner, calcule a Margem Operacional dos dois anos e explique a origem da variação.',
    tables: [dreTable('Lojas Renner — DRE', DRE_LINES, DRE_TOTALS)],
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Margem Operacional de 2024 (%, 1 casa decimal).',
        correct: 8.7,
        unit: 'percent',
        decimals: 1,
        points: 3,
        calc: { fn: 'margem', args: [D24.lucroOperacional, D24.receitaLiquida] },
        solution: {
          formula: 'MO = Lucro Operacional / Receita líquida × 100',
          substitution: `MO 2024 = ${f1(D24.lucroOperacional)} / ${f1(D24.receitaLiquida)} × 100`,
          computation: `= ${p1(MO24)}`,
          result: p1(MO24),
          unit: '% da receita líquida',
          interpretation: `Em 2024, de cada R$ 100 vendidos sobravam R$ ${f1(MO24)} depois do custo e de todas as despesas operacionais.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) Margem Operacional de 2025 (%, 1 casa decimal).',
        correct: 11.4,
        unit: 'percent',
        decimals: 1,
        points: 3,
        calc: { fn: 'margem', args: [D25.lucroOperacional, D25.receitaLiquida] },
        solution: {
          formula: 'MO = Lucro Operacional / Receita líquida × 100',
          substitution: `MO 2025 = ${f1(D25.lucroOperacional)} / ${f1(D25.receitaLiquida)} × 100`,
          computation: `= ${p1(MO25)}`,
          result: p1(MO25),
          unit: '% da receita líquida',
          interpretation: `A operação "para em pé" com mais folga: ${p1(MO25)} contra ${p1(MO24)} em 2024 (+${f1(MO25 - MO24)} p.p.).`,
        },
      },
      {
        id: 'c',
        kind: 'choice',
        prompt: 'c) De onde veio a melhora da Margem Operacional?',
        points: 4,
        options: [
          {
            id: 'A',
            text: 'Da queda das despesas operacionais em valor absoluto: a Renner gastou menos em 2025 do que em 2024.',
            whyWrong: `As despesas operacionais CRESCERAM em valor: ${f1(DESPOP24)} → ${f1(DESPOP25)} (+${p1(AH_DESPOP)}). O que importa é que cresceram menos que a receita.`,
          },
          {
            id: 'B',
            text: `Do resultado financeiro, que passou de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)}.`,
            whyWrong: 'O resultado financeiro fica ABAIXO do Lucro Operacional na DRE; ele afeta a Margem Líquida, não a Operacional. E piorou, não ajudou.',
          },
          {
            id: 'C',
            text: `Do Lucro Bruto, que cresceu ${p1(AH_LB)} (custo +${p1(AH_CUSTO)} contra receita +${p1(AH_REC)}), somado a despesas operacionais que cresceram só ${p1(AH_DESPOP)} — ambas as linhas abaixo cresceram mais devagar que a receita, e o Lucro Operacional subiu ${p1(AH_LO)}.`,
          },
          {
            id: 'D',
            text: `Da redução do IR, cuja A.H. foi de +${p1(AH_IR)}.`,
            whyWrong: 'O IR mais que dobrou (+106,8%), e também está abaixo do Lucro Operacional; não explica a Margem Operacional.',
          },
        ],
        correct: 'C',
      },
    ],
    explanation: `Margem Operacional = Lucro Operacional ÷ Receita: ${p1(MO24)} → ${p1(MO25)}. O Lucro Operacional saltou ${p1(AH_LO)} com a receita crescendo ${p1(AH_REC)}, porque as duas linhas que ficam entre a receita e o LO cresceram menos que ela: custo +${p1(AH_CUSTO)} e despesas operacionais +${p1(AH_DESPOP)} (vendas +${p1(AH_DV)}, administrativas +${p1(AH_DA)}, depreciações +${p1(AH_DEP)}, perdas em crédito −${f1(Math.abs(AH_PERDAS))}%). A A.V. das despesas operacionais caiu de ${p1(AV_DESPOP24)} para ${p1(AV_DESPOP25)}.`,
    reasoningSteps: [
      'Localize o degrau certo: Lucro Operacional (antes do resultado financeiro e do IR).',
      'Calcule a margem dos dois anos e a variação em p.p.',
      'Use a A.H.: compare o crescimento da receita com o do custo e das despesas operacionais.',
      'Linhas abaixo do LO (financeiro, IR) não explicam a Margem Operacional.',
    ],
    commonMistake: 'Atribuir a melhora da Margem Operacional ao resultado financeiro ou ao IR, que ficam abaixo do Lucro Operacional na DRE.',
    rule: 'Cada margem só é afetada pelas linhas que ficam ACIMA do seu "=": para explicá-la, compare a A.H. dessas linhas com a A.H. da receita.',
    formula: 'MO = Lucro Operacional / Receita líquida × 100',
    hint: 'Quais linhas ficam entre a receita e o Lucro Operacional?',
    concept: 'A Margem Operacional responde "a operação para em pé?": quanto sobra depois do custo e das despesas de manter a estrutura e vender.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-006',
    type: 'multiple-choice',
    topic: 'dre',
    subtopic: 'Duas receitas: mercadorias e serviços financeiros',
    skill: 'ren-estrutura-dre',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'A DRE da Renner abre a receita em duas linhas. Calcule quanto a Venda de serviços (Realize) representa da receita líquida de 2025 (1 casa decimal) e escolha a alternativa que explica corretamente a linha "Perdas em crédito, líquidas".',
    tables: [dreTable('Lojas Renner — DRE (recorte)', [['  Venda de mercadorias', 'vendaMercadorias'], ['  Venda de serviços (Realize)', 'vendaServicos'], ['Receita operacional líquida', 'receitaLiquida'], ['(−) Perdas em crédito, líquidas', 'perdasCredito']], [2])],
    options: [
      {
        id: 'A',
        text: `Serviços = ${p1(AV_MERC)} da receita; as perdas em crédito são o custo das mercadorias que a loja não conseguiu vender.`,
        whyWrong: `${p1(AV_MERC)} é a fatia das MERCADORIAS. E mercadoria não vendida fica no estoque; não gera "perda em crédito".`,
      },
      {
        id: 'B',
        text: `Serviços = ${p1(AV_SERV)} da receita: a Renner também é uma financeira (Realize) que empresta ao consumidor; parte desses clientes não paga, e a inadimplência esperada aparece como "Perdas em crédito, líquidas" (${a1(D25.perdasCredito)} em 2025, ${p1(PERDAS_SERV)} da receita de serviços).`,
      },
      {
        id: 'C',
        text: `Serviços = ${p1(AV_SERV)} da receita; as perdas em crédito são juros pagos aos bancos e deveriam estar no resultado financeiro.`,
        whyWrong: 'Perdas em crédito não são juros pagos: são clientes da Realize que não pagaram. É uma linha operacional do negócio financeiro, por isso fica acima do Lucro Operacional.',
      },
      {
        id: 'D',
        text: `Serviços = 14,6% da receita; as perdas em crédito são o desconto concedido nas vendas a prazo.`,
        whyWrong: '14,6% usa a Venda de mercadorias como base (2.019,5 ÷ 13.810,0). A base da A.V. é a receita líquida total. E perda em crédito é inadimplência, não desconto.',
      },
    ],
    correct: 'B',
    calc: { fn: 'analiseVertical', args: [D25.vendaServicos, D25.receitaLiquida] },
    solution: {
      formula: 'A.V. = Venda de serviços / Receita líquida × 100',
      substitution: `A.V. serviços 2025 = ${f1(D25.vendaServicos)} / ${f1(D25.receitaLiquida)} × 100`,
      computation: `= ${p1(AV_SERV)}`,
      result: p1(AV_SERV),
      unit: '% da receita líquida',
      interpretation: `Mercadorias ${p1(AV_MERC)} + serviços ${p1(AV_SERV)} = 100%. A receita de serviços cresceu ${p1(AH_SERV)}, mais que a de mercadorias (${p1(AH_MERC)}).`,
    },
    explanation: `A Renner tem duas receitas: a loja (mercadorias, ${p1(AV_MERC)}) e a Realize (serviços financeiros, ${p1(AV_SERV)}). Quem empresta ao consumidor convive com inadimplência; a linha "Perdas em crédito, líquidas" (${a1(D25.perdasCredito)}) é a parte operacional desse negócio, e por isso aparece ANTES do Lucro Operacional, e não no resultado financeiro. Ela explica também por que Contas a receber é a maior conta do ativo.`,
    reasoningSteps: [
      'Some as duas receitas e confira que dão a receita líquida.',
      'Calcule a fatia de serviços sobre o total.',
      'Pergunte: que gasto nasce de emprestar ao consumidor? A inadimplência.',
      'Verifique a posição da linha: acima do LO = operacional; abaixo = financeiro.',
    ],
    commonMistake: 'Tratar perdas em crédito como despesa financeira (juros) ou usar a venda de mercadorias como base da A.V.',
    rule: 'Antes de analisar a DRE, pergunte "quais negócios estão dentro dessa receita?" — cada negócio traz suas próprias linhas de custo e risco.',
    formula: 'A.V. = Linha / Receita líquida × 100',
    hint: 'Quem empresta dinheiro ao consumidor carrega que risco?',
    concept: 'Linhas específicas da DRE revelam o modelo de negócio: perdas em crédito existem porque parte da receita da Renner vem do crédito ao consumidor (Realize).',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-007',
    type: 'true-false',
    topic: 'resultado-financeiro',
    subtopic: 'A.H. com mudança de sinal',
    skill: 'ren-resultado-financeiro',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `Julgue: "O resultado financeiro da Renner passou de +${f1(D24.resultadoFinanceiro)} em 2024 para ${f1(D25.resultadoFinanceiro)} em 2025. A A.H. correta da linha é −233,7% (= −82,5 ÷ 61,7 − 1), o que indica uma piora de 233,7%."`,
    correct: false,
    explanation: `Quando a linha muda de sinal, a A.H. não é significativa (n.m.): dividir −82,5 por +61,7 produz um percentual sem sentido econômico (a "base" era uma receita e virou despesa). A leitura certa é em R$: a linha deixou de SOMAR ${f1(D24.resultadoFinanceiro)} ao lucro e passou a CONSUMIR ${a1(D25.resultadoFinanceiro)} — uma piora de ${a1(VAR_RF)} milhões, coerente com o caixa que caiu ${p1(Math.abs(AH_CAIXA))} (menos receita financeira).`,
    reasoningSteps: [
      'Verifique os sinais dos dois anos: positivo em 2024, negativo em 2025.',
      'Sinal mudou → A.H. = n.m.; não calcule o percentual.',
      'Descreva a variação em R$ (de +61,7 para −82,5 = −144,2) e o efeito no lucro.',
      'Procure a causa no balanço: caixa e aplicações menores rendem menos juros.',
    ],
    commonMistake: 'Calcular e interpretar um percentual (−233,7%) para uma linha que trocou de sinal.',
    rule: 'A.H. só faz sentido entre valores de mesmo sinal; se o sinal mudou, escreva "n.m." e explique a variação em R$.',
    formula: 'A.H. = |Atual| / |Anterior| − 1 (apenas para o mesmo sinal)',
    hint: 'Uma receita de 61,7 virou uma despesa de 82,5. Faz sentido dizer que "cresceu −233%"?',
    concept: 'O resultado financeiro mostra se o lucro vem da operação ou do caixa e das dívidas; quando ele troca de sinal, a A.H. perde significado e a análise é feita em valores.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-008',
    type: 'numeric',
    topic: 'roe',
    subtopic: 'ROE 2025',
    skill: 'ren-roe',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule o ROE (Return on Equity) da Renner em 2025. Responda em %, com 1 casa decimal.',
    tables: [
      dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida'], ['= Lucro Líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Lojas Renner — BP (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    correct: 13.9,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'roe', args: [D25.lucroLiquido, B25.patrimonioLiquido] },
    solution: {
      formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
      substitution: `ROE 2025 = ${f1(D25.lucroLiquido)} / ${f1(B25.patrimonioLiquido)} × 100`,
      computation: `${(D25.lucroLiquido / B25.patrimonioLiquido).toFixed(4).replace('.', ',')} × 100 = ${p1(ROE25)}`,
      result: p1(ROE25),
      unit: '% sobre o PL',
      interpretation: `Para cada R$ 100 que os acionistas deixaram na empresa, voltaram R$ ${f1(ROE25)} de lucro em 2025 (2024: ${p1(ROE24)}). É o número do slide: "esse lucro remunera bem quem investiu?" → ROE = ${p1(ROE25)}.`,
    },
    explanation: `O ROE é a ponte entre a DRE e o Balanço: Lucro Líquido (DRE) ÷ Patrimônio Líquido (BP) = ${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)} = ${p1(ROE25)}. Ele responde à pergunta do dono — "para cada R$ 1 que deixei na empresa, quanto voltou?" — e não à pergunta da margem (quanto sobra de cada venda).`,
    reasoningSteps: [
      'Numerador: Lucro Líquido do exercício (DRE).',
      'Denominador: Patrimônio Líquido (BP), não o Ativo Total.',
      'Divida, multiplique por 100 e arredonde.',
      'Compare com 2024 e com pares para julgar.',
    ],
    commonMistake: 'Dividir o Lucro Líquido pelo Ativo Total (7,4%) ou pela Receita (9,2%, que é a margem).',
    rule: 'ROE = Lucro Líquido ÷ Patrimônio Líquido: lucro da DRE sobre o capital dos sócios no BP.',
    formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
    hint: 'O denominador é "a riqueza dos sócios", não o total do que a empresa possui.',
    concept: 'ROE mede a rentabilidade do capital dos sócios: quanto de lucro cada R$ 1 de PL gerou no ano.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-009',
    type: 'multiple-choice',
    topic: 'roe',
    subtopic: 'ROE comparado',
    skill: 'ren-roe-interpretacao',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `O ROE da Renner foi de ${p1(ROE25)} em 2025 (${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)}) e de ${p1(ROE24)} em 2024. Na lista de ROEs apresentada em aula (data-base anterior), constavam Renner ${ROE_REF.rennerAnterior}%, Ambev ${ROE_REF.ambev}%, Itaú ${ROE_REF.itau}%, Bradesco ${ROE_REF.bradesco}%, Casas Bahia ${ROE_REF.casasBahia}% e Azul ${ROE_REF.azul}%. Qual leitura é a mais adequada?`,
    options: [
      {
        id: 'A',
        text: `O ROE de ${p1(ROE25)} é excelente, porque está acima da Margem Líquida de ${p1(ML25)}.`,
        whyWrong: 'ROE e margem medem coisas diferentes (lucro sobre PL × lucro sobre receita); não se comparam entre si. ROE acima da margem é consequência do giro e da alavancagem, não um mérito.',
      },
      {
        id: 'B',
        text: `O ROE piorou na essência, pois o PL caiu ${p1(Math.abs(AH_PL))}; a alta de ${p1(ROE24)} para ${p1(ROE25)} é só efeito contábil.`,
        whyWrong: `O lucro cresceu ${p1(AH_LL)} enquanto o PL caiu ${p1(Math.abs(AH_PL))}: a melhora vem sobretudo do lucro. Um PL menor (recompra de ações, dividendos) ajuda o ROE, mas não o torna "falso".`,
      },
      {
        id: 'C',
        text: `Comparado ao Itaú (${ROE_REF.itau}%), o ROE de ${p1(ROE25)} mostra que a Renner é mal administrada.`,
        whyWrong: 'Banco e varejo têm estruturas diferentes: bancos operam com alavancagem de ~10×. Comparar ROE entre setores sem considerar a natureza do negócio leva a conclusões erradas.',
      },
      {
        id: 'D',
        text: `Melhorou ${f1(ROE25 - ROE24)} p.p. em relação a 2024 (${p1(ROE24)} → ${p1(ROE25)}), mas ainda está abaixo dos ${ROE_REF.rennerAnterior}% que a própria Renner tinha na data-base da lista e dos pares de bens de consumo e bancos (Ambev ${ROE_REF.ambev}%, Itaú ${ROE_REF.itau}%); se o acionista está satisfeito depende de comparar com o custo do capital e com o que o varejo rende.`,
      },
      {
        id: 'E',
        text: `O ROE correto é ${p1(av(D25.lucroLiquido, B25.ativoTotal))} (${f1(D25.lucroLiquido)} ÷ ${f1(B25.ativoTotal)}), e por isso a Renner rende menos que a Casas Bahia.`,
        whyWrong: `${f1(D25.lucroLiquido)} ÷ ${f1(B25.ativoTotal)} divide pelo Ativo Total, não pelo PL; e Casas Bahia teve ROE negativo (${ROE_REF.casasBahia}%).`,
      },
    ],
    correct: 'D',
    explanation: `Um ROE nunca é bom ou ruim sozinho. As comparações possíveis são: com o ano anterior (${p1(ROE24)} → ${p1(ROE25)}, melhorou), com o histórico da própria empresa (${ROE_REF.rennerAnterior}% na lista da aula), com pares e setores (Ambev ${ROE_REF.ambev}%, bancos ${ROE_REF.bradesco}–${ROE_REF.itau}%, varejo e aéreas negativos) e com o custo de capital do acionista. A pergunta do slide, "por que bancos e bens de consumo rendem mais que varejo e aéreas?", lembra que alavancagem e margem variam por setor.`,
    reasoningSteps: [
      'Confirme a fórmula: LL ÷ PL, não LL ÷ Ativo nem LL ÷ Receita.',
      'Compare no tempo: o ROE subiu ou caiu em relação a 2024?',
      'Compare com pares do mesmo setor e com o histórico da empresa.',
      'Só então pergunte se remunera o custo de capital do acionista.',
    ],
    commonMistake: 'Julgar o ROE como "ótimo" ou "ruim" comparando-o com a margem ou com empresas de outro setor.',
    rule: 'Julgue o ROE sempre por comparação: ano anterior, histórico, pares do setor e custo do capital — nunca pelo número isolado.',
    formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
    hint: 'Que comparações tornam um ROE "bom" ou "ruim"?',
    concept: 'O ROE responde se o lucro remunera bem quem investiu; a resposta depende do que o acionista obteria em alternativas de risco parecido.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-010',
    type: 'numeric',
    topic: 'av',
    subtopic: 'A.V. do Ativo — contas a receber',
    skill: 'ren-av-bp',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Qual a participação (A.V.) de Contas a receber no Ativo Total da Renner em 31/12/2025? Responda em %, com 1 casa decimal.',
    tables: [
      bpTable(
        'Lojas Renner — ATIVO (recorte)',
        [
          ['ATIVO TOTAL', 'ativoTotal'],
          ['ATIVO CIRCULANTE', 'ativoCirculante'],
          ['  Caixa e equivalentes de caixa', 'caixa'],
          ['  Aplicações financeiras', 'aplicacoesFinanceiras'],
          ['  Contas a receber', 'contasReceber'],
          ['  Estoques', 'estoques'],
          ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'],
          ['  Imobilizado', 'imobilizado'],
          ['  Direito de uso', 'direitoUso'],
          ['  Intangível', 'intangivel'],
        ],
        [0, 1, 6],
      ),
    ],
    balanceCheck: BAL,
    correct: 36.6,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [B25.contasReceber, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = Conta / Ativo Total × 100',
      substitution: `A.V. contas a receber = ${f1(B25.contasReceber)} / ${f1(B25.ativoTotal)} × 100`,
      computation: `${(B25.contasReceber / B25.ativoTotal).toFixed(4).replace('.', ',')} × 100 = ${p1(AV_CR25)}`,
      result: p1(AV_CR25),
      unit: '% do Ativo Total',
      interpretation: `Mais de um terço do ativo da Renner é crédito a clientes (${p1(AV_CR25)}; em 2024, ${p1(AV_CR24)}): é a carteira da Realize. Vem muito à frente de Imobilizado (${p1(AV_IMOB25)}), Direito de uso (${p1(AV_DUSO25)}) e Estoques (${p1(AV_EST25)}).`,
    },
    explanation: `A A.V. do ativo responde "onde a empresa investe?". Na Renner a resposta surpreende quem pensa só em lojas e estoques: a maior conta é Contas a receber, ${f1(B25.contasReceber)} de ${f1(B25.ativoTotal)} = ${p1(AV_CR25)}. É o crédito ao consumidor (cartão Realize) — coerente com a receita de serviços financeiros e com a linha de perdas em crédito da DRE.`,
    reasoningSteps: [
      'Base da A.V. do ativo: Ativo Total.',
      'Divida a conta pelo total e multiplique por 100.',
      'Ordene as maiores contas: isso descreve o modelo de negócio.',
      'Ligue com a DRE: recebíveis grandes ↔ receita de serviços e perdas em crédito.',
    ],
    commonMistake: 'Dividir pelo Ativo Circulante (61,7%) em vez de pelo Ativo Total.',
    rule: 'A.V. do ativo = conta ÷ Ativo Total; as maiores contas mostram onde a empresa decidiu investir.',
    formula: 'A.V. = Conta / Ativo Total × 100',
    hint: 'O denominador é o total do ativo, não o subtotal do circulante.',
    concept: 'A Análise Vertical do ativo mostra a distribuição dos investimentos e revela a natureza do negócio.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-011',
    type: 'multiple-choice',
    topic: 'ah',
    subtopic: 'A.H. do caixa',
    skill: 'ren-ah-bp',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a A.H. de Caixa e equivalentes de caixa da Renner de 2024 para 2025 (1 casa decimal) e escolha a alternativa correta.',
    tables: [bpTable('Lojas Renner — ATIVO (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['  Caixa e equivalentes de caixa', 'caixa'], ['  Aplicações financeiras', 'aplicacoesFinanceiras']], [0])],
    options: [
      {
        id: 'A',
        text: `−${p1(Math.abs(AH_CAIXA))}: o caixa caiu quase pela metade (${f1(B24.caixa)} → ${f1(B25.caixa)}), uma queda de ${a1(VAR_CAIXA)} milhões, muito maior que a do Ativo Total (−${p1(Math.abs(AH_ATIVO))}).`,
      },
      {
        id: 'B',
        text: `+${p1(Math.abs(AH_CAIXA))}: o caixa cresceu, porque o lucro de 2025 foi maior que o de 2024.`,
        whyWrong: 'Sinal trocado: 978,1 é menor que 1.926,1. E lucro não é caixa — o lucro maior não impede o caixa de cair.',
      },
      {
        id: 'C',
        text: `−96,9%: o caixa de 2024 era 96,9% maior que o de 2025.`,
        whyWrong: '96,9% usa 2025 como base (1.926,1 ÷ 978,1 − 1). A base da A.H. é o ano anterior (2024).',
      },
      {
        id: 'D',
        text: `−4,5%: o peso do caixa no Ativo Total caiu de 9,5% para 5,0%.`,
        whyWrong: 'Isso é a variação da A.V. em pontos percentuais, não a A.H. A A.H. mede quanto o valor da conta variou.',
      },
      {
        id: 'E',
        text: `−3,6%: o caixa caiu na mesma proporção que o Ativo Total.`,
        whyWrong: '−3,6% é a A.H. do Ativo Total. O caixa caiu muito mais que o ativo — é justamente o que torna a linha relevante.',
      },
    ],
    correct: 'A',
    calc: { fn: 'analiseHorizontal', args: [B25.caixa, B24.caixa] },
    solution: {
      formula: 'A.H. = Atual / Anterior − 1',
      substitution: `A.H. caixa = ${f1(B25.caixa)} / ${f1(B24.caixa)} − 1`,
      computation: `${(B25.caixa / B24.caixa).toFixed(4).replace('.', ',')} − 1 = −${p1(Math.abs(AH_CAIXA))}`,
      result: `−${p1(Math.abs(AH_CAIXA))}`,
      unit: '% de variação sobre 2024',
      interpretation: `O caixa caiu ${a1(VAR_CAIXA)} milhões, enquanto o Ativo Total caiu ${a1(VAR_ATIVO)}: a queda do ativo é quase toda explicada pelo caixa. Do lado direito, empréstimos e debêntures foram de ${f1(B24.emprestimosDebentures)} a zero.`,
    },
    explanation: `A.H. = ${f1(B25.caixa)} ÷ ${f1(B24.caixa)} − 1 = −${p1(Math.abs(AH_CAIXA))}. A A.H. isola a linha que puxou a variação do ativo: o Ativo Total caiu só ${p1(Math.abs(AH_ATIVO))}, mas o caixa caiu quase metade. Nenhum número se lê sozinho: para saber se é problema, olhe para onde o dinheiro foi (dívidas quitadas, recompra de ações, dividendos) e se a liquidez se manteve.`,
    reasoningSteps: [
      'Base: 2024 (ano anterior).',
      'Divida 2025 por 2024, subtraia 1; sinal negativo = queda.',
      'Compare com a A.H. do Ativo Total para ver se a linha foi a responsável pela variação.',
      'Procure a contrapartida no lado direito do balanço.',
    ],
    commonMistake: 'Inverter a base (dividir 2024 por 2025) ou confundir a variação da A.V. (em p.p.) com a A.H.',
    rule: 'A.H. de uma conta é lida contra a A.H. do total: a conta que varia muito mais que o total é a que explica a mudança.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'O caixa de 2025 é maior ou menor que o de 2024? O sinal vem daí.',
    concept: 'A A.H. mostra o que mudou entre as duas fotos do balanço e localiza a conta responsável pela variação.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-012',
    type: 'multiple-choice',
    topic: 'av',
    subtopic: 'A.V. do Passivo Circulante — quem financia',
    skill: 'ren-av-bp',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: 'Observe o Passivo Circulante da Renner em 31/12/2025 e escolha a leitura correta sobre quem financia a empresa no curto prazo.',
    tables: [rennerLiabilityTable()],
    options: [
      {
        id: 'A',
        text: `A maior fonte de curto prazo são os bancos: Empréstimos, financiamentos e debêntures somam ${f1(B24.emprestimosDebentures)}.`,
        whyWrong: `${f1(B24.emprestimosDebentures)} é o saldo de 2024. Em 2025 a linha está ZERADA: a Renner quitou a dívida bancária de curto prazo.`,
      },
      {
        id: 'B',
        text: `O maior item do PC são os Fornecedores (${f1(B25.fornecedores)}), como em qualquer varejista.`,
        whyWrong: `Fornecedores é o segundo item (${p1(FORN_PC25)} do PC). O maior é Obrigações com administradoras de cartões, ${f1(B25.administradorasCartoes)}.`,
      },
      {
        id: 'C',
        text: `O PC cresceu ${p1(Math.abs(AH_PC))} em 2025, o que indica aumento do endividamento de curto prazo.`,
        whyWrong: `O PC CAIU ${p1(Math.abs(AH_PC))} (${f1(B24.passivoCirculante)} → ${f1(B25.passivoCirculante)}), puxado pela quitação de empréstimos e dos financiamentos de serviços financeiros de curto prazo.`,
      },
      {
        id: 'D',
        text: `O PC representa ${p1(AV_PC25)} do Passivo + PL, o que significa que terceiros financiam mais que os sócios.`,
        whyWrong: `A A.V. do PC está certa (${p1(AV_PC25)}), mas terceiros no total (PC + PNC) somam ${p1(AV_TERC25)}, menos que o PL (${p1(AV_PL25)}): os sócios ainda são o maior financiador.`,
      },
      {
        id: 'E',
        text: `O maior item do PC são as Obrigações com administradoras de cartões (${f1(B25.administradorasCartoes)}, ${p1(CART_PC25)} do PC), seguidas de Fornecedores (${f1(B25.fornecedores)}): dívidas operacionais, sem juros explícitos ("de graça"), enquanto a dívida bancária de curto prazo foi zerada (${f1(B24.emprestimosDebentures)} → ${f1(B25.emprestimosDebentures)}).`,
      },
    ],
    correct: 'E',
    explanation: `A pergunta do slide da Aula 5 é "a dívida é cara (bancos) ou de graça (fornecedores)?". No PC da Renner, os dois maiores itens são operacionais: administradoras de cartões (${f1(B25.administradorasCartoes)}: a venda já aconteceu, mas a Renner ainda deve repassar/paga à bandeira) e fornecedores (${f1(B25.fornecedores)}). Não carregam juros explícitos. Os empréstimos e debêntures de curto prazo saíram de ${f1(B24.emprestimosDebentures)} para zero, e o PC como um todo caiu ${p1(Math.abs(AH_PC))}.`,
    reasoningSteps: [
      'Ordene os itens do PC do maior para o menor.',
      'Classifique cada um: operacional (fornecedores, cartões, salários, impostos) ou financeiro (empréstimos, debêntures, arrendamentos).',
      'Compare 2025 com 2024: o que foi quitado, o que cresceu?',
      'Conclua sobre o custo da dívida: operacional é "de graça"; bancária custa juros.',
    ],
    commonMistake: 'Supor que o maior passivo de um varejista é sempre Fornecedores, ou ler o saldo de 2024 como se fosse o de 2025.',
    rule: 'No passivo, separe dívida operacional (sem juros explícitos) de dívida financeira (com juros): só a segunda pesa no resultado financeiro.',
    hint: 'Qual é a única linha do PC acima de 2.000? Ela cobra juros?',
    concept: 'A composição do passivo diz se a empresa é financiada por quem cobra juros (bancos) ou por quem não cobra (fornecedores, operadoras de cartão).',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-013',
    type: 'true-false',
    topic: 'alavancagem',
    subtopic: 'Capital próprio × terceiros',
    skill: 'ren-estrutura-capital',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `Julgue: "Como a linha Empréstimos, financiamentos e debêntures do Passivo Circulante da Renner está zerada em 2025, a empresa é financiada 100% por capital próprio e sua alavancagem é igual a 1,0."`,
    correct: false,
    explanation: `Não ter dívida bancária de curto prazo não é o mesmo que não ter terceiros. O PL financia ${p1(AV_PL25)} do ativo; os outros ${p1(AV_TERC25)} vêm de terceiros: administradoras de cartões (${f1(B25.administradorasCartoes)}), fornecedores (${f1(B25.fornecedores)}), arrendamentos a pagar (${f1(ARREND25)} somando curto e longo prazo), financiamentos de serviços financeiros de longo prazo (${f1(B25.financiamentosServFinLP)}), impostos, salários e dividendos. Por isso a alavancagem é ${f2(ALAV25)} (${f1(B25.ativoTotal)} ÷ ${f1(B25.patrimonioLiquido)}), não 1,0.`,
    reasoningSteps: [
      'Alavancagem = Ativo Total ÷ PL; só vale 1,0 se Passivo = 0.',
      'Some PC + PNC: isso é tudo o que terceiros financiam, com ou sem juros.',
      'Calcule a A.V. do PL e de terceiros.',
      'Conclua: dívida bancária zero ≠ passivo zero.',
    ],
    commonMistake: 'Confundir "sem empréstimos bancários" com "sem passivo"; fornecedores, cartões e arrendamentos também são terceiros.',
    rule: 'Terceiros = todo o Passivo (circulante + não circulante), não só as dívidas com bancos; alavancagem = 1,0 só quando o Passivo é zero.',
    formula: 'Alavancagem = Ativo Total / Patrimônio Líquido',
    hint: 'Some PC e PNC: isso é zero?',
    concept: 'Alavancagem mede quantos R$ de ativo cada R$ 1 dos sócios sustenta; sobe conforme fornecedores e dívidas financiam parte do ativo.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-014',
    type: 'numeric',
    topic: 'av',
    subtopic: 'A.V. do Passivo + PL — estrutura de capital',
    skill: 'ren-estrutura-capital',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Quem financia a Renner? Calcule quanto o Patrimônio Líquido representa do total de Passivo + PL em 31/12/2025. Responda em %, com 1 casa decimal.',
    tables: [
      bpTable(
        'Lojas Renner — PASSIVO + PL (recorte)',
        [
          ['PASSIVO CIRCULANTE', 'passivoCirculante'],
          ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'],
          ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido'],
          ['PASSIVO TOTAL + PL (= Ativo Total)', 'ativoTotal'],
        ],
        [3],
      ),
    ],
    balanceCheck: BAL,
    correct: 53.3,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [B25.patrimonioLiquido, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = PL / (Passivo + PL) × 100',
      substitution: `A.V. PL 2025 = ${f1(B25.patrimonioLiquido)} / ${f1(B25.ativoTotal)} × 100`,
      computation: `${(B25.patrimonioLiquido / B25.ativoTotal).toFixed(4).replace('.', ',')} × 100 = ${p1(AV_PL25)}`,
      result: p1(AV_PL25),
      unit: '% do Passivo + PL',
      interpretation: `Os sócios financiam ${p1(AV_PL25)} do ativo; terceiros, ${p1(AV_TERC25)} (PC ${p1(AV_PC25)} + PNC ${p1(AV_PNC25)}). Em 2024 o PL pesava ${p1(AV_PL24)}: estrutura praticamente estável.`,
    },
    explanation: `Do lado direito, a A.V. responde "quem financia?". Como Ativo = Passivo + PL, a base é o Ativo Total: ${f1(B25.patrimonioLiquido)} ÷ ${f1(B25.ativoTotal)} = ${p1(AV_PL25)}. Pouco mais da metade do ativo é capital próprio; o restante vem de terceiros, majoritariamente de curto prazo (PC ${p1(AV_PC25)}).`,
    reasoningSteps: [
      'Lembre que Passivo + PL = Ativo Total: essa é a base.',
      'Divida o PL pelo total e multiplique por 100.',
      'Complemento = terceiros (PC + PNC).',
      'Compare com o ano anterior: a estrutura mudou?',
    ],
    commonMistake: 'Dividir o PL pelo Passivo (terceiros) em vez de pelo total, obtendo mais de 100%.',
    rule: 'A.V. do lado direito do BP usa como base o total Passivo + PL, que é igual ao Ativo Total.',
    formula: 'A.V. = PL / (Passivo + PL) × 100',
    hint: 'O total do lado direito já está na tabela com outro nome.',
    concept: 'A estrutura de capital mostra a proporção entre capital próprio e de terceiros no financiamento do ativo.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-015',
    type: 'multi-part',
    topic: 'liquidez',
    subtopic: 'Liquidez Corrente 2024 × 2025',
    skill: 'ren-liquidez',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'Com o Balanço da Renner, calcule a Liquidez Corrente dos dois anos e interprete a mudança.',
    tables: [
      bpTable(
        'Lojas Renner — Circulantes (recorte)',
        [
          ['ATIVO CIRCULANTE', 'ativoCirculante'],
          ['  Caixa e equivalentes de caixa', 'caixa'],
          ['  Aplicações financeiras', 'aplicacoesFinanceiras'],
          ['  Contas a receber', 'contasReceber'],
          ['  Estoques', 'estoques'],
          ['PASSIVO CIRCULANTE', 'passivoCirculante'],
          ['  Empréstimos, financiamentos e debêntures', 'emprestimosDebentures'],
          ['  Financiamentos — operações serv. financeiros', 'financiamentosServFin'],
          ['  Fornecedores', 'fornecedores'],
          ['  Obrigações com administradoras de cartões', 'administradorasCartoes'],
          ['  Obrigações estatutárias (dividendos/JCP)', 'obrigacoesEstatutarias'],
        ],
        [0, 5],
      ),
    ],
    balanceCheck: BAL,
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Liquidez Corrente em 31/12/2024 (2 casas decimais).',
        correct: 1.61,
        unit: 'ratio',
        decimals: 2,
        points: 3,
        calc: { fn: 'liquidezCorrente', args: [B24.ativoCirculante, B24.passivoCirculante] },
        solution: {
          formula: 'LC = Ativo Circulante / Passivo Circulante',
          substitution: `LC 2024 = ${f1(B24.ativoCirculante)} / ${f1(B24.passivoCirculante)}`,
          computation: `= ${LC24.toFixed(4).replace('.', ',')}`,
          result: f2(LC24),
          unit: 'vezes (índice)',
          interpretation: `Para cada R$ 1,00 de obrigação de curto prazo havia R$ ${f2(LC24)} de recursos de curto prazo: folga.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) Liquidez Corrente em 31/12/2025 (2 casas decimais).',
        correct: 1.69,
        unit: 'ratio',
        decimals: 2,
        points: 3,
        calc: { fn: 'liquidezCorrente', args: [B25.ativoCirculante, B25.passivoCirculante] },
        solution: {
          formula: 'LC = Ativo Circulante / Passivo Circulante',
          substitution: `LC 2025 = ${f1(B25.ativoCirculante)} / ${f1(B25.passivoCirculante)}`,
          computation: `= ${LC25.toFixed(4).replace('.', ',')}`,
          result: f2(LC25),
          unit: 'vezes (índice)',
          interpretation: `R$ ${f2(LC25)} de AC para cada R$ 1,00 de PC: a folga aumentou mesmo com o caixa caindo ${p1(Math.abs(AH_CAIXA))}.`,
        },
      },
      {
        id: 'c',
        kind: 'choice',
        prompt: 'c) Qual a leitura mais adequada?',
        points: 4,
        options: [
          {
            id: 'A',
            text: `A LC caiu porque o caixa caiu ${p1(Math.abs(AH_CAIXA))}; a Renner está em situação de atenção.`,
            whyWrong: `A LC SUBIU (${f2(LC24)} → ${f2(LC25)}). O caixa caiu, mas o PC caiu ainda mais em proporção.`,
          },
          {
            id: 'B',
            text: `A LC subiu de ${f2(LC24)} para ${f2(LC25)} porque o AC cresceu com o aumento das contas a receber.`,
            whyWrong: `O AC CAIU ${p1(Math.abs(AH_AC))} (as contas a receber cresceram ${p1(AH_CR)}, mas o caixa caiu ${p1(Math.abs(AH_CAIXA))}). A melhora veio do denominador.`,
          },
          {
            id: 'C',
            text: `A LC subiu de ${f2(LC24)} para ${f2(LC25)} porque o PC caiu ${p1(Math.abs(AH_PC))} (empréstimos de ${f1(B24.emprestimosDebentures)} para zero e financiamentos de serviços financeiros de ${f1(B24.financiamentosServFin)} para ${f1(B25.financiamentosServFin)}) mais do que o AC (−${p1(Math.abs(AH_AC))}); a folga continua, mas o AC agora depende mais de recebíveis (${f1(B25.contasReceber)}) e menos de caixa.`,
          },
          {
            id: 'D',
            text: `Com LC acima de 1,5 nos dois anos, não há nada a analisar: liquidez alta é sempre boa.`,
            whyWrong: 'Nunca leia o número sozinho: a composição mudou (menos caixa, mais recebíveis) e isso muda a qualidade da liquidez, mesmo com o índice maior.',
          },
        ],
        correct: 'C',
      },
    ],
    explanation: `LC = AC ÷ PC: ${f2(LC24)} em 2024 e ${f2(LC25)} em 2025 — folga nos dois anos. O índice melhorou porque o PC caiu ${p1(Math.abs(AH_PC))}, mais que o AC (−${p1(Math.abs(AH_AC))}): a Renner usou caixa para zerar empréstimos e reduzir financiamentos de curto prazo. Mas a composição do AC mudou: caixa e recebíveis valem mais que estoque, e dentro do AC os recebíveis (crédito ao consumidor) ganharam peso sobre o caixa.`,
    reasoningSteps: [
      'Calcule AC ÷ PC nos dois anos (não use totais).',
      'Classifique: > 1 folga, = 1 limite, < 1 atenção.',
      'Explique a variação pela A.H. do AC e do PC: qual caiu mais?',
      'Olhe a composição: o que compõe o AC (caixa × recebíveis × estoques) e o PC (operacional × financeiro).',
    ],
    commonMistake: 'Supor que a queda do caixa derruba a LC sem olhar o que aconteceu com o Passivo Circulante.',
    rule: 'LC muda pelo numerador E pelo denominador: compare as A.H. do AC e do PC antes de concluir, e depois leia a composição.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'O PC caiu mais ou menos que o AC?',
    concept: 'Liquidez Corrente compara recursos e obrigações de curto prazo; sua leitura exige conhecer a composição e o que mudou entre os anos.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-016',
    type: 'numeric',
    topic: 'giro',
    subtopic: 'Giro do Ativo — varejo × cervejaria',
    skill: 'ren-giro',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: `Calcule o Giro do Ativo da Renner em 2025 e compare com o da Ambev no mesmo ano (${f2(GIRO_AMBEV_2025)}x). Arredonde para 2 casas decimais.`,
    tables: [
      dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida']], [0]),
      bpTable('Lojas Renner — BP (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0]),
    ],
    correct: 0.81,
    unit: 'times',
    decimals: 2,
    calc: { fn: 'giro', args: [D25.receitaLiquida, B25.ativoTotal] },
    solution: {
      formula: 'Giro do Ativo = Receita líquida / Ativo Total',
      substitution: `Giro 2025 = ${f1(D25.receitaLiquida)} / ${f1(B25.ativoTotal)}`,
      computation: `= ${GIRO25.toFixed(4).replace('.', ',')}`,
      result: `${f2(GIRO25)}x`,
      unit: 'vezes por ano',
      interpretation: `Cada R$ 1 investido no ativo gera R$ ${f2(GIRO25)} de venda por ano (2024: ${f2(GIRO24)}x). A Ambev gira ${f2(GIRO_AMBEV_2025)}x: "o varejo gira mais que a cervejaria", que carrega fábricas, marcas e ágio em um ativo enorme.`,
    },
    explanation: `Giro = ${f1(D25.receitaLiquida)} ÷ ${f1(B25.ativoTotal)} = ${f2(GIRO25)}x. O giro subiu de ${f2(GIRO24)}x porque a receita cresceu ${p1(AH_REC)} e o ativo encolheu ${p1(Math.abs(AH_ATIVO))}: "vender mais com a mesma (ou menor) estrutura". Comparado à Ambev (${f2(GIRO_AMBEV_2025)}x), a Renner gira mais, como se espera do varejo — mas com margem menor (${p1(ML25)} contra ${'18,1%'} da Ambev).`,
    reasoningSteps: [
      'Numerador: Receita líquida (DRE); denominador: Ativo Total (BP).',
      'Divida e arredonde: o resultado é "vezes", não %.',
      'Compare com o ano anterior: o giro melhora se a receita cresce mais que o ativo.',
      'Compare com setores: varejo gira mais; indústria pesada e bebidas giram menos e precisam de margem maior.',
    ],
    commonMistake: 'Dividir a receita pelo PL (1,51x) ou pelo Ativo Circulante, ou responder em %.',
    rule: 'Giro = Receita ÷ Ativo Total: mede quantos reais de venda cada real investido gera por ano; julgue-o pelo setor e pela tendência.',
    formula: 'Giro = Receita líquida / Ativo Total',
    hint: 'Receita de um ano sobre o ativo de uma foto: dá um número em "vezes".',
    concept: 'O Giro do Ativo mede a eficiência no uso do ativo; varejo tende a girar mais que indústria pesada e bebidas.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-017',
    type: 'multi-part',
    topic: 'dupont',
    subtopic: 'DuPont 2025 × 2024',
    skill: 'ren-dupont',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `Decomponha o ROE da Renner em 2025 pela análise DuPont e compare com 2024 (Margem Líquida ${p1(ML24)} × Giro ${f2(GIRO24)} × Alavancagem ${f2(ALAV24)} = ${p1(ROE24)}).`,
    tables: [
      dreTable('Lojas Renner — DRE (recorte)', [['Receita operacional líquida', 'receitaLiquida'], ['= Lucro Líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Lojas Renner — BP (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Alavancagem em 2025 (2 casas decimais).',
        correct: 1.88,
        unit: 'times',
        decimals: 2,
        points: 3,
        calc: { fn: 'alavancagem', args: [B25.ativoTotal, B25.patrimonioLiquido] },
        solution: {
          formula: 'Alavancagem = Ativo Total / Patrimônio Líquido',
          substitution: `Alavancagem 2025 = ${f1(B25.ativoTotal)} / ${f1(B25.patrimonioLiquido)}`,
          computation: `= ${ALAV25.toFixed(4).replace('.', ',')}`,
          result: `${f2(ALAV25)}x`,
          unit: 'vezes',
          interpretation: `Cada R$ 1 dos sócios sustenta R$ ${f2(ALAV25)} de ativo; terceiros financiam os outros R$ ${f2(ALAV25 - 1)}. Em 2024 era ${f2(ALAV24)}x: praticamente estável, levemente menor.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) ROE 2025 pela decomposição DuPont (Margem × Giro × Alavancagem), em %, com 1 casa decimal.',
        correct: 13.9,
        unit: 'percent',
        decimals: 1,
        points: 3,
        calc: { fn: 'dupontDemonstracoes', args: [D25.lucroLiquido, D25.receitaLiquida, B25.ativoTotal, B25.patrimonioLiquido] },
        solution: {
          formula: 'ROE = (LL / Receita) × (Receita / Ativo) × (Ativo / PL)',
          substitution: `ROE 2025 = ${p1(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)}`,
          computation: `= ${p1(ROE25)} (com os fatores arredondados: 9,2% × 0,81 × 1,88 ≈ 14,0%; a diferença é só arredondamento)`,
          result: p1(ROE25),
          unit: '% sobre o PL',
          interpretation: `O produto dos três fatores reproduz o ROE direto (${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)} = ${p1(ROE25)}): a receita e o ativo se cancelam na multiplicação.`,
        },
      },
      {
        id: 'c',
        kind: 'choice',
        prompt: `c) O ROE subiu de ${p1(ROE24)} para ${p1(ROE25)}. De onde veio a melhora?`,
        points: 4,
        options: [
          {
            id: 'A',
            text: `Da alavancagem: a Renner tomou mais dívida e multiplicou o retorno dos sócios.`,
            whyWrong: `A alavancagem CAIU levemente (${f2(ALAV24)} → ${f2(ALAV25)}); a empresa quitou empréstimos. Não foi ela que puxou o ROE.`,
          },
          {
            id: 'B',
            text: `Da margem líquida (${p1(ML24)} → ${p1(ML25)}) e do giro (${f2(GIRO24)} → ${f2(GIRO25)}): a operação rendeu mais por real vendido e vendeu mais por real de ativo, com alavancagem praticamente estável (${f2(ALAV24)} → ${f2(ALAV25)}) — melhora de origem operacional.`,
          },
          {
            id: 'C',
            text: `Só da margem: o giro e a alavancagem não mudam de um ano para o outro.`,
            whyWrong: `O giro subiu de ${f2(GIRO24)} para ${f2(GIRO25)} (receita +${p1(AH_REC)} com ativo −${p1(Math.abs(AH_ATIVO))}) e contribuiu tanto quanto a margem.`,
          },
          {
            id: 'D',
            text: `Da queda do PL (−${p1(Math.abs(AH_PL))}): com menos capital próprio, qualquer lucro parece maior.`,
            whyWrong: `A queda do PL é pequena e já está capturada na alavancagem, que mal mudou. O lucro cresceu ${p1(AH_LL)}: a melhora é real, não efeito de base.`,
          },
        ],
        correct: 'B',
      },
    ],
    explanation: `DuPont 2025: ${p1(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)} = ${p1(ROE25)}; 2024: ${p1(ML24)} × ${f2(GIRO24)} × ${f2(ALAV24)} = ${p1(ROE24)}. Dois fatores subiram (margem e giro) e um ficou estável/caiu de leve (alavancagem). Logo, a melhora do ROE veio da operação — vender mais, com mais sobra por venda e sobre um ativo menor — e não de mais dívida. É a leitura "sustentável" que o acionista prefere.`,
    reasoningSteps: [
      'Calcule os três fatores de cada ano: LL/Receita, Receita/Ativo, Ativo/PL.',
      'Multiplique e confira com o ROE direto (LL/PL).',
      'Compare fator a fator: qual subiu, qual caiu?',
      'Classifique a origem: margem e giro = operação; alavancagem = estrutura de capital (faca de dois gumes).',
    ],
    commonMistake: 'Atribuir a melhora do ROE à alavancagem sem verificar que ela ficou estável, ou somar os fatores em vez de multiplicar.',
    rule: 'Para explicar a variação do ROE, compare os três fatores DuPont ano a ano: a origem está no fator que mudou.',
    formula: 'ROE = Margem Líquida × Giro × Alavancagem',
    hint: 'Qual dos três fatores NÃO subiu?',
    concept: 'A decomposição DuPont separa o ROE em eficiência de margem, eficiência no uso do ativo e estrutura de capital.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-018',
    type: 'true-false',
    topic: 'ah',
    subtopic: 'A.H. do IR e das margens',
    skill: 'ren-ah-dre',
    caseTag: 'renner',
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `Julgue: "Na Renner, o Lucro Operacional cresceu ${p1(AH_LO)}, mas o Lucro Líquido cresceu só ${p1(AH_LL)}. A diferença é explicada pelas linhas abaixo do Lucro Operacional: o IR/CS mais que dobrou (+${p1(AH_IR)}, de ${a1(D24.irCs)} para ${a1(D25.irCs)}) e o resultado financeiro passou de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)}. Por isso a Margem Líquida subiu menos (+${f1(ML25 - ML24)} p.p.) do que a Margem Operacional (+${f1(MO25 - MO24)} p.p.)."`,
    correct: true,
    explanation: `Entre o Lucro Operacional e o Lucro Líquido há duas linhas: resultado financeiro e IR. As duas pioraram em 2025: o financeiro virou negativo (−${a1(VAR_RF)} milhões de diferença) e o IR subiu ${p1(AH_IR)} — a alíquota efetiva sobre o LAIR passou de ${p1(ALIQ24)} para ${p1(ALIQ25)}. Resultado: o LO cresceu ${p1(AH_LO)}, o LAIR ${p1(AH_LAIR)} e o LL ${p1(AH_LL)}; a Margem Operacional ganhou ${f1(MO25 - MO24)} p.p. e a Líquida só ${f1(ML25 - ML24)} p.p. A A.H. degrau a degrau localiza exatamente onde a melhora se perdeu.`,
    reasoningSteps: [
      'Compare a A.H. de cada "=" da DRE: LB, LO, LAIR, LL.',
      'Onde o crescimento desacelera, olhe as linhas entre os dois degraus.',
      'Entre LO e LL: resultado financeiro e IR.',
      'Traduza para margens: a diferença entre a variação da MO e da ML vem dessas linhas.',
    ],
    commonMistake: 'Olhar só a A.H. do Lucro Líquido e concluir que "tudo melhorou", sem perceber que o LO cresceu quase o dobro.',
    rule: 'Leia a A.H. degrau por degrau: a diferença entre o crescimento de dois lucros consecutivos está nas linhas entre eles.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'O que fica entre o Lucro Operacional e o Lucro Líquido na DRE?',
    concept: 'A A.H. aplicada aos subtotais da DRE mostra em que degrau a melhora da operação foi parcialmente consumida.',
    sourceReference: SRC_A4,
  },

  // =====================================================================================
  // PARTE B — Renner, roteiro da prova em 3 partes (12 questões discursivas)
  // =====================================================================================
  {
    id: 'ren-019',
    type: 'essay',
    topic: 'av',
    subtopic: 'Parte 1 — onde a empresa investe',
    skill: 'roteiro-av-ativo',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 1, order: 1 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 1 — Decisões de investimento e financiamento (Balanço). Pergunta 1: Quais são as contas mais importantes do ativo da Renner em 31/12/2025? Como a empresa distribui seus investimentos (A.V.) e isso faz sentido para o modelo de negócio de uma varejista de moda com braço financeiro (Realize)?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        {
          id: 'receb',
          description: `Identifica Contas a receber como a maior conta (${p1(AV_CR25)} do ativo, ${f1(B25.contasReceber)}) e a liga ao crédito ao consumidor / Realize.`,
          points: 4,
          keywords: [['receb', '36,6'], ['receb', '36,5'], ['receb', '7.175'], ['receb', '7175']],
        },
        {
          id: 'outras',
          description: `Cita ao menos duas outras contas relevantes com A.V.: Imobilizado ${p1(AV_IMOB25)}, Direito de uso ${p1(AV_DUSO25)}, Estoques ${p1(AV_EST25)}, Intangível ${p1(AV_INTANG25)}, Caixa ${p1(AV_CAIXA25)} + Aplicações ${p1(AV_APLIC25)}.`,
          points: 3,
          keywords: [['imobilizado', '14,9'], ['estoque', '9,5'], ['direito de uso', '10,6'], ['intang', '8,2'], ['caixa', '5,0'], ['circulante', '59,3']],
        },
        {
          id: 'sentido',
          description: 'Avalia a coerência com o modelo de negócio: varejo (lojas alugadas = direito de uso, estoques de moda) + financeira (recebíveis), relacionando com a receita de serviços e as perdas em crédito.',
          points: 3,
          keywords: [['realize'], ['credito', 'consumidor'], ['cartao'], ['financeir', 'receb'], ['loja', 'estoque']],
        },
      ],
      seriousErrors: [
        { description: 'Afirma que estoques ou imobilizado são a maior conta do ativo.', patterns: ['maior conta e o estoque', 'maior conta e o imobilizado', 'estoques sao a maior', 'imobilizado e a maior'], penalty: 2 },
        { description: 'Usa o Ativo Circulante como base da A.V. do ativo.', patterns: ['dividido pelo ativo circulante', 'sobre o ativo circulante'], penalty: 1 },
      ],
      modelAnswer: `O Ativo Total da Renner em 31/12/2025 é de R$ ${f1(B25.ativoTotal)} milhões, ${p1(AV_AC25)} no circulante. A maior conta, de longe, é Contas a receber: ${f1(B25.contasReceber)} = ${p1(AV_CR25)} do ativo (em 2024, ${p1(AV_CR24)}). Depois vêm Imobilizado ${f1(B25.imobilizado)} (${p1(AV_IMOB25)}), Direito de uso ${f1(B25.direitoUso)} (${p1(AV_DUSO25)} — as lojas alugadas), Estoques ${f1(B25.estoques)} (${p1(AV_EST25)}), Intangível ${f1(B25.intangivel)} (${p1(AV_INTANG25)}) e Caixa + Aplicações ${f1(B25.caixa + B25.aplicacoesFinanceiras)} (${p1(AV_CAIXA25 + AV_APLIC25)}). A distribuição faz sentido para o modelo: a Renner é varejista de moda (estoques, lojas, marca) E financeira (Realize): ela vende a prazo e no cartão próprio, por isso mais de um terço do ativo é crédito a clientes. Isso aparece na DRE: ${p1(AV_SERV)} da receita vem de serviços financeiros (${f1(D25.vendaServicos)}) e existe a linha "perdas em crédito" (${a1(D25.perdasCredito)}). Um varejista "puro" teria estoques e imobilizado no topo; na Renner o investimento principal é financiar o consumidor. ${RUBRIC_NOTE}`,
    },
    explanation: `A Parte 1 do roteiro começa com a A.V. do ativo: ordenar as contas pelo peso no Ativo Total e perguntar se a distribuição é coerente com o negócio. Na Renner, Contas a receber (${p1(AV_CR25)}) supera Imobilizado (${p1(AV_IMOB25)}) e Estoques (${p1(AV_EST25)}): a empresa investe mais em crédito ao consumidor do que em lojas e mercadorias — reflexo da Realize.`,
    reasoningSteps: [
      'Calcule a A.V. das principais contas sobre o Ativo Total e ordene.',
      'Agrupe: operacionais de varejo (estoques, imobilizado, direito de uso, intangível) × financeiras (contas a receber) × caixa.',
      'Cruze com a DRE: há receita e risco (perdas) ligados a cada grupo?',
      'Conclua com números: "faz sentido porque...".',
    ],
    commonMistake: 'Descrever o ativo sem números ou sem ligar a maior conta ao modelo de negócio (crédito ao consumidor).',
    rule: 'Na prova, toda afirmação sobre o ativo vem com a A.V.: "conta X = Y% do ativo, porque o negócio é Z".',
    formula: 'A.V. = Conta / Ativo Total × 100',
    hint: 'Qual conta passa de 7.000? Por que uma loja de roupas teria tanto a receber?',
    concept: 'A A.V. do ativo mostra onde a empresa investe; sua coerência deve ser julgada contra o modelo de negócio.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-020',
    type: 'essay',
    topic: 'ah',
    subtopic: 'Parte 1 — queda do ativo e do caixa',
    skill: 'roteiro-ah-ativo',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 1, order: 2 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: `Parte 1 — Pergunta 2: O ativo total da Renner caiu ${p1(Math.abs(AH_ATIVO))} (de ${f1(B24.ativoTotal)} para ${f1(B25.ativoTotal)}) e o caixa caiu ${p1(Math.abs(AH_CAIXA))} (de ${f1(B24.caixa)} para ${f1(B25.caixa)}). O que explica essas quedas? Isso é sinal de problema? Use a A.H. e cite as contas do lado direito que mudaram.`,
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        {
          id: 'caixa',
          description: `Quantifica a queda do caixa (−${p1(Math.abs(AH_CAIXA))}, −${a1(VAR_CAIXA)}) e mostra que ela explica a maior parte da queda do ativo (−${a1(VAR_ATIVO)}).`,
          points: 3,
          keywords: [['caixa', '49,2'], ['caixa', '948'], ['caixa', '978'], ['caixa', '738']],
        },
        {
          id: 'destino',
          description: `Localiza para onde foi o dinheiro: empréstimos e debêntures de ${f1(B24.emprestimosDebentures)} para zero, financiamentos de serviços financeiros de curto prazo de ${f1(B24.financiamentosServFin)} para ${f1(B25.financiamentosServFin)} (PC −${p1(Math.abs(AH_PC))}), recompra de ações (tesouraria de ${a1(B24.acoesTesouraria)} para ${a1(B25.acoesTesouraria)}) e dividendos; PL −${p1(Math.abs(AH_PL))}.`,
          points: 4,
          keywords: [['emprest', '522'], ['emprest', 'zero'], ['emprest', 'zerad'], ['debent', '522'], ['tesouraria', '344'], ['passivo circulante', '10,2'], ['financiamento', '409']],
        },
        {
          id: 'julgamento',
          description: `Julga com comparação: não é sinal de problema por si só — a liquidez corrente subiu (${f2(LC24)} → ${f2(LC25)}), a receita cresceu ${p1(AH_REC)} e o giro subiu (${f2(GIRO24)} → ${f2(GIRO25)}); o ponto de atenção é o resultado financeiro que virou negativo (${f1(D25.resultadoFinanceiro)}).`,
          points: 3,
          keywords: [['liquidez', '1,69'], ['liquidez', '1,6'], ['giro', '0,81'], ['financeiro', '82,5'], ['receita', '9,6']],
        },
      ],
      seriousErrors: [
        { description: 'Conclui que o caixa caiu porque a empresa teve prejuízo ou lucro menor (lucro não é caixa; o lucro cresceu 21,8%).', patterns: ['caixa caiu porque o lucro caiu', 'prejuizo', 'lucro menor explica'], penalty: 2 },
        { description: 'Trata queda de ativo como necessariamente ruim, sem comparação.', patterns: ['queda do ativo e sempre ruim', 'empresa esta quebrando', 'sinal claro de problema'], penalty: 1 },
      ],
      modelAnswer: `O Ativo Total caiu ${a1(VAR_ATIVO)} (−${p1(Math.abs(AH_ATIVO))}); só o caixa caiu ${a1(VAR_CAIXA)} (−${p1(Math.abs(AH_CAIXA))}, de ${f1(B24.caixa)} para ${f1(B25.caixa)}) — ou seja, a queda do ativo é mais que explicada pelo caixa, pois Contas a receber subiu ${p1(AH_CR)} (${f1(B24.contasReceber)} → ${f1(B25.contasReceber)}) e Estoques caíram só ${p1(Math.abs(AH_EST))}. Para onde foi o dinheiro? Para o lado direito: o PC caiu ${a1(VAR_PC)} (−${p1(Math.abs(AH_PC))}), com Empréstimos, financiamentos e debêntures de ${f1(B24.emprestimosDebentures)} para ${f1(B25.emprestimosDebentures)} e Financiamentos de serviços financeiros de curto prazo de ${f1(B24.financiamentosServFin)} para ${f1(B25.financiamentosServFin)}; o PL caiu ${a1(VAR_PL)} (−${p1(Math.abs(AH_PL))}) apesar do lucro de ${f1(D25.lucroLiquido)}, porque a empresa recomprou ações (tesouraria de ${a1(B24.acoesTesouraria)} para ${a1(B25.acoesTesouraria)}) e distribuiu dividendos/JCP (obrigações estatutárias ${f1(B25.obrigacoesEstatutarias)} ainda a pagar). O PNC subiu ${p1(AH_PNC)} (financiamentos de serviços financeiros de longo prazo de ${f1(B24.financiamentosServFinLP)} para ${f1(B25.financiamentosServFinLP)}): parte da dívida curta foi alongada. É problema? Não por si só: a Renner usou caixa para quitar dívida cara e devolver capital aos sócios, a liquidez corrente até subiu (${f2(LC24)} → ${f2(LC25)}), a receita cresceu ${p1(AH_REC)} e o giro passou de ${f2(GIRO24)} para ${f2(GIRO25)}. O ponto de atenção é o resultado financeiro: com menos caixa aplicado, ele saiu de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)}. ${RUBRIC_NOTE}`,
    },
    explanation: `A A.H. localiza o que mudou (caixa −${p1(Math.abs(AH_CAIXA))}) e o lado direito explica o porquê (dívidas quitadas, recompra de ações, dividendos). Queda de ativo não é, por si, boa ou ruim: um ativo menor com receita maior eleva o giro e o ROE; o custo foi perder receita financeira.`,
    reasoningSteps: [
      'Compare a variação em R$ do ativo com a de cada conta: quem explica a queda?',
      'Procure a contrapartida: que contas do Passivo e do PL caíram no mesmo valor?',
      'Verifique a liquidez e o giro depois da mudança.',
      'Julgue com comparação, nunca com "ruim" ou "ótimo" isolados.',
    ],
    commonMistake: 'Ler a queda do caixa como prejuízo ou como "a empresa está quebrando" — o lucro subiu 21,8% e a liquidez melhorou.',
    rule: 'Toda queda de ativo tem contrapartida no lado direito: ache-a antes de julgar.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'Some as quedas de empréstimos e financiamentos de curto prazo e compare com a queda do caixa.',
    concept: 'A A.H. do balanço revela as decisões do ano: o que a empresa comprou, vendeu, pagou e distribuiu.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-021',
    type: 'essay',
    topic: 'alavancagem',
    subtopic: 'Parte 1 — quem financia',
    skill: 'roteiro-estrutura-capital',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 1, order: 3 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 1 — Pergunta 3: Quem financia a Renner: capital de terceiros ou capital próprio, em qual proporção (A.V. do Passivo + PL em 2025)? Quem é o maior financiador de terceiros e essa dívida é cara (bancos) ou "de graça" (operacional)? O que isso significa em termos de risco e retorno para o acionista?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        {
          id: 'proporcao',
          description: `Dá a proporção: PL ${p1(AV_PL25)} × terceiros ${p1(AV_TERC25)} (PC ${p1(AV_PC25)} + PNC ${p1(AV_PNC25)}).`,
          points: 3,
          keywords: [['53,3'], ['53,2'], ['46,7'], ['35,0', '11,7']],
        },
        {
          id: 'financiador',
          description: `Identifica os maiores financiadores de terceiros: administradoras de cartões ${f1(B25.administradorasCartoes)} (${p1(AV_CART25)} do total), fornecedores ${f1(B25.fornecedores)}, arrendamentos ${f1(ARREND25)} (CP + LP); dívida bancária de curto prazo zerada.`,
          points: 4,
          keywords: [['cart', '2.602'], ['cart', '2602'], ['cart', '13,3'], ['fornecedor', '1.774'], ['arrendamento', '2.505'], ['arrendamento', '1.765']],
        },
        {
          id: 'risco',
          description: `Risco e retorno: alavancagem ${f2(ALAV25)} (moderada), dívida majoritariamente operacional e sem juros explícitos → risco financeiro baixo; ROE ${p1(ROE25)} obtido mais por operação do que por dívida.`,
          points: 3,
          keywords: [['alavancagem', '1,88'], ['alavancagem', '1,9'], ['roe', '13,9'], ['juros', 'de graca'], ['sem juros']],
        },
      ],
      seriousErrors: [
        { description: 'Afirma que a Renner é financiada 100% por capital próprio por não ter empréstimos bancários.', patterns: ['100% capital proprio', '100% por capital proprio', 'nao tem capital de terceiros', 'nao possui terceiros'], penalty: 2 },
        { description: 'Diz que os bancos são o maior financiador.', patterns: ['bancos sao o maior financiador', 'maior financiador sao os bancos', 'maior fonte sao os emprestimos'], penalty: 2 },
      ],
      modelAnswer: `Do total de Passivo + PL de ${f1(B25.ativoTotal)}, o PL financia ${f1(B25.patrimonioLiquido)} = ${p1(AV_PL25)} e terceiros financiam ${f1(TERC25)} = ${p1(AV_TERC25)} (PC ${f1(B25.passivoCirculante)} = ${p1(AV_PC25)}; PNC ${f1(B25.passivoNaoCirculante)} = ${p1(AV_PNC25)}). A estrutura é pouco alavancada: Ativo/PL = ${f2(ALAV25)} (2024: ${f2(ALAV24)}). Entre os terceiros, o maior financiador são as administradoras de cartões, ${f1(B25.administradorasCartoes)} (${p1(AV_CART25)} do total e ${p1(CART_PC25)} do PC), seguidas de fornecedores ${f1(B25.fornecedores)} (${p1(AV_FORN25)}) e arrendamentos a pagar ${f1(ARREND25)} (${p1(AV_ARREND25)}, curto + longo prazo — as lojas alugadas). Empréstimos e debêntures de curto prazo foram zerados (${f1(B24.emprestimosDebentures)} em 2024) e a dívida com juros que resta é pequena: financiamentos de serviços financeiros ${f1(B25.financiamentosServFin + B25.financiamentosServFinLP)}. Ou seja, a dívida é majoritariamente operacional, "de graça" (cartões, fornecedores, salários, impostos) — o que se confirma no resultado financeiro quase neutro (${f1(D25.resultadoFinanceiro)}). Risco e retorno: risco financeiro baixo (pouca dívida cara, LC ${f2(LC25)}), mas o acionista abre mão do multiplicador da alavancagem: o ROE de ${p1(ROE25)} vem de margem (${p1(ML25)}) e giro (${f2(GIRO25)}), não de dívida. ${RUBRIC_NOTE}`,
    },
    explanation: `"Quem financia?" se responde com a A.V. do lado direito: PL ${p1(AV_PL25)} contra terceiros ${p1(AV_TERC25)}. Depois, a pergunta da Aula 5: a dívida é cara ou de graça? Na Renner, os maiores credores são operadoras de cartão e fornecedores — sem juros explícitos. Pouca alavancagem = menos risco e menos multiplicador para o ROE.`,
    reasoningSteps: [
      'Calcule a A.V. de PL, PC e PNC sobre o total.',
      'Dentro do passivo, ordene os credores e classifique-os: operacionais × financeiros.',
      'Calcule a alavancagem (Ativo/PL) e leia: quanto de ativo cada R$ 1 dos sócios sustenta.',
      'Traduza em risco (juros, prazo) e retorno (multiplicador do ROE).',
    ],
    commonMistake: 'Confundir "sem empréstimos bancários" com "sem terceiros", ou esquecer arrendamentos e cartões como dívida.',
    rule: 'Estrutura de capital = A.V. do lado direito + natureza dos credores: quem são, se cobram juros e em que prazo.',
    formula: 'Alavancagem = Ativo Total / PL',
    hint: 'Some PC + PNC e compare com o PL. Depois ache a linha maior que 2.000 no PC.',
    concept: 'A estrutura de capital determina o risco financeiro e o efeito multiplicador da alavancagem sobre o retorno do acionista.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-022',
    type: 'essay',
    topic: 'liquidez',
    subtopic: 'Parte 1 — financiamento da queda do ativo e prazos',
    skill: 'roteiro-liquidez',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 1, order: 4 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: `Parte 1 — Pergunta 4: Como a queda do ativo (−${a1(VAR_ATIVO)}) foi "financiada" do lado direito do balanço — que contas do Passivo e do PL caíram ou subiram? Há descasamento de prazos entre ativo e passivo? Use a Liquidez Corrente dos dois anos e a composição do AC e do PC.`,
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        {
          id: 'lado-direito',
          description: `Decompõe a queda de ${a1(VAR_ATIVO)}: PC −${a1(VAR_PC)} (−${p1(Math.abs(AH_PC))}), PNC +${f1(VAR_PNC)} (+${p1(AH_PNC)}), PL −${a1(VAR_PL)} (−${p1(Math.abs(AH_PL))}).`,
          points: 4,
          keywords: [['passivo circulante', '10,2'], ['passivo circulante', '780'], ['nao circulante', '18,5'], ['nao circulante', '359'], ['patrimonio', '316'], ['patrimonio', '2,9']],
        },
        {
          id: 'lc',
          description: `Calcula a LC dos dois anos (${f2(LC24)} → ${f2(LC25)}) e conclui que há folga (> 1), sem descasamento: AC ${f1(B25.ativoCirculante)} cobre o PC ${f1(B25.passivoCirculante)}.`,
          points: 3,
          keywords: [['1,69'], ['1,61', '1,7'], ['11.633', '6.866'], ['11633', '6866']],
        },
        {
          id: 'composicao',
          description: `Lê a composição: recebíveis ${f1(B25.contasReceber)} (${p1(av(B25.contasReceber, B25.ativoCirculante))} do AC) financiados por cartões ${f1(B25.administradorasCartoes)} e financiamentos de serviços financeiros (agora majoritariamente de longo prazo, ${f1(B25.financiamentosServFinLP)}); caixa menor é o ponto de atenção.`,
          points: 3,
          keywords: [['receb', 'cart'], ['receb', '7.175'], ['caixa', '978'], ['longo prazo', '358'], ['dividendo', '212']],
        },
      ],
      seriousErrors: [
        { description: 'Calcula a liquidez com Ativo Total / Passivo Total.', patterns: ['ativo total / passivo total', 'ativo total dividido pelo passivo total', 'ativo total sobre o passivo'], penalty: 2 },
        { description: 'Conclui que LC < 1 ou insolvência.', patterns: ['liquidez menor que 1', 'abaixo de 1', 'insolven'], penalty: 2 },
      ],
      modelAnswer: `O ativo caiu ${a1(VAR_ATIVO)} (${f1(B24.ativoTotal)} → ${f1(B25.ativoTotal)}). Do lado direito: o Passivo Circulante caiu ${a1(VAR_PC)} (${f1(B24.passivoCirculante)} → ${f1(B25.passivoCirculante)}, −${p1(Math.abs(AH_PC))}), sobretudo por empréstimos e debêntures (${f1(B24.emprestimosDebentures)} → 0) e financiamentos de serviços financeiros de CP (${f1(B24.financiamentosServFin)} → ${f1(B25.financiamentosServFin)}); o Passivo Não Circulante subiu ${f1(VAR_PNC)} (${f1(B24.passivoNaoCirculante)} → ${f1(B25.passivoNaoCirculante)}, +${p1(AH_PNC)}), porque os financiamentos de serviços financeiros foram alongados (LP de ${f1(B24.financiamentosServFinLP)} para ${f1(B25.financiamentosServFinLP)}); e o PL caiu ${a1(VAR_PL)} (−${p1(Math.abs(AH_PL))}) por recompra de ações e dividendos, mesmo com lucro de ${f1(D25.lucroLiquido)}. Soma: −${a1(VAR_PC)} + ${f1(VAR_PNC)} − ${a1(VAR_PL)} = −${a1(VAR_ATIVO)}. Prazos: a Liquidez Corrente passou de ${f2(LC24)} (${f1(B24.ativoCirculante)} ÷ ${f1(B24.passivoCirculante)}) para ${f2(LC25)} (${f1(B25.ativoCirculante)} ÷ ${f1(B25.passivoCirculante)}): folga nos dois anos, e maior em 2025, porque o PC caiu mais que o AC (−${p1(Math.abs(AH_PC))} contra −${p1(Math.abs(AH_AC))}). Não há descasamento: o AC cobre o PC com sobra de ${f1(B25.ativoCirculante - B25.passivoCirculante)}. A composição, porém, mudou: o AC depende mais de recebíveis (${f1(B25.contasReceber)}, ${p1(av(B25.contasReceber, B25.ativoCirculante))} do AC) e menos de caixa (${f1(B25.caixa)}); esses recebíveis são financiados por cartões (${f1(B25.administradorasCartoes)}) e pelos financiamentos de serviços financeiros, agora de longo prazo — dívida casada com um ativo que gira em meses. Os dividendos declarados (${f1(B25.obrigacoesEstatutarias)}) incham o PC sem ser dívida nova. ${RUBRIC_NOTE}`,
    },
    explanation: `Ativo = Passivo + PL: se o ativo caiu ${a1(VAR_ATIVO)}, o lado direito caiu o mesmo valor — basta somar as variações de PC, PNC e PL. A pergunta dos prazos se responde com a LC (${f2(LC24)} → ${f2(LC25)}) e com a composição: caixa e recebíveis valem mais que estoque; dívida de longo prazo financiando recebíveis de curto prazo é prazo casado.`,
    reasoningSteps: [
      'Calcule a variação em R$ de PC, PNC e PL e confira que soma a variação do ativo.',
      'Dentro de cada grupo, ache as linhas que explicam a variação.',
      'Calcule LC dos dois anos e classifique (folga/limite/atenção).',
      'Leia a composição do AC e do PC antes de concluir sobre prazos.',
    ],
    commonMistake: 'Calcular a liquidez com totais (Ativo Total / Passivo Total) ou ignorar que o PNC subiu ao mesmo tempo que o PC caiu (alongamento).',
    rule: 'A variação do ativo é sempre igual à soma das variações do passivo e do PL; a LC diz se os prazos casam, a composição diz com que qualidade.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'Some: variação do PC + variação do PNC + variação do PL. Dá −738,6?',
    concept: 'Financiamento e prazos: toda mudança no ativo tem contrapartida no lado direito, e a liquidez corrente mostra se o curto prazo está coberto.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-023',
    type: 'essay',
    topic: 'margens',
    subtopic: 'Parte 2 — Margem Bruta',
    skill: 'roteiro-margem-bruta',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 2, order: 5 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 2 — Resultados (DRE). Pergunta 5: Calcule e compare a Margem Bruta da Renner em 2024 e 2025. O produto é rentável? O que a A.H. da receita e do custo explica sobre a variação?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'mb', description: `Margem Bruta 2024 = ${p1(MB24)} e 2025 = ${p1(MB25)} (+${f1(MB25 - MB24)} p.p.).`, points: 4, keywords: [['60,6', '61,7'], ['60,5', '61,7'], ['61,7', '1,1']] },
        { id: 'ah', description: `A.H.: receita +${p1(AH_REC)}, custo +${p1(AH_CUSTO)}, lucro bruto +${p1(AH_LB)} — o custo cresceu menos que a receita.`, points: 3, keywords: [['9,6', '6,4'], ['9,6', '6,5'], ['11,7'], ['custo', 'menos que a receita']] },
        { id: 'leitura', description: 'Responde "o produto é rentável?" com comparação: margem alta para varejo (mais de 60% de cada venda sobra após o custo), melhorou, típica de moda com marca própria.', points: 3, keywords: [['rentavel'], ['sobra', 'custo'], ['marca'], ['moda', 'margem']] },
      ],
      seriousErrors: [
        { description: 'Usa o Lucro Operacional ou Líquido como Margem Bruta.', patterns: ['margem bruta de 11,4', 'margem bruta de 9,2', 'margem bruta = lucro liquido'], penalty: 2 },
        { description: 'Diz que o custo caiu em valor.', patterns: ['custo caiu', 'custo diminuiu', 'reducao do custo em reais'], penalty: 1 },
      ],
      modelAnswer: `Margem Bruta = Lucro Bruto ÷ Receita líquida. 2024: ${f1(D24.lucroBruto)} ÷ ${f1(D24.receitaLiquida)} = ${p1(MB24)}. 2025: ${f1(D25.lucroBruto)} ÷ ${f1(D25.receitaLiquida)} = ${p1(MB25)}. Melhora de ${f1(MB25 - MB24)} p.p. A A.H. explica: a receita cresceu ${p1(AH_REC)} (mercadorias +${p1(AH_MERC)}, serviços +${p1(AH_SERV)}) enquanto o custo das vendas cresceu só ${p1(AH_CUSTO)} (${a1(D24.custoVendas)} → ${a1(D25.custoVendas)}); por isso o Lucro Bruto cresceu ${p1(AH_LB)}, mais que a receita, e a A.V. do custo caiu de ${p1(AVC24)} para ${p1(AVC25)}. Regra: a margem melhora quando a linha de baixo cresce mais devagar que a receita. O produto é rentável? Sim, e cada vez mais: de cada R$ 100 vendidos sobram R$ ${f1(MB25)} depois do custo do tecido, da confecção e do custo dos serviços financeiros — margem alta para varejo (um supermercado trabalha com margem bruta muito menor), típica de moda com marca própria e mix de serviços; e melhor que a da própria Renner em 2024. ${RUBRIC_NOTE}`,
    },
    explanation: `A Margem Bruta responde "o produto é rentável?". Na Renner ela passou de ${p1(MB24)} para ${p1(MB25)} porque a receita (+${p1(AH_REC)}) cresceu mais que o custo (+${p1(AH_CUSTO)}). Sempre apresente os dois anos, a variação em p.p. e a A.H. das duas linhas que a compõem.`,
    reasoningSteps: [
      'Calcule LB ÷ Receita nos dois anos.',
      'Expresse a mudança em pontos percentuais.',
      'Compare a A.H. da receita com a A.H. do custo.',
      'Julgue por comparação: ano anterior e natureza do negócio.',
    ],
    commonMistake: 'Dizer "a margem bruta é boa" sem citar os dois anos, ou ler o sinal negativo do custo como queda.',
    rule: 'Margem comparada = dois anos + variação em p.p. + A.H. das linhas que explicam.',
    formula: 'MB = Lucro Bruto / Receita líquida × 100',
    hint: 'Receita +9,6% e custo +6,4%: qual cresceu mais?',
    concept: 'A Margem Bruta mede a sobra da atividade em si, depois do custo que gruda no produto.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-024',
    type: 'essay',
    topic: 'margens',
    subtopic: 'Parte 2 — Margem Operacional',
    skill: 'roteiro-margem-operacional',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 2, order: 6 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 2 — Pergunta 6: Calcule a Margem Operacional de 2024 e 2025. De onde veio a melhora? Identifique, com a A.H., quais despesas operacionais cresceram mais e quais cresceram menos que a receita.',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'mo', description: `MO 2024 = ${p1(MO24)}; MO 2025 = ${p1(MO25)} (+${f1(MO25 - MO24)} p.p.); LO +${p1(AH_LO)}.`, points: 4, keywords: [['8,7', '11,4'], ['8,7', '11,3'], ['42,7'], ['11,4', '2,7']] },
        { id: 'despesas', description: `Despesas operacionais ${f1(DESPOP24)} → ${f1(DESPOP25)} (+${p1(AH_DESPOP)}, menos que a receita); por linha: vendas +${p1(AH_DV)}, administrativas +${p1(AH_DA)}, depreciações +${p1(AH_DEP)}, perdas em crédito −${f1(Math.abs(AH_PERDAS))}%, outros +${p1(AH_OUT)}.`, points: 4, keywords: [['vendas', '7,7'], ['administrativ', '7,9'], ['perdas', '0,7'], ['deprecia', '4,0'], ['outros', '12,2'], ['6,5', 'despesas']] },
        { id: 'origem', description: `Conclui: a melhora veio do Lucro Bruto (+${p1(AH_LB)}) e de despesas crescendo abaixo da receita (A.V. das despesas ${p1(AV_DESPOP24)} → ${p1(AV_DESPOP25)}), e não do financeiro ou do IR.`, points: 2, keywords: [['lucro bruto', '11,7'], ['51,8', '50,4'], ['abaixo da receita'], ['menos que a receita']] },
      ],
      seriousErrors: [
        { description: 'Atribui a melhora da Margem Operacional ao resultado financeiro ou ao IR.', patterns: ['melhora veio do resultado financeiro', 'margem operacional melhorou pelo ir', 'por causa do imposto'], penalty: 2 },
        { description: 'Diz que as despesas caíram em valor.', patterns: ['despesas cairam', 'despesas diminuiram', 'reduziu as despesas em reais'], penalty: 1 },
      ],
      modelAnswer: `Margem Operacional = Lucro Operacional ÷ Receita. 2024: ${f1(D24.lucroOperacional)} ÷ ${f1(D24.receitaLiquida)} = ${p1(MO24)}; 2025: ${f1(D25.lucroOperacional)} ÷ ${f1(D25.receitaLiquida)} = ${p1(MO25)} — ganho de ${f1(MO25 - MO24)} p.p., com o Lucro Operacional crescendo ${p1(AH_LO)} contra receita +${p1(AH_REC)}. A melhora tem duas origens, ambas acima do LO: (1) o Lucro Bruto cresceu ${p1(AH_LB)} (custo +${p1(AH_CUSTO)} < receita +${p1(AH_REC)}); (2) as despesas operacionais somadas cresceram ${p1(AH_DESPOP)} (${f1(DESPOP24)} → ${f1(DESPOP25)}), abaixo da receita, de modo que sua A.V. caiu de ${p1(AV_DESPOP24)} para ${p1(AV_DESPOP25)}. Linha a linha: despesas com vendas +${p1(AH_DV)} (${a1(D24.despesasVendas)} → ${a1(D25.despesasVendas)}), gerais e administrativas +${p1(AH_DA)}, depreciações e amortizações +${p1(AH_DEP)}, perdas em crédito −${f1(Math.abs(AH_PERDAS))}% (${a1(D24.perdasCredito)} → ${a1(D25.perdasCredito)}: a inadimplência ficou estável mesmo com a receita de serviços crescendo ${p1(AH_SERV)}) e outros resultados operacionais +${p1(AH_OUT)} (única linha acima da receita, mas pequena: ${a1(D25.outrosOperacionais)}). A operação "para em pé" com mais folga: de cada R$ 100 vendidos sobram R$ ${f1(MO25)} depois de custo e estrutura, contra R$ ${f1(MO24)} em 2024. O resultado financeiro e o IR não entram nessa conta — ficam abaixo do Lucro Operacional. ${RUBRIC_NOTE}`,
    },
    explanation: `Para explicar a Margem Operacional, só interessam as linhas acima do LO: custo e despesas operacionais. Na Renner todas, exceto "outros", cresceram menos que a receita (+${p1(AH_REC)}): é o caso clássico de alavancagem operacional — a estrutura cresce menos que as vendas e a margem abre.`,
    reasoningSteps: [
      'Calcule LO ÷ Receita nos dois anos.',
      'Some as despesas operacionais (LB − LO) e calcule a A.H. do bloco.',
      'Calcule a A.H. de cada despesa e compare com a da receita.',
      'Aponte as linhas que puxaram a melhora e as que a atrapalharam.',
    ],
    commonMistake: 'Explicar a Margem Operacional com o resultado financeiro ou o IR, ou dizer que as despesas "caíram" quando apenas cresceram menos que a receita.',
    rule: 'A melhora de margem vem de linhas que crescem menos que a receita: liste-as com a A.H. de cada uma.',
    formula: 'MO = Lucro Operacional / Receita líquida × 100',
    hint: 'A receita cresceu 9,6%. Quais despesas cresceram menos que isso?',
    concept: 'A Margem Operacional mede se a operação completa (produto + estrutura) para em pé; sua variação é explicada pela A.H. das despesas contra a da receita.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-025',
    type: 'essay',
    topic: 'resultado-financeiro',
    subtopic: 'Parte 2 — Margem Líquida, financeiro e IR',
    skill: 'roteiro-margem-liquida',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 2, order: 7 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 2 — Pergunta 7: Calcule a Margem Líquida de 2024 e 2025. Qual foi o papel do resultado financeiro e do IR/CS na passagem do Lucro Operacional ao Lucro Líquido? Por que a Margem Líquida melhorou menos que a Operacional?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'ml', description: `ML 2024 = ${p1(ML24)}; ML 2025 = ${p1(ML25)} (+${f1(ML25 - ML24)} p.p.); LL +${p1(AH_LL)}.`, points: 3, keywords: [['8,3', '9,2'], ['9,2', '0,9'], ['21,8']] },
        { id: 'financeiro', description: `Resultado financeiro passou de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)} (n.m.; −${a1(VAR_RF)}), ligado ao caixa menor; explica a A.H. como não significativa.`, points: 3, keywords: [['61,7', '82,5'], ['financeiro', '82,5'], ['financeiro', 'negativo', '144']] },
        { id: 'ir', description: `IR/CS de ${a1(D24.irCs)} para ${a1(D25.irCs)} (+${p1(AH_IR)}); alíquota efetiva ${p1(ALIQ24)} → ${p1(ALIQ25)} do LAIR.`, points: 2, keywords: [['106,8'], ['124,3', '257,1'], ['257,1'], ['15,0', '9,4']] },
        { id: 'conclusao', description: `Conclui: LO +${p1(AH_LO)} mas LL +${p1(AH_LL)}, porque as duas linhas abaixo do LO pioraram; MO +${f1(MO25 - MO24)} p.p. × ML +${f1(ML25 - ML24)} p.p.`, points: 2, keywords: [['42,7', '21,8'], ['2,7', '0,9'], ['abaixo do lucro operacional']] },
      ],
      seriousErrors: [
        { description: 'Calcula a A.H. do resultado financeiro como percentual (ex.: −233,7%) e a interpreta.', patterns: ['233,7', '233%', '-233'], penalty: 1 },
        { description: 'Afirma que o resultado financeiro melhorou.', patterns: ['resultado financeiro melhorou', 'financeiro ajudou o lucro em 2025'], penalty: 2 },
      ],
      modelAnswer: `Margem Líquida = Lucro Líquido ÷ Receita: 2024 ${f1(D24.lucroLiquido)} ÷ ${f1(D24.receitaLiquida)} = ${p1(ML24)}; 2025 ${f1(D25.lucroLiquido)} ÷ ${f1(D25.receitaLiquida)} = ${p1(ML25)} (+${f1(ML25 - ML24)} p.p.). De cada R$ 100 vendidos, R$ ${f1(ML25)} chegam ao acionista. O Lucro Líquido cresceu ${p1(AH_LL)}, bem menos que o Lucro Operacional (+${p1(AH_LO)}), porque as duas linhas entre eles pioraram. (1) Resultado financeiro: de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)} — como o sinal mudou, a A.H. é "n.m."; em R$ a piora é de ${a1(VAR_RF)}. A causa está no balanço: caixa −${p1(Math.abs(AH_CAIXA))} (menos receita de aplicações) e, mesmo com empréstimos zerados, juros dos financiamentos de serviços financeiros e dos arrendamentos. (2) IR/CS: de ${a1(D24.irCs)} para ${a1(D25.irCs)} (+${p1(AH_IR)}), enquanto o LAIR cresceu ${p1(AH_LAIR)} (${f1(LAIR24)} → ${f1(LAIR25)}): a alíquota efetiva subiu de ${p1(ALIQ24)} para ${p1(ALIQ25)}. Resultado: a Margem Operacional ganhou ${f1(MO25 - MO24)} p.p. (${p1(MO24)} → ${p1(MO25)}), mas a Líquida só ${f1(ML25 - ML24)} p.p. — parte da melhora operacional foi consumida abaixo do LO. O lucro continua vindo da operação (LO ${f1(D25.lucroOperacional)}), não do financeiro, o que é saudável; o ponto a monitorar é a perda da receita financeira. ${RUBRIC_NOTE}`,
    },
    explanation: `Entre o LO e o LL estão o resultado financeiro e o IR. Os dois pioraram em 2025, por isso o LL cresceu ${p1(AH_LL)} contra ${p1(AH_LO)} do LO. Quando a linha financeira troca de sinal, a A.H. é n.m. e a análise é feita em R$.`,
    reasoningSteps: [
      'Calcule a ML dos dois anos e compare com a MO.',
      'Identifique as linhas entre LO e LL.',
      'Para o financeiro, verifique o sinal: se mudou, descreva em R$ (n.m.).',
      'Para o IR, compare a A.H. do imposto com a A.H. do LAIR (alíquota efetiva).',
    ],
    commonMistake: 'Interpretar um percentual para o resultado financeiro que trocou de sinal, ou atribuir ao IR uma melhora.',
    rule: 'Se LL cresce menos que LO, a explicação está obrigatoriamente no resultado financeiro ou no IR.',
    formula: 'ML = Lucro Líquido / Receita líquida × 100',
    hint: 'O resultado financeiro mudou de sinal. O que isso faz com a A.H.?',
    concept: 'A Margem Líquida é o fim do filme: além da operação, incorpora o efeito do caixa, das dívidas e do imposto.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-026',
    type: 'essay',
    topic: 'roe',
    subtopic: 'Parte 2 — ROE e satisfação do acionista',
    skill: 'roteiro-roe',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 2, order: 8 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: `Parte 2 — Pergunta 8: Calcule o ROE da Renner em 2025 e em 2024. Como acionista, você estaria satisfeito? Justifique comparando com o ano anterior e com as referências vistas em aula (Renner ${ROE_REF.rennerAnterior}% na data-base anterior, Ambev ${ROE_REF.ambev}%, Itaú ${ROE_REF.itau}%, Casas Bahia ${ROE_REF.casasBahia}%).`,
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'roe', description: `ROE 2025 = ${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)} = ${p1(ROE25)}; 2024 = ${p1(ROE24)}.`, points: 4, keywords: [['13,9'], ['1.457', '10.456'], ['1457', '10456']] },
        { id: 'comparacao', description: `Compara: +${f1(ROE25 - ROE24)} p.p. sobre 2024 (${p1(ROE24)}); abaixo dos ${ROE_REF.rennerAnterior}% históricos e de Ambev/Itaú; muito acima de varejistas com ROE negativo.`, points: 3, keywords: [['11,1'], ['16%'], ['16 %'], ['ambev', '18'], ['itau', '24'], ['casas bahia']] },
        { id: 'julgamento', description: 'Julga com critério: satisfação depende do custo de oportunidade do acionista (renda fixa / outras ações de risco parecido) e da tendência; nunca "ótimo" ou "ruim" isolado.', points: 3, keywords: [['custo de oportunidade'], ['custo do capital'], ['renda fixa'], ['alternativa'], ['tendencia', 'melhor']] },
      ],
      seriousErrors: [
        { description: 'Calcula o ROE sobre o Ativo Total ou sobre a Receita.', patterns: ['roe = lucro liquido / ativo', 'roe de 7,4', 'roe de 9,2'], penalty: 2 },
        { description: 'Julga o ROE isoladamente como ótimo/ruim.', patterns: ['roe otimo', 'roe e otimo', 'roe pessimo', 'roe e ruim'], penalty: 1 },
      ],
      modelAnswer: `ROE = Lucro Líquido ÷ Patrimônio Líquido. 2025: ${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)} = ${p1(ROE25)}. 2024: ${f1(D24.lucroLiquido)} ÷ ${f1(B24.patrimonioLiquido)} = ${p1(ROE24)}. Para cada R$ 100 deixados na empresa, voltaram R$ ${f1(ROE25)} em 2025, contra R$ ${f1(ROE24)} em 2024: melhora de ${f1(ROE25 - ROE24)} p.p., vinda do lucro (+${p1(AH_LL)}) e, marginalmente, do PL menor (−${p1(Math.abs(AH_PL))}, por recompra de ações e dividendos). Satisfeito? Depende da comparação. Contra o passado: melhorou, mas ainda não voltou aos ${ROE_REF.rennerAnterior}% da própria Renner na data-base da lista da aula. Contra pares: fica abaixo de Ambev (${ROE_REF.ambev}%) e Itaú (${ROE_REF.itau}%) — mas bancos operam com alavancagem de ~10× e bens de consumo têm margens maiores; dentro do varejo, está muito acima de Casas Bahia (${ROE_REF.casasBahia}%). Contra o custo de oportunidade: o acionista compara ${p1(ROE25)} com o que obteria em renda fixa ou em ações de risco parecido; um ROE próximo ao custo do capital remunera pouco o risco do negócio. Conclusão: tendência positiva e retorno razoável para varejo, mas sem folga grande sobre o custo de capital — a satisfação é moderada e condicionada à continuidade da melhora de margem e giro. ${RUBRIC_NOTE}`,
    },
    explanation: `ROE = ${p1(ROE25)} (2025) contra ${p1(ROE24)} (2024). O julgamento é sempre relativo: ano anterior, histórico, pares do setor e custo de oportunidade. Bancos e bens de consumo rendem mais que varejo por alavancagem e margem — comparar sem esse filtro leva a conclusões erradas.`,
    reasoningSteps: [
      'Calcule LL ÷ PL nos dois anos.',
      'Compare com o ano anterior (tendência).',
      'Compare com o histórico e com pares, lembrando das diferenças de setor.',
      'Compare com o custo de oportunidade do acionista.',
    ],
    commonMistake: 'Responder "sim, 13,9% é ótimo" sem nenhuma comparação, ou dividir pelo Ativo Total.',
    rule: 'ROE se julga em três comparações: tempo, pares e custo do capital.',
    formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
    hint: 'Com o que o acionista compara 13,9%?',
    concept: 'O ROE responde à pergunta do dono; a satisfação depende das alternativas de investimento com risco parecido.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-027',
    type: 'essay',
    topic: 'dupont',
    subtopic: 'Parte 2 — DuPont 2025 × 2024',
    skill: 'roteiro-dupont',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 2, order: 9 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 2 — Pergunta 9: Decomponha o ROE de 2025 pela análise DuPont (Margem Líquida × Giro do Ativo × Alavancagem) e compare com 2024. Qual fator explica a mudança do ROE?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'fatores25', description: `2025: ML ${p1(ML25)} × Giro ${f2(GIRO25)} × Alavancagem ${f2(ALAV25)} = ${p1(ROE25)}.`, points: 4, keywords: [['9,2', '0,81', '1,88'], ['9,2', '0,81', '1,9'], ['9,2', '0,8', '1,88']] },
        { id: 'fatores24', description: `2024: ML ${p1(ML24)} × Giro ${f2(GIRO24)} × Alavancagem ${f2(ALAV24)} = ${p1(ROE24)}.`, points: 3, keywords: [['8,3', '0,71', '1,89'], ['8,3', '0,71', '1,9'], ['8,3', '0,7', '1,89']] },
        { id: 'origem', description: 'Conclui que a melhora veio de margem e giro (operação), com alavancagem estável/levemente menor — não de dívida.', points: 3, keywords: [['margem', 'giro', 'alavancagem'], ['operac', 'nao', 'divida'], ['alavancagem', 'estavel'], ['alavancagem', 'caiu']] },
      ],
      seriousErrors: [
        { description: 'Soma os fatores em vez de multiplicar.', patterns: ['9,2 + 0,81', 'soma dos fatores', 'somando margem'], penalty: 2 },
        { description: 'Atribui a melhora à alavancagem.', patterns: ['melhora veio da alavancagem', 'aumentou a alavancagem', 'mais divida explica'], penalty: 2 },
      ],
      modelAnswer: `ROE = Margem Líquida × Giro × Alavancagem = (LL ÷ Receita) × (Receita ÷ Ativo) × (Ativo ÷ PL). 2025: ${f1(D25.lucroLiquido)} ÷ ${f1(D25.receitaLiquida)} = ${p1(ML25)}; ${f1(D25.receitaLiquida)} ÷ ${f1(B25.ativoTotal)} = ${f2(GIRO25)}; ${f1(B25.ativoTotal)} ÷ ${f1(B25.patrimonioLiquido)} = ${f2(ALAV25)}. Produto: ${p1(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)} ≈ ${p1(ROE25)} (igual ao ROE direto ${f1(D25.lucroLiquido)} ÷ ${f1(B25.patrimonioLiquido)}; pequenas diferenças são arredondamento). 2024: ${p1(ML24)} × ${f2(GIRO24)} × ${f2(ALAV24)} = ${p1(ROE24)}. Comparando fator a fator: a margem subiu de ${p1(ML24)} para ${p1(ML25)} (custo e despesas crescendo menos que a receita); o giro subiu de ${f2(GIRO24)} para ${f2(GIRO25)} (receita +${p1(AH_REC)} sobre um ativo ${p1(Math.abs(AH_ATIVO))} menor — "vender mais com a mesma estrutura" e enxugar caixa ocioso); a alavancagem praticamente não mudou (${f2(ALAV24)} → ${f2(ALAV25)}, até caiu um pouco, porque empréstimos foram quitados). Logo, a melhora do ROE de ${p1(ROE24)} para ${p1(ROE25)} tem origem operacional (margem e giro), e não em mais dívida — é a melhora "de boa qualidade", que não aumenta o risco do acionista. Margem × giro (retorno sobre o ativo) subiu de ${p1(ML24 * GIRO24)} para ${p1(ML25 * GIRO25)}. ${RUBRIC_NOTE}`,
    },
    explanation: `DuPont separa o ROE em três perguntas: quanto sobra de cada venda (margem), quantas vendas cada real de ativo gera (giro) e quanto de ativo cada real dos sócios sustenta (alavancagem). Na Renner, os dois primeiros subiram e o terceiro ficou estável: melhora operacional.`,
    reasoningSteps: [
      'Calcule os três fatores de cada ano com as demonstrações.',
      'Multiplique e confira com LL ÷ PL.',
      'Compare cada fator entre os anos.',
      'Nomeie a origem: operação (margem, giro) ou estrutura de capital (alavancagem).',
    ],
    commonMistake: 'Comparar só o ROE final sem olhar os fatores, ou somar os fatores.',
    rule: 'A explicação de uma variação de ROE está no fator DuPont que mudou — compare os três ano a ano.',
    formula: 'ROE = (LL/Receita) × (Receita/Ativo) × (Ativo/PL)',
    hint: 'Qual fator ficou praticamente igual nos dois anos?',
    concept: 'A decomposição DuPont mostra se o retorno do acionista vem de eficiência operacional ou de alavancagem financeira.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-028',
    type: 'essay',
    topic: 'estrategia',
    subtopic: 'Parte 3 — custo × diferenciação',
    skill: 'roteiro-vantagem-competitiva',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 3, order: 10 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 3 — Estratégia. Pergunta 10: Pelas demonstrações, a vantagem competitiva da Renner parece vir de custo baixo ou de diferenciação? No varejo de moda, que linhas da DRE e do BP sustentam sua resposta (margem bruta, despesas com vendas, intangível, serviços financeiros)?',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'mb', description: `Usa a Margem Bruta de ${p1(MB25)} (alta para varejo) como evidência de diferenciação (marca própria, moda, preço acima do custo).`, points: 4, keywords: [['61,7', 'diferencia'], ['margem bruta', '61'], ['61,7', 'marca']] },
        { id: 'despesas', description: `Mostra o custo da diferenciação: despesas com vendas ${a1(D25.despesasVendas)} = ${p1(AV_DV25)} da receita (lojas, pessoal, marketing); margem líquida de só ${p1(ML25)}.`, points: 3, keywords: [['vendas', '21,2'], ['vendas', '3.359'], ['vendas', '3359'], ['9,2', 'liquida']] },
        { id: 'realize', description: `Cita a Realize (${p1(AV_SERV)} da receita; recebíveis ${p1(AV_CR25)} do ativo) e/ou o intangível (${f1(B25.intangivel)}) como parte da proposta de valor e da fidelização.`, points: 3, keywords: [['realize'], ['12,8'], ['36,6'], ['intang', '1.611'], ['cartao', 'fideliz']] },
      ],
      seriousErrors: [
        { description: 'Afirma que a vantagem é de custo baixo com base na margem bruta alta (inversão lógica).', patterns: ['lideranca em custo porque a margem bruta e alta', 'custo baixo porque a margem e alta'], penalty: 2 },
      ],
      modelAnswer: `As demonstrações apontam para diferenciação. A Margem Bruta de ${p1(MB25)} (Lucro Bruto ${f1(D25.lucroBruto)} sobre receita ${f1(D25.receitaLiquida)}) significa que a Renner vende por mais de 2,5 vezes o custo da mercadoria: isso só é possível com marca, moda própria e experiência de loja — um varejista de custo baixo (atacarejo, supermercado) tem margem bruta muito menor e compete por giro. A diferenciação custa caro em estrutura: despesas com vendas de ${a1(D25.despesasVendas)} (${p1(AV_DV25)} da receita) e administrativas de ${a1(D25.despesasAdministrativas)}, além de ${f1(ARREND25)} de arrendamentos no passivo (lojas em pontos nobres) e ${f1(B25.direitoUso)} de direito de uso no ativo; por isso a Margem Operacional cai para ${p1(MO25)} e a Líquida para ${p1(ML25)}. A segunda camada da diferenciação é a Realize: ${p1(AV_SERV)} da receita (${f1(D25.vendaServicos)}) vem de serviços financeiros, e ${p1(AV_CR25)} do ativo (${f1(B25.contasReceber)}) são recebíveis de clientes — o cartão próprio fideliza e financia a compra, ao custo de ${a1(D25.perdasCredito)} de perdas em crédito. O Intangível de ${f1(B25.intangivel)} (${p1(AV_INTANG25)} do ativo: marcas, sistemas) reforça a leitura. Em resumo: diferenciação sustentada por marca e crédito, com disciplina de custo nas despesas (que cresceram ${p1(AH_DESPOP)} contra receita +${p1(AH_REC)}). ${RUBRIC_NOTE}`,
    },
    explanation: `Custo × diferenciação se lê na DRE: margem bruta alta (${p1(MB25)}) com despesas de vendas pesadas (${p1(AV_DV25)}) é o perfil de quem compete por marca e experiência, não por preço. O BP confirma: intangível, lojas (direito de uso) e carteira de crédito.`,
    reasoningSteps: [
      'Veja a Margem Bruta: alta sugere preço acima do custo (diferenciação); baixa sugere competição por preço e giro.',
      'Veja o peso das despesas de vendas: diferenciação exige loja, pessoal e marketing.',
      'Procure no BP os ativos da diferenciação: intangível, direito de uso, recebíveis do cartão.',
      'Conclua com os números e o setor.',
    ],
    commonMistake: 'Responder "diferenciação" ou "custo" sem apontar as linhas e os percentuais que sustentam a escolha.',
    rule: 'Estratégia se prova com linhas das DFs: margem bruta + despesas de vendas + ativos intangíveis dizem como a empresa compete.',
    hint: 'Uma loja que vende por 2,5× o custo compete por preço?',
    concept: 'Vantagem competitiva de custo aparece como margem bruta baixa com giro alto; de diferenciação, como margem bruta alta com despesas de venda e marca pesadas.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-029',
    type: 'essay',
    topic: 'estrategia',
    subtopic: 'Parte 3 — riscos',
    skill: 'roteiro-riscos',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 3, order: 11 },
    dataSource: 'real-renner',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 3 — Pergunta 11: Quais são os principais riscos do negócio da Renner que as demonstrações revelam? Aponte pelo menos três, cada um ligado a uma linha do BP ou da DRE, com o número correspondente.',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'credito', description: `Risco de crédito/inadimplência: contas a receber ${f1(B25.contasReceber)} (${p1(AV_CR25)} do ativo) e perdas em crédito ${a1(D25.perdasCredito)} (${p1(PERDAS_SERV)} da receita de serviços).`, points: 3, keywords: [['inadimpl', '950'], ['inadimpl', '36,6'], ['credito', '950'], ['credito', '7.175'], ['perdas', '950']] },
        { id: 'financeiro', description: `Risco financeiro/caixa: caixa −${p1(Math.abs(AH_CAIXA))} (${f1(B25.caixa)}) e resultado financeiro que virou negativo (${f1(D25.resultadoFinanceiro)}); dividendos a pagar ${f1(B25.obrigacoesEstatutarias)}.`, points: 3, keywords: [['caixa', '49,2'], ['caixa', '978'], ['financeiro', '82,5'], ['212']] },
        { id: 'outros', description: `Outro risco com número: arrendamentos ${f1(ARREND25)} (compromisso fixo com lojas), estoques de moda ${f1(B25.estoques)}, despesas de vendas ${p1(AV_DV25)} da receita (estrutura pesada), IR +${p1(AH_IR)}, concorrência/moda, dependência de cartões ${f1(B25.administradorasCartoes)}.`, points: 4, keywords: [['arrendamento', '2.505'], ['arrendamento', '1.765'], ['arrendamento', '740'], ['estoque', '1.865'], ['estoque', '1865'], ['vendas', '21,2'], ['imposto', '106,8'], ['cart', '2.602'], ['moda', 'colec']] },
      ],
      seriousErrors: [
        { description: 'Aponta endividamento bancário alto como risco (a dívida bancária de curto prazo está zerada).', patterns: ['alto endividamento bancario', 'muitos emprestimos', 'dependencia de bancos'], penalty: 1 },
        { description: 'Lista riscos sem nenhum número das demonstrações.', patterns: ['nao e possivel quantificar'], penalty: 1 },
      ],
      modelAnswer: `1) Risco de crédito: a Renner é também uma financeira — Contas a receber de ${f1(B25.contasReceber)} (${p1(AV_CR25)} do ativo, +${p1(AH_CR)} no ano) e perdas em crédito de ${a1(D25.perdasCredito)} na DRE, equivalentes a ${p1(PERDAS_SERV)} da receita de serviços (${f1(D25.vendaServicos)}). Uma piora do desemprego ou dos juros eleva a inadimplência e corrói a margem operacional. 2) Risco de caixa e resultado financeiro: o caixa caiu ${p1(Math.abs(AH_CAIXA))} (${f1(B24.caixa)} → ${f1(B25.caixa)}) e o resultado financeiro passou de +${f1(D24.resultadoFinanceiro)} para ${f1(D25.resultadoFinanceiro)}; a liquidez corrente segue folgada (${f2(LC25)}), mas o AC depende mais de recebíveis que de caixa, e há ${f1(B25.obrigacoesEstatutarias)} de dividendos/JCP a pagar no PC. 3) Risco de estrutura fixa: arrendamentos a pagar de ${f1(ARREND25)} (CP ${f1(B25.arrendamentos)} + LP ${f1(B25.arrendamentosLP)}) são compromissos de aluguel de lojas que não caem se a venda cair; somados a despesas com vendas de ${a1(D25.despesasVendas)} (${p1(AV_DV25)} da receita), tornam a Margem Operacional (${p1(MO25)}) sensível a qualquer recuo de receita. 4) Risco de moda/estoque: ${f1(B25.estoques)} de estoques (${p1(AV_EST25)} do ativo) de coleções que perdem valor rápido; a Margem Bruta de ${p1(MB25)} depende de acertar a coleção e evitar remarcações, num setor pressionado por concorrência de varejo digital. 5) Risco tributário: o IR/CS subiu ${p1(AH_IR)} (${a1(D24.irCs)} → ${a1(D25.irCs)}), com alíquota efetiva passando de ${p1(ALIQ24)} para ${p1(ALIQ25)} — a Margem Líquida (${p1(ML25)}) é sensível a mudanças de tributação. ${RUBRIC_NOTE}`,
    },
    explanation: `Risco, na prova, é uma linha das DFs que pode piorar: recebíveis e perdas em crédito (inadimplência), caixa e resultado financeiro (liquidez), arrendamentos e despesas de vendas (custo fixo), estoques (moda), IR (tributação). Cada risco vem com o número que o dimensiona.`,
    reasoningSteps: [
      'Percorra as maiores contas do ativo: o que pode perder valor? (recebíveis, estoques)',
      'Percorra o passivo: que compromissos são fixos? (arrendamentos, dividendos)',
      'Percorra a DRE: que linhas podem piorar rápido? (perdas em crédito, financeiro, IR)',
      'Para cada risco, escreva a linha, o valor e o percentual.',
    ],
    commonMistake: 'Listar riscos genéricos ("concorrência", "economia") sem ancorá-los em uma linha e um número das demonstrações.',
    rule: 'Todo risco citado deve apontar a linha das DFs onde ele apareceria e o tamanho dela hoje.',
    hint: 'Que conta do ativo depende de o cliente pagar? Que conta do passivo é aluguel de loja?',
    concept: 'Os riscos de um negócio ficam visíveis nas contas em que ele concentra investimentos e compromissos.',
    sourceReference: SRC_A4,
  },
  {
    id: 'ren-030',
    type: 'essay',
    topic: 'estrategia',
    subtopic: 'Parte 3 — ações para melhorar margens e rentabilidade',
    skill: 'roteiro-acoes',
    caseTag: 'renner',
    roteiro: { case: 'renner', part: 3, order: 12 },
    dataSource: 'real-renner',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX_ROTEIRO,
    stem: 'Parte 3 — Pergunta 12: Que ações concretas você recomendaria para melhorar as margens e a rentabilidade (ROE) da Renner? Proponha pelo menos três, indicando para cada uma a linha da DRE ou do BP afetada e o fator DuPont (margem, giro ou alavancagem) que ela movimenta.',
    tables: rennerAnnex(),
    rubric: {
      requireNumbers: true,
      criteria: [
        { id: 'margem', description: `Ação de margem com linha e número: reduzir perdas em crédito (${a1(D25.perdasCredito)}), despesas com vendas (${a1(D25.despesasVendas)}, ${p1(AV_DV25)}), custo das vendas (${p1(AVC25)}), outros operacionais (${a1(D25.outrosOperacionais)}).`, points: 4, keywords: [['perdas', '950'], ['vendas', '3.359'], ['vendas', '21,2'], ['custo', '38,3'], ['outros', '854'], ['margem', 'despesa']] },
        { id: 'giro', description: `Ação de giro com linha e número: enxugar estoques (${f1(B25.estoques)}), acelerar recebíveis (${f1(B25.contasReceber)}), desmobilizar lojas/imobilizado ocioso (${f1(B25.imobilizado)}), aplicar caixa parado (${f1(B25.caixa + B25.aplicacoesFinanceiras)}).`, points: 3, keywords: [['estoque', '1.865'], ['estoque', '1865'], ['receb', '7.175'], ['receb', '7175'], ['imobilizado', '2.929'], ['giro', 'estoque'], ['giro', '0,81']] },
        { id: 'financeiro-alav', description: `Ação sobre resultado financeiro/alavancagem com número: recompor receita financeira (resultado ${f1(D25.resultadoFinanceiro)}), usar dívida barata e casada com os recebíveis (financiamentos de serviços financeiros ${f1(B25.financiamentosServFinLP)}), alavancagem ${f2(ALAV25)}; ou gestão tributária (IR ${a1(D25.irCs)}).`, points: 3, keywords: [['financeiro', '82,5'], ['alavancagem', '1,88'], ['divida', 'barata'], ['imposto', '257'], ['ir', '257,1'], ['juros', 'prazo']] },
      ],
      seriousErrors: [
        { description: 'Propõe "aumentar a alavancagem" sem condicionar ao custo da dívida ser menor que o retorno da operação.', patterns: ['pegar mais emprestimos para aumentar o roe', 'aumentar a divida sempre'], penalty: 1 },
        { description: 'Propõe cortar o custo ou as despesas sem indicar a linha nem o valor.', patterns: ['cortar custos em geral', 'reduzir gastos de forma geral'], penalty: 1 },
      ],
      modelAnswer: `Ponto de partida: ROE ${p1(ROE25)} = margem ${p1(ML25)} × giro ${f2(GIRO25)} × alavancagem ${f2(ALAV25)}. Ações: (1) MARGEM — reduzir as perdas em crédito (${a1(D25.perdasCredito)}, ${p1(AV_PERDAS25)} da receita e ${p1(PERDAS_SERV)} da receita de serviços) com melhor análise de crédito e cobrança: cada R$ 100 milhões a menos nessa linha elevam a margem operacional em ~0,6 p.p. (linha "perdas em crédito, líquidas"; conta "contas a receber"). (2) MARGEM — conter as despesas com vendas (${a1(D25.despesasVendas)}, ${p1(AV_DV25)} da receita, +${p1(AH_DV)} no ano): produtividade por loja, renegociação de aluguéis (arrendamentos ${f1(ARREND25)}) e marketing mais eficiente, mantendo a regra "despesa crescendo menos que a receita" (linha "despesas com vendas"). (3) GIRO — enxugar estoques (${f1(B25.estoques)}, ${p1(AV_EST25)} do ativo) com coleções mais curtas e menos remarcação, e acelerar o giro dos recebíveis (${f1(B25.contasReceber)}): vender mais com a mesma estrutura, reduzindo o ativo e elevando o giro de ${f2(GIRO25)}x (linhas "estoques" e "contas a receber"; também custo das vendas de ${p1(AVC25)} da receita via menor remarcação). (4) RESULTADO FINANCEIRO — recompor a receita financeira (resultado de ${f1(D25.resultadoFinanceiro)} contra +${f1(D24.resultadoFinanceiro)} em 2024): aplicar o caixa (${f1(B25.caixa + B25.aplicacoesFinanceiras)}) e financiar a carteira da Realize com dívida barata e casada com o prazo dos recebíveis (financiamentos de serviços financeiros ${f1(B25.financiamentosServFinLP)}) — alavancagem só se o retorno da operação superar o custo dos juros (linha "resultado financeiro"; fator alavancagem, hoje ${f2(ALAV25)}). (5) IR — planejamento tributário sobre a linha IR/CS (${a1(D25.irCs)}, +${p1(AH_IR)}), por exemplo via JCP, para proteger a margem líquida. Cada ação é verificável na próxima DRE: a A.V. e a A.H. da linha citada mostrarão se funcionou. ${RUBRIC_NOTE}`,
    },
    explanation: `Ação concreta = linha das DFs + número de hoje + fator DuPont que ela move. Reduzir perdas em crédito e despesas de vendas ataca a margem; enxugar estoques e recebíveis ataca o giro; recompor receita financeira e usar dívida barata atacam o resultado financeiro e a alavancagem.`,
    reasoningSteps: [
      'Parta da decomposição DuPont: qual fator tem mais espaço para melhorar?',
      'Para a margem, escolha as maiores despesas em A.V. e proponha como contê-las.',
      'Para o giro, escolha os maiores ativos operacionais e proponha como reduzi-los sem perder venda.',
      'Para a alavancagem, só com dívida barata e casada ao prazo do ativo.',
      'Nomeie a linha e o valor de hoje para cada ação.',
    ],
    commonMistake: 'Propor ações genéricas ("cortar custos", "vender mais") sem a linha, o valor atual e o fator que ela movimenta.',
    rule: 'Toda recomendação deve ser verificável na próxima DRE/BP: diga a linha, o valor atual e o fator DuPont afetado.',
    formula: 'ROE = Margem × Giro × Alavancagem',
    hint: 'Quais as três maiores despesas em A.V.? Quais os três maiores ativos?',
    concept: 'Melhorar o ROE significa agir sobre margem (DRE), giro (ativo) ou alavancagem (passivo); as ações se escrevem nas linhas das demonstrações.',
    sourceReference: SRC_A4,
  },
];
