// Estado da prova (modo Prova Real / Simulado). Funções puras + persistência (autosave).
import type { Answer, PublicQuestion } from '../../shared/types';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';

export type ExamMode = 'p1' | 'ambev' | 'custom';

export interface ExamConfig {
  mode: ExamMode;
  title: string;
  /** null = sem limite */
  timeLimitSec: number | null;
  autoSubmit: boolean;
}

export interface ExamSession extends ExamConfig {
  id: string;
  questions: PublicQuestion[];
  answers: Record<string, Answer>;
  flags: string[];
  current: number;
  startedAt: number;
  elapsedSec: number;
  savedAt: number;
}

export function newId(prefix = 'ex'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createSession(questions: PublicQuestion[], config: ExamConfig, now = Date.now()): ExamSession {
  return { ...config, id: newId(), questions, answers: {}, flags: [], current: 0, startedAt: now, elapsedSec: 0, savedAt: now };
}

export function isAnswered(a: Answer | undefined): boolean {
  if (!a) return false;
  switch (a.kind) {
    case 'choice':
    case 'number':
    case 'text':
      return String(a.value ?? '').trim().length > 0;
    case 'boolean':
      return typeof a.value === 'boolean';
    case 'map':
    case 'parts':
      return Object.values(a.value ?? {}).some((v) => String(v ?? '').trim().length > 0);
    case 'order':
      return Array.isArray(a.value) && a.value.length > 0;
  }
}

/** Resposta completa (todas as partes/itens preenchidos) — usada para avisos na revisão. */
export function isComplete(q: PublicQuestion, a: Answer | undefined): boolean {
  if (!isAnswered(a)) return false;
  if (a!.kind === 'map') {
    const keys = q.type === 'debit-credit' ? q.accounts?.map((x) => x.id) : q.items?.map((x) => x.id);
    return (keys ?? []).every((k) => (a!.value as Record<string, string>)[k]);
  }
  if (a!.kind === 'parts') return (q.parts ?? []).every((p) => String((a!.value as Record<string, string>)[p.id] ?? '').trim());
  return true;
}

export function setAnswer(s: ExamSession, id: string, a: Answer): ExamSession {
  return { ...s, answers: { ...s.answers, [id]: a } };
}

export function clearAnswer(s: ExamSession, id: string): ExamSession {
  const answers = { ...s.answers };
  delete answers[id];
  return { ...s, answers };
}

export function toggleFlag(s: ExamSession, id: string): ExamSession {
  return { ...s, flags: s.flags.includes(id) ? s.flags.filter((f) => f !== id) : [...s.flags, id] };
}

export function goTo(s: ExamSession, index: number): ExamSession {
  const current = Math.max(0, Math.min(s.questions.length - 1, index));
  return current === s.current ? s : { ...s, current };
}

export function tick(s: ExamSession, deltaSec = 1): ExamSession {
  return { ...s, elapsedSec: s.elapsedSec + deltaSec };
}

export function remainingSec(s: ExamSession): number | null {
  return s.timeLimitSec == null ? null : Math.max(0, s.timeLimitSec - s.elapsedSec);
}

export function isExpired(s: ExamSession): boolean {
  return s.timeLimitSec != null && s.elapsedSec >= s.timeLimitSec;
}

export function summary(s: ExamSession) {
  const answeredIdx: number[] = [];
  const unansweredIdx: number[] = [];
  const incompleteIdx: number[] = [];
  s.questions.forEach((q, i) => {
    const a = s.answers[q.id];
    if (isAnswered(a)) {
      answeredIdx.push(i);
      if (!isComplete(q, a)) incompleteIdx.push(i);
    } else unansweredIdx.push(i);
  });
  const flaggedIdx = s.questions.map((q, i) => (s.flags.includes(q.id) ? i : -1)).filter((i) => i >= 0);
  return {
    total: s.questions.length,
    answered: answeredIdx.length,
    unanswered: unansweredIdx.length,
    flagged: flaggedIdx.length,
    answeredIdx,
    unansweredIdx,
    incompleteIdx,
    flaggedIdx,
    progressPct: s.questions.length ? Math.round((answeredIdx.length / s.questions.length) * 100) : 0,
  };
}

export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m ${s}s` : `${m}m ${String(s).padStart(2, '0')}s`;
}

// --- Autosave -------------------------------------------------------------------

export function saveSession(s: ExamSession, now = Date.now()): boolean {
  return writeJSON(KEYS.activeExam, { ...s, savedAt: now });
}

export function loadSession(): ExamSession | null {
  const s = readJSON<ExamSession | null>(KEYS.activeExam, null);
  if (!s || !Array.isArray(s.questions) || !s.questions.length) return null;
  return s;
}

export function clearSession() {
  removeKey(KEYS.activeExam);
}
