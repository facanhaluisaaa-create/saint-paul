import type { Difficulty, Question } from '../shared/types';
import { GROUPS, GROUP_IDS, TOPICS, groupOf, type GroupId, type TopicId } from '../shared/topics';
import { isObjective } from './grading';

export interface StudentSignals {
  /** id → timestamp (ms) da última vez em que a questão foi vista. */
  seen?: Record<string, number>;
  /** tema → domínio 0–100. */
  mastery?: Partial<Record<TopicId, number>>;
  /** Habilidades erradas anteriormente. */
  wrongSkills?: string[];
  wrongIds?: string[];
}

export interface BuildRequest extends StudentSignals {
  mode: 'p1' | 'topic' | 'review' | 'ambev' | 'mixed' | 'roteiro';
  count: number;
  topics?: TopicId[];
  exclude?: string[];
  /** Modo roteiro: id do caso (shared/cases.ts). */
  caseId?: string;
}

/** Temas citados no resumo da aluna, mas não localizados nos slides das Aulas 1–5: ficam fora do simulado misto. */
const OUT_OF_P1: TopicId[] = ['mc-pe', 'equivalencia'];

const DIFF_TARGET: Record<Difficulty, number> = { easy: 0.25, medium: 0.5, hard: 0.25 };
const DAY = 86_400_000;

/** Peso de uma questão para o sorteio: novas, de temas fracos e de habilidades erradas sobem. */
export function questionWeight(q: Question, s: StudentSignals, now = Date.now()): number {
  let w = 1;
  const seenAt = s.seen?.[q.id];
  if (seenAt) {
    const days = (now - seenAt) / DAY;
    w *= days < 1 ? 0.08 : days < 3 ? 0.2 : days < 7 ? 0.45 : 0.7;
  }
  const m = s.mastery?.[q.topic];
  if (m != null) w *= 1 + (100 - m) / 100; // tema fraco: até 2x
  if (s.wrongSkills?.includes(q.skill)) w *= 1.6;
  return w;
}

function weightedPick<T>(items: T[], weight: (t: T) => number, rand = Math.random): T | undefined {
  const total = items.reduce((s, t) => s + weight(t), 0);
  if (!items.length || total <= 0) return items[0];
  let r = rand() * total;
  for (const t of items) {
    r -= weight(t);
    if (r <= 0) return t;
  }
  return items[items.length - 1];
}

/** Distribui `count` vagas proporcionalmente aos pesos (maiores restos). */
export function apportion<K extends string>(weights: Record<K, number>, count: number): Record<K, number> {
  const keys = Object.keys(weights) as K[];
  const total = keys.reduce((s, k) => s + weights[k], 0);
  const exact = keys.map((k) => ({ k, v: (weights[k] / total) * count }));
  const out = {} as Record<K, number>;
  let used = 0;
  for (const { k, v } of exact) {
    out[k] = Math.floor(v);
    used += out[k];
  }
  exact
    .sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)))
    .slice(0, count - used)
    .forEach(({ k }) => (out[k] += 1));
  return out;
}

/**
 * Seleciona `n` questões de `pool`, perseguindo a meta de dificuldade e limitando discursivas.
 */
function pickBalanced(
  pool: Question[],
  n: number,
  s: StudentSignals,
  state: { diff: Record<Difficulty, number>; essays: number; maxEssays: number; total: number },
  chosen: Set<string>,
): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < n; i++) {
    const avail = pool.filter((q) => !chosen.has(q.id) && (isObjective(q) || state.essays < state.maxEssays));
    if (!avail.length) break;
    // Dificuldade com maior déficit em relação à meta.
    const filled = state.total + 1;
    const want = (Object.keys(DIFF_TARGET) as Difficulty[]).sort(
      (a, b) => (DIFF_TARGET[b] * filled - state.diff[b]) - (DIFF_TARGET[a] * filled - state.diff[a]),
    );
    let candidates: Question[] = [];
    for (const d of want) {
      candidates = avail.filter((q) => q.difficulty === d);
      if (candidates.length) break;
    }
    // Evita repetir a mesma habilidade dentro do simulado.
    const usedSkills = new Set(out.map((q) => q.skill));
    const fresh = candidates.filter((q) => !usedSkills.has(q.skill));
    const q = weightedPick(fresh.length ? fresh : candidates, (x) => questionWeight(x, s))!;
    out.push(q);
    chosen.add(q.id);
    state.diff[q.difficulty]++;
    state.total++;
    if (!isObjective(q)) state.essays++;
  }
  return out;
}

const topicOrder = Object.keys(TOPICS) as TopicId[];
const byContentOrder = (a: Question, b: Question) => topicOrder.indexOf(a.topic) - topicOrder.indexOf(b.topic);

export function buildExam(bank: Question[], req: BuildRequest): Question[] {
  const count = Math.max(1, Math.min(req.count, 60));
  const exclude = new Set(req.exclude ?? []);
  const chosen = new Set<string>();
  const state = {
    diff: { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>,
    essays: 0,
    maxEssays: Math.max(1, Math.round(count * 0.12)),
    total: 0,
  };
  // Questões do roteiro (12 perguntas encadeadas com anexo) só entram no modo roteiro.
  const available = bank.filter((q) => !exclude.has(q.id) && !q.roteiro);

  if (req.mode === 'roteiro') {
    const pool = bank.filter((q) => q.roteiro && q.roteiro.case === req.caseId);
    return pool.sort((a, b) => a.roteiro!.part - b.roteiro!.part || a.roteiro!.order - b.roteiro!.order);
  }

  if (req.mode === 'p1' || req.mode === 'mixed') {
    // Na P1, o Caso Ambev entra como parte dos grupos (é conteúdo da disciplina).
    const quotas = apportion(
      Object.fromEntries(GROUP_IDS.map((g) => [g, GROUPS[g].p1Weight])) as Record<GroupId, number>,
      count,
    );
    let picked: Question[] = [];
    const p1pool = req.mode === 'p1' ? available.filter((q) => !OUT_OF_P1.includes(q.topic)) : available;
    for (const g of GROUP_IDS) {
      const pool = p1pool.filter((q) => groupOf(q.topic) === g);
      picked.push(...pickBalanced(pool, quotas[g], req, state, chosen));
    }
    if (picked.length < count) picked.push(...pickBalanced(p1pool, count - picked.length, req, state, chosen));
    // Ordem de conteúdo, como numa prova real (sem revelar o tema).
    picked = picked.sort(byContentOrder);
    return picked;
  }

  if (req.mode === 'ambev') {
    const pool = available.filter((q) => q.caseTag === 'ambev' || q.caseTag === 'renner');
    state.maxEssays = Math.max(2, Math.round(count * 0.25));
    return pickBalanced(pool, Math.min(count, pool.length), req, state, chosen).sort(byContentOrder);
  }

  if (req.mode === 'topic') {
    const topics = new Set(req.topics?.length ? req.topics : topicOrder);
    const pool = available.filter((q) => topics.has(q.topic));
    state.maxEssays = Math.max(2, Math.round(count * 0.2));
    return pickBalanced(pool, Math.min(count, pool.length), req, state, chosen).sort(byContentOrder);
  }

  // review: variações das habilidades erradas, depois conceitos relacionados (mesmo tema / pré-requisitos).
  const wrongSkills = new Set(req.wrongSkills ?? []);
  const wrongIds = new Set(req.wrongIds ?? []);
  const wrongTopics = new Set(bank.filter((q) => wrongIds.has(q.id) || wrongSkills.has(q.skill)).map((q) => q.topic));
  state.maxEssays = Math.max(2, Math.round(count * 0.2));
  const tiers: Question[][] = [
    available.filter((q) => wrongSkills.has(q.skill) && !wrongIds.has(q.id)),
    available.filter((q) => wrongTopics.has(q.topic) && !wrongIds.has(q.id)),
    available.filter((q) => wrongIds.has(q.id)),
  ];
  const out: Question[] = [];
  for (const tier of tiers) {
    if (out.length >= count) break;
    out.push(...pickBalanced(tier, count - out.length, req, state, chosen));
  }
  return out.sort(byContentOrder);
}

/** Próxima questão da prova adaptativa: tema e dificuldade-alvo, evitando repetições. */
export function pickAdaptive(
  bank: Question[],
  topic: TopicId,
  difficulty: Difficulty,
  exclude: string[],
  s: StudentSignals,
): Question | undefined {
  const ex = new Set(exclude);
  const order: Difficulty[] =
    difficulty === 'easy' ? ['easy', 'medium', 'hard'] : difficulty === 'medium' ? ['medium', 'easy', 'hard'] : ['hard', 'medium', 'easy'];
  for (const d of order) {
    const pool = bank.filter((q) => q.topic === topic && q.difficulty === d && !ex.has(q.id) && !q.roteiro);
    const objective = pool.filter(isObjective);
    const q = weightedPick(objective.length ? objective : pool, (x) => questionWeight(x, s));
    if (q) return q;
  }
  return undefined;
}

/** Miniquestão de fixação: mesma habilidade (outra questão), objetiva e preferencialmente fácil. */
export function pickFixation(bank: Question[], q: Question, exclude: Set<string>): Question | undefined {
  const quick = (x: Question) =>
    x.id !== q.id && !exclude.has(x.id) && (x.type === 'multiple-choice' || x.type === 'true-false' || x.type === 'numeric');
  const rank = (x: Question) => ({ easy: 0, medium: 1, hard: 2 })[x.difficulty];
  const sameSkill = bank.filter((x) => quick(x) && x.skill === q.skill).sort((a, b) => rank(a) - rank(b));
  if (sameSkill.length) return sameSkill[0];
  const sameTopic = bank.filter((x) => quick(x) && x.topic === q.topic && x.difficulty !== 'hard');
  return sameTopic[Math.floor(Math.random() * sameTopic.length)];
}
