# QUESTION_BLUEPRINT — Banco de questões da P1

Construído a partir dos materiais reais da disciplina (ver `CONTENT_MAP.md`). Duas camadas:

1. **Formato da prova (roteiro em 3 partes):** 12 perguntas discursivas por caso, com consulta ao anexo das DFs, rubrica de 10 pontos e a regra "resposta sem número vale no máximo metade". Casos: Ambev (real, as 12 perguntas originais), Renner (real), dois fictícios (varejo e indústria).
2. **Treino de competências:** questões objetivas, numéricas, de classificação, débito/crédito, ordenação, multipartes e discursivas curtas sobre todo o conteúdo das Aulas 1–5, incluindo os exercícios dos slides.

## Metas globais

| Dimensão | Meta |
|---|---|
| Nível cognitivo (treino) | Reconhecer 30% · Calcular 25% · Interpretar 30% · Analisar/Decidir 15% |
| Dificuldade | Fácil 25% · Média 50% · Difícil 25% |
| Origem | Conceitual (slides) · Exercício da disciplina · Fictício (marcado) · Real Ambev · Real Renner |

## Arquivos e cobertura

| Arquivo | Fonte principal | O que cobre |
|---|---|---|
| `aulas.ts` | Slides das Aulas 1–4 e Atividade da Aula 4 | Definições e finalidades da contabilidade, usuários, B/D/O, Alfenas, Cia. Simétrica, Comercial Bahia, 5 estados patrimoniais, exemplo da Aula 3, Remendão, variações do PL, Padaria São Jorge, Pedal Forte, Camisetas Aurora, competência (Ex. 2), V/F (Ex. 5), CPC 51 |
| `balance-sheet.ts` | Aulas 1, 2 e 4 | Fundamentos, equação patrimonial, classificação, circulante × não circulante, PL |
| `debit-credit.ts` | Aula 3 | Natureza das contas, partidas dobradas, razonetes, balancete |
| `dre.ts` | Aula 4 | Degraus da DRE, custo × despesa, competência × caixa, resultado financeiro (+ EP e MC/PE sinalizados) |
| `analysis.ts` | Aulas 4 e 5 | A.V., A.H. (convenção da planilha), margens, liquidez — casos fictícios |
| `dupont.ts` | Aula 5 | ROE, giro, alavancagem, DuPont, estratégia — casos fictícios |
| `recognition.ts` | Aulas 4 e 5 | Reconhecimento de fórmulas e perguntas-chave |
| `ambev.ts` | Planilha + Caso Ambev + Atividade Ex. 4 | Treino com dados reais e as 12 perguntas do roteiro |
| `renner.ts` | Slides da Aula 4 e Aula 5 | Treino com dados reais da Renner, roteiro da Renner e conceitos da Aula 5 (barraca de praia, liquidez, DuPont) |
| `roteiro-ficticio.ts` | Formato da prova | Dois casos fictícios completos com 12 perguntas cada e treino objetivo |

## Formatos e regras de qualidade

- **Múltipla escolha:** 4–5 alternativas, cada distrator com `whyWrong` (erro real: base errada, escala 0,18 × 0,18%, A.V. × A.H., Passivo Total × PC, Ativo no lugar de PL).
- **Numérica:** `calc` recalculado pelo validador; `solution` com fórmula → substituição → conta → resultado → unidade → interpretação; aceita 18 / 18% / 0,18.
- **Discursiva:** rubrica de 10 pontos; nas de roteiro, `requireNumbers: true` e critérios com os números esperados.
- **Débito/crédito, classificação, ordenação, multipartes:** pontuação parcial.
- Toda questão: `reasoningSteps`, `commonMistake`, `rule`, `sourceReference` (aula e slide).
- Julgamentos sempre por comparação (ano anterior, pares, custo de capital).
- **A.H. = |atual| ÷ |anterior| − 1** (planilha); sinal mudou → n.m.

## Distribuição da prova mista (25 questões)

| Grupo | Questões |
|---|---|
| Fundamentos/BP | 3 |
| Débito/crédito/razonetes/balancete | 3 |
| DRE/custo × despesa/competência | 4 |
| A.V./A.H. | 4 |
| Margens | 3 |
| Liquidez | 2 |
| ROE/Giro/Alavancagem/DuPont | 4 |
| Estratégia/resultado financeiro | 2 |

Fora da prova mista: questões do roteiro (só no modo roteiro) e os temas MC/PE e equivalência (não localizados nos slides).

## Banco entregue (saída de `npm run validate`)

**362 questões · 0 erros · 125 cálculos recalculados · 134 balanços conferidos · 71 rubricas auditadas (resposta-modelo tira 99% em média).**

| Dimensão | Resultado |
|---|---|
| Fácil / Média / Difícil | 25% / 51% / 24% |
| Reconhecer / Calcular / Interpretar / Analisar | 23% / 24% / 27% / 26% |
| Origem | conceitual 142 · fictício 123 · real Ambev 38 · real Renner 30 · exercício da disciplina 29 |
| Tipos | ME 99 · V/F 62 · numérica 60 · discursiva 55 · multipartes 30 · classificação 23 · débito/crédito 16 · curta 12 · ordenação 5 |
| Roteiro da prova | 48 perguntas (4 casos × 12), com anexo e rubrica que exige números |

Por arquivo: aulas 50 · balance-sheet 38 · debit-credit 28 · dre 41 · analysis 35 · dupont 34 · recognition 20 · aula5 16 · ambev 38 · renner 30 · roteiro-ficticio 32.
