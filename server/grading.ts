import type {
  Answer,
  GradedQuestion,
  Part,
  PartResult,
  PublicPart,
  PublicQuestion,
  Question,
  Rubric,
} from '../shared/types';
import { formatWithUnit, isNumericCorrect, normalizeToUnit, formatNumber } from '../shared/numeric';
import { gradeEssayKeywords, type EssayGrade } from './essay';
import { gradeEssayLLM, llmEnabled } from './llm';

// ---------------------------------------------------------------------------
// Versão pública (sem gabarito)

/** Embaralhamento determinístico por id (mesma ordem sempre para a mesma questão). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Garante que a ordem embaralhada não coincida com a correta.
  if (arr.every((x, i) => x === items[i]) && arr.length > 1) arr.push(arr.shift()!);
  return arr;
}

function publicPart(p: Part): PublicPart {
  if (p.kind === 'numeric') return { id: p.id, kind: 'numeric', prompt: p.prompt, unit: p.unit, decimals: p.decimals, points: p.points };
  if (p.kind === 'choice')
    return { id: p.id, kind: 'choice', prompt: p.prompt, options: p.options.map((o) => ({ id: o.id, text: o.text })), points: p.points };
  return { id: p.id, kind: 'text', prompt: p.prompt, points: p.points };
}

export function toPublic(q: Question, opts: { revealMeta: boolean }): PublicQuestion {
  const base: PublicQuestion = {
    id: q.id,
    type: q.type,
    stem: q.stem,
    context: q.context,
    tables: q.tables ?? (q.table ? [q.table] : undefined),
    dataSource: q.dataSource,
    roteiroPart: q.roteiro?.part,
    points: 1,
  };
  if (opts.revealMeta) {
    base.topic = q.topic;
    base.difficulty = q.difficulty;
    base.cognitiveLevel = q.cognitiveLevel;
  }
  switch (q.type) {
    case 'multiple-choice':
      base.options = q.options.map((o) => ({ id: o.id, text: o.text }));
      break;
    case 'numeric':
      base.unit = q.unit;
      base.decimals = q.decimals;
      break;
    case 'classification':
      base.items = q.items;
      base.categories = q.categories;
      break;
    case 'debit-credit':
      base.operation = q.operation;
      base.accounts = q.accounts;
      break;
    case 'ordering':
      base.items = seededShuffle(q.items, q.id);
      break;
    case 'multi-part':
      base.parts = q.parts.map(publicPart);
      break;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Correção

export function isObjective(q: Question): boolean {
  if (q.type === 'essay' || q.type === 'short-answer') return false;
  if (q.type === 'multi-part') return !q.parts.some((p) => p.kind === 'text');
  return true;
}

async function gradeRubric(stem: string, text: string, rubric: Rubric): Promise<EssayGrade> {
  if (text.trim().length >= 15 && llmEnabled()) {
    try {
      return await gradeEssayLLM(stem, text, rubric);
    } catch (e) {
      console.warn('[grader] LLM indisponível, usando palavras-chave:', (e as Error).message);
    }
  }
  return gradeEssayKeywords(text, rubric);
}

function scaleHint(raw: string, unit: string, expected: number): string | undefined {
  const v = normalizeToUnit(raw, unit as any, expected);
  if (v == null || expected === 0) return undefined;
  const ratio = v / expected;
  if (Math.abs(ratio - 0.01) < 0.002 || Math.abs(ratio - 100) < 2)
    return 'Erro de escala: o valor está 100 vezes maior ou menor. Lembre que 0,18 = 18% (e não 0,18%).';
  if (Math.abs(ratio + 1) < 0.02) return 'O módulo está certo, mas o sinal está trocado. Em A.H., queda é variação negativa.';
  if (expected !== 0 && Math.abs(v - (100 - expected)) < 0.2 && unit === 'percent')
    return 'Você calculou o complemento (100% − resposta). Verifique o numerador da fórmula.';
  return undefined;
}

const blankAnswer = (a: Answer | undefined): boolean => {
  if (!a) return true;
  switch (a.kind) {
    case 'choice':
    case 'number':
    case 'text':
      return !String(a.value ?? '').trim();
    case 'boolean':
      return typeof a.value !== 'boolean';
    case 'map':
    case 'parts':
      return Object.values(a.value ?? {}).every((v) => !String(v ?? '').trim());
    case 'order':
      return !a.value?.length;
  }
};

export async function gradeQuestion(q: Question, answer: Answer | undefined): Promise<GradedQuestion> {
  const base: GradedQuestion = {
    id: q.id,
    topic: q.topic,
    skill: q.skill,
    difficulty: q.difficulty,
    cognitiveLevel: q.cognitiveLevel,
    type: q.type,
    dataSource: q.dataSource,
    caseTag: q.caseTag,
    roteiro: q.roteiro,
    earned: 0,
    points: 1,
    status: 'wrong',
    objective: isObjective(q),
    userAnswer: '—',
    correctAnswer: '',
    explanation: q.explanation,
    reasoningSteps: q.reasoningSteps,
    commonMistake: q.commonMistake,
    rule: q.rule,
    formula: q.formula,
    sourceReference: q.sourceReference,
    gradingMethod: 'exact',
  };
  const blank = blankAnswer(answer);

  switch (q.type) {
    case 'multiple-choice': {
      const correct = q.options.find((o) => o.id === q.correct)!;
      base.correctAnswer = `${correct.id}) ${correct.text}`;
      base.solution = q.solution;
      if (!blank && answer?.kind === 'choice') {
        const chosen = q.options.find((o) => o.id === answer.value);
        base.userAnswer = chosen ? `${chosen.id}) ${chosen.text}` : String(answer.value);
        if (answer.value === q.correct) base.earned = 1;
        else base.whyWrong = chosen?.whyWrong;
      }
      break;
    }
    case 'true-false': {
      base.correctAnswer = q.correct ? 'Verdadeiro' : 'Falso';
      if (!blank && answer?.kind === 'boolean') {
        base.userAnswer = answer.value ? 'Verdadeiro' : 'Falso';
        if (answer.value === q.correct) base.earned = 1;
      }
      break;
    }
    case 'numeric': {
      base.correctAnswer = formatWithUnit(q.correct, q.unit, q.decimals);
      base.solution = q.solution;
      if (!blank && answer?.kind === 'number') {
        base.userAnswer = answer.value;
        if (isNumericCorrect(answer.value, q.unit, q.correct, q.decimals, q.tolerance)) base.earned = 1;
        else base.whyWrong = scaleHint(answer.value, q.unit, q.correct);
      }
      break;
    }
    case 'short-answer':
    case 'essay': {
      base.modelAnswer = q.rubric.modelAnswer;
      base.correctAnswer = q.rubric.modelAnswer;
      const text = answer?.kind === 'text' ? answer.value : '';
      base.userAnswer = text || '—';
      const g = await gradeRubric(q.stem, text, q.rubric);
      base.earned = g.total ? g.earned / g.total : 0;
      base.criteria = g.criteria;
      base.seriousErrors = g.seriousErrors;
      base.gradingMethod = g.method;
      break;
    }
    case 'classification': {
      const user = answer?.kind === 'map' ? answer.value : {};
      const catLabel = (id?: string) => q.categories.find((c) => c.id === id)?.label ?? '—';
      base.itemDetails = q.items.map((it) => ({
        label: it.label,
        user: catLabel(user[it.id]),
        correct: catLabel(q.correct[it.id]),
        ok: user[it.id] === q.correct[it.id],
      }));
      const ok = base.itemDetails.filter((d) => d.ok).length;
      base.earned = ok / q.items.length;
      base.userAnswer = blank ? '—' : `${ok} de ${q.items.length} itens corretos`;
      base.correctAnswer = q.items.map((it) => `${it.label} → ${catLabel(q.correct[it.id])}`).join('; ');
      break;
    }
    case 'debit-credit': {
      const user = answer?.kind === 'map' ? answer.value : {};
      const lbl = (v?: string) => (v === 'D' ? 'Débito' : v === 'C' ? 'Crédito' : '—');
      base.itemDetails = q.accounts.map((a) => ({
        label: a.label,
        user: lbl(user[a.id]),
        correct: lbl(q.correct[a.id]),
        ok: user[a.id] === q.correct[a.id],
      }));
      const ok = base.itemDetails.filter((d) => d.ok).length;
      base.earned = ok / q.accounts.length;
      base.userAnswer = blank ? '—' : `${ok} de ${q.accounts.length} contas corretas`;
      base.correctAnswer = q.accounts.map((a) => `${lbl(q.correct[a.id])}: ${a.label}`).join('; ');
      break;
    }
    case 'ordering': {
      const user = answer?.kind === 'order' ? answer.value : [];
      const lbl = (id?: string) => q.items.find((i) => i.id === id)?.label ?? '—';
      base.itemDetails = q.items.map((it, i) => ({
        label: `${i + 1}ª posição`,
        user: lbl(user[i]),
        correct: it.label,
        ok: user[i] === it.id,
      }));
      const ok = base.itemDetails.filter((d) => d.ok).length;
      base.earned = blank ? 0 : ok / q.items.length;
      base.userAnswer = blank ? '—' : `${ok} de ${q.items.length} posições corretas`;
      base.correctAnswer = q.items.map((i) => i.label).join(' → ');
      break;
    }
    case 'multi-part': {
      const user = answer?.kind === 'parts' ? answer.value : {};
      const totalPts = q.parts.reduce((s, p) => s + p.points, 0);
      const parts: PartResult[] = [];
      let earnedPts = 0;
      let usedLLM = false;
      for (const p of q.parts) {
        const raw = String(user[p.id] ?? '');
        if (p.kind === 'numeric') {
          const ok = raw.trim() !== '' && isNumericCorrect(raw, p.unit, p.correct, p.decimals, p.tolerance);
          earnedPts += ok ? p.points : 0;
          parts.push({
            id: p.id,
            prompt: p.prompt,
            earned: ok ? p.points : 0,
            points: p.points,
            userAnswer: raw || '—',
            correctAnswer: formatWithUnit(p.correct, p.unit, p.decimals),
            solution: p.solution,
          });
        } else if (p.kind === 'choice') {
          const ok = raw === p.correct;
          const opt = p.options.find((o) => o.id === raw);
          const cor = p.options.find((o) => o.id === p.correct)!;
          earnedPts += ok ? p.points : 0;
          parts.push({
            id: p.id,
            prompt: p.prompt,
            earned: ok ? p.points : 0,
            points: p.points,
            userAnswer: opt ? `${opt.id}) ${opt.text}` : '—',
            correctAnswer: `${cor.id}) ${cor.text}${!ok && opt?.whyWrong ? `\nPor que a sua está errada: ${opt.whyWrong}` : ''}`,
          });
        } else {
          const g = await gradeRubric(`${q.stem}\n${p.prompt}`, raw, p.rubric);
          if (g.method === 'llm') usedLLM = true;
          earnedPts += g.earned;
          parts.push({
            id: p.id,
            prompt: p.prompt,
            earned: Math.round(g.earned * 100) / 100,
            points: p.points,
            userAnswer: raw || '—',
            correctAnswer: p.rubric.modelAnswer,
            criteria: g.criteria,
          });
        }
      }
      base.parts = parts;
      base.earned = totalPts ? earnedPts / totalPts : 0;
      base.userAnswer = blank ? '—' : `${formatNumber(earnedPts, 1)} de ${formatNumber(totalPts, 1)} pontos nas partes`;
      base.correctAnswer = parts.map((p) => `${p.id}) ${p.correctAnswer.split('\n')[0]}`).join(' | ');
      base.gradingMethod = q.parts.some((p) => p.kind === 'text') ? (usedLLM ? 'llm' : 'keywords') : 'exact';
      break;
    }
  }

  base.earned = Math.round(base.earned * 1000) / 1000;
  if (blank) base.status = 'blank';
  else if (base.earned >= 0.999) base.status = 'correct';
  else if (base.earned > 0) base.status = 'partial';
  else base.status = 'wrong';
  return base;
}
