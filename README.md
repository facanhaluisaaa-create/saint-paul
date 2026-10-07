# P1 · Contabilidade para Tomada de Decisões I

Plataforma de simulados e estudo guiado para a P1 da disciplina **Contabilidade para Tomada de Decisões I**, Escola de Negócios Saint Paul, Prof. Dr. Arthur Tornatore Siessere, 2º semestre de 2026.

Ela simula a prova real (cronômetro, navegação, marcação, sem dicas), corrige com profundidade (resposta correta, por que a sua está errada, como pensar, pegadinha, regra transferível, miniquestão de fixação) e acompanha o domínio por tema para direcionar a revisão.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:5173 (frontend + API de correção no mesmo processo)
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm test` | Testes automáticos (fórmulas, arredondamento, 0,18/18%, correção, sessão, timer, autosave, retomada, domínio, adaptativa, API) |
| `npm run validate` | Valida o banco: recalcula todos os gabaritos numéricos, confere A = P + PL, alternativas, rubricas e partidas dobradas |
| `npm run audit:rubrics` | Corrige cada resposta-modelo com o corretor automático (deve tirar nota alta) e uma resposta vaga (deve tirar nota baixa) |
| `npm run build` | Typecheck + build de produção em `dist/` |
| `npm start` | Servidor de produção (build + API) em http://localhost:4173 |

### Correção semântica das discursivas (opcional)

Sem configuração, as discursivas são corrigidas por rubrica com conceitos, palavras-chave e sinônimos, e o app avisa que a correção é aproximada. Para usar a correção semântica (restrita à rubrica, com saída JSON por critério), defina uma chave da API da Anthropic antes de subir o servidor:

```bash
export ANTHROPIC_API_KEY=...        # usada só no servidor, nunca enviada ao navegador
export GRADER_MODEL=claude-opus-5-5 # opcional (padrão)
export GRADER_LLM=off               # opcional: força o corretor por palavras-chave
```

Se a chamada falhar, o servidor volta automaticamente para o corretor determinístico.

## Modos

| Modo | Onde | Características |
|---|---|---|
| **Prova real / Simular P1** | Painel → Iniciar P1 simulada | 20–25 questões (configurável), cronômetro (sem limite, 30, 45, 60, 90 min ou personalizado), entrega automática opcional, navegador de questões, marcação para revisão, autosave e retomada, tela "Revisar antes de entregar", **tema oculto**, correção só no final |
| **Estudo guiado** | Painel → Estudo guiado | Correção imediata; botões Dica, Mostrar fórmula, Explicar conceito, Tentar novamente e Ver solução passo a passo |
| **Revisão dos erros** | Menu → Meus erros | Variações das habilidades erradas (outra questão, mesma skill), depois conceitos relacionados; não repete necessariamente a mesma pergunta |
| **Treino por tema** | Menu → Treino por tema | 23 temas, mais "Misturado" e "Caso Ambev" |
| **Prova adaptativa** | Menu → Adaptativa | 2 acertos seguidos sobem o nível; um erro desce o nível e, em temas compostos, volta aos pré-requisitos (ex.: DuPont → Margem, Giro, Alavancagem → DuPont) |
| **Simulado Caso Ambev** | Painel → Simulado Caso Ambev | Dados reais, com as DFs completas disponíveis durante a prova |
| **Revisão expressa** | Menu → Revisão expressa | Cartões com todas as fórmulas, regras e pegadinhas (imprimível) |
| **Histórico** | Menu → Histórico | Abre qualquer prova antiga com a correção completa |
| **Banco de questões** | `#/question-bank` | Rota de auditoria, **só em desenvolvimento** (`npm run dev`) |

Atalhos de teclado: **A–E** escolhem alternativas, **V/F** em verdadeiro ou falso, **← →** navegam, **R** marca para revisão.

O relatório final mostra nota em pontos e em percentual, tempo, objetivas e discursivas, desempenho por assunto, diagnóstico e plano de revisão, com os botões "Iniciar revisão personalizada" e "Exportar relatório (PDF)" (impressão amigável, todas as correções expandidas).

## Arquitetura

```
shared/              código comum a cliente e servidor
  types.ts           schema das questões (completo e público)
  topics.ts          temas, grupos do simulado e pré-requisitos da adaptativa
  finance.ts         fórmulas da disciplina (A.V., A.H., margens, LC, ROE, giro, alavancagem, DuPont, MC/PE)
  numeric.ts         leitura de números pt-BR, equivalência 0,18 / 18% / 18, tolerância
  ambev.ts           DFP Ambev 2025 × 2024 (R$ mil)
server/              camada de correção: o gabarito nunca vai para o navegador
  questions/*.ts     banco de questões (com gabarito, explicação e rubrica)
  grading.ts         versão pública das questões + correção por tipo
  essay.ts           corretor por rubrica (fallback determinístico)
  llm.ts             corretor semântico opcional (Claude API, saída estruturada)
  selection.ts       montagem do simulado: cobertura, dificuldade, repetição, temas fracos
  validate.ts        validação matemática e estrutural do banco
  api.ts, http.ts    rotas /api/* (montadas no Vite em dev e em server/prod.ts em produção)
src/                 React + TypeScript
  lib/               sessão de prova, progresso/domínio, motor adaptativo, storage
  components/        renderização das questões, tabelas, painel de correção, gráficos
  screens/           painel, prova, relatório, estudo, temas, adaptativa, expressa, histórico, banco
tests/               Vitest
scripts/             validate-bank.ts, audit-rubrics.ts
```

**Sem vazamento de gabarito.** O navegador recebe só id, enunciado, dados e alternativas; no modo prova, nem o tema. A correção acontece em `POST /api/grade`. Um teste garante que nenhum campo de gabarito, explicação ou rubrica aparece na versão pública, e o bundle de produção não contém o banco.

**Persistência:** `localStorage` (prova em andamento, histórico, tentativas, questões vistas). Nada sai do navegador além das respostas enviadas para correção.

**Domínio por tema (0–100):** média ponderada das tentativas por dificuldade (fácil 0,8; média 1; difícil 1,3) e por recência (decaimento de 0,88 por tentativa). Recuperação após erro na mesma habilidade dá bônus, e há um peso inicial que impede domínio alto com poucas tentativas.

**Simulado P1 (25 questões):** Fundamentos/BP 3 · Débito/Crédito 4 · DRE/Competência 4 · A.V./A.H. 3 · Margens 3 · Liquidez 2 · ROE/DuPont 4 · Estratégia 2, com proporção para outros tamanhos. Também persegue a meta 25/50/25 de dificuldade, permite no máximo cerca de 12% de discursivas e evita repetir a mesma habilidade. Questões vistas recentemente têm peso menor (8% no mesmo dia), e temas fracos e habilidades erradas têm peso maior.

## Fontes do conteúdo (leia antes de confiar)

- **Os materiais da disciplina (slides, PDFs, XLSX, exercícios) não estavam no repositório.** O conteúdo segue o resumo da P1 enviado pela aluna (blocos A–Y). Detalhes em [`CONTENT_MAP.md`](CONTENT_MAP.md).
- **Ambev:** valores da DFP consolidada oficial (CVM, dados abertos), que reproduzem os números citados no resumo (ML 18,1%, giro 0,61x, alavancagem 1,63x, LC 43/45 = 0,96). Se a planilha da disciplina divergir, edite `shared/ambev.ts` e rode `npm run validate`.
- **Casos fictícios** são marcados como "Caso fictício para estudo". Nenhum número foi atribuído a Alfenas, Remendão, Padaria São Jorge ou Renner, porque seus dados não estavam disponíveis.
- Distribuição do banco e metas por tema: [`QUESTION_BLUEPRINT.md`](QUESTION_BLUEPRINT.md).

## Como adicionar questões

1. Edite ou crie um arquivo em `server/questions/` seguindo `shared/types.ts`. Questões numéricas precisam de `calc` (função de `shared/finance.ts` + argumentos) e `solution`. Casos com balanço precisam de `balanceCheck`.
2. Registre o arquivo em `server/questions/index.ts`.
3. Rode `npm run validate && npm test`.
