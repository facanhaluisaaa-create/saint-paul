// Casos disponíveis no modo "Roteiro da prova" (12 perguntas em 3 partes, com consulta ao anexo das DFs).
// O id corresponde ao `caseTag` / `roteiro.case` das questões do banco.

export interface CaseInfo {
  id: string;
  label: string;
  company: string;
  sector: string;
  source: 'real' | 'ficticio';
  description: string;
}

export const CASES: CaseInfo[] = [
  {
    id: 'ambev',
    label: 'Caso Ambev (real)',
    company: 'Ambev S.A.',
    sector: 'bebidas',
    source: 'real',
    description: 'O caso trabalhado em sala na Aula 5: DFs consolidadas 2025 × 2024 da planilha da disciplina. As 12 perguntas originais.',
  },
  {
    id: 'renner',
    label: 'Caso Renner (real)',
    company: 'Lojas Renner S.A.',
    sector: 'varejo de moda',
    source: 'real',
    description: 'A empresa do caso real da Aula 4 (DRE, Ativo e Passivo 2025 × 2024), agora com o roteiro completo em 3 partes.',
  },
  {
    id: 'rot-varejo',
    label: 'Caso fictício — varejo',
    company: 'empresa fictícia de varejo',
    sector: 'varejo',
    source: 'ficticio',
    description: 'Empresa que você nunca viu: margem fina, giro alto, financiada por fornecedores e cartões. Treina o roteiro sem decorar respostas.',
  },
  {
    id: 'rot-industria',
    label: 'Caso fictício — indústria',
    company: 'empresa fictícia industrial',
    sector: 'bens de capital',
    source: 'ficticio',
    description: 'Indústria intensiva em ativos: margem alta, giro baixo, dívida bancária de longo prazo e margem em queda.',
  },
];

export const ROTEIRO_PARTS: Record<1 | 2 | 3, { title: string; subtitle: string }> = {
  1: { title: 'Parte 1 — Decisões de investimento e financiamento (Balanço)', subtitle: 'A.V. e A.H. do ativo e do passivo · estrutura de capital · maior financiador · prazos e liquidez' },
  2: { title: 'Parte 2 — Resultados (DRE)', subtitle: 'A.V. e A.H. da DRE · margens bruta, operacional e líquida · ROE e a satisfação do acionista' },
  3: { title: 'Parte 3 — Estratégia', subtitle: 'custo × diferenciação · riscos do negócio · ações concretas ligadas às linhas das DFs' },
};
