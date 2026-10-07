import { beforeEach, describe, expect, it } from 'vitest';
import type { GradedQuestion, PublicQuestion } from '../shared/types';
import { setStorage, type KV } from '../src/lib/storage';
import {
  clearSession,
  createSession,
  formatClock,
  goTo,
  isExpired,
  loadSession,
  remainingSec,
  saveSession,
  setAnswer,
  summary,
  tick,
  toggleFlag,
} from '../src/lib/examState';
import { recordAnswer, startAdaptive } from '../src/lib/adaptive';
import { diagnosis, getAttempts, getHistory, logAttempts, masteryScore, reviewPlan, saveRecord, summarizeResults, type Attempt } from '../src/lib/progress';

class MemKV implements KV {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

const qs: PublicQuestion[] = [
  { id: 'q1', type: 'multiple-choice', stem: 'x', dataSource: 'conceitual', options: [{ id: 'A', text: 'a' }], points: 1 },
  { id: 'q2', type: 'numeric', stem: 'y', dataSource: 'conceitual', unit: 'percent', decimals: 1, points: 1 },
  {
    id: 'q3',
    type: 'debit-credit',
    stem: 'z',
    dataSource: 'conceitual',
    accounts: [
      { id: 'a', label: 'Caixa' },
      { id: 'b', label: 'Capital' },
    ],
    points: 1,
  },
];

const config = { mode: 'p1' as const, title: 'Simulado P1', timeLimitSec: 60, autoSubmit: true };

beforeEach(() => setStorage(new MemKV()));

describe('sessão de prova', () => {
  it('responde, navega e marca para revisão', () => {
    let s = createSession(qs, config, 0);
    s = setAnswer(s, 'q1', { kind: 'choice', value: 'A' });
    s = toggleFlag(s, 'q2');
    s = setAnswer(s, 'q3', { kind: 'map', value: { a: 'D' } });
    s = goTo(s, 99);
    expect(s.current).toBe(2);
    s = goTo(s, -3);
    expect(s.current).toBe(0);
    const sum = summary(s);
    expect(sum.answered).toBe(2);
    expect(sum.unanswered).toBe(1);
    expect(sum.flagged).toBe(1);
    expect(sum.incompleteIdx).toEqual([2]); // débito/crédito com só uma conta marcada
    expect(sum.progressPct).toBe(67);
    s = toggleFlag(s, 'q2');
    expect(summary(s).flagged).toBe(0);
  });

  it('cronômetro: decrementa, expira e formata', () => {
    let s = createSession(qs, config, 0);
    expect(remainingSec(s)).toBe(60);
    for (let i = 0; i < 59; i++) s = tick(s);
    expect(isExpired(s)).toBe(false);
    s = tick(s);
    expect(isExpired(s)).toBe(true);
    expect(remainingSec(s)).toBe(0);
    expect(formatClock(42 * 60 + 18)).toBe('42:18');
    expect(formatClock(3725)).toBe('1:02:05');
    const unlimited = createSession(qs, { ...config, timeLimitSec: null });
    expect(remainingSec(tick(unlimited, 9999))).toBeNull();
    expect(isExpired(tick(unlimited, 9999))).toBe(false);
  });

  it('autosave e retomada preservam respostas, marcações e tempo', () => {
    let s = createSession(qs, config, 0);
    s = setAnswer(s, 'q2', { kind: 'number', value: '18%' });
    s = toggleFlag(s, 'q1');
    s = goTo(s, 1);
    s = tick(s, 25);
    saveSession(s);
    const r = loadSession()!;
    expect(r.answers.q2).toEqual({ kind: 'number', value: '18%' });
    expect(r.flags).toEqual(['q1']);
    expect(r.current).toBe(1);
    expect(r.elapsedSec).toBe(25);
    expect(remainingSec(r)).toBe(35);
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('storage corrompido não quebra a retomada', () => {
    const kv = new MemKV();
    kv.setItem('sp.p1.activeExam', '{corrompido');
    setStorage(kv);
    expect(loadSession()).toBeNull();
  });
});

const graded = (id: string, topic: any, earned: number, extra: Partial<GradedQuestion> = {}): GradedQuestion => ({
  id,
  topic,
  skill: `${topic}-s`,
  difficulty: 'medium',
  cognitiveLevel: 'calculation',
  type: 'numeric',
  dataSource: 'conceitual',
  earned,
  points: 1,
  status: earned >= 1 ? 'correct' : earned > 0 ? 'partial' : 'wrong',
  objective: true,
  userAnswer: '',
  correctAnswer: '',
  explanation: '',
  reasoningSteps: [],
  sourceReference: '',
  ...extra,
});

describe('finalização, histórico e revisão', () => {
  it('resume nota em pontos, percentual e por assunto', () => {
    const rs = [graded('a', 'dupont', 0), graded('b', 'dupont', 1), graded('c', 'bp', 1), graded('d', 'dre', 0.5, { objective: false })];
    const s = summarizeResults(rs);
    expect(s.earned).toBe(2.5);
    expect(s.percent).toBe(62.5);
    expect(s.objective).toMatchObject({ correct: 2, total: 3 });
    expect(s.discursive).toMatchObject({ earned: 0.5, total: 1 });
    expect(s.byGroup['roe-dupont']).toEqual({ earned: 1, total: 2 });
    const plan = reviewPlan(rs);
    expect(plan[0].topic).toBe('dupont');
    expect(plan[0].count).toBe(5);
    expect(diagnosis(rs)).toMatch(/fundamentos e bp/i);
  });

  it('salva e reabre provas antigas; registra tentativas', () => {
    const rs = [graded('a', 'liquidez', 1)];
    saveRecord({ id: 'ex1', kind: 'p1', title: 'T', date: 1, durationSec: 10, timeLimitSec: null, questions: qs, answers: {}, results: rs, earned: 1, total: 1, percent: 100 });
    logAttempts(rs, 'p1', 5);
    expect(getHistory()[0].id).toBe('ex1');
    expect(getAttempts()).toHaveLength(1);
  });
});

describe('domínio por tema', () => {
  const at = (score: number, ts: number, difficulty: Attempt['difficulty'] = 'medium', skill = 's'): Attempt => ({
    qid: `q${ts}`,
    topic: 'dupont',
    skill,
    difficulty,
    level: 'calculation',
    score,
    ts,
    kind: 'p1',
  });

  it('poucas tentativas não geram domínio máximo; acertos consistentes aproximam de 100', () => {
    expect(masteryScore([])).toBeNull();
    expect(masteryScore([at(1, 1)])!).toBeLessThan(60);
    const many = Array.from({ length: 15 }, (_, i) => at(1, i));
    expect(masteryScore(many)!).toBeGreaterThan(85);
  });

  it('erros recentes pesam mais que erros antigos', () => {
    const oldErrors = [at(0, 1), at(0, 2), at(1, 3), at(1, 4), at(1, 5)];
    const newErrors = [at(1, 1), at(1, 2), at(1, 3), at(0, 4), at(0, 5)];
    expect(masteryScore(oldErrors)!).toBeGreaterThan(masteryScore(newErrors)!);
  });

  it('acerto em questão difícil vale mais; recuperação após erro dá bônus', () => {
    expect(masteryScore([at(1, 1, 'hard')])!).toBeGreaterThan(masteryScore([at(1, 1, 'easy')])!);
    const recovered = [at(0, 1, 'medium', 'x'), at(1, 2, 'medium', 'x')];
    const notRecovered = [at(1, 1, 'medium', 'x'), at(0, 2, 'medium', 'y')];
    expect(masteryScore(recovered)!).toBeGreaterThan(masteryScore(notRecovered)!);
  });
});

describe('prova adaptativa', () => {
  it('sobe de nível após 2 acertos e volta aos fundamentos ao errar DuPont', () => {
    let s = startAdaptive(['dupont'], 20);
    expect(s.current).toMatchObject({ topic: 'dupont', difficulty: 'medium' });
    s = recordAnswer(s, 'a', true);
    s = recordAnswer(s, 'b', true);
    expect(s.current).toMatchObject({ topic: 'dupont', difficulty: 'hard' });
    s = recordAnswer(s, 'c', false);
    expect(s.levels.dupont).toBe('medium');
    expect(s.queue.map((q) => q.topic)).toEqual(['margens', 'giro', 'alavancagem', 'dupont']);
    s = recordAnswer(s, 'd', true); // margens
    s = recordAnswer(s, 'e', true); // giro
    s = recordAnswer(s, 'f', true); // alavancagem
    expect(s.current?.topic).toBe('dupont');
    expect(s.current?.reason).toMatch(/Recompondo/);
  });

  it('encerra ao atingir o número máximo de questões', () => {
    let s = startAdaptive(['bp'], 2);
    s = recordAnswer(s, 'a', true);
    s = recordAnswer(s, 'b', false);
    expect(s.current).toBeNull();
  });
});
