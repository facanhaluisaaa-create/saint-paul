// Valida o banco de questões: recalcula gabaritos numéricos, confere alternativas,
// rubricas, partidas dobradas e Ativo = Passivo + PL nos casos.
// Uso: npm run validate            (banco inteiro)
//      npx tsx scripts/validate-bank.ts server/questions/dre.ts   (um arquivo)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Question } from '../shared/types';
import { validateBank } from '../server/validate';
import { TOPICS } from '../shared/topics';

async function main() {
  const file = process.argv[2];
  let bank: Question[];
  if (file) {
    const mod = await import(pathToFileURL(path.resolve(file)).href);
    bank = mod.questions;
  } else {
    bank = (await import('../server/questions/index')).QUESTION_BANK;
  }

  const issues = validateBank(bank);
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  const count = <K extends string>(f: (q: Question) => K) =>
    bank.reduce<Record<string, number>>((acc, q) => ((acc[f(q)] = (acc[f(q)] ?? 0) + 1), acc), {});
  const pct = (n: number) => `${((n / bank.length) * 100).toFixed(0)}%`;
  const show = (title: string, rec: Record<string, number>) => {
    console.log(`\n${title}`);
    for (const [k, v] of Object.entries(rec).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(28)} ${String(v).padStart(4)}  ${pct(v)}`);
  };

  console.log(`Banco: ${bank.length} questões`);
  show('Por tema', count((q) => `${q.topic} (${TOPICS[q.topic]?.label ?? '?'})`));
  show('Por dificuldade', count((q) => q.difficulty));
  show('Por nível cognitivo', count((q) => q.cognitiveLevel));
  show('Por tipo', count((q) => q.type));
  show('Por origem dos dados', count((q) => q.dataSource));

  const numericChecked = bank.filter(
    (q) => q.type === 'numeric' || (q.type === 'multiple-choice' && q.calc) || (q.type === 'multi-part' && q.parts.some((p) => p.kind === 'numeric')),
  ).length;
  console.log(`\nQuestões com cálculo recalculado: ${numericChecked}`);
  console.log(`Balanços conferidos (A = P + PL): ${bank.reduce((s, q) => s + (q.balanceCheck?.length ?? 0), 0)}`);

  if (warnings.length) {
    console.log(`\nAvisos (${warnings.length}):`);
    for (const w of warnings.slice(0, 40)) console.log(`  [${w.id}] ${w.message}`);
  }
  if (errors.length) {
    console.log(`\nERROS (${errors.length}):`);
    for (const e of errors) console.log(`  [${e.id}] ${e.message}`);
    process.exit(1);
  }
  console.log('\nOK — nenhum erro encontrado.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
