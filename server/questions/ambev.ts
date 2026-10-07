import type { Question, DataTable } from '../../shared/types';
import { AMBEV, AMBEV_SOURCE, ambevAssetTable, ambevLiabilityTable, ambevIncomeTable, ambevAnnex } from '../../shared/ambev';

// Caso Ambev — DADOS REAIS (planilha da disciplina: Ativo, Passivo e DRE consolidados 2025 × 2024, R$ MILHÕES).
// Estrutura do professor: Ágio separado do Intangível; "Lucro operacional" SEM a Participação em coligadas
// (ela vem depois do resultado financeiro); A.H. = |atual| ÷ |anterior| − 1.
// Parte A: treino (amb-001…amb-026). Parte B: as 12 perguntas do caso, formato da prova (amb-027…amb-038).
// Todos os números dos textos saem de AMBEV; os gabaritos numéricos são recalculados pelo validador.

const B25 = AMBEV.bp[2025];
const B24 = AMBEV.bp[2024];
const D25 = AMBEV.dre[2025];
const D24 = AMBEV.dre[2024];

const CTX = 'DADOS REAIS — Ambev S.A., DFs consolidadas 2025 × 2024 (planilha da disciplina; valores em R$ milhões)';
const CTX_ROTEIRO =
  'CASO AMBEV — Exercício de Análise das DFs (Aula 5). Responda citando sempre os números (A.V. e A.H.); resposta sem número vale no máximo metade.';
const NOTE = 'Valores em R$ milhões. ' + AMBEV_SOURCE;
const SRC_CASO = 'Caso Ambev (Aula 5)';
const SRC_PLAN = 'Planilha Ambev';
const SRC_ATIV = 'Atividade em classe Aula 4 — Ex. 4';

/** Inteiro em pt-BR (ex.: 41.538). */
const fmt = (v: number) => Math.round(v).toLocaleString('pt-BR');
/** Inteiro em módulo (para linhas negativas da DRE e variações). */
const a0 = (v: number) => fmt(Math.abs(v));
/** Número com 1 casa (ex.: 28,6). */
const f1 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Número com 2 casas (ex.: 0,96). */
const f2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Percentual com 1 casa (ex.: 28,6%). */
const p1 = (v: number) => `${f1(v)}%`;
/** Percentual com 2 casas (ex.: 18,12%). */
const p2 = (v: number) => `${f2(v)}%`;

// Indicadores derivados (só para montar textos).
const av = (conta: number, base: number) => (Math.abs(conta) / Math.abs(base)) * 100;
const ah = (atual: number, anterior: number) => (Math.abs(atual) / Math.abs(anterior) - 1) * 100;

// ---- Ativo
const AV_AGIO25 = av(B25.agio, B25.ativoTotal);
const AV_IMOB25 = av(B25.imobilizado, B25.ativoTotal);
const AV_RLP25 = av(B25.rlp, B25.ativoTotal);
const AV_CAIXA25 = av(B25.caixa, B25.ativoTotal);
const AV_CAIXA24 = av(B24.caixa, B24.ativoTotal);
const AV_INTANG25 = av(B25.intangivel, B25.ativoTotal);
const AV_EST25 = av(B25.estoques, B25.ativoTotal);
const AV_CR25 = av(B25.contasReceber, B25.ativoTotal);
const AV_AC25 = av(B25.ativoCirculante, B25.ativoTotal);
const AV_AC24 = av(B24.ativoCirculante, B24.ativoTotal);
const AV_ANC25 = av(B25.ativoNaoCirculante, B25.ativoTotal);
const AGIO_INT25 = B25.agio + B25.intangivel;
const AV_AGIO_INT25 = av(AGIO_INT25, B25.ativoTotal);
const AH_ATIVO = ah(B25.ativoTotal, B24.ativoTotal);
const AH_AC = ah(B25.ativoCirculante, B24.ativoCirculante);
const AH_ANC = ah(B25.ativoNaoCirculante, B24.ativoNaoCirculante);
const AH_CAIXA = ah(B25.caixa, B24.caixa);
const AH_AGIO = ah(B25.agio, B24.agio);
const AH_IMOB = ah(B25.imobilizado, B24.imobilizado);
const AH_INTANG = ah(B25.intangivel, B24.intangivel);
const AH_EST = ah(B25.estoques, B24.estoques);
const VAR_ATIVO = B25.ativoTotal - B24.ativoTotal;
const VAR_CAIXA = B25.caixa - B24.caixa;
const VAR_AGIO = B25.agio - B24.agio;
const VAR_IMOB = B25.imobilizado - B24.imobilizado;
const VAR_INTANG = B25.intangivel - B24.intangivel;
const VAR_EST = B25.estoques - B24.estoques;
const CAIXA_PESO_QUEDA = av(VAR_CAIXA, VAR_ATIVO);

// ---- Passivo e PL
const AV_PL25 = av(B25.patrimonioLiquido, B25.ativoTotal);
const AV_PL24 = av(B24.patrimonioLiquido, B24.ativoTotal);
const AV_PC25 = av(B25.passivoCirculante, B25.ativoTotal);
const AV_PC24 = av(B24.passivoCirculante, B24.ativoTotal);
const AV_PNC25 = av(B25.passivoNaoCirculante, B25.ativoTotal);
const AV_PNC24 = av(B24.passivoNaoCirculante, B24.ativoTotal);
const TERC25 = B25.passivoCirculante + B25.passivoNaoCirculante;
const AV_TERC25 = av(TERC25, B25.ativoTotal);
const AV_FORN25 = av(B25.fornecedores, B25.ativoTotal);
const FORN_PC25 = av(B25.fornecedores, B25.passivoCirculante);
const AV_IMP25 = av(B25.impostosRecolher, B25.ativoTotal);
const AV_DIV25 = av(B25.dividendosJcp, B25.ativoTotal);
const DIV_PC25 = av(B25.dividendosJcp, B25.passivoCirculante);
const DIVIDA25 = B25.emprestimosCP + B25.emprestimosLP;
const DIVIDA24 = B24.emprestimosCP + B24.emprestimosLP;
const AV_DIVIDA25 = av(DIVIDA25, B25.ativoTotal);
const AH_PL = ah(B25.patrimonioLiquido, B24.patrimonioLiquido);
const AH_PC = ah(B25.passivoCirculante, B24.passivoCirculante);
const AH_PNC = ah(B25.passivoNaoCirculante, B24.passivoNaoCirculante);
const AH_FORN = ah(B25.fornecedores, B24.fornecedores);
const AH_DIV = ah(B25.dividendosJcp, B24.dividendosJcp);
const AH_SAL = ah(B25.salariosEncargos, B24.salariosEncargos);
const AH_DERIV_PC = ah(B25.derivativosProvisoesOutrosPC, B24.derivativosProvisoesOutrosPC);
const AH_DEMAIS_LP = ah(B25.demaisObrigacoesLP, B24.demaisObrigacoesLP);
const VAR_PL = B25.patrimonioLiquido - B24.patrimonioLiquido;
const VAR_PC = B25.passivoCirculante - B24.passivoCirculante;
const VAR_PNC = B25.passivoNaoCirculante - B24.passivoNaoCirculante;
const VAR_DIREITO = VAR_PL + VAR_PC + VAR_PNC;
const VAR_FORN = B25.fornecedores - B24.fornecedores;
const VAR_DIV = B25.dividendosJcp - B24.dividendosJcp;
const VAR_RESERVAS = B25.reservas - B24.reservas;
const PL_PESO_QUEDA = av(VAR_PL, VAR_ATIVO);
const LC25 = B25.ativoCirculante / B25.passivoCirculante;
const LC24 = B24.ativoCirculante / B24.passivoCirculante;

// ---- DRE
const MB25 = av(D25.lucroBruto, D25.receitaLiquida);
const MB24 = av(D24.lucroBruto, D24.receitaLiquida);
const MO25 = av(D25.lucroOperacional, D25.receitaLiquida);
const MO24 = av(D24.lucroOperacional, D24.receitaLiquida);
const ML25 = av(D25.lucroLiquido, D25.receitaLiquida);
const ML24 = av(D24.lucroLiquido, D24.receitaLiquida);
const AVC25 = av(D25.custoVendas, D25.receitaLiquida);
const AVC24 = av(D24.custoVendas, D24.receitaLiquida);
const AV_LOG25 = av(D25.despesasLogisticas, D25.receitaLiquida);
const AV_COM25 = av(D25.despesasComerciais, D25.receitaLiquida);
const AV_ADM25 = av(D25.despesasAdministrativas, D25.receitaLiquida);
const AV_RF25 = av(D25.resultadoFinanceiro, D25.receitaLiquida);
const AV_RF24 = av(D24.resultadoFinanceiro, D24.receitaLiquida);
const AV_IR25 = av(D25.irCs, D25.receitaLiquida);
const AV_IR24 = av(D24.irCs, D24.receitaLiquida);
const AH_REC = ah(D25.receitaLiquida, D24.receitaLiquida);
const AH_CPV = ah(D25.custoVendas, D24.custoVendas);
const AH_LB = ah(D25.lucroBruto, D24.lucroBruto);
const AH_LOG = ah(D25.despesasLogisticas, D24.despesasLogisticas);
const AH_COM = ah(D25.despesasComerciais, D24.despesasComerciais);
const AH_ADM = ah(D25.despesasAdministrativas, D24.despesasAdministrativas);
const AH_LO = ah(D25.lucroOperacional, D24.lucroOperacional);
const AH_RF = ah(D25.resultadoFinanceiro, D24.resultadoFinanceiro);
const AH_LAIR = ah(D25.lair, D24.lair);
const AH_IR = ah(D25.irCs, D24.irCs);
const AH_LL = ah(D25.lucroLiquido, D24.lucroLiquido);
const VAR_REC = D25.receitaLiquida - D24.receitaLiquida;
const VAR_CPV = Math.abs(D24.custoVendas) - Math.abs(D25.custoVendas);
const VAR_LO = D25.lucroOperacional - D24.lucroOperacional;
const VAR_INU = D25.itensNaoUsuais - D24.itensNaoUsuais;
const VAR_RF = Math.abs(D25.resultadoFinanceiro) - Math.abs(D24.resultadoFinanceiro);
const VAR_IR = Math.abs(D24.irCs) - Math.abs(D25.irCs);
const VAR_LL = D25.lucroLiquido - D24.lucroLiquido;
const DESPOP25 = Math.abs(D25.despesasLogisticas + D25.despesasComerciais + D25.despesasAdministrativas);
const DESPOP24 = Math.abs(D24.despesasLogisticas + D24.despesasComerciais + D24.despesasAdministrativas);
const ALIQ25 = av(D25.irCs, D25.lair);
const ALIQ24 = av(D24.irCs, D24.lair);

// ---- ROE, giro, alavancagem
const ROE25 = av(D25.lucroLiquido, B25.patrimonioLiquido);
const ROE24 = av(D24.lucroLiquido, B24.patrimonioLiquido);
const GIRO25 = D25.receitaLiquida / B25.ativoTotal;
const GIRO24 = D24.receitaLiquida / B24.ativoTotal;
const ALAV25 = B25.ativoTotal / B25.patrimonioLiquido;
const ALAV24 = B24.ativoTotal / B24.patrimonioLiquido;

// Referências citadas em aula (lista de ROEs da Aula 4, data-base anterior) e caso Renner (Aula 4).
const ROE_REF = { ambevLista: 18, renner: 13.9, itau: 24, weg: 29, bradesco: 15, boaSafra: 7 };
const RENNER_REF = { giro: 0.81, ml: 9.2, roe: 13.9 };

type BpKey = keyof typeof B25;
type DreKey = keyof typeof D25;

/** Tabela só com os valores (sem A.V./A.H.), para as questões de cálculo. */
function bpTable(caption: string, lines: [string, BpKey][], totalRows?: number[]): DataTable {
  return {
    caption,
    note: NOTE,
    headers: ['Conta', '31/12/2025', '31/12/2024'],
    rows: lines.map(([label, k]) => [label, fmt(B25[k]), fmt(B24[k])]),
    ...(totalRows ? { totalRows } : {}),
  };
}
function dreTable(caption: string, lines: [string, DreKey][], totalRows?: number[]): DataTable {
  return {
    caption,
    note: NOTE,
    headers: ['Linha', '2025', '2024'],
    rows: lines.map(([label, k]) => [label, fmt(D25[k]), fmt(D24[k])]),
    ...(totalRows ? { totalRows } : {}),
  };
}

const ATIVO_LINES: [string, BpKey][] = [
  ['ATIVO TOTAL', 'ativoTotal'],
  ['ATIVO CIRCULANTE', 'ativoCirculante'],
  ['  Caixa e equivalentes de caixa', 'caixa'],
  ['  Aplicações financeiras', 'aplicacoesFinanceiras'],
  ['  Contas a receber', 'contasReceber'],
  ['  Estoques', 'estoques'],
  ['  Tributos a recuperar', 'tributosRecuperar'],
  ['  Derivativos, mantidos p/ venda e outros', 'derivativosOutrosAC'],
  ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'],
  ['  Realizável a longo prazo', 'rlp'],
  ['  Investimentos', 'investimentos'],
  ['  Imobilizado', 'imobilizado'],
  ['  Intangível', 'intangivel'],
  ['  Ágio', 'agio'],
];
const ATIVO_TOTALS = [0, 1, 8];
const PASSIVO_LINES: [string, BpKey][] = [
  ['PASSIVO TOTAL + PL', 'ativoTotal'],
  ['PASSIVO CIRCULANTE', 'passivoCirculante'],
  ['  Fornecedores', 'fornecedores'],
  ['  Empréstimos e financiamentos', 'emprestimosCP'],
  ['  Dividendos e JCP a pagar', 'dividendosJcp'],
  ['  Impostos e IR/CS a recolher', 'impostosRecolher'],
  ['  Salários e encargos', 'salariosEncargos'],
  ['  Derivativos, provisões e outros', 'derivativosProvisoesOutrosPC'],
  ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'],
  ['  Empréstimos e financiamentos (LP)', 'emprestimosLP'],
  ['  IR diferido', 'irDiferido'],
  ['  Demais obrigações (LP)', 'demaisObrigacoesLP'],
  ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido'],
];
const PASSIVO_TOTALS = [0, 1, 8, 12];
const DRE_LINES: [string, DreKey][] = [
  ['Receita líquida', 'receitaLiquida'],
  ['(−) Custo dos produtos vendidos', 'custoVendas'],
  ['= Lucro bruto', 'lucroBruto'],
  ['(−) Despesas logísticas', 'despesasLogisticas'],
  ['(−) Despesas comerciais', 'despesasComerciais'],
  ['(−) Despesas administrativas', 'despesasAdministrativas'],
  ['(+/−) Outras receitas/despesas operacionais', 'outrasReceitasDespesasOperacionais'],
  ['(+/−) Itens não usuais', 'itensNaoUsuais'],
  ['= Lucro operacional', 'lucroOperacional'],
  ['(+/−) Resultado financeiro líquido', 'resultadoFinanceiro'],
  ['(+) Participação em coligadas', 'participacaoColigadas'],
  ['= Lucro antes do IR/CS', 'lair'],
  ['(−) IR e contribuição social', 'irCs'],
  ['= Lucro líquido do exercício', 'lucroLiquido'],
];
const DRE_TOTALS = [0, 2, 8, 11, 13];

const BAL = [
  { label: 'Ambev 31/12/2025', ativo: B25.ativoTotal, passivo: B25.passivoCirculante + B25.passivoNaoCirculante, pl: B25.patrimonioLiquido, tolerance: 1.5 },
  { label: 'Ambev 31/12/2024', ativo: B24.ativoTotal, passivo: B24.passivoCirculante + B24.passivoNaoCirculante, pl: B24.patrimonioLiquido, tolerance: 1.5 },
];

const RUBRIC_NOTE = 'Regra da disciplina: nunca "ótimo" ou "ruim" sem comparação (ano anterior, pares, natureza do negócio, custo do capital).';

export const questions: Question[] = [
  // =====================================================================================
  // PARTE A — Ambev, treino
  // =====================================================================================
  {
    id: 'amb-001',
    type: 'numeric',
    topic: 'av',
    subtopic: 'A.V. do ativo — Ágio',
    skill: 'amb-av-ativo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Análise Vertical (A.V.) do Ágio sobre o Ativo Total da Ambev em 31/12/2025. Responda em %, com 1 casa decimal.',
    tables: [bpTable('Ambev — Ativo (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['  Imobilizado', 'imobilizado'], ['  Intangível', 'intangivel'], ['  Ágio', 'agio']], [0])],
    correct: 28.6,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [B25.agio, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = Conta / Ativo Total × 100',
      substitution: `A.V. Ágio 2025 = ${fmt(B25.agio)} / ${fmt(B25.ativoTotal)} × 100`,
      computation: `${(B25.agio / B25.ativoTotal).toFixed(4).replace('.', ',')} × 100 = ${p1(AV_AGIO25)}`,
      result: p1(AV_AGIO25),
      unit: '% do Ativo Total',
      interpretation: `De cada R$ 100 investidos no ativo da Ambev, R$ ${f1(AV_AGIO25)} são ágio — o valor pago acima do patrimônio nas aquisições de cervejarias e marcas. É a maior conta do ativo, à frente do Imobilizado (${p1(AV_IMOB25)}).`,
    },
    explanation: `No balanço, a base da Análise Vertical é o Ativo Total (100%). O ágio de ${fmt(B25.agio)} sobre ${fmt(B25.ativoTotal)} dá ${p1(AV_AGIO25)}: mais de um quarto do ativo da Ambev não é fábrica nem estoque, é o preço pago por aquisições. Na planilha do professor o Ágio aparece separado do Intangível (${p1(AV_INTANG25)}); juntos, somam ${p1(AV_AGIO_INT25)}.`,
    reasoningSteps: [
      'Identifique a base: no ativo, cada conta é dividida pelo Ativo Total.',
      'Divida o valor da conta pela base e multiplique por 100.',
      'Arredonde na casa pedida.',
      'Leia: "de cada R$ 100 do ativo, R$ X estão nessa conta".',
    ],
    commonMistake: 'Dividir o Ágio pelo Ativo Não Circulante (grupo em que ele está) em vez de pelo Ativo Total — daria 41,0%, não 28,6%.',
    rule: 'A.V. do balanço: toda conta ÷ Ativo Total (ou ÷ Passivo + PL total) × 100 — a base é sempre o total, não o grupo.',
    formula: 'A.V. = Conta / Ativo Total × 100',
    hint: 'A base é o Ativo Total, não o subtotal do não circulante.',
    concept: 'A A.V. do ativo mostra onde a empresa investe: o peso de cada conta no total aplicado.',
    sourceReference: SRC_PLAN,
  },
  {
    id: 'amb-002',
    type: 'multiple-choice',
    topic: 'av',
    subtopic: 'Maiores contas do ativo (A.V. 2025)',
    skill: 'amb-av-ativo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Pela Análise Vertical do ativo em 31/12/2025, qual é a conta mais importante do ativo da Ambev e qual o seu peso (1 casa decimal)?',
    tables: [bpTable('Ambev — Ativo', ATIVO_LINES, ATIVO_TOTALS)],
    options: [
      {
        id: 'A',
        text: `Imobilizado, com ${p1(AV_IMOB25)}: fábricas e equipamentos são sempre o maior investimento de uma indústria.`,
        whyWrong: `O Imobilizado (${fmt(B25.imobilizado)}) é a maior conta TANGÍVEL, mas fica em segundo lugar: o Ágio (${fmt(B25.agio)}) é maior. "Indústria = imobilizado no topo" é um pressuposto, não uma conta feita.`,
      },
      {
        id: 'B',
        text: `Ágio, com ${p1(AV_AGIO25)} (${fmt(B25.agio)}), seguido de Imobilizado ${p1(AV_IMOB25)}, Realizável a longo prazo ${p1(AV_RLP25)} e Caixa ${p1(AV_CAIXA25)}.`,
      },
      {
        id: 'C',
        text: `Caixa e equivalentes, com ${p1(AV_CAIXA25)}: é a conta mais líquida e por isso a mais importante.`,
        whyWrong: 'Liquidez não é peso. O caixa é a 4ª maior conta (12,8%); a pergunta é sobre a A.V., ou seja, onde está a maior fatia do investimento.',
      },
      {
        id: 'D',
        text: `Ativo não circulante, com ${p1(AV_ANC25)}.`,
        whyWrong: 'O ANC é um grupo, não uma conta. A pergunta pede a conta (Ágio, Imobilizado, Caixa...), e o grupo não diz em que a empresa investiu.',
      },
      {
        id: 'E',
        text: `Ágio, com ${p1(AH_AGIO)}.`,
        whyWrong: `${p1(AH_AGIO)} é a A.H. do Ágio (variação de ${fmt(B24.agio)} para ${fmt(B25.agio)}), não a A.V. (peso no ativo). A conta está certa, a medida está errada.`,
      },
    ],
    correct: 'B',
    calc: { fn: 'analiseVertical', args: [B25.agio, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = Conta / Ativo Total × 100',
      substitution: `Ágio: ${fmt(B25.agio)} / ${fmt(B25.ativoTotal)}; Imobilizado: ${fmt(B25.imobilizado)} / ${fmt(B25.ativoTotal)}; RLP: ${fmt(B25.rlp)} / ${fmt(B25.ativoTotal)}; Caixa: ${fmt(B25.caixa)} / ${fmt(B25.ativoTotal)}`,
      computation: `Ágio ${p1(AV_AGIO25)} > Imobilizado ${p1(AV_IMOB25)} > RLP ${p1(AV_RLP25)} > Caixa ${p1(AV_CAIXA25)} > Intangível ${p1(AV_INTANG25)} > Estoques ${p1(AV_EST25)} > Contas a receber ${p1(AV_CR25)}`,
      result: `Ágio, ${p1(AV_AGIO25)}`,
      unit: '% do Ativo Total',
      interpretation: `A Ambev investe primeiro em aquisições (ágio) e marcas (intangível): ${p1(AV_AGIO_INT25)} do ativo. Depois vêm as fábricas (Imobilizado ${p1(AV_IMOB25)}) e o caixa (${p1(AV_CAIXA25)}).`,
    },
    explanation: `Ordenar as contas pela A.V. é o primeiro passo da Parte 1 do roteiro ("onde a empresa investe?"). Na Ambev o topo é o Ágio (${p1(AV_AGIO25)}), não o Imobilizado (${p1(AV_IMOB25)}): a empresa cresceu comprando cervejarias e marcas, e esse preço fica registrado no ativo. Caixa (${p1(AV_CAIXA25)}) e Realizável a LP (${p1(AV_RLP25)}) completam as quatro maiores.`,
    reasoningSteps: [
      'Calcule a A.V. de cada conta (não dos grupos) sobre o Ativo Total.',
      'Ordene do maior para o menor peso.',
      'Separe o que é tangível (fábricas, estoques) do que é intangível (ágio, marcas).',
      'Pergunte se a distribuição faz sentido para o negócio.',
    ],
    commonMistake: 'Responder com o grupo (ANC 69,8%) ou assumir que indústria tem Imobilizado no topo sem fazer a conta.',
    rule: 'Para achar a maior conta, calcule a A.V. de cada CONTA sobre o total e ordene — grupos não respondem "onde a empresa investe".',
    formula: 'A.V. = Conta / Ativo Total × 100',
    hint: 'Compare os valores de Ágio e Imobilizado antes de dividir.',
    concept: 'A A.V. do ativo revela as decisões de investimento: na Ambev, aquisições e marcas pesam mais que fábricas.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-003',
    type: 'numeric',
    topic: 'av',
    subtopic: 'A.V. — Ágio + Intangível',
    skill: 'amb-av-intangiveis',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Some Ágio e Intangível da Ambev em 31/12/2025 e calcule quanto representam, juntos, do Ativo Total. Responda em %, com 1 casa decimal.',
    tables: [bpTable('Ambev — Ativo (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['  Imobilizado', 'imobilizado'], ['  Intangível', 'intangivel'], ['  Ágio', 'agio']], [0])],
    correct: 36.2,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [B25.agio + B25.intangivel, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = (Ágio + Intangível) / Ativo Total × 100',
      substitution: `(${fmt(B25.agio)} + ${fmt(B25.intangivel)}) / ${fmt(B25.ativoTotal)} × 100 = ${fmt(AGIO_INT25)} / ${fmt(B25.ativoTotal)} × 100`,
      computation: `${(AGIO_INT25 / B25.ativoTotal).toFixed(4).replace('.', ',')} × 100 = ${p1(AV_AGIO_INT25)}`,
      result: p1(AV_AGIO_INT25),
      unit: '% do Ativo Total',
      interpretation: `Mais de um terço do ativo da Ambev (${p1(AV_AGIO_INT25)}) são marcas e aquisições — quase o dobro do Imobilizado (${p1(AV_IMOB25)}). O negócio é tanto de marcas quanto de fábricas.`,
    },
    explanation: `Na planilha do professor o Ágio (${fmt(B25.agio)}) aparece separado do Intangível (${fmt(B25.intangivel)}), mas os dois têm a mesma natureza: valor pago por marcas e empresas adquiridas. Somados, ${fmt(AGIO_INT25)} = ${p1(AV_AGIO_INT25)} do ativo. Essa leitura é o que dá sentido ao modelo de negócio: a Ambev compete por marca e escala, e o balanço mostra isso.`,
    reasoningSteps: [
      'Some as duas contas de natureza intangível: Ágio e Intangível.',
      'Divida a soma pelo Ativo Total e multiplique por 100.',
      'Compare com o Imobilizado para ver o que pesa mais: marcas ou fábricas.',
      'Ligue ao modelo de negócio: por que uma cervejaria carrega tanto ágio?',
    ],
    commonMistake: 'Somar só Ágio + Intangível e dividir pelo Ativo Não Circulante (base errada) — ou esquecer que o Ágio está fora da linha "Intangível" na planilha.',
    rule: 'Contas de mesma natureza podem ser somadas antes da A.V.; a base continua sendo o Ativo Total.',
    formula: 'A.V. = Conta / Ativo Total × 100',
    hint: 'São duas linhas separadas na planilha; some antes de dividir.',
    concept: 'Ágio e Intangível registram o valor de marcas e aquisições: na Ambev, pesam mais que as fábricas.',
    sourceReference: SRC_PLAN,
  },
  {
    id: 'amb-004',
    type: 'true-false',
    topic: 'av',
    subtopic: 'Leitura da A.V. do ativo',
    skill: 'amb-av-intangiveis',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `Avalie a afirmação: "Como o Imobilizado (fábricas e equipamentos) representa a maior parte do ativo da Ambev em 2025, a empresa é um caso típico de indústria 'pesada' em ativos físicos, e marcas e aquisições têm peso secundário no balanço."`,
    tables: [ambevAssetTable()],
    correct: false,
    explanation: `Falso. O Imobilizado é ${p1(AV_IMOB25)} do ativo, enquanto Ágio (${p1(AV_AGIO25)}) e Intangível (${p1(AV_INTANG25)}) somam ${p1(AV_AGIO_INT25)} — quase o dobro. O balanço da Ambev é "pesado" em marcas e aquisições, não em fábricas. Isso não é bom nem ruim por si: é o retrato de uma empresa que cresceu comprando concorrentes e construindo marcas.`,
    reasoningSteps: [
      'Leia a coluna A.V. 2025 e localize Imobilizado, Ágio e Intangível.',
      'Some Ágio + Intangível e compare com o Imobilizado.',
      'Decida qual natureza de ativo domina: tangível ou intangível.',
      'Evite julgar: descreva o modelo de negócio que o balanço revela.',
    ],
    commonMistake: 'Supor que toda indústria tem o Imobilizado como maior conta, sem olhar a A.V.',
    rule: 'Antes de afirmar "a maior parte do ativo é X", confira a A.V.: a intuição sobre o setor pode estar errada.',
    hint: 'Some as duas contas intangíveis e compare com o Imobilizado.',
    concept: 'A A.V. do ativo precisa ser lida contra o modelo de negócio: fábricas × marcas × caixa.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-005',
    type: 'numeric',
    topic: 'ah',
    subtopic: 'A.H. do Ativo Total',
    skill: 'amb-ah-ativo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Análise Horizontal (A.H.) do Ativo Total da Ambev de 2024 para 2025. Responda em %, com 2 casas decimais (use o sinal).',
    tables: [bpTable('Ambev — Ativo (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['ATIVO CIRCULANTE', 'ativoCirculante'], ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante']], [0])],
    correct: -10.72,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'analiseHorizontal', args: [B25.ativoTotal, B24.ativoTotal] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1 (× 100)',
      substitution: `A.H. Ativo = ${fmt(B25.ativoTotal)} / ${fmt(B24.ativoTotal)} − 1`,
      computation: `${(B25.ativoTotal / B24.ativoTotal).toFixed(4).replace('.', ',')} − 1 = ${p2(AH_ATIVO)}`,
      result: p2(AH_ATIVO),
      unit: '% de variação sobre 2024',
      interpretation: `O ativo encolheu ${a0(VAR_ATIVO)} (de ${fmt(B24.ativoTotal)} para ${fmt(B25.ativoTotal)}): a Ambev terminou 2025 com um balanço ${p1(Math.abs(AH_ATIVO))} menor. O circulante caiu ${p1(Math.abs(AH_AC))} e o não circulante ${p1(Math.abs(AH_ANC))}.`,
    },
    explanation: `A A.H. usa o ano anterior como base: ${fmt(B25.ativoTotal)} ÷ ${fmt(B24.ativoTotal)} − 1 = ${p2(AH_ATIVO)}. É a pergunta 2 do caso: "o ativo total caiu 10,7% — o que explica?". O número sozinho só diz que caiu; a explicação vem das contas (caixa, ágio, imobilizado) e da contrapartida no lado direito.`,
    reasoningSteps: [
      'A base da A.H. é sempre o ano ANTERIOR (2024).',
      'Divida 2025 por 2024 e subtraia 1.',
      'Multiplique por 100; o sinal negativo indica queda.',
      'Guarde o número: ele é a régua para comparar a variação das contas.',
    ],
    commonMistake: 'Dividir pela base de 2025 (daria −12,0%) ou dar a diferença em R$ (−17.421) sem dividir.',
    rule: 'A.H. = atual ÷ anterior − 1; a base é sempre o período mais antigo.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'Qual ano é a base? O mais antigo.',
    concept: 'A A.H. mede a variação de cada conta entre as duas fotos do balanço.',
    sourceReference: SRC_PLAN,
  },
  {
    id: 'amb-006',
    type: 'numeric',
    topic: 'ah',
    subtopic: 'A.H. do Caixa',
    skill: 'amb-ah-ativo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a A.H. de Caixa e equivalentes de caixa da Ambev de 2024 para 2025. Responda em %, com 1 casa decimal (use o sinal).',
    tables: [bpTable('Ambev — Ativo Circulante (recorte)', [['ATIVO CIRCULANTE', 'ativoCirculante'], ['  Caixa e equivalentes de caixa', 'caixa'], ['  Aplicações financeiras', 'aplicacoesFinanceiras'], ['  Estoques', 'estoques']], [0])],
    correct: -34.8,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseHorizontal', args: [B25.caixa, B24.caixa] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1 (× 100)',
      substitution: `A.H. Caixa = ${fmt(B25.caixa)} / ${fmt(B24.caixa)} − 1`,
      computation: `${(B25.caixa / B24.caixa).toFixed(4).replace('.', ',')} − 1 = ${p1(AH_CAIXA)}`,
      result: p1(AH_CAIXA),
      unit: '% de variação sobre 2024',
      interpretation: `O caixa caiu ${a0(VAR_CAIXA)} (−${p1(Math.abs(AH_CAIXA))}) — sozinho, ${p1(CAIXA_PESO_QUEDA)} da queda de ${a0(VAR_ATIVO)} do ativo. O peso do caixa no ativo foi de ${p1(AV_CAIXA24)} para ${p1(AV_CAIXA25)}.`,
    },
    explanation: `${fmt(B25.caixa)} ÷ ${fmt(B24.caixa)} − 1 = ${p1(AH_CAIXA)}. Mais de um terço do caixa saiu em um ano. Por si só isso não é prejuízo (o lucro foi de ${fmt(D25.lucroLiquido)}): o dinheiro saiu para pagar dividendos/JCP e outras obrigações — a resposta está no lado direito do balanço. É a maior variação do ativo e explica a queda da Liquidez Corrente (${f2(LC24)} → ${f2(LC25)}).`,
    reasoningSteps: [
      'Divida o caixa de 2025 pelo de 2024 e subtraia 1.',
      'Compare com a A.H. do Ativo Total: a conta caiu mais ou menos que o total?',
      'Meça o peso da variação: variação do caixa ÷ variação do ativo.',
      'Procure a contrapartida no Passivo/PL antes de julgar.',
    ],
    commonMistake: 'Ler a queda do caixa como prejuízo — lucro não é caixa; o LL cresceu 7,7% no mesmo ano.',
    rule: 'Queda de caixa com lucro positivo exige procurar para onde o dinheiro foi (dívidas pagas, dividendos, investimentos), nunca concluir "prejuízo".',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'A base é 28.596.',
    concept: 'A A.H. do caixa mostra o movimento financeiro do ano; a DRE não explica caixa — o balanço e a DFC explicam.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-007',
    type: 'multiple-choice',
    topic: 'ah',
    subtopic: 'O que explica a queda do ativo',
    skill: 'amb-ah-ativo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `O Ativo Total da Ambev caiu ${p2(AH_ATIVO)} (de ${fmt(B24.ativoTotal)} para ${fmt(B25.ativoTotal)}). Calcule a variação do Caixa em R$ e escolha a leitura correta sobre o que explica a queda.`,
    tables: [ambevAssetTable()],
    options: [
      {
        id: 'A',
        text: 'A empresa teve prejuízo em 2025, e o prejuízo consumiu o ativo.',
        whyWrong: `O lucro líquido de 2025 foi ${fmt(D25.lucroLiquido)} (+${p1(AH_LL)}). Queda do ativo não é sinônimo de prejuízo: o ativo cai quando a empresa paga dívidas, distribui lucros ou vê contas em moeda estrangeira perderem valor.`,
      },
      {
        id: 'B',
        text: `O Ágio caiu ${a0(VAR_AGIO)} (${p1(AH_AGIO)}) e é o principal responsável, pois é a maior conta do ativo.`,
        whyWrong: `Maior conta não é maior variação. O ágio explica ${a0(VAR_AGIO)} dos ${a0(VAR_ATIVO)} de queda; o caixa explica ${a0(VAR_CAIXA)} — mais de três vezes mais.`,
      },
      {
        id: 'C',
        text: `O Ativo Circulante caiu ${p1(Math.abs(AH_AC))}, mas o Não Circulante cresceu e compensou parte da queda.`,
        whyWrong: `O ANC também caiu: ${p1(AH_ANC)} (−${a0(B25.ativoNaoCirculante - B24.ativoNaoCirculante)}), puxado por ágio, imobilizado e intangível. Não houve compensação.`,
      },
      {
        id: 'D',
        text: `O Caixa caiu ${a0(VAR_CAIXA)} (${p1(AH_CAIXA)}, de ${fmt(B24.caixa)} para ${fmt(B25.caixa)}) — ${p1(CAIXA_PESO_QUEDA)} da queda de ${a0(VAR_ATIVO)} do ativo; Ágio (−${a0(VAR_AGIO)}, ${p1(AH_AGIO)}), Imobilizado (−${a0(VAR_IMOB)}) e Intangível (−${a0(VAR_INTANG)}) explicam quase todo o restante.`,
      },
      {
        id: 'E',
        text: `A queda de ${a0(VAR_ATIVO)} vem toda do lado esquerdo e não tem contrapartida no Passivo ou no PL.`,
        whyWrong: `Ativo = Passivo + PL sempre. O lado direito encolheu junto: PL −${a0(VAR_PL)}, PC −${a0(VAR_PC)}, PNC −${a0(VAR_PNC)} (soma ${a0(VAR_DIREITO)}).`,
      },
    ],
    correct: 'D',
    calc: { fn: 'subtrai', args: [B24.caixa, B25.caixa] },
    solution: {
      formula: 'Variação em R$ = Anterior − Atual (queda)',
      substitution: `Queda do caixa = ${fmt(B24.caixa)} − ${fmt(B25.caixa)}`,
      computation: `= ${a0(VAR_CAIXA)} (A.H. ${p1(AH_CAIXA)}); queda do ativo = ${fmt(B24.ativoTotal)} − ${fmt(B25.ativoTotal)} = ${a0(VAR_ATIVO)}`,
      result: `${a0(VAR_CAIXA)} de queda no caixa = ${p1(CAIXA_PESO_QUEDA)} da queda do ativo`,
      unit: 'R$ milhões',
      interpretation: `A queda do ativo é, antes de tudo, uma saída de caixa (${a0(VAR_CAIXA)}); o resto são ágio, imobilizado e intangível menores (−${a0(VAR_AGIO)}, −${a0(VAR_IMOB)}, −${a0(VAR_INTANG)}) e estoques (−${a0(VAR_EST)}).`,
    },
    explanation: `Para explicar a A.H. do total, compare a variação em R$ de cada conta com a variação do total. O caixa (−${a0(VAR_CAIXA)}) responde por ${p1(CAIXA_PESO_QUEDA)} da queda; ágio, imobilizado e intangível respondem por outros ${a0(VAR_AGIO + VAR_IMOB + VAR_INTANG)}. Não é sinal de prejuízo (LL ${fmt(D25.lucroLiquido)}): a contrapartida está no lado direito — o PL caiu ${a0(VAR_PL)} com dividendos/JCP e ajustes de avaliação, e o PC e o PNC caíram ${a0(VAR_PC)} e ${a0(VAR_PNC)}.`,
    reasoningSteps: [
      'Calcule a variação em R$ do Ativo Total.',
      'Calcule a variação em R$ das maiores contas e divida pela variação do total: quem pesa mais?',
      'Distinga "maior conta" de "maior variação".',
      'Procure a contrapartida no Passivo e no PL antes de concluir.',
    ],
    commonMistake: 'Atribuir a queda à maior conta (ágio) ou a um prejuízo que não existiu.',
    rule: 'Quem explica a variação do total é a conta com maior variação em R$, não a conta com maior saldo.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'Olhe a coluna A.H.: qual conta tem a maior queda percentual e um saldo grande?',
    concept: 'A A.H. do balanço localiza o que mudou; a leitura completa exige achar a contrapartida do outro lado.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-008',
    type: 'numeric',
    topic: 'ah',
    subtopic: 'A.H. do Patrimônio Líquido',
    skill: 'amb-ah-passivo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a A.H. do Patrimônio Líquido da Ambev de 2024 para 2025. Responda em %, com 2 casas decimais (use o sinal).',
    tables: [bpTable('Ambev — Passivo e PL (recorte)', [['PASSIVO TOTAL + PL', 'ativoTotal'], ['PASSIVO CIRCULANTE', 'passivoCirculante'], ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 3])],
    correct: -10.85,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'analiseHorizontal', args: [B25.patrimonioLiquido, B24.patrimonioLiquido] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1 (× 100)',
      substitution: `A.H. PL = ${fmt(B25.patrimonioLiquido)} / ${fmt(B24.patrimonioLiquido)} − 1`,
      computation: `${(B25.patrimonioLiquido / B24.patrimonioLiquido).toFixed(4).replace('.', ',')} − 1 = ${p2(AH_PL)}`,
      result: p2(AH_PL),
      unit: '% de variação sobre 2024',
      interpretation: `O PL caiu ${a0(VAR_PL)} apesar do lucro de ${fmt(D25.lucroLiquido)}: a empresa distribuiu lucros (reservas −${a0(VAR_RESERVAS)}) e os ajustes de avaliação patrimonial ficaram mais negativos (${fmt(B24.ajustesAvaliacao)} → ${fmt(B25.ajustesAvaliacao)}). A queda do PL (${p2(AH_PL)}) acompanha a do ativo (${p2(AH_ATIVO)}), e por isso a alavancagem ficou estável em ${f2(ALAV25)}.`,
    },
    explanation: `${fmt(B25.patrimonioLiquido)} ÷ ${fmt(B24.patrimonioLiquido)} − 1 = ${p2(AH_PL)}. Lucro aumenta o PL; dividendos/JCP e ajustes negativos de avaliação o reduzem. Em 2025 as reduções superaram o lucro, e o PL encolheu ${a0(VAR_PL)} — ${p1(PL_PESO_QUEDA)} da queda do ativo. Isso importa para o ROE: um PL menor com lucro maior eleva o retorno (${p2(ROE24)} → ${p2(ROE25)}).`,
    reasoningSteps: [
      'Divida o PL de 2025 pelo de 2024 e subtraia 1.',
      'Compare com a A.H. do Ativo Total: caíram na mesma proporção?',
      'Explique a queda: lucro entra, dividendos e ajustes de avaliação saem.',
      'Ligue ao ROE: PL menor eleva o retorno sobre o mesmo lucro.',
    ],
    commonMistake: 'Achar que o PL só pode crescer em ano de lucro — dividendos e ajustes de avaliação podem reduzi-lo mais do que o lucro o aumenta.',
    rule: 'PL final = PL inicial + lucro − distribuições ± ajustes; confira a A.H. do PL contra a do ativo para ler a alavancagem.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'A base é 99.581.',
    concept: 'O PL é a riqueza dos sócios; sua variação resume lucro retido, dividendos e ajustes de avaliação.',
    sourceReference: SRC_PLAN,
  },
  {
    id: 'amb-009',
    type: 'multi-part',
    topic: 'alavancagem',
    subtopic: 'Estrutura de capital — quem financia',
    skill: 'amb-estrutura-capital',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'Com o Passivo e PL da Ambev em 31/12/2025, responda: quem financia a empresa e a dívida é cara (bancos) ou "de graça" (fornecedores)?',
    tables: [bpTable('Ambev — Passivo e PL', PASSIVO_LINES, PASSIVO_TOTALS)],
    balanceCheck: BAL,
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) A.V. do Patrimônio Líquido sobre o Passivo total + PL em 2025 (%, 1 casa decimal).',
        correct: 61.2,
        unit: 'percent',
        decimals: 1,
        points: 3,
        calc: { fn: 'analiseVertical', args: [B25.patrimonioLiquido, B25.ativoTotal] },
        solution: {
          formula: 'A.V. = PL / (Passivo + PL) × 100',
          substitution: `${fmt(B25.patrimonioLiquido)} / ${fmt(B25.ativoTotal)} × 100`,
          computation: `= ${p1(AV_PL25)}`,
          result: p1(AV_PL25),
          unit: '% do Passivo + PL',
          interpretation: `Os sócios financiam ${p1(AV_PL25)} do ativo; terceiros, ${p1(AV_TERC25)}.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) A.V. do Passivo Circulante sobre o Passivo total + PL em 2025 (%, 1 casa decimal).',
        correct: 31.4,
        unit: 'percent',
        decimals: 1,
        points: 3,
        calc: { fn: 'analiseVertical', args: [B25.passivoCirculante, B25.ativoTotal] },
        solution: {
          formula: 'A.V. = PC / (Passivo + PL) × 100',
          substitution: `${fmt(B25.passivoCirculante)} / ${fmt(B25.ativoTotal)} × 100`,
          computation: `= ${p1(AV_PC25)}`,
          result: p1(AV_PC25),
          unit: '% do Passivo + PL',
          interpretation: `Quase todo o capital de terceiros é de curto prazo: PC ${p1(AV_PC25)} contra PNC ${p1(AV_PNC25)}.`,
        },
      },
      {
        id: 'c',
        kind: 'choice',
        prompt: 'c) Pela composição do PC e do PNC, o capital de terceiros da Ambev é predominantemente "caro" (bancos, com juros) ou "de graça" (operacional)?',
        options: [
          {
            id: 'A',
            text: `"De graça": Fornecedores ${fmt(B25.fornecedores)} são ${p1(FORN_PC25)} do PC (${p1(AV_FORN25)} do total); empréstimos CP + LP somam só ${fmt(DIVIDA25)} (${p1(AV_DIVIDA25)} do total). O grosso é crédito operacional, impostos e dividendos a pagar.`,
          },
          {
            id: 'B',
            text: `"Cara": o PC de ${p1(AV_PC25)} é todo formado por empréstimos bancários de curto prazo.`,
            whyWrong: `Empréstimos de curto prazo são ${fmt(B25.emprestimosCP)}, menos de 3% do PC. O PC é fornecedores, impostos, dividendos, salários e provisões.`,
          },
          {
            id: 'C',
            text: `"Cara": o PNC de ${p1(AV_PNC25)} é inteiramente dívida bancária de longo prazo.`,
            whyWrong: `O PNC de ${fmt(B25.passivoNaoCirculante)} inclui IR diferido ${fmt(B25.irDiferido)} e demais obrigações ${fmt(B25.demaisObrigacoesLP)}; empréstimos LP são só ${fmt(B25.emprestimosLP)}.`,
          },
          {
            id: 'D',
            text: 'Não há capital de terceiros relevante: a Ambev é financiada 100% por capital próprio.',
            whyWrong: `Terceiros financiam ${p1(AV_TERC25)} (${fmt(TERC25)}). Pouca dívida bancária não significa ausência de terceiros: fornecedores e impostos também financiam o ativo.`,
          },
        ],
        correct: 'A',
        points: 4,
      },
    ],
    explanation: `"Quem financia?" se responde com a A.V. do lado direito: PL ${p1(AV_PL25)}, PC ${p1(AV_PC25)}, PNC ${p1(AV_PNC25)} — terceiros ${p1(AV_TERC25)}. Depois vem a pergunta da Aula 5: a dívida é cara ou de graça? Na Ambev, os fornecedores (${fmt(B25.fornecedores)}, ${p1(FORN_PC25)} do PC) são o maior credor e a dívida bancária total é de apenas ${fmt(DIVIDA25)} (${p1(AV_DIVIDA25)}): capital de terceiros majoritariamente operacional, sem juros explícitos.`,
    reasoningSteps: [
      'Calcule a A.V. de PL, PC e PNC sobre o total do lado direito.',
      'Dentro do PC e do PNC, separe credores operacionais (fornecedores, impostos, salários) de credores financeiros (empréstimos).',
      'Some empréstimos CP + LP e compare com fornecedores.',
      'Conclua: capital próprio domina; a dívida de terceiros é, em sua maioria, "de graça".',
    ],
    commonMistake: 'Confundir "capital de terceiros 38,8%" com "dívida bancária 38,8%" — bancos são só 2,3% do total.',
    rule: 'Estrutura de capital = A.V. do lado direito + natureza dos credores (cobram juros? em que prazo?).',
    formula: 'A.V. = Conta / (Passivo + PL) × 100',
    hint: 'Some os dois empréstimos (CP e LP) e compare com Fornecedores.',
    concept: 'Fornecedores financiam a operação sem juros explícitos; bancos cobram juros. A composição do passivo diz quanto custa o capital de terceiros.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-010',
    type: 'numeric',
    topic: 'av',
    subtopic: 'Fornecedores como % do PC',
    skill: 'amb-estrutura-capital',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Quanto a conta Fornecedores representa do Passivo Circulante da Ambev em 31/12/2025? Responda em %, com 1 casa decimal.',
    tables: [bpTable('Ambev — Passivo Circulante', PASSIVO_LINES.slice(1, 8), [0])],
    correct: 52.1,
    unit: 'percent',
    decimals: 1,
    calc: { fn: 'analiseVertical', args: [B25.fornecedores, B25.passivoCirculante] },
    solution: {
      formula: 'Peso = Fornecedores / Passivo Circulante × 100',
      substitution: `${fmt(B25.fornecedores)} / ${fmt(B25.passivoCirculante)} × 100`,
      computation: `${(B25.fornecedores / B25.passivoCirculante).toFixed(4).replace('.', ',')} × 100 = ${p1(FORN_PC25)}`,
      result: p1(FORN_PC25),
      unit: '% do Passivo Circulante',
      interpretation: `Mais da metade do que a Ambev deve no curto prazo é a fornecedores (${p1(FORN_PC25)}); dividendos/JCP a pagar são outros ${p1(DIV_PC25)}. Empréstimos de curto prazo (${fmt(B25.emprestimosCP)}) são marginais.`,
    },
    explanation: `Aqui a base não é o total do balanço, e sim o PC, porque a pergunta é sobre a composição do curto prazo. Fornecedores ${fmt(B25.fornecedores)} ÷ PC ${fmt(B25.passivoCirculante)} = ${p1(FORN_PC25)}. Isso muda a leitura da Liquidez Corrente de ${f2(LC25)}: o denominador é dominado por crédito operacional, que se renova a cada compra, e não por dívida bancária vencendo.`,
    reasoningSteps: [
      'Leia a pergunta: "% do Passivo Circulante" — a base é o PC, não o total.',
      'Divida Fornecedores pelo PC e multiplique por 100.',
      'Compare com as outras contas do PC: dividendos, impostos, empréstimos.',
      'Use isso para ler a Liquidez Corrente "por dentro".',
    ],
    commonMistake: 'Dividir pelo Passivo total + PL (daria 16,4%) quando a pergunta pede a participação no PC.',
    rule: 'A base da A.V. é a que a pergunta define: total do balanço, grupo ou receita — leia o enunciado antes de dividir.',
    formula: 'Peso no grupo = Conta / Grupo × 100',
    hint: 'A base aqui é o subtotal do Passivo Circulante.',
    concept: 'A composição do PC diz se as obrigações de curto prazo são operacionais (renováveis) ou financeiras (exigem caixa).',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-011',
    type: 'multiple-choice',
    topic: 'alavancagem',
    subtopic: 'Dívida bancária × capital de terceiros',
    skill: 'amb-estrutura-capital',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'Some os Empréstimos e financiamentos de curto e longo prazo da Ambev em 2025 e calcule a A.V. dessa dívida bancária sobre o Passivo total + PL (2 casas decimais). Qual alternativa lê corretamente o resultado?',
    tables: [ambevLiabilityTable()],
    options: [
      {
        id: 'A',
        text: `Só ${p2(AV_DIVIDA25)} do Passivo + PL (${fmt(DIVIDA25)} = ${fmt(B25.emprestimosCP)} no PC + ${fmt(B25.emprestimosLP)} no PNC): a dívida com bancos é pequena; o grosso do capital de terceiros é operacional e sem juros explícitos — fornecedores ${p1(AV_FORN25)}, impostos ${p1(AV_IMP25)}, dividendos a pagar ${p1(AV_DIV25)} do total.`,
      },
      {
        id: 'B',
        text: `${p1(AV_TERC25)}: todo o capital de terceiros é dívida bancária e cobra juros.`,
        whyWrong: `${p1(AV_TERC25)} é o total de terceiros (PC + PNC = ${fmt(TERC25)}). Dentro dele, bancos são só ${fmt(DIVIDA25)}; o resto é fornecedores, impostos, dividendos, salários, provisões e IR diferido.`,
      },
      {
        id: 'C',
        text: `${p1(AV_PNC25)}: o Passivo Não Circulante é formado só por empréstimos de longo prazo, logo essa é a dívida bancária.`,
        whyWrong: `O PNC (${fmt(B25.passivoNaoCirculante)}) tem IR diferido ${fmt(B25.irDiferido)} e demais obrigações ${fmt(B25.demaisObrigacoesLP)}; empréstimos LP são ${fmt(B25.emprestimosLP)}.`,
      },
      {
        id: 'D',
        text: `${p2(av(B25.emprestimosCP, B25.ativoTotal))}: só o empréstimo de curto prazo conta como dívida bancária.`,
        whyWrong: `Esqueceu os ${fmt(B25.emprestimosLP)} de longo prazo. Dívida bancária = CP + LP = ${fmt(DIVIDA25)}.`,
      },
      {
        id: 'E',
        text: `${p1(AV_FORN25)}: fornecedores são o maior credor e cobram juros embutidos, logo a dívida da Ambev é cara.`,
        whyWrong: `${p1(AV_FORN25)} é a A.V. de Fornecedores, crédito operacional ("de graça" na linguagem da aula). A pergunta pede empréstimos bancários.`,
      },
    ],
    correct: 'A',
    calc: { fn: 'analiseVertical', args: [B25.emprestimosCP + B25.emprestimosLP, B25.ativoTotal] },
    solution: {
      formula: 'A.V. = (Empréstimos CP + Empréstimos LP) / (Passivo + PL) × 100',
      substitution: `(${fmt(B25.emprestimosCP)} + ${fmt(B25.emprestimosLP)}) / ${fmt(B25.ativoTotal)} × 100`,
      computation: `${fmt(DIVIDA25)} / ${fmt(B25.ativoTotal)} × 100 = ${p2(AV_DIVIDA25)}`,
      result: p2(AV_DIVIDA25),
      unit: '% do Passivo + PL',
      interpretation: `Para cada R$ 100 de ativo, apenas R$ ${f2(AV_DIVIDA25)} vêm de bancos. Terceiros financiam ${p1(AV_TERC25)}, mas quase tudo é operacional: a dívida da Ambev é, em sua maior parte, "de graça".`,
    },
    explanation: `A pergunta da Aula 5 — "a dívida é cara (bancos) ou de graça (fornecedores)?" — se responde separando, dentro do passivo, quem cobra juros de quem não cobra. Bancos: ${fmt(DIVIDA25)} (${p2(AV_DIVIDA25)}). Fornecedores: ${fmt(B25.fornecedores)} (${p1(AV_FORN25)}). O resultado financeiro negativo de ${fmt(D25.resultadoFinanceiro)} não vem, portanto, de um estoque grande de empréstimos — vem de outros itens financeiros (câmbio, derivativos, juros sobre obrigações diversas), o que merece atenção na Parte 3.`,
    reasoningSteps: [
      'Localize empréstimos e financiamentos no PC e no PNC e some.',
      'Divida pelo Passivo total + PL (a mesma base da A.V. do lado direito).',
      'Compare com fornecedores e com o total de terceiros.',
      'Conclua sobre o custo do capital de terceiros: juros explícitos ou crédito operacional?',
    ],
    commonMistake: 'Tratar "capital de terceiros" (38,8%) como se fosse todo dívida bancária.',
    rule: 'Dívida financeira = empréstimos CP + LP; capital de terceiros = todo o passivo. Os dois números contam histórias diferentes.',
    formula: 'A.V. = Conta / (Passivo + PL) × 100',
    hint: 'Há empréstimos em dois lugares do passivo.',
    concept: 'Nem todo passivo custa juros: fornecedores, impostos e dividendos a pagar financiam o ativo sem despesa financeira explícita.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-012',
    type: 'multiple-choice',
    topic: 'alavancagem',
    subtopic: 'Contrapartida da queda do ativo no lado direito',
    skill: 'amb-contrapartida-direita',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `O ativo da Ambev caiu ${a0(VAR_ATIVO)} em 2025. Calcule a queda do Patrimônio Líquido em R$ e escolha a alternativa que explica corretamente como essa queda do ativo foi "financiada" pelo lado direito do balanço.`,
    tables: [ambevLiabilityTable()],
    balanceCheck: BAL,
    options: [
      {
        id: 'A',
        text: 'A queda foi financiada por novos empréstimos: o Passivo Não Circulante cresceu para cobrir a saída de caixa.',
        whyWrong: `O PNC caiu ${a0(VAR_PNC)} (${p1(AH_PNC)}). Empréstimos LP subiram só ${fmt(B25.emprestimosLP - B24.emprestimosLP)}; a dívida bancária total passou de ${fmt(DIVIDA24)} para ${fmt(DIVIDA25)}.`,
      },
      {
        id: 'B',
        text: `O PL subiu, porque houve lucro de ${fmt(D25.lucroLiquido)}; a queda do ativo veio toda do Passivo.`,
        whyWrong: `O PL CAIU ${a0(VAR_PL)} apesar do lucro: dividendos/JCP distribuídos (reservas −${a0(VAR_RESERVAS)}) e ajustes de avaliação patrimonial mais negativos (${fmt(B24.ajustesAvaliacao)} → ${fmt(B25.ajustesAvaliacao)}) superaram o lucro retido.`,
      },
      {
        id: 'C',
        text: `O lado direito encolheu junto: PL −${a0(VAR_PL)} (${p1(AH_PL)}), PC −${a0(VAR_PC)} (${p1(AH_PC)}) e PNC −${a0(VAR_PNC)} (${p1(AH_PNC)}) — soma de ${a0(VAR_DIREITO)}, igual à queda do ativo. O caixa saiu para remunerar sócios (dividendos/JCP) e reduzir obrigações; não entrou dívida nova.`,
      },
      {
        id: 'D',
        text: `O PC caiu ${a0(VAR_PC)}, e isso sozinho explica a queda de ${a0(VAR_ATIVO)} do ativo.`,
        whyWrong: `${a0(VAR_PC)} é menos de um quarto da queda. A maior contrapartida é o PL (−${a0(VAR_PL)}, ${p1(PL_PESO_QUEDA)} da queda).`,
      },
      {
        id: 'E',
        text: `Como o ativo caiu ${p1(Math.abs(AH_ATIVO))} e o PL caiu ${p1(Math.abs(AH_PL))}, a alavancagem (Ativo ÷ PL) aumentou fortemente.`,
        whyWrong: `As quedas foram quase proporcionais: alavancagem de ${f2(ALAV24)} para ${f2(ALAV25)} — estável. "Aumentou fortemente" não resiste à conta.`,
      },
    ],
    correct: 'C',
    calc: { fn: 'subtrai', args: [B24.patrimonioLiquido, B25.patrimonioLiquido] },
    solution: {
      formula: 'Queda = PL 2024 − PL 2025; conferir: ΔPL + ΔPC + ΔPNC = ΔAtivo',
      substitution: `${fmt(B24.patrimonioLiquido)} − ${fmt(B25.patrimonioLiquido)} = ${a0(VAR_PL)}; PC: ${fmt(B24.passivoCirculante)} − ${fmt(B25.passivoCirculante)} = ${a0(VAR_PC)}; PNC: ${fmt(B24.passivoNaoCirculante)} − ${fmt(B25.passivoNaoCirculante)} = ${a0(VAR_PNC)}`,
      computation: `${a0(VAR_PL)} + ${a0(VAR_PC)} + ${a0(VAR_PNC)} = ${a0(VAR_DIREITO)} ≈ ${a0(VAR_ATIVO)} (arredondamento da planilha)`,
      result: `PL −${a0(VAR_PL)} (${p1(PL_PESO_QUEDA)} da queda)`,
      unit: 'R$ milhões',
      interpretation: `A Ambev devolveu capital aos sócios e pagou obrigações: dividendos/JCP a pagar caíram de ${fmt(B24.dividendosJcp)} para ${fmt(B25.dividendosJcp)} (foram pagos), fornecedores −${a0(VAR_FORN)}, demais obrigações LP −${a0(B25.demaisObrigacoesLP - B24.demaisObrigacoesLP)}. Sem dívida nova, a alavancagem ficou em ${f2(ALAV25)}.`,
    },
    explanation: `Toda queda do ativo tem contrapartida no lado direito, porque Ativo = Passivo + PL. Aqui as três fontes encolheram: PL −${a0(VAR_PL)}, PC −${a0(VAR_PC)}, PNC −${a0(VAR_PNC)}. O PL caiu mesmo com lucro de ${fmt(D25.lucroLiquido)} porque a empresa distribuiu dividendos/JCP e registrou ajustes de avaliação negativos. Não há descasamento novo: a dívida bancária continua pequena (${fmt(DIVIDA25)}) e a alavancagem estável (${f2(ALAV25)}). O ponto de atenção é outro — a Liquidez Corrente caiu para ${f2(LC25)} porque o caixa saiu mais rápido que o PC.`,
    reasoningSteps: [
      'Calcule a variação em R$ de PL, PC e PNC e some: deve bater com a variação do ativo.',
      'Veja qual fonte caiu mais em R$ e em %.',
      'Explique a queda do PL: lucro − dividendos/JCP ± ajustes de avaliação.',
      'Verifique se entrou dívida nova (empréstimos CP + LP) e recalcule a alavancagem.',
    ],
    commonMistake: 'Achar que o PL sempre sobe em ano de lucro, ou que queda de ativo implica novos empréstimos.',
    rule: 'Ache a contrapartida: ΔAtivo = ΔPassivo + ΔPL. Só depois julgue se houve dívida nova ou descasamento de prazos.',
    formula: 'Ativo = Passivo + PL',
    hint: 'Some as três variações do lado direito e compare com −17.421.',
    concept: 'As variações do lado direito contam as decisões de financiamento do ano: distribuir lucro, pagar dívidas ou tomar novas.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-013',
    type: 'true-false',
    topic: 'liquidez',
    subtopic: 'Dividendos a pagar e o PC',
    skill: 'amb-lc-composicao',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `Avalie a afirmação: "Dividendos e JCP a pagar de ${fmt(B25.dividendosJcp)} em 2025 (2024: ${fmt(B24.dividendosJcp)}) representam ${p1(DIV_PC25)} do Passivo Circulante da Ambev. Essa conta incha o PC e pressiona a Liquidez Corrente, mas não é dívida nova com juros: é lucro já declarado aos sócios, a caminho de sair do caixa."`,
    tables: [ambevLiabilityTable()],
    correct: true,
    explanation: `Verdadeiro. É exatamente a ressalva da Aula 5: "um dividendo declarado incha o PC sem ser dívida nova". Os ${fmt(B25.dividendosJcp)} são lucro que já pertence aos acionistas e será pago com o caixa — por isso aparecem no PC e reduzem a LC (${f2(LC25)}), mas não representam um credor cobrando juros. Em 2024 a conta era ainda maior (${fmt(B24.dividendosJcp)}, ${p1(av(B24.dividendosJcp, B24.passivoCirculante))} do PC), e a LC era ${f2(LC24)}.`,
    reasoningSteps: [
      'Localize a conta no PC e calcule seu peso (÷ PC).',
      'Pergunte: é obrigação com juros (banco) ou distribuição de lucro já declarada?',
      'Leia o efeito na LC: aumenta o denominador, sem ser dívida nova.',
      'Compare os dois anos: a conta caiu, o que ajudou o PC a encolher.',
    ],
    commonMistake: 'Tratar dividendos a pagar como endividamento ou, no extremo oposto, ignorá-los por "não serem dívida" — eles exigem caixa.',
    rule: 'Ao ler a LC, decomponha o PC: dívida bancária, crédito operacional e distribuições declaradas têm pesos e urgências diferentes.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'Quem é o credor dessa conta: o banco ou o acionista?',
    concept: 'Dividendos declarados viram obrigação no PC até serem pagos; são saída de caixa certa, mas não dívida com juros.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-014',
    type: 'numeric',
    topic: 'liquidez',
    subtopic: 'LC 2025',
    skill: 'amb-lc-calculo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Liquidez Corrente da Ambev em 31/12/2025. Arredonde para 2 casas decimais.',
    tables: [bpTable('Ambev — Balanço (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['ATIVO CIRCULANTE', 'ativoCirculante'], ['PASSIVO CIRCULANTE', 'passivoCirculante'], ['PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante']], [0])],
    correct: 0.96,
    unit: 'ratio',
    decimals: 2,
    calc: { fn: 'liquidezCorrente', args: [B25.ativoCirculante, B25.passivoCirculante] },
    solution: {
      formula: 'LC = Ativo Circulante / Passivo Circulante',
      substitution: `LC 2025 = ${fmt(B25.ativoCirculante)} / ${fmt(B25.passivoCirculante)}`,
      computation: `= ${f2(LC25)}`,
      result: f2(LC25),
      unit: 'R$ de AC por R$ 1 de PC',
      interpretation: `Para cada R$ 1 que vence no curto prazo, a Ambev tem R$ ${f2(LC25)} realizáveis no curto prazo. Pela regra de bolso, abaixo de 1 é "atenção"; em 2024 era ${f2(LC24)} (folga pequena).`,
    },
    explanation: `A Liquidez Corrente compara o que vira dinheiro em até 12 meses (AC ${fmt(B25.ativoCirculante)}) com o que vence em até 12 meses (PC ${fmt(B25.passivoCirculante)}): ${f2(LC25)}. A regra de bolso do professor: acima de 1 = folga; igual a 1 = limite; abaixo de 1 = atenção. Mas o número nunca se lê sozinho — a composição (caixa, fornecedores, dividendos) é o que diz se a atenção vira preocupação.`,
    reasoningSteps: [
      'Pegue os subtotais Ativo Circulante e Passivo Circulante (não os totais).',
      'Divida AC por PC.',
      'Arredonde em 2 casas e aplique a regra de bolso.',
      'Anote: o próximo passo é olhar o que compõe cada lado.',
    ],
    commonMistake: 'Dividir Ativo Total por Passivo total (daria 2,58) — a LC é só curto prazo contra curto prazo.',
    rule: 'LC = AC ÷ PC: curto prazo contra curto prazo; a regra de bolso (1,0) é o começo da leitura, não o fim.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'Use os subtotais circulantes.',
    concept: 'A LC mede quantos R$ de curto prazo existem para cada R$ 1 de obrigação de curto prazo.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-015',
    type: 'multi-part',
    topic: 'liquidez',
    subtopic: 'LC 2024 × 2025 — leitura pela composição',
    skill: 'amb-lc-interpretacao',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `A Liquidez Corrente da Ambev em 2025 é ${f2(LC25)}. Calcule a de 2024 e interprete a mudança pela composição do AC e do PC.`,
    tables: [ambevAssetTable(), ambevLiabilityTable()],
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Liquidez Corrente em 31/12/2024 (2 casas decimais).',
        correct: 1.1,
        unit: 'ratio',
        decimals: 2,
        points: 4,
        calc: { fn: 'liquidezCorrente', args: [B24.ativoCirculante, B24.passivoCirculante] },
        solution: {
          formula: 'LC = AC / PC',
          substitution: `${fmt(B24.ativoCirculante)} / ${fmt(B24.passivoCirculante)}`,
          computation: `= ${f2(LC24)}`,
          result: f2(LC24),
          unit: 'R$ de AC por R$ 1 de PC',
          interpretation: `Em 2024 havia folga pequena (${f2(LC24)}); em 2025 o índice caiu para ${f2(LC25)}.`,
        },
      },
      {
        id: 'b',
        kind: 'choice',
        prompt: `b) Qual leitura da queda de ${f2(LC24)} para ${f2(LC25)} está correta?`,
        options: [
          {
            id: 'A',
            text: `O AC caiu ${p1(Math.abs(AH_AC))}, puxado pelo caixa (${p1(AH_CAIXA)}), enquanto o PC caiu só ${p1(Math.abs(AH_PC))}. Como ${p1(FORN_PC25)} do PC é Fornecedores (crédito operacional que se renova) e ${fmt(B25.dividendosJcp)} são dividendos já declarados, e o giro de uma cervejaria é rápido, o ${f2(LC25)} pede atenção, não alarme.`,
          },
          {
            id: 'B',
            text: `Com LC abaixo de 1, a Ambev não consegue pagar suas obrigações de curto prazo e está próxima da insolvência.`,
            whyWrong: `A regra de bolso diz "atenção", não "insolvência". O PC é majoritariamente fornecedores (${p1(FORN_PC25)}) e dividendos; a dívida bancária de curto prazo é só ${fmt(B25.emprestimosCP)}, e o caixa é ${fmt(B25.caixa)}.`,
          },
          {
            id: 'C',
            text: `A LC caiu porque o PC cresceu com novos empréstimos bancários de curto prazo.`,
            whyWrong: `O PC CAIU ${a0(VAR_PC)} (${p1(AH_PC)}) e os empréstimos CP caíram de ${fmt(B24.emprestimosCP)} para ${fmt(B25.emprestimosCP)}. A queda da LC vem do numerador (caixa), não do denominador.`,
          },
          {
            id: 'D',
            text: `A LC caiu porque a receita líquida caiu ${p2(Math.abs(AH_REC))} em 2025.`,
            whyWrong: 'A LC é um índice do BALANÇO (AC ÷ PC). A receita é da DRE e não entra na fórmula; a explicação está na saída de caixa.',
          },
        ],
        correct: 'A',
        points: 6,
      },
    ],
    explanation: `A queda da LC é explicada pelo numerador: o AC caiu ${a0(B25.ativoCirculante - B24.ativoCirculante)} (${p1(AH_AC)}), quase tudo caixa (−${a0(VAR_CAIXA)}), enquanto o PC caiu ${a0(VAR_PC)} (${p1(AH_PC)}). A leitura "por dentro" da Aula 5: Fornecedores são ${p1(FORN_PC25)} do PC (crédito operacional que se renova a cada compra), dividendos declarados ${fmt(B25.dividendosJcp)} incham o PC sem ser dívida nova, e o giro rápido de bebidas convive com índice abaixo de 1. Atenção, portanto, ao caixa que saiu — mas sem concluir insolvência.`,
    reasoningSteps: [
      'Calcule a LC dos dois anos e veja a direção da mudança.',
      'Decomponha: a variação veio do AC (numerador) ou do PC (denominador)?',
      'Olhe a composição do PC: fornecedores, dividendos, impostos, bancos.',
      'Julgue com a natureza do negócio (giro rápido) e nunca com o número isolado.',
    ],
    commonMistake: 'Ler LC < 1 como insolvência, ou explicar a LC com dados da DRE.',
    rule: 'Nunca leia a LC sozinha: pergunte o que compõe o AC e o PC e o que mudou de um ano para o outro.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'O PC caiu; então por que a LC caiu? Olhe o caixa.',
    concept: 'Caixa e recebíveis valem mais que estoque; um dividendo declarado incha o PC sem ser dívida nova; giro rápido convive bem com índice < 1.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-016',
    type: 'true-false',
    topic: 'liquidez',
    subtopic: 'Regra de bolso × leitura completa',
    skill: 'amb-lc-interpretacao',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `Avalie a afirmação: "Como a Liquidez Corrente da Ambev caiu para ${f2(LC25)} (abaixo de 1), a regra de bolso a coloca em 'atenção' e, portanto, a conclusão correta é que a empresa está incapaz de honrar suas obrigações de curto prazo em 2026."`,
    tables: [ambevAssetTable(), ambevLiabilityTable()],
    correct: false,
    explanation: `Falso. A regra de bolso (abaixo de 1 = atenção) é o ponto de partida, não a conclusão. "Atenção" significa olhar a composição: o PC de ${fmt(B25.passivoCirculante)} tem ${fmt(B25.fornecedores)} de fornecedores (${p1(FORN_PC25)}, crédito operacional renovável), ${fmt(B25.dividendosJcp)} de dividendos já declarados e só ${fmt(B25.emprestimosCP)} de empréstimos; o AC tem ${fmt(B25.caixa)} de caixa e um giro rápido (bebidas vendem antes de pagar o fornecedor). Além disso, a operação gera lucro de ${fmt(D25.lucroLiquido)} por ano. O índice ${f2(LC25)} pede acompanhamento do caixa que saiu (−${p1(Math.abs(AH_CAIXA))}), não decreta incapacidade de pagamento.`,
    reasoningSteps: [
      'Aplique a regra de bolso para classificar: folga, limite ou atenção.',
      'Abra o PC: quanto é fornecedor, dividendo, imposto, banco?',
      'Abra o AC: quanto é caixa e recebível (líquido) versus estoque?',
      'Considere o giro do negócio e a geração de lucro antes de concluir.',
    ],
    commonMistake: 'Transformar "atenção" em "incapaz de pagar": a regra de bolso não substitui a leitura da composição.',
    rule: 'LC < 1 = atenção; atenção = olhar por dentro (composição e variação), nunca sentença.',
    formula: 'LC = Ativo Circulante / Passivo Circulante',
    hint: 'O que é a maior conta do PC e como ela se renova?',
    concept: 'A liquidez depende da qualidade do AC e da natureza do PC, não só da razão entre eles.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-017',
    type: 'numeric',
    topic: 'margens',
    subtopic: 'Margem Bruta 2025',
    skill: 'amb-margens-calculo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Margem Bruta da Ambev em 2025. Responda em %, com 2 casas decimais.',
    tables: [dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['(−) Custo dos produtos vendidos', 'custoVendas'], ['= Lucro bruto', 'lucroBruto']], [0, 2])],
    correct: 51.42,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'margem', args: [D25.lucroBruto, D25.receitaLiquida] },
    solution: {
      formula: 'Margem Bruta = Lucro Bruto / Receita líquida × 100',
      substitution: `MB 2025 = ${fmt(D25.lucroBruto)} / ${fmt(D25.receitaLiquida)} × 100`,
      computation: `${(D25.lucroBruto / D25.receitaLiquida).toFixed(4).replace('.', ',')} × 100 = ${p2(MB25)}`,
      result: p2(MB25),
      unit: '% da receita líquida',
      interpretation: `De cada R$ 100 vendidos, R$ ${f2(MB25)} sobram depois do custo dos produtos (CPV ${p2(AVC25)}). Em 2024 a MB era ${p2(MB24)}: +${f2(MB25 - MB24)} p.p.`,
    },
    explanation: `A Margem Bruta responde "o produto é rentável?": Lucro Bruto ${fmt(D25.lucroBruto)} ÷ Receita ${fmt(D25.receitaLiquida)} = ${p2(MB25)}. Mais da metade de cada real vendido sobra depois do custo de produzir a bebida — uma margem alta típica de bens de consumo com marca forte e escala. Se é "boa", só a comparação diz: com o ano anterior (${p2(MB24)}) melhorou.`,
    reasoningSteps: [
      'Pegue o primeiro "=" da DRE: Lucro Bruto.',
      'Divida pela Receita líquida e multiplique por 100.',
      'Arredonde em 2 casas.',
      'Compare com o ano anterior antes de qualquer julgamento.',
    ],
    commonMistake: 'Usar o Lucro Operacional (23.318) ou dividir pelo CPV em vez de pela receita.',
    rule: 'Margem = lucro do degrau ÷ Receita líquida × 100; a Margem Bruta usa o primeiro degrau.',
    formula: 'MB = Lucro Bruto / Receita líquida × 100',
    hint: 'Lucro Bruto = Receita − CPV.',
    concept: 'A Margem Bruta mede a sobra da atividade em si, antes das despesas de estrutura e venda.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-018',
    type: 'multiple-choice',
    topic: 'margens',
    subtopic: 'Por que a Margem Bruta subiu',
    skill: 'amb-margens-origem',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `A receita da Ambev caiu ${p2(AH_REC)} em 2025. Calcule a A.H. do Custo dos produtos vendidos (2 casas decimais) e escolha a leitura correta sobre a Margem Bruta.`,
    tables: [dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['(−) Custo dos produtos vendidos', 'custoVendas'], ['= Lucro bruto', 'lucroBruto']], [0, 2])],
    options: [
      {
        id: 'A',
        text: '+1,72%: o CPV cresceu, por isso a Margem Bruta caiu.',
        whyWrong: `Erro de sinal. O CPV foi de ${a0(D24.custoVendas)} para ${a0(D25.custoVendas)}: CAIU. A fórmula da planilha usa módulos: ${a0(D25.custoVendas)} ÷ ${a0(D24.custoVendas)} − 1 = ${p2(AH_CPV)}.`,
      },
      {
        id: 'B',
        text: `${p2(AH_REC)}: CPV e receita caíram na mesma proporção, e a Margem Bruta ficou estável em ${p1(MB24)}.`,
        whyWrong: `${p2(AH_REC)} é a A.H. da RECEITA. O CPV caiu mais (${p2(AH_CPV)}), e por isso a margem mudou.`,
      },
      {
        id: 'C',
        text: `${p2(AH_LB)}: é a A.H. do Lucro Bruto, e como o Lucro Bruto caiu, a Margem Bruta piorou.`,
        whyWrong: `O Lucro Bruto em R$ caiu ${p2(Math.abs(AH_LB))}, menos que a receita (${p2(Math.abs(AH_REC))}); por isso a MARGEM subiu. Lucro em R$ e margem em % são medidas diferentes.`,
      },
      {
        id: 'D',
        text: `−0,18%: é a A.H. do CPV, igual à variação da margem.`,
        whyWrong: `0,18 p.p. é a variação da A.V. do CPV (${p2(AVC24)} → ${p2(AVC25)}) e da MB (${p2(MB24)} → ${p2(MB25)}), não a A.H. do CPV.`,
      },
      {
        id: 'E',
        text: `${p2(AH_CPV)}: o CPV (${a0(D24.custoVendas)} → ${a0(D25.custoVendas)}) caiu mais que a receita (${p2(AH_REC)}); a linha de baixo "cresceu mais devagar" que a receita, e a MB subiu de ${p2(MB24)} para ${p2(MB25)} (+${f2(MB25 - MB24)} p.p.).`,
      },
    ],
    correct: 'E',
    calc: { fn: 'analiseHorizontal', args: [D25.custoVendas, D24.custoVendas] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1',
      substitution: `A.H. CPV = ${a0(D25.custoVendas)} / ${a0(D24.custoVendas)} − 1`,
      computation: `${(Math.abs(D25.custoVendas) / Math.abs(D24.custoVendas)).toFixed(4).replace('.', ',')} − 1 = ${p2(AH_CPV)}`,
      result: p2(AH_CPV),
      unit: '% de variação sobre 2024',
      interpretation: `CPV ${p2(AH_CPV)} contra receita ${p2(AH_REC)}: o custo caiu mais rápido. A A.V. do CPV foi de ${p2(AVC24)} para ${p2(AVC25)} e a Margem Bruta de ${p2(MB24)} para ${p2(MB25)}.`,
    },
    explanation: `Regra de leitura da Aula 4: a margem melhora quando a linha de baixo cresce mais devagar que a receita — e vale também quando as duas caem: o CPV caiu ${p2(Math.abs(AH_CPV))}, a receita ${p2(Math.abs(AH_REC))}. Resultado: a Margem Bruta subiu ${f2(MB25 - MB24)} p.p., para ${p2(MB25)}, mesmo com Lucro Bruto menor em R$ (${fmt(D24.lucroBruto)} → ${fmt(D25.lucroBruto)}). A.H. (variação da linha) e A.V. (peso da linha) respondem a perguntas diferentes.`,
    reasoningSteps: [
      'Calcule a A.H. do CPV pelos valores em módulo.',
      'Compare com a A.H. da receita: qual caiu mais?',
      'Linha de custo caindo mais que a receita = margem sobe.',
      'Confirme pela A.V.: o peso do CPV na receita diminuiu.',
    ],
    commonMistake: 'Ler o sinal negativo do CPV como queda, ou confundir lucro em R$ (que caiu) com margem em % (que subiu).',
    rule: 'Para saber se uma margem melhorou, compare a A.H. da linha com a A.H. da receita.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'O CPV saiu de 43.615 para 42.864: subiu ou caiu, e em quanto por cento?',
    concept: 'A A.H. do custo é lida contra a A.H. da receita: é essa comparação que explica a origem da melhora da margem.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-019',
    type: 'multi-part',
    topic: 'margens',
    subtopic: 'Margem Operacional 2024 × 2025 — origem da melhora',
    skill: 'amb-margens-origem',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: 'Com a DRE da Ambev, calcule a Margem Operacional dos dois anos e explique de onde veio a variação. Lembre: na planilha do professor, o Lucro operacional NÃO inclui a Participação em coligadas.',
    tables: [ambevIncomeTable()],
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Margem Operacional de 2024 (%, 2 casas decimais).',
        correct: 24.37,
        unit: 'percent',
        decimals: 2,
        points: 3,
        calc: { fn: 'margem', args: [D24.lucroOperacional, D24.receitaLiquida] },
        solution: {
          formula: 'MO = Lucro Operacional / Receita líquida × 100',
          substitution: `MO 2024 = ${fmt(D24.lucroOperacional)} / ${fmt(D24.receitaLiquida)} × 100`,
          computation: `= ${p2(MO24)}`,
          result: p2(MO24),
          unit: '% da receita líquida',
          interpretation: `Em 2024 sobravam R$ ${f2(MO24)} de cada R$ 100 depois do CPV e das despesas operacionais.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) Margem Operacional de 2025 (%, 2 casas decimais).',
        correct: 26.43,
        unit: 'percent',
        decimals: 2,
        points: 3,
        calc: { fn: 'margem', args: [D25.lucroOperacional, D25.receitaLiquida] },
        solution: {
          formula: 'MO = Lucro Operacional / Receita líquida × 100',
          substitution: `MO 2025 = ${fmt(D25.lucroOperacional)} / ${fmt(D25.receitaLiquida)} × 100`,
          computation: `= ${p2(MO25)}`,
          result: p2(MO25),
          unit: '% da receita líquida',
          interpretation: `Melhora de ${f2(MO25 - MO24)} p.p.: a operação "para em pé" com mais folga em 2025.`,
        },
      },
      {
        id: 'c',
        kind: 'text',
        prompt: `c) Explique, com a A.H. das linhas de despesa, de onde veio a melhora da Margem Operacional (o Lucro operacional cresceu ${p2(AH_LO)} com receita ${p2(AH_REC)}).`,
        points: 4,
        rubric: {
          requireNumbers: true,
          criteria: [
            {
              id: 'despesas',
              description: `Mostra que as despesas caíram mais que a receita: logísticas ${p1(AH_LOG)}, comerciais ${p1(AH_COM)}, administrativas ${p1(AH_ADM)} (contra receita ${p1(AH_REC)}).`,
              points: 2,
              keywords: [['logist', '5,4'], ['comerc', '3,3'], ['administr', '5,5'], ['despesa', '1.252'], ['despesa', 'mais que a receita'], ['despesa', 'mais rapido']],
            },
            {
              id: 'naousuais',
              description: `Cita os itens não usuais (de ${fmt(D24.itensNaoUsuais)} para +${fmt(D25.itensNaoUsuais)}, +${fmt(VAR_INU)}) como ganho pontual que ajudou o Lucro operacional.`,
              points: 1,
              keywords: [['nao usua', '643'], ['nao usua', '744'], ['nao usua', '101'], ['nao usuais']],
            },
            {
              id: 'conclusao',
              description: `Conclui com números: LO de ${fmt(D24.lucroOperacional)} para ${fmt(D25.lucroOperacional)} (+${fmt(VAR_LO)}, ${p2(AH_LO)}), MO de ${p2(MO24)} para ${p2(MO25)}.`,
              points: 1,
              keywords: [['6,9'], ['1.516'], ['1516'], ['23.318'], ['23318'], ['26,4', '24,4'], ['26,43', '24,37']],
            },
          ],
          seriousErrors: [
            { description: 'Atribui a melhora ao crescimento da receita (a receita caiu 1,35%).', patterns: ['receita cresceu', 'receita subiu', 'aumento da receita', 'aumento de receita'], penalty: 1 },
            { description: 'Inclui a Participação em coligadas ou o resultado financeiro no Lucro operacional.', patterns: ['coligadas no lucro operacional', 'financeiro no lucro operacional'], penalty: 1 },
          ],
          modelAnswer: `A melhora veio das despesas, não da receita (que caiu ${p2(Math.abs(AH_REC))}). O Lucro Bruto caiu ${p2(Math.abs(AH_LB))} (${fmt(D24.lucroBruto)} → ${fmt(D25.lucroBruto)}), mas as três linhas de despesa caíram mais rápido: logísticas ${p1(AH_LOG)} (${a0(D24.despesasLogisticas)} → ${a0(D25.despesasLogisticas)}), comerciais ${p1(AH_COM)} (${a0(D24.despesasComerciais)} → ${a0(D25.despesasComerciais)}) e administrativas ${p1(AH_ADM)} (${a0(D24.despesasAdministrativas)} → ${a0(D25.despesasAdministrativas)}) — juntas, de ${fmt(DESPOP24)} para ${fmt(DESPOP25)} (−${fmt(DESPOP24 - DESPOP25)}). Os itens não usuais passaram de ${fmt(D24.itensNaoUsuais)} para +${fmt(D25.itensNaoUsuais)} (+${fmt(VAR_INU)}), um ganho pontual. Resultado: Lucro operacional de ${fmt(D24.lucroOperacional)} para ${fmt(D25.lucroOperacional)} (+${fmt(VAR_LO)}, ${p2(AH_LO)}) e MO de ${p2(MO24)} para ${p2(MO25)} (+${f2(MO25 - MO24)} p.p.).`,
        },
      },
    ],
    explanation: `A Margem Operacional responde "a operação para em pé?". Subiu de ${p2(MO24)} para ${p2(MO25)} porque, com receita em queda (${p2(AH_REC)}), as despesas caíram ainda mais (logísticas ${p1(AH_LOG)}, comerciais ${p1(AH_COM)}, administrativas ${p1(AH_ADM)}), e os itens não usuais somaram +${fmt(D25.itensNaoUsuais)}. É a regra de leitura: margem melhora quando a linha de baixo cresce mais devagar (ou cai mais rápido) que a receita. Vale separar o que é estrutural (despesas) do que é pontual (itens não usuais).`,
    reasoningSteps: [
      'Calcule a MO dos dois anos: Lucro operacional ÷ Receita.',
      'Calcule a A.H. de cada linha entre Lucro Bruto e Lucro operacional.',
      'Compare cada A.H. com a da receita: o que caiu mais que a receita ajudou a margem.',
      'Separe ganhos recorrentes (despesas) de pontuais (itens não usuais).',
    ],
    commonMistake: 'Somar a Participação em coligadas ao Lucro operacional (na planilha ela vem depois do resultado financeiro) ou explicar a melhora pela receita.',
    rule: 'Origem da variação de uma margem = A.H. de cada linha entre os dois degraus, comparada com a A.H. da receita.',
    formula: 'MO = Lucro Operacional / Receita líquida × 100',
    hint: 'Receita caiu 1,35%; que linhas caíram mais do que isso?',
    concept: 'O Lucro Operacional é a sobra da operação completa (produto + estrutura), antes de juros, coligadas e IR.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-020',
    type: 'numeric',
    topic: 'margens',
    subtopic: 'Margem Líquida 2025',
    skill: 'amb-margens-calculo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule a Margem Líquida da Ambev em 2025. Responda em %, com 2 casas decimais.',
    tables: [dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['= Lucro operacional', 'lucroOperacional'], ['= Lucro antes do IR/CS', 'lair'], ['= Lucro líquido do exercício', 'lucroLiquido']], [0, 3])],
    correct: 18.12,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'margem', args: [D25.lucroLiquido, D25.receitaLiquida] },
    solution: {
      formula: 'Margem Líquida = Lucro Líquido / Receita líquida × 100',
      substitution: `ML 2025 = ${fmt(D25.lucroLiquido)} / ${fmt(D25.receitaLiquida)} × 100`,
      computation: `${(D25.lucroLiquido / D25.receitaLiquida).toFixed(4).replace('.', ',')} × 100 = ${p2(ML25)}`,
      result: p2(ML25),
      unit: '% da receita líquida',
      interpretation: `De cada R$ 100 vendidos, R$ ${f2(ML25)} chegam ao acionista depois de custo, despesas, juros, coligadas e IR. Em 2024 eram R$ ${f2(ML24)}: +${f2(ML25 - ML24)} p.p.`,
    },
    explanation: `A Margem Líquida é o fim do filme da DRE: ${fmt(D25.lucroLiquido)} ÷ ${fmt(D25.receitaLiquida)} = ${p2(ML25)}. Ela responde "sobra para o sócio?" — e na Ambev sobram R$ ${f2(ML25)} de cada R$ 100, quase o dobro de uma varejista como a Renner (${p1(RENNER_REF.ml)}). Se isso remunera bem o capital investido é pergunta do ROE, não da margem.`,
    reasoningSteps: [
      'Pegue o último "=" da DRE: Lucro líquido do exercício.',
      'Divida pela Receita líquida (não pelo Lucro Bruto nem pelo PL).',
      'Multiplique por 100 e arredonde.',
      'Compare com o ano anterior.',
    ],
    commonMistake: 'Usar o LAIR (19.422) no numerador — isso daria 22,01%, não a margem líquida.',
    rule: 'Margem Líquida usa o último degrau (Lucro Líquido) sobre a Receita líquida.',
    formula: 'ML = Lucro Líquido / Receita líquida × 100',
    hint: 'O numerador é o último "=" da DRE.',
    concept: 'A Margem Líquida mede a eficiência de todos os degraus: quanto de cada R$ 100 vira lucro para os sócios.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-021',
    type: 'multiple-choice',
    topic: 'resultado-financeiro',
    subtopic: 'Resultado financeiro e IR na Margem Líquida',
    skill: 'amb-ml-financeiro-ir',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `A Margem Líquida da Ambev subiu de ${p2(ML24)} para ${p2(ML25)}. Calcule a A.H. do Resultado financeiro líquido (1 casa decimal) e escolha a alternativa que explica corretamente o papel do resultado financeiro e do IR/CS nessa melhora.`,
    tables: [ambevIncomeTable()],
    options: [
      {
        id: 'A',
        text: `O resultado financeiro melhorou ${p1(AH_RF)} e foi o principal motor da margem líquida.`,
        whyWrong: `O resultado financeiro PIOROU: a despesa financeira líquida foi de ${a0(D24.resultadoFinanceiro)} para ${a0(D25.resultadoFinanceiro)}. A A.H. positiva mede o crescimento do valor da linha, que é uma despesa.`,
      },
      {
        id: 'B',
        text: `O resultado financeiro piorou ${p1(AH_RF)} (${fmt(D24.resultadoFinanceiro)} → ${fmt(D25.resultadoFinanceiro)}), consumindo quase todo o ganho operacional (+${fmt(VAR_LO)}): o LAIR ficou estável (${p2(AH_LAIR)}). A margem líquida subiu porque o IR/CS caiu ${p1(Math.abs(AH_IR))} (${a0(D24.irCs)} → ${a0(D25.irCs)}).`,
      },
      {
        id: 'C',
        text: 'A margem líquida subiu porque a receita cresceu mais do que as despesas financeiras.',
        whyWrong: `A receita CAIU ${p2(Math.abs(AH_REC))}. A melhora da margem líquida não veio da receita.`,
      },
      {
        id: 'D',
        text: `O IR/CS subiu ${p1(Math.abs(AH_IR))}, mas a Participação em coligadas (+${fmt(D25.participacaoColigadas)}) compensou.`,
        whyWrong: `O IR/CS CAIU ${p1(Math.abs(AH_IR))} (${a0(D24.irCs)} → ${a0(D25.irCs)}); a coligada contribuiu ${fmt(D25.participacaoColigadas)}, pequeno diante de um LL de ${fmt(D25.lucroLiquido)}.`,
      },
      {
        id: 'E',
        text: `A A.H. do resultado financeiro é −${p1(AH_RF)}, porque a linha é negativa na DRE.`,
        whyWrong: `A fórmula da planilha usa módulos: ${a0(D25.resultadoFinanceiro)} ÷ ${a0(D24.resultadoFinanceiro)} − 1 = +${p1(AH_RF)}. O sinal negativo da linha só diz que é despesa; a despesa cresceu.`,
      },
    ],
    correct: 'B',
    calc: { fn: 'analiseHorizontal', args: [D25.resultadoFinanceiro, D24.resultadoFinanceiro] },
    solution: {
      formula: 'A.H. = |Atual| / |Anterior| − 1',
      substitution: `A.H. RF = ${a0(D25.resultadoFinanceiro)} / ${a0(D24.resultadoFinanceiro)} − 1`,
      computation: `${(Math.abs(D25.resultadoFinanceiro) / Math.abs(D24.resultadoFinanceiro)).toFixed(4).replace('.', ',')} − 1 = +${p1(AH_RF)}`,
      result: `+${p1(AH_RF)} (piorou)`,
      unit: '% de variação sobre 2024',
      interpretation: `A despesa financeira líquida cresceu ${a0(VAR_RF)} (A.V. de ${p2(AV_RF24)} para ${p2(AV_RF25)} da receita) e anulou o ganho operacional de ${fmt(VAR_LO)}: LAIR ${fmt(D24.lair)} → ${fmt(D25.lair)} (${p2(AH_LAIR)}). O IR/CS caiu ${a0(VAR_IR)} (alíquota efetiva de ${p1(ALIQ24)} para ${p1(ALIQ25)} do LAIR), e o LL subiu ${p2(AH_LL)}.`,
    },
    explanation: `Entre o Lucro operacional e o Lucro líquido há três linhas: resultado financeiro, coligadas e IR/CS. Em 2025 a operação rendeu +${fmt(VAR_LO)} a mais, mas o resultado financeiro piorou ${a0(VAR_RF)} (${fmt(D24.resultadoFinanceiro)} → ${fmt(D25.resultadoFinanceiro)}, +${p1(AH_RF)}), deixando o LAIR praticamente igual (${p2(AH_LAIR)}). O que fez o LL crescer ${p2(AH_LL)} foi o IR/CS menor: ${a0(D24.irCs)} → ${a0(D25.irCs)} (${p1(AH_IR)}). É a pergunta "de onde vem o lucro: operação ou financeiro?" — aqui a operação melhorou, o financeiro piorou e o imposto fechou a conta.`,
    reasoningSteps: [
      'Calcule a A.H. do resultado financeiro pelos módulos: cresceu ou caiu a despesa?',
      'Compare a variação do financeiro com a variação do Lucro operacional.',
      'Veja o LAIR: se ficou estável, o financeiro anulou a operação.',
      'Olhe o IR/CS: a queda do imposto explica o LL maior.',
    ],
    commonMistake: 'Ler "+72,6%" como melhora do financeiro, ou atribuir o LL maior à receita (que caiu).',
    rule: 'Em linhas de despesa, A.H. positiva = despesa cresceu = piorou; leia o sinal pelo significado da linha, não pela planilha.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'A despesa financeira foi de 2.318 para 4.002. Isso é melhora ou piora?',
    concept: 'O resultado financeiro é o efeito das dívidas, do caixa e do câmbio; o IR é a fatia do governo. Os dois podem mover o LL sem que a operação mude.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-022',
    type: 'short-answer',
    topic: 'dre',
    subtopic: 'Exercício 4 — receita caiu, lucro subiu',
    skill: 'amb-ll-vs-receita',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `Exercício 4 (b) da atividade em classe: a receita líquida da Ambev caiu ${p1(Math.abs(AH_REC))} (${fmt(D24.receitaLiquida)} → ${fmt(D25.receitaLiquida)}), mas o lucro líquido subiu ${p1(AH_LL)} (${fmt(D24.lucroLiquido)} → ${fmt(D25.lucroLiquido)}). Como isso é possível? Aponte as linhas responsáveis, com a A.H. de cada uma.`,
    tables: [ambevIncomeTable()],
    rubric: {
      requireNumbers: true,
      criteria: [
        {
          id: 'cpv',
          description: `CPV caiu mais que a receita (${p2(AH_CPV)} × ${p2(AH_REC)}): Lucro Bruto cai menos e a MB sobe para ${p2(MB25)}.`,
          points: 2,
          keywords: [['cpv', '1,7'], ['custo', '1,7'], ['custo', '42.864'], ['cpv', '42.864'], ['custo', 'mais que a receita'], ['custo', 'mais rapido'], ['51,4']],
        },
        {
          id: 'despesas',
          description: `Despesas operacionais caíram: logísticas ${p1(AH_LOG)}, comerciais ${p1(AH_COM)}, administrativas ${p1(AH_ADM)}; Lucro operacional +${p2(AH_LO)}.`,
          points: 3,
          keywords: [['logist'], ['comerc', 'admin'], ['despesa', '5,4'], ['despesa', '3,3'], ['despesa', '5,5'], ['operacional', '6,9'], ['operacional', '23.318'], ['despesas', 'cairam'], ['despesas', 'caiu']],
        },
        {
          id: 'financeiro',
          description: `Resultado financeiro piorou (${fmt(D24.resultadoFinanceiro)} → ${fmt(D25.resultadoFinanceiro)}, +${p1(AH_RF)}) e anulou o ganho operacional: LAIR ${p2(AH_LAIR)}.`,
          points: 2,
          keywords: [['financeiro', '4.002'], ['financeiro', '4002'], ['financeiro', '72'], ['financeiro', '2.318'], ['financeiro', 'pior']],
        },
        {
          id: 'ir',
          description: `IR/CS caiu ${p1(Math.abs(AH_IR))} (${a0(D24.irCs)} → ${a0(D25.irCs)}) — a linha que fez o LL crescer com LAIR estável.`,
          points: 3,
          keywords: [['ir/cs', '26'], ['imposto', '26'], ['ir e cs', '26'], ['tributo', '26'], ['renda', '26'], ['ir/cs', '3.433'], ['imposto', '3.433'], ['imposto', '4.640'], ['ir/cs', '4.640'], ['ir/cs', '3433']],
        },
      ],
      seriousErrors: [
        { description: 'Atribui o lucro maior a crescimento da receita.', patterns: ['receita cresceu', 'receita subiu', 'aumento da receita', 'receita aumentou'], penalty: 2 },
        { description: 'Diz que o resultado financeiro melhorou.', patterns: ['financeiro melhorou', 'resultado financeiro positivo', 'melhora do resultado financeiro'], penalty: 2 },
      ],
      modelAnswer: `Receita ${p2(AH_REC)} e LL +${p2(AH_LL)} convivem porque as linhas abaixo da receita caíram mais do que ela — exceto o financeiro. (1) CPV: ${a0(D24.custoVendas)} → ${a0(D25.custoVendas)} (${p2(AH_CPV)}), caiu mais que a receita; Lucro Bruto ${p2(AH_LB)} e MB de ${p2(MB24)} para ${p2(MB25)}. (2) Despesas: logísticas ${p1(AH_LOG)}, comerciais ${p1(AH_COM)}, administrativas ${p1(AH_ADM)}; itens não usuais de ${fmt(D24.itensNaoUsuais)} para +${fmt(D25.itensNaoUsuais)}. Lucro operacional ${fmt(D24.lucroOperacional)} → ${fmt(D25.lucroOperacional)} (+${p2(AH_LO)}), MO ${p2(MO24)} → ${p2(MO25)}. (3) Resultado financeiro piorou: ${fmt(D24.resultadoFinanceiro)} → ${fmt(D25.resultadoFinanceiro)} (+${p1(AH_RF)}), consumindo o ganho operacional; LAIR ${fmt(D24.lair)} → ${fmt(D25.lair)} (${p2(AH_LAIR)}). (4) IR/CS: ${a0(D24.irCs)} → ${a0(D25.irCs)} (${p1(AH_IR)}), alíquota efetiva de ${p1(ALIQ24)} para ${p1(ALIQ25)} do LAIR — é o que fez o LL crescer ${fmt(VAR_LL)}. ML de ${p2(ML24)} para ${p2(ML25)}. A linha a atacar é o resultado financeiro (${a0(VAR_RF)} a mais de despesa), porque a melhora do IR pode não se repetir.`,
    },
    explanation: `Receita menor e lucro maior é o caso clássico em que a A.H. linha a linha é obrigatória. Duas forças ajudaram (CPV ${p2(AH_CPV)} e despesas caindo ${p1(AH_LOG)}/${p1(AH_COM)}/${p1(AH_ADM)}), uma atrapalhou (financeiro +${p1(AH_RF)}) e uma fechou a conta (IR/CS ${p1(AH_IR)}). Sem o IR menor, o LL teria ficado praticamente igual, porque o LAIR mal mudou (${p2(AH_LAIR)}).`,
    reasoningSteps: [
      'Calcule a A.H. de cada linha da DRE e compare com a da receita.',
      'Separe o que ajudou (linhas que caíram mais que a receita) do que atrapalhou (linhas que cresceram).',
      'Verifique o LAIR: se ficou estável, a operação e o financeiro se anularam.',
      'Identifique a linha que explica a diferença final (IR/CS) e a linha a atacar (financeiro).',
    ],
    commonMistake: 'Parar na Margem Bruta e não perceber que o LAIR ficou estável — a melhora do LL veio do imposto.',
    rule: 'Quando receita e lucro andam em direções opostas, a resposta está na A.H. das linhas intermediárias, uma a uma.',
    formula: 'A.H. = |Atual| / |Anterior| − 1',
    hint: 'Compare o LAIR dos dois anos antes de olhar o LL.',
    concept: 'O lucro pode crescer sem receita crescer: basta custos, despesas ou impostos caírem mais do que ela.',
    sourceReference: SRC_ATIV,
  },
  {
    id: 'amb-023',
    type: 'numeric',
    topic: 'roe',
    subtopic: 'ROE 2025',
    skill: 'amb-roe-calculo',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'easy',
    cognitiveLevel: 'calculation',
    context: CTX,
    stem: 'Calcule o ROE da Ambev em 2025 (Lucro Líquido de 2025 sobre o Patrimônio Líquido de 31/12/2025). Responda em %, com 2 casas decimais.',
    tables: [
      dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['= Lucro líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Ambev — Balanço (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    correct: 18.01,
    unit: 'percent',
    decimals: 2,
    calc: { fn: 'roe', args: [D25.lucroLiquido, B25.patrimonioLiquido] },
    solution: {
      formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
      substitution: `ROE 2025 = ${fmt(D25.lucroLiquido)} / ${fmt(B25.patrimonioLiquido)} × 100`,
      computation: `${(D25.lucroLiquido / B25.patrimonioLiquido).toFixed(4).replace('.', ',')} × 100 = ${p2(ROE25)}`,
      result: p2(ROE25),
      unit: '% ao ano sobre o PL',
      interpretation: `Para cada R$ 100 que os sócios deixaram na empresa, voltaram R$ ${f2(ROE25)} em 2025. Em 2024 foram R$ ${f2(ROE24)}. Coincide com o "Ambev 18%" da lista da aula (data-base anterior).`,
    },
    explanation: `O ROE é a ponte entre as duas demonstrações: Lucro Líquido (DRE) ÷ Patrimônio Líquido (Balanço) = ${fmt(D25.lucroLiquido)} ÷ ${fmt(B25.patrimonioLiquido)} = ${p2(ROE25)}. É a pergunta do dono: "para cada R$ 1 que deixei na empresa, quanto voltou neste ano?". Se é satisfatório depende da comparação: ano anterior (${p2(ROE24)}), pares (Renner ${p1(ROE_REF.renner)}, Itaú ${ROE_REF.itau}%, WEG ${ROE_REF.weg}%) e custo do capital.`,
    reasoningSteps: [
      'Numerador: Lucro Líquido do exercício (DRE).',
      'Denominador: Patrimônio Líquido (Balanço) — não o Ativo Total.',
      'Divida, multiplique por 100 e arredonde.',
      'Compare com o ano anterior e com pares antes de julgar.',
    ],
    commonMistake: 'Dividir pelo Ativo Total (daria 11,02%) ou pela Receita (isso é a margem líquida, 18,12% — valor próximo, mas conceito diferente).',
    rule: 'ROE = LL ÷ PL: lucro da DRE sobre o capital dos sócios no Balanço.',
    formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
    hint: 'O denominador é o capital dos sócios, não o ativo.',
    concept: 'O ROE mede o retorno sobre o capital próprio: a pergunta central da rentabilidade para o acionista.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-024',
    type: 'multiple-choice',
    topic: 'roe',
    subtopic: 'ROE 2024 × 2025 — satisfação do acionista',
    skill: 'amb-roe-leitura',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `O ROE da Ambev em 2025 foi ${p2(ROE25)}. Calcule o ROE de 2024 (2 casas decimais) e escolha a leitura correta sobre a satisfação do acionista. Referências da aula: Renner ${p1(ROE_REF.renner)}, Bradesco ${ROE_REF.bradesco}%, Itaú ${ROE_REF.itau}%, WEG ${ROE_REF.weg}%, Boa Safra ${ROE_REF.boaSafra}%.`,
    tables: [
      dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['= Lucro líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Ambev — Balanço (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    options: [
      {
        id: 'A',
        text: `Sim, totalmente: ${p2(ROE25)} é um ROE ótimo em qualquer cenário.`,
        whyWrong: 'Julgamento absoluto. A disciplina exige comparação: ano anterior, pares, custo do capital. "Ótimo em qualquer cenário" não existe.',
      },
      {
        id: 'B',
        text: `Não: o ROE caiu de ${p2(ROE25)} para ${p2(ROE24)} porque o PL encolheu.`,
        whyWrong: `Inverteu os anos: 2024 = ${p2(ROE24)}, 2025 = ${p2(ROE25)}. O ROE SUBIU — e o PL menor foi uma das causas da alta, não de queda.`,
      },
      {
        id: 'C',
        text: `O ROE de 2024 foi ${p2(ML24)}, igual à margem líquida; em 2025 ficou em ${p2(ML25)}.`,
        whyWrong: `Confunde ROE (LL ÷ PL) com Margem Líquida (LL ÷ Receita). ${p2(ML24)} e ${p2(ML25)} são margens; os ROEs são ${p2(ROE24)} e ${p2(ROE25)}.`,
      },
      {
        id: 'D',
        text: `O ROE subiu de ${p2(ROE24)} (${fmt(D24.lucroLiquido)} ÷ ${fmt(B24.patrimonioLiquido)}) para ${p2(ROE25)} (${fmt(D25.lucroLiquido)} ÷ ${fmt(B25.patrimonioLiquido)}). A satisfação depende da comparação: acima do ano anterior e da Renner (${p1(ROE_REF.renner)}), abaixo de Itaú (${ROE_REF.itau}%) e WEG (${ROE_REF.weg}%); e parte da alta veio do PL ter encolhido ${p1(Math.abs(AH_PL))}, não só de mais lucro.`,
      },
      {
        id: 'E',
        text: `${p2(ROE25)} é igual ao "Ambev ${ROE_REF.ambevLista}%" da lista da aula, portanto nada mudou em relação a 2024.`,
        whyWrong: `A lista da aula tem data-base anterior à das DFs. Pela planilha, o ROE de 2024 foi ${p2(ROE24)}: houve melhora de ${f2(ROE25 - ROE24)} p.p.`,
      },
    ],
    correct: 'D',
    calc: { fn: 'roe', args: [D24.lucroLiquido, B24.patrimonioLiquido] },
    solution: {
      formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
      substitution: `ROE 2024 = ${fmt(D24.lucroLiquido)} / ${fmt(B24.patrimonioLiquido)} × 100`,
      computation: `${(D24.lucroLiquido / B24.patrimonioLiquido).toFixed(4).replace('.', ',')} × 100 = ${p2(ROE24)}`,
      result: p2(ROE24),
      unit: '% ao ano sobre o PL',
      interpretation: `De ${p2(ROE24)} para ${p2(ROE25)}: +${f2(ROE25 - ROE24)} p.p. O lucro cresceu ${p1(AH_LL)} e o PL caiu ${p1(Math.abs(AH_PL))} — os dois efeitos elevam o ROE.`,
    },
    explanation: `"Como acionista, estou satisfeito?" só se responde comparando. Contra 2024 (${p2(ROE24)}), melhorou. Contra pares, ${p2(ROE25)} fica acima do varejo (Renner ${p1(ROE_REF.renner)}) e abaixo de bancos e WEG — coerente com a pergunta da aula "por que bancos e bens de consumo rendem mais que varejo e aéreas?". A ressalva importante: parte da alta vem do denominador menor (PL −${p1(Math.abs(AH_PL))}), que é efeito de dividendos e ajustes de avaliação, não de operação.`,
    reasoningSteps: [
      'Calcule o ROE dos dois anos com LL ÷ PL.',
      'Compare com o ano anterior: melhorou ou piorou?',
      'Compare com pares do mesmo setor e de outros setores.',
      'Decomponha a variação: veio do lucro, do PL ou dos dois?',
    ],
    commonMistake: 'Julgar o ROE em termos absolutos ("18% é ótimo") ou confundi-lo com a margem líquida, que por coincidência é próxima (18,12%).',
    rule: 'ROE se julga por comparação (tempo, pares, custo do capital) e se explica por decomposição (lucro × PL).',
    formula: 'ROE = Lucro Líquido / Patrimônio Líquido × 100',
    hint: 'Use o PL de cada ano como denominador.',
    concept: 'O ROE mede a satisfação do acionista; sua leitura exige referências e a origem da variação.',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-025',
    type: 'multi-part',
    topic: 'dupont',
    subtopic: 'DuPont 2025 × 2024',
    skill: 'amb-dupont',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'hard',
    cognitiveLevel: 'analysis',
    context: CTX,
    stem: `Decomponha o ROE da Ambev de 2025 pelo DuPont (Margem Líquida × Giro do Ativo × Alavancagem) e compare com 2024 (ML ${p2(ML24)} × Giro ${f2(GIRO24)} × Alavancagem ${f2(ALAV24)} ≈ ${p2(ROE24)}).`,
    tables: [
      dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['= Lucro líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Ambev — Balanço (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    parts: [
      {
        id: 'a',
        kind: 'numeric',
        prompt: 'a) Giro do Ativo 2025 = Receita ÷ Ativo Total (2 casas decimais).',
        correct: 0.61,
        unit: 'times',
        decimals: 2,
        points: 2,
        calc: { fn: 'giro', args: [D25.receitaLiquida, B25.ativoTotal] },
        solution: {
          formula: 'Giro = Receita líquida / Ativo Total',
          substitution: `${fmt(D25.receitaLiquida)} / ${fmt(B25.ativoTotal)}`,
          computation: `= ${f2(GIRO25)}`,
          result: f2(GIRO25),
          unit: 'vezes por ano',
          interpretation: `Cada R$ 1 de ativo gera R$ ${f2(GIRO25)} de receita por ano (2024: ${f2(GIRO24)}). Subiu porque o ativo caiu ${p1(Math.abs(AH_ATIVO))} com receita quase estável.`,
        },
      },
      {
        id: 'b',
        kind: 'numeric',
        prompt: 'b) Alavancagem 2025 = Ativo Total ÷ PL (2 casas decimais).',
        correct: 1.63,
        unit: 'times',
        decimals: 2,
        points: 2,
        calc: { fn: 'alavancagem', args: [B25.ativoTotal, B25.patrimonioLiquido] },
        solution: {
          formula: 'Alavancagem = Ativo Total / Patrimônio Líquido',
          substitution: `${fmt(B25.ativoTotal)} / ${fmt(B25.patrimonioLiquido)}`,
          computation: `= ${f2(ALAV25)}`,
          result: f2(ALAV25),
          unit: 'vezes',
          interpretation: `Cada R$ 1 dos sócios sustenta R$ ${f2(ALAV25)} de ativo (2024: ${f2(ALAV24)}): alavancagem estável e moderada.`,
        },
      },
      {
        id: 'c',
        kind: 'numeric',
        prompt: 'c) ROE 2025 recomposto pelo DuPont a partir das demonstrações: (LL ÷ Receita) × (Receita ÷ Ativo) × (Ativo ÷ PL), em %, 2 casas decimais.',
        correct: 18.01,
        unit: 'percent',
        decimals: 2,
        points: 2,
        calc: { fn: 'dupontDemonstracoes', args: [D25.lucroLiquido, D25.receitaLiquida, B25.ativoTotal, B25.patrimonioLiquido] },
        solution: {
          formula: 'ROE = ML × Giro × Alavancagem',
          substitution: `${p2(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)}`,
          computation: `= ${p2(ROE25)} (com os fatores arredondados: ${f2(18.12 * 0.61 * 1.63)}%)`,
          result: p2(ROE25),
          unit: '% sobre o PL',
          interpretation: `A receita e o ativo se cancelam na multiplicação: sobra LL ÷ PL. O DuPont não muda o ROE — mostra de onde ele vem.`,
        },
      },
      {
        id: 'd',
        kind: 'choice',
        prompt: `d) Comparando 2025 (${p2(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)}) com 2024 (${p2(ML24)} × ${f2(GIRO24)} × ${f2(ALAV24)}), de onde veio a melhora do ROE?`,
        options: [
          {
            id: 'A',
            text: `De margem (${p2(ML24)} → ${p2(ML25)}) e giro (${f2(GIRO24)} → ${f2(GIRO25)}, ativo menor com receita estável); a alavancagem ficou em ${f2(ALAV25)} — não houve mais dívida.`,
          },
          {
            id: 'B',
            text: 'Da alavancagem: a empresa tomou mais dívida para multiplicar o retorno.',
            whyWrong: `Alavancagem ${f2(ALAV24)} → ${f2(ALAV25)}: estável. Empréstimos CP + LP até caíram (${fmt(DIVIDA24)} → ${fmt(DIVIDA25)}).`,
          },
          {
            id: 'C',
            text: `Só da margem: o giro caiu porque a receita caiu ${p2(Math.abs(AH_REC))}.`,
            whyWrong: `O giro SUBIU (${f2(GIRO24)} → ${f2(GIRO25)}): o ativo caiu ${p1(Math.abs(AH_ATIVO))}, muito mais que a receita (${p2(AH_REC)}).`,
          },
          {
            id: 'D',
            text: 'Do giro, que subiu porque a receita cresceu com a mesma estrutura.',
            whyWrong: `A receita CAIU ${p2(Math.abs(AH_REC))}. O giro subiu pelo denominador: ativo ${p1(AH_ATIVO)}.`,
          },
        ],
        correct: 'A',
        points: 4,
      },
    ],
    explanation: `DuPont 2025: ${p2(ML25)} × ${f2(GIRO25)} × ${f2(ALAV25)} = ${p2(ROE25)}; 2024: ${p2(ML24)} × ${f2(GIRO24)} × ${f2(ALAV24)} ≈ ${p2(ROE24)}. Dois fatores melhoraram — margem (+${f2(ML25 - ML24)} p.p., via despesas e IR) e giro (ativo ${p1(AH_ATIVO)} com receita ${p2(AH_REC)}) — e a alavancagem ficou estável. Pela barraca de praia: a Ambev vendeu com mais margem e com um isopor menor, sem pegar mais dinheiro emprestado. A ressalva: o giro subiu porque o ativo encolheu (caixa que saiu), não porque vendeu mais.`,
    reasoningSteps: [
      'Calcule os três fatores de cada ano: ML, Giro, Alavancagem.',
      'Multiplique e confira com LL ÷ PL.',
      'Compare fator a fator: qual mudou?',
      'Explique a mudança de cada fator com as linhas das DFs (despesas, IR, caixa, PL).',
    ],
    commonMistake: 'Atribuir a alta do ROE à alavancagem, ou achar que giro cai sempre que a receita cai (o denominador também muda).',
    rule: 'DuPont separa o ROE em três perguntas: quanto sobra de cada venda, quantas vezes o ativo vende e de quem é o ativo.',
    formula: 'ROE = (LL / Receita) × (Receita / Ativo) × (Ativo / PL)',
    hint: 'O ativo caiu 10,72% e a receita 1,35%: o que acontece com Receita ÷ Ativo?',
    concept: 'O DuPont explica a origem do ROE: margem (eficiência da venda), giro (uso do ativo) e alavancagem (capital de terceiros).',
    sourceReference: SRC_CASO,
  },
  {
    id: 'amb-026',
    type: 'multiple-choice',
    topic: 'giro',
    subtopic: 'Giro: cervejaria × varejo',
    skill: 'amb-giro-setor',
    caseTag: 'ambev',
    dataSource: 'real-ambev',
    difficulty: 'medium',
    cognitiveLevel: 'interpretation',
    context: CTX,
    stem: `Calcule o Giro do Ativo da Ambev em 2025 (2 casas decimais) e escolha a leitura correta, sabendo que a Renner (Aula 4) girou ${f2(RENNER_REF.giro)} com margem líquida de ${p1(RENNER_REF.ml)}.`,
    tables: [
      dreTable('Ambev — DRE (recorte)', [['Receita líquida', 'receitaLiquida'], ['= Lucro líquido do exercício', 'lucroLiquido']], [1]),
      bpTable('Ambev — Balanço (recorte)', [['ATIVO TOTAL', 'ativoTotal'], ['PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido']], [0, 1]),
    ],
    options: [
      {
        id: 'A',
        text: `${f2(GIRO25)}: cada R$ 1 de ativo gera R$ ${f2(GIRO25)} de receita por ano, contra ${f2(RENNER_REF.giro)} na Renner — "o varejo gira mais que a cervejaria", que carrega fábricas, ágio e marcas no ativo; a Ambev compensa com margem líquida de ${p2(ML25)} (Renner ${p1(RENNER_REF.ml)}).`,
      },
      {
        id: 'B',
        text: `${f2(ALAV25)}: cada R$ 1 investido no ativo gera R$ ${f2(ALAV25)} de receita.`,
        whyWrong: `${f2(ALAV25)} é a Alavancagem (Ativo ÷ PL), não o giro. O giro é Receita ÷ Ativo.`,
      },
      {
        id: 'C',
        text: `${f2(GIRO25)}: como gira menos que a Renner (${f2(RENNER_REF.giro)}), a Ambev é uma empresa pior que a varejista.`,
        whyWrong: 'Giro depende do setor: indústria com ativos pesados gira menos e precisa de margem maior. O julgamento se faz com margem × giro (e o ROE), não com um fator isolado.',
      },
      {
        id: 'D',
        text: `${f2(GIRO24)}: cada R$ 1 de ativo gerou R$ ${f2(GIRO24)} de receita em 2025.`,
        whyWrong: `${f2(GIRO24)} é o giro de 2024 (${fmt(D24.receitaLiquida)} ÷ ${fmt(B24.ativoTotal)}). Em 2025 o ativo menor elevou o giro.`,
      },
      {
        id: 'E',
        text: `0,18: giro = Lucro Líquido ÷ Receita.`,
        whyWrong: `LL ÷ Receita é a Margem Líquida (${p2(ML25)} = 0,18). Giro é Receita ÷ Ativo Total.`,
      },
    ],
    correct: 'A',
    calc: { fn: 'giro', args: [D25.receitaLiquida, B25.ativoTotal] },
    solution: {
      formula: 'Giro = Receita líquida / Ativo Total',
      substitution: `Giro 2025 = ${fmt(D25.receitaLiquida)} / ${fmt(B25.ativoTotal)}`,
      computation: `= ${f2(GIRO25)}`,
      result: f2(GIRO25),
      unit: 'vezes por ano',
      interpretation: `A Ambev precisa de R$ 1,64 de ativo para gerar R$ 1 de receita; a Renner, R$ 1,24. Margem × giro: Ambev ${p2(ML25)} × ${f2(GIRO25)} ≈ ${f1(ML25 * GIRO25)}% sobre o ativo; Renner ${p1(RENNER_REF.ml)} × ${f2(RENNER_REF.giro)} ≈ ${f1(RENNER_REF.ml * RENNER_REF.giro)}%.`,
    },
    explanation: `Giro = ${fmt(D25.receitaLiquida)} ÷ ${fmt(B25.ativoTotal)} = ${f2(GIRO25)}. A frase da Aula 5 — "o varejo gira mais que a cervejaria" — se confirma: Renner ${f2(RENNER_REF.giro)}, Ambev ${f2(GIRO25)}. A diferença está no ativo: a Ambev carrega ${p1(AV_AGIO_INT25)} de ágio e marcas e ${p1(AV_IMOB25)} de fábricas; a varejista tem ativos mais leves. Giro baixo exige margem alta — e a Ambev tem (${p2(ML25)} contra ${p1(RENNER_REF.ml)}). São dois jeitos de encher o mesmo bolso.`,
    reasoningSteps: [
      'Calcule Receita ÷ Ativo Total.',
      'Compare com uma empresa de outro setor: por que gira diferente?',
      'Olhe a A.V. do ativo: ativos pesados (fábricas, ágio) reduzem o giro.',
      'Multiplique margem × giro para comparar o retorno sobre o ativo.',
    ],
    commonMistake: 'Julgar o giro isoladamente ("gira menos = pior") ou confundir giro com alavancagem.',
    rule: 'Giro se compara dentro do setor; entre setores, leia margem × giro.',
    formula: 'Giro = Receita líquida / Ativo Total',
    hint: 'Quantos R$ de venda cada R$ 1 de ativo gera por ano?',
    concept: 'Giro alto: varejo e supermercado; giro baixo: indústria pesada, energia, concessões — que precisam de margem maior.',
    sourceReference: SRC_CASO,
  },
