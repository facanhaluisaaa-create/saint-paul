const CARDS: { title: string; lines: string[]; note?: string }[] = [
  {
    title: 'As três demonstrações',
    lines: ['BP = a fotografia do patrimônio (Ativo = Passivo + PL)', 'DRE = o filme do resultado (Receitas − Custos − Despesas)', 'DFC = o filme do caixa (saldo inicial + entradas − saídas; FCO, FCI, FCF)'],
    note: 'Finalidades: planejamento (olhar para a frente) · controle (acompanhar a execução) · decisão (escolher com clareza — o coração da disciplina).',
  },
  {
    title: 'Bens, direitos e obrigações',
    lines: ['Bens: satisfazem uma necessidade e têm avaliação econômica (tangíveis e intangíveis)', 'Direitos: domínio nosso, posse de terceiros (contas, duplicatas e títulos a receber)', 'Obrigações: posse nossa, domínio de terceiros (contas a pagar, fornecedores, salários, impostos)'],
    note: 'Ativo = bens + direitos (lado esquerdo). Passivo = obrigações (lado direito). PL = Ativo − Passivo.',
  },
  {
    title: 'Grupos do Balanço',
    lines: ['Ativo ordenado por liquidez: AC (até 12 meses) · ANC: Realizável a LP, Investimentos, Imobilizado, Intangível', 'Passivo ordenado por exigibilidade: PC (até 12 meses) · PNC (Exigível a LP)', 'PL: Capital, Reservas, Ajustes de Avaliação Patrimonial, Lucros/Prejuízos Acumulados'],
    note: 'Investimentos = participações em outras empresas e imóveis não usados na operação. Intangível = marcas, patentes, softwares e ágio. "Quem financia — terceiros ou sócios? Em qual prazo?"',
  },
  {
    title: 'Os 5 estados patrimoniais',
    lines: ['Ativo > Passivo: PL positivo (riqueza própria)', 'Passivo = 0: Ativo = PL', 'Ativo = Passivo: PL = 0 (fronteira)', 'Passivo > Ativo: passivo a descoberto, PL negativo', 'Ativo = 0: PL = −Passivo (limite teórico)'],
  },
  {
    title: 'Débito e crédito',
    lines: ['Débito = lado esquerdo · Crédito = lado direito', 'Ativo: aumenta a débito, diminui a crédito (saldo devedor)', 'Passivo e PL: aumentam a crédito, diminuem a débito (saldo credor)', 'Σ débitos = Σ créditos — "não há débito(s) sem crédito(s) correspondente(s)"'],
    note: '"A natureza da conta é que determina o lado para os aumentos e o lado para as diminuições." Nunca pense em entrada/saída de dinheiro.',
  },
  {
    title: 'Ciclo e balancete',
    lines: ['Fato → lançamento → razão → saldo → balancete de verificação → balanço'],
    note: 'Saldos devedores = saldos credores no balancete, mas isso não garante classificação correta.',
  },
  {
    title: 'Variações do PL',
    lines: ['Aportes de capital (inicial e posteriores)', 'Resultado: receitas − despesas', 'Receita = entrada de elementos para o ativo (dinheiro ou direitos) → aumenta o PL', 'Despesa = consumo que diminui o ativo ou aumenta o passivo → diminui o PL'],
  },
  {
    title: 'DRE — os degraus do resultado',
    lines: ['Receita líquida', '(−) CMV/CPV = LUCRO BRUTO → o produto é rentável?', '(−) Despesas operacionais = LUCRO OPERACIONAL → a operação para em pé?', '(±) Resultado financeiro = LUCRO ANTES DO IR/CS', '(−) IR e CS = LUCRO LÍQUIDO → sobra para o sócio?'],
    note: 'Cada "=" é um lucro diferente. A DRE se lê "sem precisar de débito e crédito".',
  },
  {
    title: 'Custo × Despesa',
    lines: ['Custo: gasto ligado diretamente ao produto ou serviço vendido (farinha, tecido, costureira, embalagem, energia das máquinas)', 'Despesa: manter a estrutura e vender — "não gruda no produto" (vendedores, marketing, aluguel do escritório, contador, frete de entrega)'],
  },
  {
    title: 'Competência × Caixa',
    lines: ['O que manda é o fato gerador, não o dinheiro', 'Venda hoje para receber em 60 dias → receita de hoje', 'Salário de setembro pago em outubro → despesa de setembro', 'Aluguel/seguro anual antecipado → entra mês a mês', 'Adiantamento de cliente → receita só na entrega'],
    note: 'LUCRO NÃO É CAIXA. Empresa lucrativa pode ficar sem dinheiro — por isso existe a DFC.',
  },
  {
    title: 'Análise Vertical',
    lines: ['A.V. = conta ÷ base × 100', 'Base: Ativo total · Passivo total + PL · Receita líquida'],
    note: 'Onde cada R$ 100 de receita é consumido — e quanto sobra em cada degrau. Onde a empresa investe e quem a financia.',
  },
  {
    title: 'Análise Horizontal',
    lines: ['A.H. = |atual| ÷ |anterior| − 1', 'Para valores positivos = (atual − anterior) ÷ anterior', 'Se o sinal mudou: n.m. (não significativo)'],
    note: 'O que cresce mais rápido: receita, custo ou despesa — a origem da melhora ou piora do lucro. CPV −43.615 → −42.864 = −1,72% (caiu).',
  },
  {
    title: 'Margens',
    lines: ['MB = Lucro Bruto ÷ Receita', 'MO = Lucro Operacional ÷ Receita', 'ML = Lucro Líquido ÷ Receita'],
    note: 'Regra de leitura: margem melhora quando a linha de baixo cresce mais devagar que a receita. "De cada R$ 100 vendidos, R$ 9,20 chegam ao acionista" (Renner).',
  },
  {
    title: 'Liquidez Corrente',
    lines: ['LC = Ativo Circulante ÷ Passivo Circulante', 'Acima de 1 = folga · igual a 1 = no limite · abaixo de 1 = atenção'],
    note: 'Nunca leia o número sozinho: caixa e recebíveis valem mais que estoque; dividendo declarado incha o PC sem ser dívida nova; giro rápido convive bem com índice < 1. Variações: liquidez seca (sem estoques) e imediata (só disponível).',
  },
  {
    title: 'ROE — a ponte entre BP e DRE',
    lines: ['ROE = Lucro Líquido (DRE) ÷ Patrimônio Líquido (Balanço)'],
    note: '"Para cada R$ 1 que deixei na empresa, quanto voltou neste ano?" Julgue por comparação: ano anterior, pares (Ambev 18%, Itaú 24%, Renner 13,9%), custo de capital.',
  },
  {
    title: 'DuPont — três caminhos do retorno',
    lines: ['ROE = Margem Líquida × Giro do Ativo × Alavancagem', '(LL ÷ Receita) × (Receita ÷ Ativo) × (Ativo ÷ PL)', 'Margem × Giro = retorno sobre o ATIVO; a alavancagem diz de quem é esse ativo'],
    note: 'Barraca de praia: margem (caipirinha × água), giro (o mesmo isopor usado 5×), alavancagem (R$ 1.000 seus + R$ 2.000 a 10%: 30% → 70%; se chover, triplica o prejuízo).',
  },
  {
    title: 'Giro e Alavancagem',
    lines: ['Giro = Receita ÷ Ativo total — alto no varejo, baixo em indústria pesada, energia e concessões', 'Alavancagem = Ativo total ÷ PL — 1,0 = 100% capital próprio; bancos ~10×'],
    note: 'Melhorar o giro: vender mais com a mesma estrutura, enxugar estoques e recebíveis, desmobilizar ativo ocioso. Alavancagem amplia o ROE quando a operação rende mais do que custa o dinheiro de terceiros — e amplia o prejuízo quando rende menos.',
  },
  {
    title: 'O roteiro da prova (3 partes)',
    lines: ['1. Balanço: A.V. e A.H. do ativo e do passivo · estrutura de capital · maior financiador · prazos e liquidez', '2. DRE: A.V. e A.H. · margens bruta, operacional e líquida · ROE e a satisfação do acionista', '3. Estratégia: custo × diferenciação · riscos · ações concretas ligadas às linhas das DFs'],
    note: 'Com consulta ao anexo. Na prova, resposta sem número vale no máximo metade.',
  },
];

const TRAPS = [
  'Capital Social é PL, não Ativo.',
  'Dinheiro entrar não significa crédito: Caixa aumenta a débito.',
  'Saldo devedor não é dívida — Caixa tem saldo devedor.',
  'Compra de prédio é Ativo Imobilizado, não despesa.',
  'Pagar fornecedor não cria nova despesa.',
  'Venda a prazo é receita no mês da venda; adiantamento de cliente só vira receita na entrega.',
  'Lucro líquido não é o dinheiro no caixa.',
  'A.V. ≠ A.H.: estrutura × evolução.',
  'Margem divide pela Receita Líquida, não pelo Ativo.',
  'LC usa Passivo Circulante, não Passivo Total — e LC < 1 não significa falência.',
  'ROE divide pelo PL; Giro divide pelo Ativo.',
  'ROE alto por alavancagem não é eficiência operacional.',
  'Com o CPC 51/IFRS 18 muda a apresentação da DRE, não o lucro líquido.',
  '0,18 = 18%, e não 0,18%.',
];

export function Express() {
  return (
    <div className="page">
      <p className="eyebrow">Revisão expressa</p>
      <h1>Tudo da P1 em uma página</h1>
      <p className="lead">Fórmulas, regras e frases do professor, nas palavras dos slides das Aulas 1 a 5.</p>
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
