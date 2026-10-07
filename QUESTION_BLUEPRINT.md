# QUESTION_BLUEPRINT — Banco de questões da P1

## Metas globais

| Dimensão | Meta |
|---|---|
| Total | ≥ 160 questões, sem "clones" que só trocam números |
| Nível cognitivo | Reconhecer 30% · Calcular 25% · Interpretar 30% · Analisar/Decidir 15% |
| Dificuldade | Fácil 25% · Média 50% · Difícil 25% |
| Origem | Conceitual · Fictícia (marcada **CASO FICTÍCIO PARA ESTUDO**) · Real Ambev (DFP 2025 × 2024) |

## Quantidade por tema (arquivo → temas)

| Arquivo | Tema | Qtde | Formatos principais | Habilidades |
|---|---|---|---|---|
| `balance-sheet.ts` | fundamentos | 7 | ME, V/F, discursiva curta | BP × DRE × DFC; usuários; finalidade |
| | bp | 7 | ME, numérica, V/F | Equação patrimonial; descobrir PL/Passivo |
| | classificacao | 9 | classificação, ME, V/F | Bens, direitos, obrigações, PL |
| | circulante | 8 | classificação, ME, V/F | 12 meses; liquidez × exigibilidade; grupos do ANC |
| | pl | 6 | ME, V/F, discursiva | Aportes × resultado; PL ≠ caixa |
| `debit-credit.ts` | debito-credito | 15 | débito/crédito, ME, V/F | Natureza da conta; partidas dobradas; 1×n |
| | razonetes | 7 | numérica, ME | Saldo devedor/credor; sequência de fatos |
| | balancete | 6 | ME, V/F, numérica | Igualdade; limites do balancete |
| `dre.ts` | dre | 10 | ordenação, numérica, ME | Estrutura; subtotais |
| | custo-despesa | 7 | classificação, ME, discursiva | "Gruda no produto?" |
| | competencia-caixa | 9 | ME, V/F, discursiva, numérica | Lucro ≠ caixa; 3 exemplos obrigatórios |
| | resultado-financeiro | 5 | ME, discursiva analítica | Operação × financeiro |
| | equivalencia | 3 | ME, numérica | Participações; impacto no resultado |
| | mc-pe | 5 | numérica, ME | MCu; PE; exemplo da água |
| `analysis.ts` | av | 8 | numérica, ME, multipartes | Bases corretas; leitura |
| | ah | 8 | numérica, ME, V/F | Sinal; base anterior; A.V. × A.H. |
| | margens | 10 | numérica, ME, multipartes | MB/MO/ML; interpretação "a cada R$ 100" |
| | liquidez | 9 | numérica, ME, V/F, discursiva | AC/PC; leitura não isolada |
| `dupont.ts` | roe | 7 | numérica, ME, V/F | LL/PL; comparação |
| | giro | 5 | numérica, ME | Receita/Ativo; varejo × capital intensivo |
| | alavancagem | 6 | numérica, ME, V/F | Ativo/PL; risco |
| | dupont | 10 | ME, multipartes, discursiva | Decomposição; comparação entre anos |
| | estrategia | 6 | discursiva analítica, ME | Decisão integrada BP + DRE |
| `ambev.ts` | vários (caseTag `ambev`) | 22 | todas | A.V., A.H., LC, margens, RF, ROE, DuPont, riscos, ações |

## Formatos e regras de qualidade

- **Múltipla escolha:** 4–5 alternativas. Cada distrator representa um erro real e traz `whyWrong` (ex.: "usou Passivo Total", "leu 0,18 como 0,18%", "dividiu pelo Ativo").
- **Numérica:** traz `calc` (função da biblioteca `shared/finance.ts` + argumentos), recalculado pelo validador, e `solution` com fórmula → substituição → conta → resultado → unidade → interpretação. Aceita 18 / 18% / 0,18 quando equivalentes; tolerância padrão de 0,1 p.p. (percentual) ou 0,01 (índice).
- **Discursiva:** rubrica de 10 pontos com critérios, palavras-chave (grupos de sinônimos), erros graves e resposta-modelo.
- **Débito/crédito:** contas envolvidas no fato; o aluno marca D ou C em cada uma; pontuação parcial.
- **Ordenação:** linhas da DRE embaralhadas.
- **Multipartes:** cálculo + interpretação, com pontuação parcial.
- Toda questão tem `reasoningSteps` (COMO PENSAR), `commonMistake` (PEGADINHA), `rule` (REGRA TRANSFERÍVEL) e `sourceReference`.
- Julgamentos sempre condicionados à comparação (período anterior, pares, custo de capital), nunca "ROE de 18% é ótimo".

## Distribuição do "Simular P1" (25 questões; proporcional para outros tamanhos)

| Grupo | Questões |
|---|---|
| Fundamentos/BP | 3 |
| Débito/crédito/razonetes/balancete | 4 |
| DRE/custo × despesa/competência | 4 |
| A.V./A.H. | 3 |
| Margens | 3 |
| Liquidez | 2 |
| ROE/Giro/Alavancagem/DuPont | 4 |
| Estratégia/RF/EP/MC-PE | 2 |

Restrições do sorteio: ≈ 25/50/25 de dificuldade; pelo menos 1 questão de cada nível cognitivo por grupo grande; no máximo 3 discursivas em 25; questões vistas recentemente têm peso menor; temas fracos e habilidades já erradas têm peso maior.
