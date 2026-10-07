// Substitui server/llm.ts na versão publicada (página estática): sem correção semântica.
import type { Rubric } from '../shared/types';
import type { EssayGrade } from './essay';

export function llmEnabled(): boolean {
  return false;
}

export async function gradeEssayLLM(_stem: string, _text: string, _rubric: Rubric): Promise<EssayGrade> {
  throw new Error('correção semântica indisponível na versão publicada');
}
