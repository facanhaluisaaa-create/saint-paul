import type { Question, Part } from '../shared/types';
import { runCalc, round } from '../shared/finance';
import { defaultTolerance, parseNumberInput } from '../shared/numeric';
import { TOPICS } from '../shared/topics';

export interface ValidationIssue {
  id: string;
  level: 'error' | 'warning';
  message: string;
}

function checkNumeric(
  id: string,
  label: string,
  q: { correct: number; unit: any; decimals: number; tolerance?: number; calc: { fn: any; args: number[] } },
  issues: ValidationIssue[],
) {
  let computed: number;
  try {
    computed = runCalc(q.calc.fn, q.calc.args);
  } catch (e) {
    issues.push({ id, level: 'error', message: `${label}: falha ao executar calc ${q.calc.fn}: ${e}` });
    return;
  }
  if (!Number.isFinite(computed)) {
    issues.push({ id, level: 'error', message: `${label}: calc retornou valor não finito` });
    return;
  }
  const tol = q.tolerance ?? defaultTolerance(q.unit, q.decimals);
  const rounded = round(computed, q.decimals);
  if (Math.abs(rounded - q.correct) > tol / 2 + 1e-9) {
    issues.push({
      id,
      level: 'error',
      message: `${label}: gabarito ${q.correct} difere do recálculo ${rounded} (${q.calc.fn}(${q.calc.args.join(', ')}))`,
    });
  }
}

function numbersIn(text: string): number[] {
  const out: number[] = [];
  const re = /[-−]?\d[\d.,]*/g;
  for (const m of text.match(re) ?? []) {
    const p = parseNumberInput(m.replace('−', '-').replace(/[.,]$/, ''));
    if (p) out.push(p.value);
  }
  return out;
}

function checkRubric(id: string, label: string, rubric: any, expectedTotal: number, issues: ValidationIssue[]) {
  if (!rubric || !Array.isArray(rubric.criteria) || rubric.criteria.length === 0) {
    issues.push({ id, level: 'error', message: `${label}: rubrica ausente` });
    return;
  }
  const total = rubric.criteria.reduce((s: number, c: any) => s + c.points, 0);
  if (Math.abs(total - expectedTotal) > 1e-9) {
    issues.push({ id, level: 'error', message: `${label}: rubrica soma ${total}, esperado ${expectedTotal}` });
  }
  for (const c of rubric.criteria) {
    if (!c.keywords?.length || c.keywords.some((g: string[]) => !g.length)) {
      issues.push({ id, level: 'error', message: `${label}: critério ${c.id} sem palavras-chave` });
    }
  }
  if (!rubric.modelAnswer || rubric.modelAnswer.length < 40) {
    issues.push({ id, level: 'error', message: `${label}: resposta-modelo ausente ou curta` });
  }
}

export function validateQuestion(q: Question, issues: ValidationIssue[]) {
  const id = q.id;
  const req = (cond: unknown, msg: string) => {
    if (!cond) issues.push({ id, level: 'error', message: msg });
  };
  req(q.stem && q.stem.length > 10, 'enunciado ausente');
  req(q.explanation && q.explanation.length > 30, 'explicação ausente/curta');
  req(Array.isArray(q.reasoningSteps) && q.reasoningSteps.length >= 2, 'reasoningSteps precisa de ≥ 2 passos');
  req(q.sourceReference, 'sourceReference ausente');
  req(q.skill, 'skill ausente');
  req(q.topic in TOPICS, `tema inválido: ${q.topic}`);
  if (q.caseTag === 'ambev') req(q.dataSource === 'real-ambev', 'questão Ambev deve ter dataSource real-ambev');
  if (!q.rule) issues.push({ id, level: 'warning', message: 'sem regra transferível (rule)' });

  for (const b of q.balanceCheck ?? []) {
    if (Math.abs(b.ativo - (b.passivo + b.pl)) > 0.5) {
      issues.push({ id, level: 'error', message: `balanço "${b.label}" não fecha: A=${b.ativo} ≠ P+PL=${b.passivo + b.pl}` });
    }
  }

  switch (q.type) {
    case 'multiple-choice': {
      req(q.options.length >= 4 && q.options.length <= 5, 'múltipla escolha deve ter 4 ou 5 alternativas');
      const ids = q.options.map((o) => o.id);
      req(new Set(ids).size === ids.length, 'ids de alternativas repetidos');
      req(ids.includes(q.correct), `alternativa correta ${q.correct} inexistente`);
      const texts = q.options.map((o) => o.text.trim().toLowerCase());
      req(new Set(texts).size === texts.length, 'alternativas com texto repetido');
      for (const o of q.options) {
        if (o.id !== q.correct && !o.whyWrong) issues.push({ id, level: 'warning', message: `alternativa ${o.id} sem whyWrong` });
      }
      if (q.calc) {
        const computed = runCalc(q.calc.fn, q.calc.args);
        const correctText = q.options.find((o) => o.id === q.correct)?.text ?? '';
        const nums = numbersIn(correctText);
        const match = (v: number) => nums.some((n) => Math.abs(n - v) <= Math.max(Math.abs(v) * 0.006, 0.006));
        if (!match(computed)) {
          issues.push({ id, level: 'error', message: `MC calc ${computed.toFixed(4)} não aparece na alternativa correta "${correctText}"` });
        }
        for (const o of q.options) {
          if (o.id === q.correct) continue;
          const ns = numbersIn(o.text);
          if (ns.length && ns.every((n) => Math.abs(n - computed) <= Math.max(Math.abs(computed) * 0.002, 0.002)) && nums.length === ns.length) {
            issues.push({ id, level: 'error', message: `alternativa ${o.id} também corresponde ao valor correto` });
          }
        }
      }
      break;
    }
    case 'true-false':
      req(typeof q.correct === 'boolean', 'V/F sem gabarito booleano');
      break;
    case 'numeric':
      req(q.solution, 'numérica sem solution');
      checkNumeric(id, 'numérica', q, issues);
      break;
    case 'short-answer':
    case 'essay':
      checkRubric(id, q.type, q.rubric, 10, issues);
      break;
    case 'classification': {
      const cats = new Set(q.categories.map((c) => c.id));
      for (const it of q.items) req(cats.has(q.correct[it.id]), `item ${it.id} sem categoria válida`);
      req(q.items.length >= 3, 'classificação precisa de ≥ 3 itens');
      break;
    }
    case 'debit-credit': {
      const vals = q.accounts.map((a) => q.correct[a.id]);
      req(vals.every((v) => v === 'D' || v === 'C'), 'débito/crédito: conta sem D/C');
      req(vals.includes('D') && vals.includes('C'), 'partidas dobradas: precisa de ao menos um débito e um crédito');
      break;
    }
    case 'ordering':
      req(q.items.length >= 3, 'ordenação precisa de ≥ 3 itens');
      break;
    case 'multi-part': {
      req(q.parts.length >= 2, 'multipartes precisa de ≥ 2 partes');
      for (const p of q.parts as Part[]) {
        if (p.kind === 'numeric') checkNumeric(id, `parte ${p.id}`, p, issues);
        if (p.kind === 'choice') req(p.options.some((o) => o.id === p.correct), `parte ${p.id}: alternativa correta inexistente`);
        if (p.kind === 'text') checkRubric(id, `parte ${p.id}`, p.rubric, p.points, issues);
      }
      break;
    }
  }
}

export function validateBank(bank: Question[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (const q of bank) {
    if (seen.has(q.id)) issues.push({ id: q.id, level: 'error', message: 'id duplicado' });
    seen.add(q.id);
    validateQuestion(q, issues);
  }
  return issues;
}
