// Auditoria das rubricas: a resposta-modelo deve tirar nota alta no corretor
// determinístico; uma resposta vazia de conceitos deve tirar nota baixa.
import { QUESTION_BANK } from '../server/questions/index';
import { gradeEssayKeywords } from '../server/essay';
import type { Rubric } from '../shared/types';

const rows: { id: string; model: number; junk: number }[] = [];
const check = (id: string, r: Rubric) => {
  const total = r.criteria.reduce((s, c) => s + c.points, 0);
  const model = gradeEssayKeywords(r.modelAnswer, r).earned / total;
  const junk = gradeEssayKeywords('Depende da empresa e do contexto, é preciso analisar com cuidado antes de concluir qualquer coisa sobre isso.', r).earned / total;
  rows.push({ id, model, junk });
};
for (const q of QUESTION_BANK) {
  if (q.type === 'essay' || q.type === 'short-answer') check(q.id, q.rubric);
  if (q.type === 'multi-part') for (const p of q.parts) if (p.kind === 'text') check(`${q.id}/${p.id}`, p.rubric);
}
const weak = rows.filter((r) => r.model < 0.8 || r.junk > 0.2);
console.log(`Rubricas auditadas: ${rows.length}`);
console.log(`Resposta-modelo média: ${((rows.reduce((s, r) => s + r.model, 0) / rows.length) * 100).toFixed(0)}%`);
for (const w of weak) console.log(`  ${w.id}: modelo ${(w.model * 100).toFixed(0)}%, resposta vazia ${(w.junk * 100).toFixed(0)}%`);
if (weak.length) process.exitCode = 1;
