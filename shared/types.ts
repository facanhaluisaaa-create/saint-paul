import type { TopicId } from './topics';
import type { CalcFn } from './finance';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type CognitiveLevel = 'recognition' | 'calculation' | 'interpretation' | 'analysis';
export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'numeric'
  | 'short-answer'
  | 'essay'
  | 'classification'
  | 'debit-credit'
  | 'ordering'
  | 'multi-part';

/** Origem dos dados usados na questão. */
export type DataSource =
  | 'conceitual' // sem números de empresa; baseada no conteúdo das aulas
  | 'ficticio' // CASO FICTÍCIO PARA ESTUDO
  | 'real-ambev' // Ambev 2025 × 2024 (planilha da disciplina)
  | 'real-renner' // Lojas Renner 2025 × 2024 (slides da Aula 4)
  | 'aula'; // exercício/caso dos slides (Alfenas, Comercial Bahia, Cia. Simétrica, Remendão, Padaria São Jorge...)

export type NumericUnit = 'percent' | 'ratio' | 'times' | 'currency' | 'units';

export interface DataTable {
  caption?: string;
  /** Ex.: "Valores em R$ mil" */
  note?: string;
  headers: string[];
  rows: (string | number)[][];
  /** Índices de linhas a destacar como totais. */
  totalRows?: number[];
}

export interface CalcSpec {
  fn: CalcFn;
  args: number[];
}

/** Estrutura de correção de cálculo: fórmula → substituição → conta → resultado → unidade → interpretação. */
export interface CalcSolution {
  formula: string;
  substitution: string;
  computation: string;
  result: string;
  unit: string;
  interpretation: string;
}

export interface RubricCriterion {
  id: string;
  description: string;
  points: number;
  /** Grupos de palavras-chave: o critério é atendido se QUALQUER grupo tiver TODAS as palavras. */
  keywords: string[][];
}

export interface Rubric {
  criteria: RubricCriterion[];
  /** Regra da disciplina: "na prova, resposta sem número vale no máximo metade". */
  requireNumbers?: boolean;
  /** Erros conceituais graves: se detectados, geram alerta e desconto. */
  seriousErrors?: { description: string; patterns: string[]; penalty: number }[];
  modelAnswer: string;
}

export interface Option {
  id: string; // 'A' | 'B' | ...
  text: string;
  /** Por que essa alternativa está errada (o erro de raciocínio que ela representa). */
  whyWrong?: string;
}

interface BaseQuestion {
  id: string;
  topic: TopicId;
  subtopic?: string;
  /** Habilidade avaliada (questões com a mesma skill testam o mesmo conceito). */
  skill: string;
  /** Caso a que a questão pertence: 'ambev' | 'renner' | id de caso fictício do roteiro. */
  caseTag?: string;
  /**
   * Questão do "roteiro de análise em 3 partes" (formato da prova): Parte 1 BP (investimento e
   * financiamento), Parte 2 DRE (resultados), Parte 3 Estratégia. `order` ordena dentro do caso.
   */
  roteiro?: { case: string; part: 1 | 2 | 3; order: number };
  dataSource: DataSource;
  difficulty: Difficulty;
  cognitiveLevel: CognitiveLevel;
  stem: string;
  context?: string;
  table?: DataTable;
  tables?: DataTable[];
  explanation: string;
  reasoningSteps: string[];
  commonMistake?: string;
  /** REGRA TRANSFERÍVEL: como resolver sozinho em outra questão. */
  rule?: string;
  formula?: string;
  hint?: string;
  /** Explicação curta do conceito (botão "Explicar conceito"). */
  concept?: string;
  sourceReference: string;
  /** Para casos com balanço: o validador confere Ativo = Passivo + PL (tolerância padrão 0,5; use maior para R$ milhões arredondados). */
  balanceCheck?: { label: string; ativo: number; passivo: number; pl: number; tolerance?: number }[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: Option[];
  correct: string;
  calc?: CalcSpec;
  solution?: CalcSolution;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correct: boolean;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  correct: number;
  unit: NumericUnit;
  decimals: number;
  /** Tolerância absoluta na unidade da resposta (ex.: 0.1 ponto percentual). */
  tolerance?: number;
  calc: CalcSpec;
  solution: CalcSolution;
}

export interface EssayQuestion extends BaseQuestion {
  type: 'short-answer' | 'essay';
  rubric: Rubric;
}

export interface ClassificationQuestion extends BaseQuestion {
  type: 'classification';
  items: { id: string; label: string }[];
  categories: { id: string; label: string }[];
  correct: Record<string, string>;
}

export interface DebitCreditQuestion extends BaseQuestion {
  type: 'debit-credit';
  /** Descrição do fato contábil. */
  operation: string;
  accounts: { id: string; label: string }[];
  correct: Record<string, 'D' | 'C'>;
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  /** Itens na ordem CORRETA; o servidor embaralha antes de enviar. */
  items: { id: string; label: string }[];
}

export type Part =
  | { id: string; kind: 'numeric'; prompt: string; correct: number; unit: NumericUnit; decimals: number; tolerance?: number; points: number; calc: CalcSpec; solution: CalcSolution }
  | { id: string; kind: 'choice'; prompt: string; options: Option[]; correct: string; points: number }
  | { id: string; kind: 'text'; prompt: string; points: number; rubric: Rubric };

export interface MultiPartQuestion extends BaseQuestion {
  type: 'multi-part';
  parts: Part[];
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | NumericQuestion
  | EssayQuestion
  | ClassificationQuestion
  | DebitCreditQuestion
  | OrderingQuestion
  | MultiPartQuestion;

// ---------------------------------------------------------------------------
// Versões públicas (enviadas ao navegador) — SEM gabarito, explicação ou rubrica.

export type PublicPart =
  | { id: string; kind: 'numeric'; prompt: string; unit: NumericUnit; decimals: number; points: number }
  | { id: string; kind: 'choice'; prompt: string; options: { id: string; text: string }[]; points: number }
  | { id: string; kind: 'text'; prompt: string; points: number };

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  stem: string;
  context?: string;
  tables?: DataTable[];
  dataSource: DataSource;
  /** Parte do roteiro (formato da prova) — enviada sempre, pois é a estrutura da prova. */
  roteiroPart?: 1 | 2 | 3;
  /** Só enviados fora do modo prova. */
  topic?: TopicId;
  difficulty?: Difficulty;
  cognitiveLevel?: CognitiveLevel;
  options?: { id: string; text: string }[];
  unit?: NumericUnit;
  decimals?: number;
  items?: { id: string; label: string }[];
  categories?: { id: string; label: string }[];
  operation?: string;
  accounts?: { id: string; label: string }[];
  parts?: PublicPart[];
  points: number;
}

/** Resposta do aluno, por tipo. */
export type Answer =
  | { kind: 'choice'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'number'; value: string }
  | { kind: 'text'; value: string }
  | { kind: 'map'; value: Record<string, string> }
  | { kind: 'order'; value: string[] }
  | { kind: 'parts'; value: Record<string, string> };

export interface CriterionResult {
  id: string;
  description: string;
  points: number;
  earned: number;
  met: boolean;
  comment?: string;
}

export interface PartResult {
  id: string;
  prompt: string;
  earned: number;
  points: number;
  userAnswer: string;
  correctAnswer: string;
  solution?: CalcSolution;
  criteria?: CriterionResult[];
}

export interface GradedQuestion {
  id: string;
  topic: TopicId;
  skill: string;
  difficulty: Difficulty;
  cognitiveLevel: CognitiveLevel;
  type: QuestionType;
  dataSource: DataSource;
  caseTag?: string;
  roteiro?: { case: string; part: 1 | 2 | 3; order: number };
  earned: number;
  points: number;
  /** 'correct' | 'partial' | 'wrong' | 'blank' */
  status: 'correct' | 'partial' | 'wrong' | 'blank';
  objective: boolean;
  userAnswer: string;
  correctAnswer: string;
  whyWrong?: string;
  explanation: string;
  reasoningSteps: string[];
  commonMistake?: string;
  rule?: string;
  formula?: string;
  solution?: CalcSolution;
  criteria?: CriterionResult[];
  seriousErrors?: string[];
  modelAnswer?: string;
  parts?: PartResult[];
  /** Detalhe item a item (classificação, débito/crédito, ordenação). */
  itemDetails?: { label: string; user: string; correct: string; ok: boolean }[];
  gradingMethod?: 'exact' | 'keywords' | 'llm';
  sourceReference: string;
  fixation?: PublicQuestion;
}
