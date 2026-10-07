import type { Answer, Difficulty, GradedQuestion, PublicQuestion } from '../../shared/types';
import type { TopicId } from '../../shared/topics';
import { studentSignals } from './progress';

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `Erro ${res.status}`);
  return json as T;
}

export interface Catalog {
  total: number;
  byTopic: Record<string, number>;
  ambev: number;
  llm: boolean;
}

export const api = {
  catalog: () => call<Catalog>('GET', '/api/catalog'),
  buildExam: (opts: { mode: 'p1' | 'topic' | 'review' | 'ambev' | 'mixed'; count: number; topics?: TopicId[]; revealMeta: boolean; wrongSkills?: string[]; wrongIds?: string[] }) => {
    const signals = studentSignals();
    if (opts.wrongSkills) signals.wrongSkills = opts.wrongSkills;
    if (opts.wrongIds) signals.wrongIds = opts.wrongIds;
    return call<{ questions: PublicQuestion[] }>('POST', '/api/exam', { ...opts, signals }).then((r) => r.questions);
  },
  grade: (items: { id: string; answer?: Answer }[], withFixation = true) =>
    call<{ results: GradedQuestion[] }>('POST', '/api/grade', { items, withFixation }).then((r) => r.results),
  aids: (id: string, kind: 'hint' | 'formula' | 'concept') => call<{ text: string; sourceReference: string }>('POST', '/api/aids', { id, kind }),
  adaptiveNext: (topic: TopicId, difficulty: Difficulty, exclude: string[]) =>
    call<{ question: PublicQuestion | null }>('POST', '/api/adaptive/next', { topic, difficulty, exclude, signals: studentSignals() }).then((r) => r.question),
  devBank: () => call<{ questions: any[]; issues: { id: string; level: string; message: string }[] }>('GET', '/api/dev/bank'),
};
