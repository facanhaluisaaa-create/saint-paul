// Histórico, tentativas, domínio por tema, diagnóstico e plano de revisão.
import type { Answer, CognitiveLevel, Difficulty, GradedQuestion, PublicQuestion } from '../../shared/types';
import { GROUPS, GROUP_IDS, TOPICS, TOPIC_IDS, groupOf, type GroupId, type TopicId } from '../../shared/topics';
import { KEYS, readJSON, writeJSON } from './storage';

export type SessionKind = 'p1' | 'ambev' | 'custom' | 'study' | 'review' | 'topic' | 'adaptive' | 'roteiro';

export interface Attempt {
  qid: string;
  topic: TopicId;
  skill: string;
  difficulty: Difficulty;
  level: CognitiveLevel;
  /** fração 0–1 */
  score: number;
  ts: number;
  kind: SessionKind;
}

export interface ExamRecord {
  id: string;
  kind: SessionKind;
  title: string;
  date: number;
  durationSec: number;
  timeLimitSec: number | null;
  questions: PublicQuestion[];
  answers: Record<string, Answer>;
  results: GradedQuestion[];
  earned: number;
  total: number;
  percent: number;
}

const MAX_ATTEMPTS = 3000;
const MAX_HISTORY = 60;

export function getAttempts(): Attempt[] {
  return readJSON<Attempt[]>(KEYS.attempts, []);
}

export function getHistory(): ExamRecord[] {
  return readJSON<ExamRecord[]>(KEYS.history, []);
}

export function getRecord(id: string): ExamRecord | undefined {
  return getHistory().find((r) => r.id === id);
}

export function getSeen(): Record<string, number> {
  return readJSON<Record<string, number>>(KEYS.seen, {});
}

export function markSeen(ids: string[], now = Date.now()) {
  const seen = getSeen();
  for (const id of ids) seen[id] = now;
  writeJSON(KEYS.seen, seen);
}

export function logAttempts(results: GradedQuestion[], kind: SessionKind, now = Date.now()) {
  const attempts = getAttempts();
  for (const r of results) {
    attempts.push({ qid: r.id, topic: r.topic, skill: r.skill, difficulty: r.difficulty, level: r.cognitiveLevel, score: r.earned, ts: now, kind });
  }
  writeJSON(KEYS.attempts, attempts.slice(-MAX_ATTEMPTS));
  markSeen(results.map((r) => r.id), now);
}

export function saveRecord(rec: ExamRecord) {
  const hist = getHistory().filter((r) => r.id !== rec.id);
  hist.unshift(rec);
  writeJSON(KEYS.history, hist.slice(0, MAX_HISTORY));
}

export function summarizeResults(results: GradedQuestion[]) {
  const earned = results.reduce((s, r) => s + r.earned, 0);
  const total = results.reduce((s, r) => s + r.points, 0);
  const objective = results.filter((r) => r.objective);
  const discursive = results.filter((r) => !r.objective);
  const byGroup = {} as Record<GroupId, { earned: number; total: number }>;
  const byTopic = {} as Record<TopicId, { earned: number; total: number }>;
  const byLevel = {} as Record<CognitiveLevel, { earned: number; total: number }>;
  const byPart = {} as Record<1 | 2 | 3, { earned: number; total: number }>;
  for (const r of results) {
    if (r.roteiro) {
      (byPart[r.roteiro.part] ??= { earned: 0, total: 0 }).earned += r.earned;
      byPart[r.roteiro.part].total += r.points;
    }
    const g = groupOf(r.topic);
    (byGroup[g] ??= { earned: 0, total: 0 }).earned += r.earned;
    byGroup[g].total += r.points;
    (byTopic[r.topic] ??= { earned: 0, total: 0 }).earned += r.earned;
    byTopic[r.topic].total += r.points;
    (byLevel[r.cognitiveLevel] ??= { earned: 0, total: 0 }).earned += r.earned;
    byLevel[r.cognitiveLevel].total += r.points;
  }
  return {
    earned,
    total,
    percent: total ? (earned / total) * 100 : 0,
    objective: { correct: objective.filter((r) => r.status === 'correct').length, earned: objective.reduce((s, r) => s + r.earned, 0), total: objective.length },
    discursive: { earned: discursive.reduce((s, r) => s + r.earned, 0), total: discursive.length },
    byGroup,
    byTopic,
    byLevel,
    byPart,
  };
}

// --- Domínio -------------------------------------------------------------------

const DIFF_W: Record<Difficulty, number> = { easy: 0.8, medium: 1, hard: 1.3 };
// "Peso fantasma" com nota 0: poucas tentativas não geram domínio alto. Some após ~8 tentativas,
// para que acertos consistentes possam chegar a 100.
const PRIOR = 1.5;
const PRIOR_FADE = 8;

/**
 * Domínio 0–100 de um conjunto de tentativas (mais recentes primeiro), considerando
 * taxa de acerto, dificuldade, recência e recuperação após erro na mesma habilidade.
 */
export function masteryScore(attempts: Attempt[]): number | null {
  if (!attempts.length) return null;
  const sorted = [...attempts].sort((a, b) => b.ts - a.ts);
  let num = 0;
  let den = PRIOR * Math.max(0, 1 - attempts.length / PRIOR_FADE);
  sorted.forEach((a, k) => {
    const w = DIFF_W[a.difficulty] * Math.pow(0.88, k);
    num += w * a.score;
    den += w;
  });
  // Recuperação: habilidade errada antes e acertada depois vale bônus.
  const bySkill = new Map<string, Attempt[]>();
  for (const a of [...attempts].sort((x, y) => x.ts - y.ts)) bySkill.set(a.skill, [...(bySkill.get(a.skill) ?? []), a]);
  for (const list of bySkill.values()) {
    const firstWrong = list.findIndex((a) => a.score < 0.5);
    if (firstWrong >= 0 && list.slice(firstWrong + 1).some((a) => a.score >= 0.99)) num += 0.5;
  }
  return Math.max(0, Math.min(100, Math.round((num / den) * 100)));
}

export function masteryByTopic(attempts = getAttempts()): Partial<Record<TopicId, number>> {
  const out: Partial<Record<TopicId, number>> = {};
  for (const t of TOPIC_IDS) {
    const m = masteryScore(attempts.filter((a) => a.topic === t));
    if (m != null) out[t] = m;
  }
  return out;
}

export function masteryByGroup(attempts = getAttempts()): Partial<Record<GroupId, number>> {
  const out: Partial<Record<GroupId, number>> = {};
  for (const g of GROUP_IDS) {
    const m = masteryScore(attempts.filter((a) => groupOf(a.topic) === g));
    if (m != null) out[g] = m;
  }
  return out;
}

/** Sinais enviados ao servidor para montar provas (sem dados pessoais). */
export function studentSignals() {
  const attempts = getAttempts();
  const recent = attempts.slice(-400);
  const wrong = recent.filter((a) => a.score < 0.6);
  // Habilidade "ainda errada" se o último registro dela é erro.
  const lastBySkill = new Map<string, Attempt>();
  for (const a of recent) lastBySkill.set(a.skill, a);
  const wrongSkills = [...lastBySkill.values()].filter((a) => a.score < 0.6).map((a) => a.skill);
  return {
    seen: getSeen(),
    mastery: masteryByTopic(attempts),
    wrongSkills,
    wrongIds: [...new Set(wrong.map((a) => a.qid))],
  };
}

export function dashboardStats() {
  const hist = getHistory().filter((r) => r.kind === 'p1' || r.kind === 'ambev' || r.kind === 'custom' || r.kind === 'roteiro');
  const attempts = getAttempts();
  const pcts = hist.map((r) => r.percent);
  return {
    exams: hist.length,
    average: pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null,
    best: pcts.length ? Math.max(...pcts) : null,
    last: pcts.length ? pcts[0] : null,
    questionsDone: attempts.length,
    trend: [...hist].reverse().map((r) => ({ date: r.date, percent: r.percent })),
  };
}

/** Prioridades: grupos com menor domínio (não iniciados vêm por último, sinalizados). */
export function studyPriorities(limit = 3) {
  const m = masteryByGroup();
  const tried = GROUP_IDS.filter((g) => m[g] != null).sort((a, b) => m[a]! - m[b]!);
  const untried = GROUP_IDS.filter((g) => m[g] == null);
  return [...tried.filter((g) => m[g]! < 85), ...untried].slice(0, limit).map((g) => ({ group: g, mastery: m[g] ?? null }));
}

// --- Diagnóstico e plano ---------------------------------------------------------

const LEVEL_LABEL: Record<CognitiveLevel, string> = {
  recognition: 'reconhecimento de conceitos',
  calculation: 'cálculo',
  interpretation: 'interpretação',
  analysis: 'análise e decisão',
};

export function diagnosis(results: GradedQuestion[]): string {
  const s = summarizeResults(results);
  const groups = (Object.keys(s.byGroup) as GroupId[]).map((g) => ({ g, pct: (s.byGroup[g].earned / s.byGroup[g].total) * 100 }));
  const strong = groups.filter((x) => x.pct >= 80).map((x) => GROUPS[x.g].label.toLowerCase());
  const weak = groups.filter((x) => x.pct < 60).sort((a, b) => a.pct - b.pct).map((x) => GROUPS[x.g].label.toLowerCase());
  const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

  const parts: string[] = [];
  if (strong.length && weak.length) parts.push(`Você demonstra domínio em ${list(strong)}, mas ainda precisa reforçar ${list(weak)}.`);
  else if (strong.length) parts.push(`Bom desempenho geral: domínio em ${list(strong)}.`);
  else if (weak.length) parts.push(`Os pontos mais frágeis desta prova foram ${list(weak)}.`);
  else parts.push('Desempenho intermediário e equilibrado entre os temas.');

  const lv = (Object.keys(s.byLevel) as CognitiveLevel[])
    .filter((l) => s.byLevel[l].total >= 2)
    .map((l) => ({ l, pct: (s.byLevel[l].earned / s.byLevel[l].total) * 100 }))
    .sort((a, b) => a.pct - b.pct);
  if (lv.length >= 2 && lv[lv.length - 1].pct - lv[0].pct >= 20) {
    parts.push(
      `Por tipo de habilidade, seu ponto mais forte foi ${LEVEL_LABEL[lv[lv.length - 1].l]} (${lv[lv.length - 1].pct.toFixed(0)}%) e o mais fraco, ${LEVEL_LABEL[lv[0].l]} (${lv[0].pct.toFixed(0)}%).`,
    );
    if (lv[0].l === 'interpretation' || lv[0].l === 'analysis')
      parts.push('Treine dizer o que cada número significa e de onde ele vem, não apenas calculá-lo.');
    if (lv[0].l === 'calculation') parts.push('Revise as fórmulas e confira o denominador de cada indicador antes de dividir.');
  }
  const scale = results.filter((r) => r.whyWrong?.startsWith('Erro de escala')).length;
  if (scale) parts.push(`Atenção: ${scale} erro(s) de escala (ex.: 0,18 lido como 0,18%).`);
  const blank = results.filter((r) => r.status === 'blank').length;
  if (blank) parts.push(`${blank} questão(ões) ficaram em branco.`);
  return parts.join(' ');
}

export function reviewPlan(results: GradedQuestion[]) {
  const s = summarizeResults(results);
  const weak = (Object.keys(s.byTopic) as TopicId[])
    .map((t) => ({ t, pct: (s.byTopic[t].earned / s.byTopic[t].total) * 100 }))
    .filter((x) => x.pct < 80)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);
  return weak.map((x, i) => ({ topic: x.t, label: TOPICS[x.t].label, count: i === 0 ? 5 : 3, pct: x.pct }));
}
