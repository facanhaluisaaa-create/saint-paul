// DADOS REAIS — Ambev S.A., Demonstrações Financeiras Padronizadas (DFP) consolidadas,
// exercício 2025 (com comparativo 2024). Fonte: Portal de Dados Abertos da CVM,
// dfp_cia_aberta_2025.zip (CNPJ 07.526.557/0001-00). Valores em R$ mil.
// Se a planilha XLSX da disciplina divergir destes números, a planilha prevalece:
// substitua os valores abaixo e rode `npm run validate`.

export const AMBEV_SOURCE =
  'REAL — Ambev S.A., DFP consolidada 2025 × 2024 (CVM, dados abertos).';

export const AMBEV = {
  bp: {
    2025: {
      ativoTotal: 145087151,
      ativoCirculante: 43875596,
      caixa: 18638228,
      aplicacoesFinanceiras: 1681692,
      contasReceber: 6351608,
      estoques: 10520090,
      tributosRecuperar: 3623379,
      despesasAntecipadas: 714539,
      outrosAC: 2346060,
      ativoNaoCirculante: 101211555,
      rlp: 20500355,
      investimentos: 485792,
      imobilizado: 27644317,
      intangivel: 52581091,
      passivoCirculante: 45599307,
      obrigacoesTrabalhistas: 2200729,
      fornecedores: 22596092,
      obrigacoesFiscais: 7440459,
      emprestimosCP: 1167325,
      outrasObrigacoesCP: 11623337,
      provisoesCP: 571365,
      passivoNaoCirculante: 10713063,
      emprestimosLP: 2219599,
      outrasObrigacoesLP: 3703504,
      tributosDiferidos: 3912270,
      provisoesLP: 877690,
      patrimonioLiquido: 88774781,
      capitalSocial: 58275079,
      reservasCapital: 53781385,
      reservasLucros: 54222078,
      ajustesAvaliacao: -78364503,
      naoControladores: 860742,
    },
    2024: {
      ativoTotal: 162507949,
      ativoCirculante: 54155784,
      caixa: 28595666,
      aplicacoesFinanceiras: 1242001,
      contasReceber: 6269863,
      estoques: 11689767,
      tributosRecuperar: 3582275,
      despesasAntecipadas: 706041,
      outrosAC: 2070171,
      ativoNaoCirculante: 108352165,
      rlp: 20913198,
      investimentos: 395393,
      imobilizado: 30170194,
      intangivel: 56873380,
      passivoCirculante: 49388714,
      obrigacoesTrabalhistas: 2779753,
      fornecedores: 24042927,
      obrigacoesFiscais: 7589939,
      emprestimosCP: 1276391,
      outrasObrigacoesCP: 13258793,
      provisoesCP: 440911,
      passivoNaoCirculante: 13538721,
      emprestimosLP: 2176337,
      outrasObrigacoesLP: 5683769,
      tributosDiferidos: 5007711,
      provisoesLP: 670904,
      patrimonioLiquido: 99580514,
      capitalSocial: 58226036,
      reservasCapital: 55336410,
      reservasLucros: 53637019,
      ajustesAvaliacao: -68557326,
      naoControladores: 938375,
    },
  },
  dre: {
    2025: {
      receitaLiquida: 88242467,
      custoVendas: -42864127,
      lucroBruto: 45378340,
      despesasVendas: -19276988,
      despesasLogisticas: -10928913,
      despesasComerciais: -8348075,
      despesasAdministrativas: -5862917,
      outrasReceitasOperacionais: 2986148,
      outrasDespesasOperacionais: 93018,
      equivalenciaPatrimonial: 105785,
      lucroOperacional: 23423386,
      resultadoFinanceiro: -4001728,
      receitasFinanceiras: 2216616,
      despesasFinanceiras: -6218344,
      lair: 19421658,
      irCs: -3433225,
      lucroLiquido: 15988433,
    },
    2024: {
      receitaLiquida: 89452669,
      custoVendas: -43615080,
      lucroBruto: 45837589,
      despesasVendas: -20191324,
      despesasLogisticas: -11557161,
      despesasComerciais: -8634163,
      despesasAdministrativas: -6201074,
      outrasReceitasOperacionais: 2800226,
      outrasDespesasOperacionais: -443759,
      equivalenciaPatrimonial: 3918,
      lucroOperacional: 21805576,
      resultadoFinanceiro: -2318249,
      receitasFinanceiras: 2423704,
      despesasFinanceiras: -4741953,
      lair: 19487327,
      irCs: -4640375,
      lucroLiquido: 14846952,
    },
  },
} as const;

export type AmbevYear = 2024 | 2025;

const fmt = (v: number) => v.toLocaleString('pt-BR');

/** Tabelas prontas para exibir nas questões e no painel "Ver DFs da Ambev". */
export function ambevBalanceTable() {
  const a = AMBEV.bp[2025];
  const b = AMBEV.bp[2024];
  const row = (label: string, k: keyof typeof a) => [label, fmt(a[k]), fmt(b[k])];
  return {
    caption: 'Ambev S.A. — Balanço Patrimonial Consolidado',
    note: 'Valores em R$ mil. ' + AMBEV_SOURCE,
    headers: ['Conta', '31/12/2025', '31/12/2024'],
    rows: [
      row('ATIVO CIRCULANTE', 'ativoCirculante'),
      row('  Caixa e equivalentes de caixa', 'caixa'),
      row('  Aplicações financeiras', 'aplicacoesFinanceiras'),
      row('  Contas a receber', 'contasReceber'),
      row('  Estoques', 'estoques'),
      row('  Tributos a recuperar', 'tributosRecuperar'),
      row('  Despesas antecipadas', 'despesasAntecipadas'),
      row('  Outros ativos circulantes', 'outrosAC'),
      row('ATIVO NÃO CIRCULANTE', 'ativoNaoCirculante'),
      row('  Realizável a Longo Prazo', 'rlp'),
      row('  Investimentos', 'investimentos'),
      row('  Imobilizado', 'imobilizado'),
      row('  Intangível', 'intangivel'),
      row('ATIVO TOTAL', 'ativoTotal'),
      row('PASSIVO CIRCULANTE', 'passivoCirculante'),
      row('  Obrigações sociais e trabalhistas', 'obrigacoesTrabalhistas'),
      row('  Fornecedores', 'fornecedores'),
      row('  Obrigações fiscais', 'obrigacoesFiscais'),
      row('  Empréstimos e financiamentos', 'emprestimosCP'),
      row('  Outras obrigações', 'outrasObrigacoesCP'),
      row('  Provisões', 'provisoesCP'),
      row('PASSIVO NÃO CIRCULANTE', 'passivoNaoCirculante'),
      row('  Empréstimos e financiamentos', 'emprestimosLP'),
      row('  Outras obrigações', 'outrasObrigacoesLP'),
      row('  Tributos diferidos', 'tributosDiferidos'),
      row('  Provisões', 'provisoesLP'),
      row('PATRIMÔNIO LÍQUIDO', 'patrimonioLiquido'),
      row('  Capital social realizado', 'capitalSocial'),
      row('  Reservas de capital', 'reservasCapital'),
      row('  Reservas de lucros', 'reservasLucros'),
      row('  Ajustes de avaliação patrimonial', 'ajustesAvaliacao'),
      row('  Participação de não controladores', 'naoControladores'),
    ],
    totalRows: [0, 8, 13, 14, 21, 26],
  };
}

export function ambevIncomeTable() {
  const a = AMBEV.dre[2025];
  const b = AMBEV.dre[2024];
  const row = (label: string, k: keyof typeof a) => [label, fmt(a[k]), fmt(b[k])];
  return {
    caption: 'Ambev S.A. — Demonstração do Resultado Consolidada',
    note:
      'Valores em R$ mil. "Lucro Operacional" corresponde à linha "Resultado antes do resultado financeiro e dos tributos" da DFP (inclui equivalência patrimonial). ' +
      AMBEV_SOURCE,
    headers: ['Linha', '2025', '2024'],
    rows: [
      row('Receita Líquida', 'receitaLiquida'),
      row('(−) Custo das vendas', 'custoVendas'),
      row('= Lucro Bruto', 'lucroBruto'),
      row('(−) Despesas com vendas (logísticas + comerciais)', 'despesasVendas'),
      row('(−) Despesas gerais e administrativas', 'despesasAdministrativas'),
      row('(+) Outras receitas operacionais', 'outrasReceitasOperacionais'),
      row('(+/−) Outras despesas operacionais', 'outrasDespesasOperacionais'),
      row('(+) Equivalência patrimonial', 'equivalenciaPatrimonial'),
      row('= Lucro Operacional', 'lucroOperacional'),
      row('  Receitas financeiras', 'receitasFinanceiras'),
      row('  Despesas financeiras', 'despesasFinanceiras'),
      row('(+/−) Resultado Financeiro', 'resultadoFinanceiro'),
      row('= Lucro antes do IR/CS', 'lair'),
      row('(−) IR/CS', 'irCs'),
      row('= Lucro Líquido', 'lucroLiquido'),
    ],
    totalRows: [0, 2, 8, 12, 14],
  };
}
