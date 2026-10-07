// API independente de framework. O gabarito nunca sai do servidor antes da correção.
import type { Answer, Difficulty } from '../shared/types';
import { TOPICS, type TopicId } from '../shared/topics';
import { QUESTION_BANK, QUESTION_BY_ID } from './questions/index';
import { gradeQuestion, toPublic } from './grading';
import { buildExam, pickAdaptive, pickFixation, type BuildRequest, type StudentSignals } from './selection';
import { llmEnabled } from './llm';
import { validateBank } from './validate';

export interface ApiResponse {
  status: number;
  json: unknown;
}

const ok = (json: unknown): ApiResponse => ({ status: 200, json });
const bad = (msg: string, status = 400): ApiResponse => ({ status, json: { error: msg } });

function sanitizeSignals(body: any): StudentSignals {
  const sig = body?.signals ?? {};
  return {
    seen: typeof sig.seen === 'object' && sig.seen ? sig.seen : {},
    mastery: typeof sig.mastery === 'object' && sig.mastery ? sig.mastery : {},
    wrongSkills: Array.isArray(sig.wrongSkills) ? sig.wrongSkills.slice(0, 500) : [],
    wrongIds: Array.isArray(sig.wrongIds) ? sig.wrongIds.slice(0, 500) : [],
  };
}

export async function handleApi(method: string, path: string, body: any, opts: { dev: boolean }): Promise<ApiResponse> {
  const url = new URL(path, 'http://local');
  const p = url.pathname;

  if (method === 'GET' && p === '/api/health') {
    return ok({ questions: QUESTION_BANK.length, llm: llmEnabled() });
  }

  if (method === 'GET' && p === '/api/catalog') {
    const byTopic: Record<string, number> = {};
    for (const q of QUESTION_BANK) byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
    return ok({
      total: QUESTION_BANK.length,
      byTopic,
      ambev: QUESTION_BANK.filter((q) => q.caseTag === 'ambev').length,
      llm: llmEnabled(),
    });
  }

  if (method === 'POST' && p === '/api/exam') {
    const mode = body?.mode as BuildRequest['mode'];
    if (!['p1', 'topic', 'review', 'ambev', 'mixed'].includes(mode)) return bad('modo inválido');
    const topics = Array.isArray(body?.topics) ? (body.topics as string[]).filter((t): t is TopicId => t in TOPICS) : undefined;
    const qs = buildExam(QUESTION_BANK, {
      mode,
      count: Number(body?.count) || 25,
      topics,
      exclude: Array.isArray(body?.exclude) ? body.exclude : [],
      ...sanitizeSignals(body),
    });
    // No modo prova o tema NÃO é enviado.
    const revealMeta = body?.revealMeta === true;
    return ok({ questions: qs.map((q) => toPublic(q, { revealMeta })) });
  }

  if (method === 'POST' && p === '/api/grade') {
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length > 80) return bad('itens demais');
    const inExam = new Set<string>(items.map((i: any) => String(i.id)));
    const results = [];
    for (const it of items) {
      const q = QUESTION_BY_ID.get(String(it.id));
      if (!q) return bad(`questão desconhecida: ${it.id}`, 404);
      const graded = await gradeQuestion(q, it.answer as Answer | undefined);
      if (body?.withFixation !== false && graded.status !== 'correct') {
        const fx = pickFixation(QUESTION_BANK, q, inExam);
        if (fx) graded.fixation = toPublic(fx, { revealMeta: true });
      }
      results.push(graded);
    }
    return ok({ results });
  }

  if (method === 'POST' && p === '/api/aids') {
    // Apoios do modo estudo: nunca revelam o gabarito.
    const q = QUESTION_BY_ID.get(String(body?.id));
    if (!q) return bad('questão desconhecida', 404);
    const kind = body?.kind;
    const text =
      kind === 'hint'
        ? q.hint ?? q.reasoningSteps[0]
        : kind === 'formula'
          ? q.formula ?? 'Esta questão não depende de fórmula: identifique o conceito envolvido.'
          : kind === 'concept'
            ? q.concept ?? q.explanation.split('. ')[0] + '.'
            : null;
    if (text == null) return bad('tipo de apoio inválido');
    return ok({ text, sourceReference: q.sourceReference });
  }

  if (method === 'POST' && p === '/api/adaptive/next') {
    const topic = body?.topic as TopicId;
    if (!(topic in TOPICS)) return bad('tema inválido');
    const difficulty = (['easy', 'medium', 'hard'].includes(body?.difficulty) ? body.difficulty : 'medium') as Difficulty;
    const q = pickAdaptive(QUESTION_BANK, topic, difficulty, Array.isArray(body?.exclude) ? body.exclude : [], sanitizeSignals(body));
    return ok({ question: q ? toPublic(q, { revealMeta: true }) : null });
  }

  const single = p.match(/^\/api\/question\/([\w-]+)$/);
  if (method === 'GET' && single) {
    const q = QUESTION_BY_ID.get(single[1]);
    if (!q) return bad('questão desconhecida', 404);
    return ok({ question: toPublic(q, { revealMeta: url.searchParams.get('meta') === '1' }) });
  }

  if (method === 'GET' && p === '/api/dev/bank') {
    if (!opts.dev) return bad('disponível apenas em desenvolvimento', 404);
    return ok({ questions: QUESTION_BANK, issues: validateBank(QUESTION_BANK) });
  }

  return bad('rota não encontrada', 404);
}
