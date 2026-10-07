const CARDS: { title: string; lines: string[]; note?: string }[] = [
  { title: 'Demonstrações', lines: ['BP = fotografia (posição numa data)', 'DRE = filme do resultado (competência)', 'DFC = filme do caixa (caixa)'] },
  { title: 'Balanço Patrimonial', lines: ['Ativo = Passivo + PL', 'Ativo: bens e direitos', 'Passivo: obrigações com terceiros', 'PL: riqueza residual dos proprietários'] },
  {
    title: 'Circulante × Não Circulante',
    lines: ['Circulante: até 12 meses', 'ANC: RLP, Investimentos, Imobilizado, Intangível', 'Liquidez = velocidade de virar caixa (Ativo)', 'Exigibilidade = prazo de pagamento (Passivo)'],
  },
  { title: 'Patrimônio Líquido', lines: ['Capital Social, Reservas, Lucros/Prejuízos', 'Muda por: aportes dos sócios e resultado', 'PL não é dinheiro em caixa'] },
  {
    title: 'Débito e crédito',
    lines: ['Ativo: aumenta D · diminui C', 'Passivo: aumenta C · diminui D', 'PL: aumenta C · diminui D', 'Σ Débitos = Σ Créditos'],
    note: 'Nunca pense em "entrou/saiu dinheiro": identifique a natureza da conta e se ela aumentou ou diminuiu.',
  },
  { title: 'Ciclo contábil', lines: ['Fato → Lançamento → Razão → Saldo → Balancete → Demonstrações'], note: 'Balancete fechado não garante ausência de erro de classificação.' },
  {
    title: 'DRE',
    lines: ['Receita Líquida', '(−) Custo das Vendas = Lucro Bruto', '(−) Despesas Operacionais = Lucro Operacional', '(±) Resultado Financeiro = LAIR', '(−) IR/CS = Lucro Líquido'],
  },
  { title: 'Custo × Despesa', lines: ['Custo: ligado diretamente ao produto vendido', 'Despesa: estrutura para operar/vender'], note: 'Pergunta: "Esse gasto gruda diretamente no produto?"' },
  { title: 'Competência × Caixa', lines: ['DRE: competência (quando ocorre)', 'DFC: caixa (quando paga/recebe)', 'LUCRO NÃO É CAIXA'], note: 'Venda a prazo entra na receita hoje; salário de setembro é despesa de setembro.' },
  { title: 'Análise Vertical', lines: ['A.V. = Conta / Base × 100', 'Base: Ativo Total, Passivo + PL ou Receita Líquida'], note: '"Quanto essa conta representa na estrutura?"' },
  { title: 'Análise Horizontal', lines: ['A.H. = (Atual − Anterior) / Anterior × 100'], note: '"Quanto cresceu ou caiu?" Atenção ao sinal.' },
  { title: 'Margens', lines: ['MB = Lucro Bruto / Receita Líquida', 'MO = Lucro Operacional / Receita Líquida', 'ML = Lucro Líquido / Receita Líquida'], note: 'ML de 12%: a cada R$ 100 de receita, R$ 12 viram lucro líquido.' },
  { title: 'Liquidez Corrente', lines: ['LC = AC / PC', '> 1 folga · = 1 limite · < 1 atenção'], note: 'Nunca isoladamente: caixa, recebíveis, estoques, negócio, giro, composição do PC.' },
  { title: 'ROE', lines: ['ROE = Lucro Líquido / PL'], note: 'Compare com o período anterior, pares e custo de capital.' },
  { title: 'Giro do Ativo', lines: ['Giro = Receita / Ativo Total'], note: 'Alto no varejo; baixo em negócios intensivos em capital.' },
  { title: 'Alavancagem', lines: ['Alavancagem = Ativo Total / PL'], note: 'Amplia o retorno e também o risco e o prejuízo.' },
  { title: 'DuPont', lines: ['ROE = Margem Líquida × Giro × Alavancagem', '(LL/Receita) × (Receita/Ativo) × (Ativo/PL)'], note: 'Pergunte sempre: de onde veio o ROE?' },
  { title: 'Resultado Financeiro', lines: ['Receitas financeiras − Despesas financeiras'], note: 'O lucro veio da operação ou foi ajudado/prejudicado pelo financeiro?' },
  { title: 'Ponto de equilíbrio', lines: ['MC unitária = Preço − Custo variável', 'PE = Gastos Fixos / MC unitária'], note: 'Água: P 2, CV 1, Fixos 1.000 → PE 1.000 un.' },
  { title: 'Equivalência Patrimonial', lines: ['Resultado = Lucro da investida × % de participação'], note: 'Afeta o resultado da investidora, mas não é receita de vendas.' },
];

const TRAPS = [
  'Capital Social é PL, não Ativo.',
  'Dinheiro entrar não significa crédito; Caixa aumenta a débito.',
  'Saldo devedor não é dívida (Caixa tem saldo devedor).',
  'Compra de prédio é Ativo Imobilizado, não despesa.',
  'Pagar fornecedor não cria nova despesa.',
  'Venda a prazo é receita no mês da venda.',
  'A.V. ≠ A.H.: estrutura × evolução.',
  'Margem divide pela Receita Líquida, não pelo Ativo.',
  'LC usa Passivo Circulante, não Passivo Total.',
  'ROE divide pelo PL; Giro divide pelo Ativo.',
  'LC < 1 não significa falência.',
  'ROE alto por alavancagem não é eficiência operacional.',
  '0,18 = 18%, e não 0,18%.',
];

export function Express() {
  return (
    <div className="page">
      <p className="eyebrow">Revisão expressa</p>
      <h1>Tudo da P1 em uma página</h1>
      <div className="row no-print">
        <button className="btn btn-ghost small" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      <div className="express-grid">
        {CARDS.map((c) => (
          <section key={c.title} className="xcard">
            <h2>{c.title}</h2>
            {c.lines.map((l) => (
              <p key={l} className="formula">
                {l}
              </p>
            ))}
            {c.note && <p className="xnote">{c.note}</p>}
          </section>
        ))}
      </div>
      <section className="card mt">
        <h2>Pegadinhas mais cobradas</h2>
        <ul className="traps">
          {TRAPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
