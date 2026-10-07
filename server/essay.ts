import type { CriterionResult, Rubric } from '../shared/types';

/** Minúsculas, sem acentos, espaços normalizados. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%,.\s/=+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface EssayGrade {
  /** Pontos na escala da rubrica. */
  earned: number;
  total: number;
  criteria: CriterionResult[];
  seriousErrors: string[];
  method: 'keywords' | 'llm';
}

/**
 * Correção determinística (fallback): critério atendido se o texto contiver todas as
 * palavras de algum grupo de sinônimos. Respostas muito curtas não pontuam; repetição
 * de palavras soltas não é premiada (exige ≥ 6 palavras distintas por critério atendido).
 */
export function gradeEssayKeywords(text: string, rubric: Rubric): EssayGrade {
  const norm = normalizeText(text ?? '');
  const words = norm.split(' ').filter(Boolean);
  const distinct = new Set(words).size;
  const total = rubric.criteria.reduce((s, c) => s + c.points, 0);

  const criteria: CriterionResult[] = rubric.criteria.map((c) => {
    const met =
      words.length >= 4 &&
      c.keywords.some((group) => group.every((kw) => norm.includes(normalizeText(kw))));
    return { id: c.id, description: c.description, points: c.points, earned: met ? c.points : 0, met };
  });

  // Anti-"lista de palavras": se o texto é curto demais para os critérios atendidos, reduz.
  const metCount = criteria.filter((c) => c.met).length;
  if (metCount > 0 && distinct < metCount * 6) {
    const factor = Math.max(0.4, distinct / (metCount * 6));
    for (const c of criteria) c.earned = Math.round(c.earned * factor * 10) / 10;
  }

  const seriousErrors: string[] = [];
  let penalty = 0;
  for (const e of rubric.seriousErrors ?? []) {
    if (e.patterns.some((p) => norm.includes(normalizeText(p)))) {
      seriousErrors.push(e.description);
      penalty += e.penalty;
    }
  }
  const raw = criteria.reduce((s, c) => s + c.earned, 0);
  let earned = Math.max(0, Math.min(total, raw - penalty));
  if (rubric.requireNumbers && !/\d/.test(text ?? '')) {
    earned = Math.min(earned, total / 2);
    seriousErrors.push('Resposta sem números: na prova, resposta sem número vale no máximo metade. Cite os valores, A.V. e A.H. que sustentam a análise.');
  }
  return { earned, total, criteria, seriousErrors, method: 'keywords' };
}
