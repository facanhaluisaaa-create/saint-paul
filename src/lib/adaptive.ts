// Motor da prova adaptativa (puro). Sobe a dificuldade após acertos consecutivos;
// ao errar, desce e — em temas compostos — volta aos fundamentos antes de recompor.
import type { Difficulty } from '../../shared/types';
import { PREREQUISITES, TOPICS, type TopicId } from '../../shared/topics';

export interface AdaptiveStep {
  topic: TopicId;
  difficulty: Difficulty;
  /** Por que esta questão foi escolhida (exibido ao aluno). */
  reason: string;
}

export interface AdaptiveState {
  rotation: TopicId[];
  rotIndex: number;
  /** Fila de remediação: pré-requisitos e depois o tema a recompor. */
  queue: AdaptiveStep[];
  levels: Partial<Record<TopicId, Difficulty>>;
  streak: Partial<Record<TopicId, number>>;
  perTopicCount: Partial<Record<TopicId, number>>;
  asked: string[];
  log: { qid: string; topic: TopicId; difficulty: Difficulty; correct: boolean }[];
  max: number;
  current: AdaptiveStep | null;
}

const UP: Record<Difficulty, Difficulty> = { easy: 'medium', medium: 'hard', hard: 'hard' };
const DOWN: Record<Difficulty, Difficulty> = { easy: 'easy', medium: 'easy', hard: 'medium' };
export const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Fácil', medium: 'Média', hard: 'Difícil' };
const MAX_PER_TOPIC = 4;

export function startAdaptive(topics: TopicId[], max = 15): AdaptiveState {
  const s: AdaptiveState = { rotation: topics, rotIndex: 0, queue: [], levels: {}, streak: {}, perTopicCount: {}, asked: [], log: [], max, current: null };
  return { ...s, current: nextStep(s) };
}

export function nextStep(s: AdaptiveState): AdaptiveStep | null {
  if (s.log.length >= s.max) return null;
  if (s.queue.length) return s.queue[0];
  const topic = s.rotation[s.rotIndex % s.rotation.length];
  const difficulty = s.levels[topic] ?? 'medium';
  return { topic, difficulty, reason: `${TOPICS[topic].label} — nível ${DIFF_LABEL[difficulty].toLowerCase()}` };
}

export function recordAnswer(prev: AdaptiveState, qid: string, correct: boolean): AdaptiveState {
  const step = prev.current;
  if (!step) return prev;
  const s: AdaptiveState = {
    ...prev,
    queue: [...prev.queue],
    levels: { ...prev.levels },
    streak: { ...prev.streak },
    perTopicCount: { ...prev.perTopicCount },
    asked: [...prev.asked, qid],
    log: [...prev.log, { qid, topic: step.topic, difficulty: step.difficulty, correct }],
  };
  const t = step.topic;
  const fromQueue = s.queue.length > 0 && s.queue[0] === step;
  if (fromQueue) s.queue.shift();
  s.perTopicCount[t] = (s.perTopicCount[t] ?? 0) + 1;
  const level = s.levels[t] ?? step.difficulty;

  if (correct) {
    s.streak[t] = (s.streak[t] ?? 0) + 1;
    if ((s.streak[t] ?? 0) >= 2) {
      s.levels[t] = UP[level];
      s.streak[t] = 0;
    }
  } else {
    s.streak[t] = 0;
    s.levels[t] = DOWN[level];
    const prereqs = PREREQUISITES[t] ?? [];
    const remediating = s.queue.some((q) => q.topic === t);
    if (!fromQueue && prereqs.length && !remediating) {
      // Erro em tema composto: testar os componentes e depois recompor o tema.
      for (const p of prereqs)
        s.queue.push({ topic: p, difficulty: s.levels[p] ?? 'easy', reason: `Fundamento de ${TOPICS[t].label}: ${TOPICS[p].label}` });
      s.queue.push({ topic: t, difficulty: s.levels[t]!, reason: `Recompondo ${TOPICS[t].label} depois dos fundamentos` });
    }
  }

  // Avança na rotação quando o tema está dominado (2 acertos no difícil) ou após muitas questões.
  if (!fromQueue) {
    const mastered = correct && level === 'hard' && (s.levels[t] === 'hard') && (prev.streak[t] ?? 0) >= 1;
    if (mastered || (s.perTopicCount[t] ?? 0) >= MAX_PER_TOPIC) s.rotIndex = (s.rotIndex + 1) % s.rotation.length;
  }
  s.current = nextStep(s);
  return s;
}

/** Se não houver questão disponível para o passo atual, pula para o próximo. */
export function skipStep(prev: AdaptiveState): AdaptiveState {
  const s = { ...prev, queue: [...prev.queue] };
  if (s.queue.length && s.queue[0] === s.current) s.queue.shift();
  else s.rotIndex = (s.rotIndex + 1) % s.rotation.length;
  s.current = nextStep(s);
  return s;
}
