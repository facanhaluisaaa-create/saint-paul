import { describe, expect, it } from 'vitest';
import type { Question } from '../shared/types';
import { gradeQuestion, toPublic } from '../server/grading';
import { gradeEssayKeywords } from '../server/essay';
import { QUESTION_BANK } from '../server/questions/index';
import { validateBank } from '../server/validate';
import { buildExam, apportion } from '../server/selection';
import { handleApi } from '../server/api';
import { GROUPS, groupOf } from '../shared/topics';

process.env.GRADER_LLM = 'off';

const base = {
  topic: 'margens' as const,
  skill: 'ml-calculo',
  dataSource: 'conceitual' as const,
  difficulty: 'easy' as const,
  cognitiveLevel: 'calculation' as const,
  explanation: 'Margem líquida divide o lucro líquido pela receita líquida.',
  reasoningSteps: ['a', 'b'],
  sourceReference: 'Aula 5',
};

const numeric: Question = {
  ...base,
  id: 't-num',
  type: 'numeric',
  stem: 'Receita 1.000, LL 180. Margem líquida?',
  correct: 18,
  unit: 'percent',
  decimals: 1,
  calc: { fn: 'margem', args: [180, 1000] },
  solution: { formula: 'ML = LL/RL', substitution: '180/1000', computation: '0,18', result: '18%', unit: '%', interpretation: 'R$ 18 a cada R$ 100' },
};

const mc: Question = {
  ...base,
  id: 't-mc',
  type: 'multiple-choice',
  stem: 'Margem?',
  options: [
    { id: 'A', text: '18%' },
    { id: 'B', text: '0,18%', whyWrong: 'Erro de escala.' },
    { id: 'C', text: '82%', whyWrong: 'Complemento.' },
    { id: 'D', text: '22%', whyWrong: 'Inverteu.' },
  ],
  correct: 'A',
};

describe('correção objetiva', () => {
  it('numérica aceita 18 / 18% / 0,18 e indica erro de escala', async () => {
    for (const v of ['18', '18%', '0,18']) expect((await gradeQuestion(numeric, { kind: 'number', value: v })).status).toBe('correct');
    const wrong = await gradeQuestion(numeric, { kind: 'number', value: '0,18%' });
    expect(wrong.status).toBe('wrong');
    expect(wrong.whyWrong).toMatch(/escala/i);
    expect((await gradeQuestion(numeric, undefined)).status).toBe('blank');
  });

  it('múltipla escolha devolve o porquê do erro', async () => {
    const r = await gradeQuestion(mc, { kind: 'choice', value: 'B' });
    expect(r.earned).toBe(0);
    expect(r.whyWrong).toBe('Erro de escala.');
    expect((await gradeQuestion(mc, { kind: 'choice', value: 'A' })).earned).toBe(1);
  });

  it('débito/crédito e classificação dão pontuação parcial', async () => {
    const dc: Question = {
      ...base,
      id: 't-dc',
      type: 'debit-credit',
      stem: 'Compra de veículo à vista',
      operation: 'Compra de veículo à vista por R$ 50.000',
      accounts: [
        { id: 'v', label: 'Veículos' },
        { id: 'c', label: 'Caixa' },
      ],
      correct: { v: 'D', c: 'C' },
    };
    const r = await gradeQuestion(dc, { kind: 'map', value: { v: 'D', c: 'D' } });
    expect(r.earned).toBe(0.5);
    expect(r.status).toBe('partial');
  });

  it('multipartes soma pontos das partes', async () => {
    const mp: Question = {
      ...base,
      id: 't-mp',
      type: 'multi-part',
      stem: 'Receita 1.000; LL 120.',
      parts: [
        { ...numeric, id: 'a', kind: 'numeric', prompt: 'Calcule', points: 2, correct: 12, calc: { fn: 'margem', args: [120, 1000] } } as any,
        {
          id: 'b',
          kind: 'choice',
          prompt: 'Interprete',
          points: 1,
          options: [
            { id: 'A', text: 'R$ 12 a cada R$ 100' },
            { id: 'B', text: 'R$ 0,12 a cada R$ 100' },
          ],
          correct: 'A',
        },
      ],
    };
    const r = await gradeQuestion(mp, { kind: 'parts', value: { a: '12%', b: 'B' } });
    expect(r.earned).toBeCloseTo(2 / 3, 3);
  });
});

describe('discursivas (fallback determinístico)', () => {
  const rubric = {
    criteria: [
      { id: 'c1', description: 'competência', points: 5, keywords: [['competen']] },
      { id: 'c2', description: 'caixa', points: 5, keywords: [['caixa', 'pag'], ['caixa', 'receb']] },
    ],
    seriousErrors: [{ description: 'Disse que lucro é caixa', patterns: ['lucro e caixa sao iguais'], penalty: 3 }],
    modelAnswer: 'A DRE segue competência; o caixa registra pagamentos e recebimentos quando ocorrem.',
  };

  it('pontua por conceito', () => {
    const g = gradeEssayKeywords('A DRE usa o regime de competência, já a DFC registra o caixa quando há recebimento ou pagamento efetivo.', rubric);
    expect(g.earned).toBe(10);
    const h = gradeEssayKeywords('A DRE usa o regime de competência e reconhece receitas quando ocorrem.', rubric);
    expect(h.earned).toBe(5);
  });

  it('não premia lista de palavras soltas', () => {
    const g = gradeEssayKeywords('competencia caixa pagamento recebimento', rubric);
    expect(g.earned).toBeLessThan(10);
  });

  it('resposta sem número vale no máximo metade quando a rubrica exige números', () => {
    const r = { ...rubric, requireNumbers: true };
    const g = gradeEssayKeywords('A DRE usa o regime de competência, já a DFC registra o caixa quando há recebimento ou pagamento efetivo.', r);
    expect(g.earned).toBe(5);
    expect(g.seriousErrors.some((e) => /sem número/i.test(e))).toBe(true);
    const h = gradeEssayKeywords('A DRE usa o regime de competência (receita de 88.242), já a DFC registra o caixa quando há recebimento ou pagamento efetivo.', r);
    expect(h.earned).toBe(10);
  });

  it('desconta erro conceitual grave', () => {
    const g = gradeEssayKeywords('No regime de competência, lucro e caixa são iguais porque todo recebimento entra no caixa da empresa sempre.', rubric);
    expect(g.seriousErrors.length).toBe(1);
    expect(g.earned).toBeLessThan(10);
  });
});

describe('banco de questões', () => {
  it('tem pelo menos 150 questões e nenhuma inconsistência', () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(150);
    const errors = validateBank(QUESTION_BANK).filter((i) => i.level === 'error');
    expect(errors).toEqual([]);
  });

  it('versão pública não vaza gabarito, explicação ou rubrica', () => {
    for (const q of QUESTION_BANK) {
      const pub = JSON.stringify(toPublic(q, { revealMeta: false }));
      for (const k of ['"correct"', '"explanation"', '"rubric"', '"whyWrong"', '"reasoningSteps"', '"calc"', '"solution"', '"modelAnswer"', '"topic"', '"skill"']) {
        expect(pub.includes(k), `${q.id} vaza ${k}`).toBe(false);
      }
    }
  });

  it('ordenação pública vem embaralhada', () => {
    for (const q of QUESTION_BANK.filter((x) => x.type === 'ordering')) {
      const pub = toPublic(q, { revealMeta: false });
      expect(pub.items!.map((i) => i.id)).not.toEqual((q as any).items.map((i: any) => i.id));
    }
  });
});

describe('montagem do simulado P1', () => {
  it('distribui por grupo conforme o blueprint (25 questões)', () => {
    const quotas = apportion({ a: 3, b: 4, c: 4, d: 3, e: 3, f: 2, g: 4, h: 2 }, 25);
    expect(Object.values(quotas).reduce((a, b) => a + b, 0)).toBe(25);
    const exam = buildExam(QUESTION_BANK, { mode: 'p1', count: 25 });
    expect(exam.length).toBe(25);
    expect(new Set(exam.map((q) => q.id)).size).toBe(25);
    const byGroup: Record<string, number> = {};
    for (const q of exam) byGroup[groupOf(q.topic)] = (byGroup[groupOf(q.topic)] ?? 0) + 1;
    for (const [g, meta] of Object.entries(GROUPS)) expect(byGroup[g]).toBe(meta.p1Weight);
    const hard = exam.filter((q) => q.difficulty === 'hard').length;
    const easy = exam.filter((q) => q.difficulty === 'easy').length;
    expect(hard).toBeGreaterThanOrEqual(4);
    expect(easy).toBeGreaterThanOrEqual(4);
    expect(exam.filter((q) => q.type === 'essay' || q.type === 'short-answer').length).toBeLessThanOrEqual(3);
  });

  it('evita questões vistas recentemente', () => {
    const now = Date.now();
    const first = buildExam(QUESTION_BANK, { mode: 'p1', count: 25 });
    const seen = Object.fromEntries(first.map((q) => [q.id, now]));
    let overlap = 0;
    for (let i = 0; i < 5; i++) overlap += buildExam(QUESTION_BANK, { mode: 'p1', count: 25, seen }).filter((q) => seen[q.id]).length;
    expect(overlap / 5).toBeLessThan(6);
  });

  it('revisão prioriza variações das habilidades erradas, não as mesmas questões', () => {
    const wrong = QUESTION_BANK.find((q) => q.skill && QUESTION_BANK.filter((x) => x.skill === q.skill).length >= 3)!;
    const exam = buildExam(QUESTION_BANK, { mode: 'review', count: 5, wrongSkills: [wrong.skill], wrongIds: [wrong.id] });
    expect(exam.some((q) => q.skill === wrong.skill && q.id !== wrong.id)).toBe(true);
  });
});

describe('modo roteiro (formato da prova)', () => {
  it('monta as 12 perguntas do caso em ordem de parte, com rubrica que exige números', () => {
    for (const caseId of ['ambev', 'renner', 'rot-varejo', 'rot-industria']) {
      const exam = buildExam(QUESTION_BANK, { mode: 'roteiro', caseId, count: 12 });
      expect(exam.length, caseId).toBe(12);
      const parts = exam.map((q) => q.roteiro!.part);
      expect([...parts].sort((a, b) => a - b), caseId).toEqual(parts);
      expect(parts.filter((p) => p === 1).length, caseId).toBe(4);
      expect(parts.filter((p) => p === 2).length, caseId).toBe(5);
      expect(parts.filter((p) => p === 3).length, caseId).toBe(3);
      for (const q of exam) {
        expect(q.type === 'essay' || q.type === 'short-answer' || q.type === 'multi-part', q.id).toBe(true);
        if (q.type === 'essay' || q.type === 'short-answer') expect(q.rubric.requireNumbers, q.id).toBe(true);
        expect((q.tables?.length ?? 0) + (q.table ? 1 : 0), q.id).toBeGreaterThan(0);
      }
    }
  });

  it('questões do roteiro e temas fora dos slides não entram na prova mista', () => {
    for (let i = 0; i < 5; i++) {
      const exam = buildExam(QUESTION_BANK, { mode: 'p1', count: 25 });
      expect(exam.some((q) => q.roteiro)).toBe(false);
      expect(exam.some((q) => q.topic === 'mc-pe' || q.topic === 'equivalencia')).toBe(false);
    }
  });

  it('API devolve o anexo e a parte de cada pergunta no modo roteiro', async () => {
    const r = (await handleApi('POST', '/api/exam', { mode: 'roteiro', caseId: 'renner', count: 12 }, { dev: false })) as any;
    expect(r.status).toBe(200);
    expect(r.json.caseTables.length).toBeGreaterThanOrEqual(3);
    expect(r.json.questions.map((q: any) => q.roteiroPart)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3]);
    expect(JSON.stringify(r.json)).not.toContain('modelAnswer');
    const cases = (await handleApi('GET', '/api/cases', undefined, { dev: false })) as any;
    expect(cases.json.cases.map((c: any) => c.id)).toEqual(['ambev', 'renner', 'rot-varejo', 'rot-industria']);
  });

  it('resposta do roteiro sem números é limitada a metade pela API', async () => {
    const exam = buildExam(QUESTION_BANK, { mode: 'roteiro', caseId: 'ambev', count: 12 });
    const q = exam.find((x) => x.type === 'essay')!;
    const g = (await handleApi('POST', '/api/grade', { items: [{ id: q.id, answer: { kind: 'text', value: (q as any).rubric.modelAnswer.replace(/[\d.,%]+/g, 'x') } }] }, { dev: false })) as any;
    expect(g.json.results[0].earned).toBeLessThanOrEqual(0.5);
    const h = (await handleApi('POST', '/api/grade', { items: [{ id: q.id, answer: { kind: 'text', value: (q as any).rubric.modelAnswer } }] }, { dev: false })) as any;
    expect(h.json.results[0].earned).toBeGreaterThan(0.8);
  });
});

describe('API', () => {
  it('modo prova não envia tema; correção devolve feedback completo', async () => {
    const r = (await handleApi('POST', '/api/exam', { mode: 'p1', count: 10, revealMeta: false }, { dev: false })) as any;
    expect(r.status).toBe(200);
    expect(r.json.questions.every((q: any) => q.topic === undefined)).toBe(true);
    const g = (await handleApi('POST', '/api/grade', { items: [{ id: r.json.questions[0].id }] }, { dev: false })) as any;
    expect(g.json.results[0].status).toBe('blank');
    expect(g.json.results[0].explanation.length).toBeGreaterThan(10);
  });

  it('rota de auditoria só existe em desenvolvimento', async () => {
    expect((await handleApi('GET', '/api/dev/bank', undefined, { dev: false })).status).toBe(404);
    expect((await handleApi('GET', '/api/dev/bank', undefined, { dev: true })).status).toBe(200);
  });
});
