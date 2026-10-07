// DADOS REAIS — Ambev S.A., demonstrações consolidadas 31/12/2025 × 31/12/2024.
// FONTE PRINCIPAL: planilha da disciplina "Planilha_Ambev.xlsx" (abas Ativo, Passivo e DRE),
// anexo do "Caso Ambev — Exercício de Análise das DFs" (Divulgação de Resultados 4T25, ri.ambev.com.br).
// Valores em R$ MILHÕES, exatamente como na planilha (arredondados; subtotais podem diferir em ±1).
// A estrutura de linhas e os nomes seguem a planilha do professor:
//   • Ágio aparece separado do Intangível;
//   • "Lucro operacional" NÃO inclui a "Participação em coligadas" (equivalência), que vem depois do
//     resultado financeiro;
//   • A.V. = conta ÷ Ativo total (ou ÷ Passivo total + PL, ou ÷ Receita líquida);
//   • A.H. = |atual| ÷ |anterior| − 1 (fórmula da planilha: ABS(B)/ABS(D)-1).
// Conferência cruzada com a DFP oficial (CVM): totais, LL, PL e Ativo coincidem (em R$ mil ÷ 1.000).

export const AMBEV_SOURCE =
  'REAL — Ambev S.A., DFs consolidadas 2025 × 2024 (planilha da disciplina; Divulgação de Resultados 4T25). Valores em R$ milhões.';

export const AMBEV = {
  bp: {
    2025: {
      ativoTotal: 145087,
      ativoCirculante: 43876,
      caixa: 18638,
      aplicacoesFinanceiras: 1682,
      contasReceber: 6352,
      estoques: 10520,
      tributosRecuperar: 3623,
      derivativosOutrosAC: 3061,
      ativoNaoCirculante: 101212,
      rlp: 20500,
      investimentos: 486,
      imobilizado: 27644,
      intangivel: 11043,
      agio: 41538,
      passivoCirculante: 45599,
      fornecedores: 23743,
      emprestimosCP: 1167,
      dividendosJcp: 4928,
      impostosRecolher: 7440,
      salariosEncargos: 2201,
      derivativosProvisoesOutrosPC: 6120,
      passivoNaoCirculante: 10713,
      emprestimosLP: 2220,
      irDiferido: 3912,
      demaisObrigacoesLP: 4581,
      patrimonioLiquido: 88775,
      capitalSocial: 58275,
      reservas: 108003,
      ajustesAvaliacao: -78365,
      naoControladores: 861,
    },
    2024: {
      ativoTotal: 162508,
      ativoCirculante: 54156,
      caixa: 28596,
      aplicacoesFinanceiras: 1242,
      contasReceber: 6270,
      estoques: 11690,
      tributosRecuperar: 3582,
      derivativosOutrosAC: 2776,
      ativoNaoCirculante: 108352,
      rlp: 20913,
      investimentos: 395,
      imobilizado: 30170,
      intangivel: 12531,
      agio: 44343,
      passivoCirculante: 49389,
      fornecedores: 25224,
      emprestimosCP: 1276,
      dividendosJcp: 8487,
      impostosRecolher: 7590,
      salariosEncargos: 2780,
      derivativosProvisoesOutrosPC: 4032,
      passivoNaoCirculante: 13539,
      emprestimosLP: 2176,
      irDiferido: 5008,
      demaisObrigacoesLP: 6355,
      patrimonioLiquido: 99581,
      capitalSocial: 58226,
      reservas: 108973,
      ajustesAvaliacao: -68557,
      naoControladores: 938,
    },
  },
  dre: {
    2025: {
      receitaLiquida: 88242,
      custoVendas: -42864,
      lucroBruto: 45378,
      despesasLogisticas: -10929,
      despesasComerciais: -8348,
      despesasAdministrativas: -5863,
      outrasReceitasDespesasOperacionais: 2436,
      itensNaoUsuais: 643,
      lucroOperacional: 23318,
      resultadoFinanceiro: -4002,
      participacaoColigadas: 106,
      lair: 19422,
      irCs: -3433,
      lucroLiquido: 15988,
    },
    2024: {
      receitaLiquida: 89453,
      custoVendas: -43615,
      lucroBruto: 45838,
      despesasLogisticas: -11557,
      despesasComerciais: -8634,
      despesasAdministrativas: -6201,
      outrasReceitasDespesasOperacionais: 2457,
      itensNaoUsuais: -101,
      lucroOperacional: 21802,
      resultadoFinanceiro: -2318,
      participacaoColigadas: 4,
      lair: 19487,
      irCs: -4640,
      lucroLiquido: 14847,
    },
  },
} as const;

export type AmbevYear = 2024 | 2025;

const fmt = (v: number) => v.toLocaleString('pt-BR');
const av = (v: number, base: number) => `${((v / base) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const ah = (a: number, b: number) => (b === 0 ? '—' : `${((Math.abs(a) / Math.abs(b) - 1) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`);

/** Tabela no formato do anexo da disciplina: valor, A.V., valor anterior, A.V. anterior, A.H. */
function annexTable<K extends string>(
  caption: string,
  a: Readonly<Record<K, number>>,
  b: Readonly<Record<K, number>>,
  baseKey: K,
  rows: [string, K][],
  totalLabels: string[],
) {
  const data = rows.map(([label, k]) => [label, fmt(a[k]), av(a[k], a[baseKey]), fmt(b[k]), av(b[k], b[baseKey]), ah(a[k], b[k])]);
  return {
    caption,
    note: 'Valores em R$ milhões. A.V. = conta ÷ total; A.H. = |2025| ÷ |2024| − 1. ' + AMBEV_SOURCE,
    headers: ['Conta', '31/12/2025', 'A.V.% 25', '31/12/2024', 'A.V.% 24', 'A.H.%'],
    rows: data,
    totalRows: rows.map(([label], i) => (totalLabels.includes(label) ? i : -1)).filter((i) => i >= 0),
  };
}

export function ambevAssetTable() {
  return annexTable(
    'Ambev S.A. — ATIVO (consolidado)',
    AMBEV.bp[2025],
    AMBEV.bp[2024],
    'ativoTotal',
    [
      ['ATIVO TOTAL', 'ativoTotal'],
      ['ATIVO CIRCULANTE', 'ativoCirculante'],
      ['  Caixa e equivalentes de caixa', 'caixa'],
      ['  Aplicações financeiras', 'aplicacoesFinanceiras'],
      ['  Contas a receber', 'contasReceber'],
      ['  Estoques', 'estoques'],
      ['  Tributos a recuperar', 'tributosRecuperar'],
      ['  Derivativos, mantidos p/ venda e outros', 'derivativosOutrosAC'],
      ['ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'],
      ['  Realizável a longo prazo (tributos, IR diferido)', 'rlp'],
      ['  Investimentos', 'investimentos'],
      ['  Imobilizado', 'imobilizado'],
      ['  Intangível', 'intangivel'],
      ['  Ágio', 'agio'],
    ],
    ['ATIVO TOTAL', 'ATIVO CIRCULANTE', 'ATIVO NÃO CIRCULANTE'],
  );
}

export function ambevLiabilityTable() {
  return annexTable(
    'Ambev S.A. — PASSIVO E PL (consolidado)',
    AMBEV.bp[2025],
    AMBEV.bp[2024],
    'ativoTotal',
    [
      ['PASSIVO TOTAL + PL', 'ativoTotal'],
      ['PASSIVO CIRCULANTE', 'passivoCirculante'],
      ['  Fornecedores (contas a pagar)', 'fornecedores'],
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
      ['  Capital social', 'capitalSocial'],
      ['  Reservas', 'reservas'],
      ['  Ajustes de avaliação patrimonial', 'ajustesAvaliacao'],
      ['  Participação de não controladores', 'naoControladores'],
    ],
    ['PASSIVO TOTAL + PL', 'PASSIVO CIRCULANTE', 'PASSIVO NÃO CIRCULANTE', 'PATRIMÔNIO LÍQUIDO'],
  );
}

export function ambevIncomeTable() {
  return annexTable(
    'Ambev S.A. — DRE (consolidado) 2025 × 2024',
    AMBEV.dre[2025],
    AMBEV.dre[2024],
    'receitaLiquida',
    [
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
    ],
    ['Receita líquida', '= Lucro bruto', '= Lucro operacional', '= Lucro antes do IR/CS', '= Lucro líquido do exercício'],
  );
}

/** As três tabelas do anexo "DFs Ambev 2025 × 2024". */
export function ambevAnnex() {
  return [ambevAssetTable(), ambevLiabilityTable(), ambevIncomeTable()];
}

/** Compatibilidade: BP em uma tabela só (Ativo seguido de Passivo + PL). */
export function ambevBalanceTable() {
  const a = ambevAssetTable();
  const p = ambevLiabilityTable();
  return {
    caption: 'Ambev S.A. — Balanço Patrimonial consolidado 31/12/2025 × 31/12/2024',
    note: a.note,
    headers: a.headers,
    rows: [...a.rows, ...p.rows],
    totalRows: [...a.totalRows, ...p.totalRows.map((i) => i + a.rows.length)],
  };
}
