# CONTENT_MAP — Contabilidade para Tomada de Decisões I (P1)

Escola de Negócios Saint Paul · Prof. Dr. Arthur Tornatore Siessere · 2º semestre de 2026

## 0. Auditoria dos materiais: o que foi encontrado

| Local verificado | Resultado |
|---|---|
| Repositório `saint-paul` (todas as branches) | Só um `README.md` de 2 linhas. **Nenhum** PDF, DOCX, XLSX, slide ou imagem. |
| Pastas de upload/anexos do ambiente | Vazias. |
| Busca no sistema de arquivos por *Ambev, Aula, Remendão, Renner, .xlsx* | Nada encontrado. |

**Consequência e decisões tomadas**

1. A **fonte principal** passou a ser o resumo de conteúdo enviado pela aluna na especificação do projeto (blocos A–Y, fórmulas, regras didáticas, pegadinhas e exemplos). Esse resumo reproduz a terminologia e as regras das aulas (ex.: "BP = fotografia", "LC > 1 = folga", "Esse gasto gruda diretamente no produto?").
2. O mapeamento **Aula → tema** foi inferido da lista de materiais da especificação (Aula 2 = BP, Aula 3 = débito/crédito, Aula 4 = DRE, Aula 5 = análise conjunta/ROE/DuPont). Cada questão guarda isso em `sourceReference`.
3. **Ambev:** a planilha XLSX da disciplina não estava disponível. Para **não inventar números**, os dados vieram da **DFP consolidada oficial 2025 × 2024**, no Portal de Dados Abertos da CVM (`dfp_cia_aberta_2025.zip`, CNPJ 07.526.557/0001-00), em R$ mil. Conferência: os indicadores reproduzem exatamente os exemplos da especificação (ML 16,6% → 18,1%; Giro 0,55x → 0,61x; Alavancagem 1,63x; ROE 14,9% → 18,0%; LC 1,10 → 0,96, "43/45"), o que indica que a planilha da disciplina usa a mesma base. Se a planilha divergir, troque os valores em `shared/ambev.ts` e rode `npm run validate`.
4. **Alfenas S.A., Remendão S.A., Padaria São Jorge, Renner:** sem os arquivos, os números desses casos são desconhecidos. **Nenhum número foi atribuído a eles.** Os casos numéricos novos usam empresas com nomes próprios e são marcados como **CASO FICTÍCIO PARA ESTUDO**.
5. Equivalência Patrimonial e Margem de Contribuição/Ponto de Equilíbrio entram **só no nível descrito no resumo** (definição, impacto no resultado, exemplo da água). Ficam com peso baixo no "Simular P1".

## 1. Mapa de conteúdos

Importância: ★★★ = central e certamente cobrado · ★★ = provável · ★ = complementar.

| Bloco | Conteúdo | Fonte (inferida) | Fórmulas / regras | Terminologia da disciplina | Exemplos e pegadinhas | Imp. |
|---|---|---|---|---|---|---|
| A | Finalidade da Contabilidade: patrimônio, informação, planejamento, controle, decisão; usuários; BP, DRE, DFC | Aula 1 | BP = fotografia; DRE = filme do resultado; DFC = filme do caixa | Usuários internos/externos | Confundir DRE com DFC | ★★ |
| B | Balanço Patrimonial | Aula 2 | **Ativo = Passivo + PL** | Ativo = bens e direitos; Passivo = obrigações com terceiros; PL = riqueza residual dos proprietários | Capital Social classificado como Ativo | ★★★ |
| C | Bens, direitos e obrigações | Aula 2 | Classificação prática | Caixa, Veículo, Marca, Duplicatas a Receber, Fornecedores, Salários a Pagar | Marca (intangível) tratada como despesa | ★★★ |
| D | Circulante × Não Circulante | Aula 2 | AC: realização até 12 meses; ANC: RLP, Investimentos, Imobilizado, Intangível; PC até 12 meses; PNC após | **Liquidez** = velocidade de conversão em caixa; **Exigibilidade** = prazo de pagamento | Financiamento LP com parcela do próximo ano | ★★★ |
| E | Patrimônio Líquido | Aula 2 | Duas fontes de alteração: **aportes dos sócios** e **resultado** | Capital Social, Reservas, Lucros/Prejuízos | PL como "dinheiro em caixa" | ★★ |
| F | Débito e crédito | Aula 3 | Ativo: aumenta D, diminui C; Passivo e PL: aumentam C, diminuem D | "Não confundir com cartão de débito/crédito" | "Dinheiro entrou = crédito" | ★★★ |
| G | Partidas dobradas | Aula 3 | Σ Débitos = Σ Créditos | "Não há débito sem crédito correspondente" | Lançamentos 1×1, 1×n, n×n | ★★★ |
| H | Razão e razonetes | Aula 3 | Fato → Lançamento → Razão → Saldo → Balancete → Demonstrações | Razão (*General Ledger*), saldo devedor/credor, contas sintéticas/analíticas, plano de contas | Saldo devedor confundido com dívida | ★★★ |
| I | Balancete | Aula 3 | Σ saldos devedores = Σ saldos credores | — | Balancete fechar ≠ ausência de erro de classificação | ★★ |
| J | DRE | Aula 4 | Receita Líquida − Custo = Lucro Bruto − Despesas Operacionais = Lucro Operacional ± Resultado Financeiro = LAIR − IR/CS = Lucro Líquido | Lucro Bruto, Lucro Operacional | Ordem das linhas | ★★★ |
| K | Custo × Despesa | Aula 4 | "Esse gasto gruda diretamente no produto?" | Custo das vendas; despesas operacionais | Compra de prédio tratada como despesa; pagamento de fornecedor como nova despesa | ★★★ |
| L | Competência × Caixa | Aula 4 | DRE = competência; DFC = caixa | **"Lucro não é caixa"** | Venda a prazo de 60 dias; salário de setembro pago em outubro; aluguel anual antecipado | ★★★ |
| M | Análise Vertical | Aula 5 | Conta / Ativo Total; Conta / (Passivo + PL); Linha / Receita Líquida (× 100) | "Quanto essa conta representa dentro da estrutura?" | Confundir A.V. com A.H. | ★★★ |
| N | Análise Horizontal | Aula 5 | (Atual − Anterior) / Anterior × 100 | "Quanto essa conta cresceu ou caiu?" | Sinal; base errada (dividir pelo atual) | ★★★ |
| O–Q | Margens | Aula 5 | MB = LB/RL; MO = LO/RL; ML = LL/RL | "A cada R$ 100 de Receita Líquida, R$ X viram Lucro Líquido" | Dividir pelo Ativo; 0,18 lido como 0,18% | ★★★ |
| R | Liquidez Corrente | Aula 5 | LC = AC / PC; > 1 folga, = 1 limite, < 1 atenção | Não analisar isoladamente: caixa, recebíveis, estoques, natureza do negócio, giro, composição do PC | Usar Passivo Total; LC < 1 = falência | ★★★ |
| S | ROE | Aula 5 | ROE = LL / PL | "Para cada R$ 100 de capital próprio…" | Usar Ativo no denominador; julgar sem comparação | ★★★ |
| T | Giro do Ativo | Aula 5 | Giro = Receita / Ativo Total | "Quantos reais de venda cada R$ 1 de Ativo gera" | Usar PL; giro baixo natural em negócio intensivo em capital | ★★★ |
| U | Alavancagem | Aula 5 | Ativo Total / PL | "Quanto de Ativo cada R$ 1 dos sócios sustenta" | Alavancagem tratada como sempre positiva | ★★★ |
| V | DuPont | Aula 5 | ROE = ML × Giro × Alavancagem | "De onde veio o ROE?" | ROE alto por alavancagem lido como eficiência operacional | ★★★ |
| W | Resultado Financeiro | Aula 4/5 | Receitas financeiras − Despesas financeiras | "O lucro veio da operação ou foi ajudado/prejudicado pelo financeiro?" | Lucro cresce por receita financeira | ★★ |
| X | Equivalência Patrimonial | Aula 4 (introdutório) | Resultado da investida × % de participação | Investimentos em outras empresas | Tratar como receita de vendas | ★ |
| Y | Margem de Contribuição e Ponto de Equilíbrio | Aula 4 (introdutório) | MCu = Preço − CV; PE = Fixos / MCu | Exemplo da água: P = 2, CV = 1, Fixos = 1.000 → PE = 1.000 un. | Dividir fixos pelo preço | ★ |
| — | Caso Ambev (2025 × 2024) | Caso Ambev + DFs | Todas as anteriores | Sempre com números | Ver §2 | ★★★ |

## 2. Caso Ambev — números-chave (R$ mil; DFP consolidada, CVM)

| Indicador | 2024 | 2025 | Leitura |
|---|---|---|---|
| Receita Líquida | 89.452.669 | 88.242.467 | A.H. −1,35% |
| Lucro Bruto / Margem Bruta | 45.837.589 / 51,24% | 45.378.340 / 51,42% | Margem bruta estável/levemente maior |
| Lucro Operacional / MO | 21.805.576 / 24,38% | 23.423.386 / 26,54% | Despesas operacionais caíram (−8,6%) |
| Resultado Financeiro | −2.318.249 | −4.001.728 | Piorou 72,6% |
| Lucro Líquido / ML | 14.846.952 / 16,60% | 15.988.433 / 18,12% | A.H. +7,69%; IR/CS menor ajudou |
| Ativo Total | 162.507.949 | 145.087.151 | A.H. −10,72% (caixa −34,8%, intangível −7,5%) |
| PL | 99.580.514 | 88.774.781 | A.H. −10,85% |
| AC / PC → LC | 54.155.784 / 49.388.714 → 1,10 | 43.875.596 / 45.599.307 → 0,96 | Queda puxada pelo caixa |
| Giro | 0,55x | 0,61x | Ativo menor com receita estável |
| Alavancagem | 1,63x | 1,63x | Estável |
| ROE | 14,91% | 18,01% | Veio de margem + giro, não de alavancagem |
| Maiores contas do Ativo (A.V. 2025) | — | Intangível 36,2%; Imobilizado 19,1%; Caixa 12,8% | Empresa intensiva em marcas/ativos |

## 3. Terminologia adotada (igual à das aulas)

Ativo Circulante · Ativo Não Circulante (RLP, Investimentos, Imobilizado, Intangível) · Passivo Circulante · Passivo Não Circulante · Patrimônio Líquido · Receita Líquida · Custo das Vendas · Lucro Bruto · Despesas Operacionais · Lucro Operacional · Resultado Financeiro · LAIR (Lucro antes do IR/CS) · Lucro Líquido · Análise Vertical (A.V.) · Análise Horizontal (A.H.) · Margem Bruta / Operacional / Líquida · Liquidez Corrente · ROE · Giro do Ativo · Alavancagem · DuPont · Razonete · Balancete · Saldo devedor / credor.

**Nota de estudo (sem alterar gabaritos):** na DFP oficial, a linha "Resultado antes do resultado financeiro e dos tributos" inclui a equivalência patrimonial; na disciplina ela é tratada como **Lucro Operacional**, e o app segue o professor.

## 4. Fórmulas disponíveis no app (Revisão Expressa)

`Ativo = Passivo + PL` · `A.V. = Conta / Base × 100` · `A.H. = (Atual − Anterior) / Anterior × 100` · `MB = LB / RL` · `MO = LO / RL` · `ML = LL / RL` · `LC = AC / PC` · `ROE = LL / PL` · `Giro = Receita / Ativo` · `Alavancagem = Ativo / PL` · `ROE = ML × Giro × Alavancagem` · `MCu = Preço − CV` · `PE = Fixos / MCu`.
