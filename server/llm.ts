// Correção semântica opcional de discursivas, restrita à rubrica.
// Ativada somente se ANTHROPIC_API_KEY (ou outra credencial do SDK) estiver configurada
// e GRADER_LLM !== 'off'. Sem credencial, o app usa o corretor por palavras-chave.
import Anthropic from '@anthropic-ai/sdk';
import type { Rubric } from '../shared/types';
import type { EssayGrade } from './essay';

const MODEL = process.env.GRADER_MODEL || 'claude-opus-5-5';

export function llmEnabled(): boolean {
  if (process.env.GRADER_LLM === 'off') return false;
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  return client;
}

const SYSTEM = `Você é corretor de provas da disciplina "Contabilidade para Tomada de Decisões I".
Avalie a resposta do aluno EXCLUSIVAMENTE pelos critérios da rubrica fornecida.
Regras:
- Não premie verbosidade nem repetição: um critério só é atendido se o conceito estiver correto e explícito.
- Conceda pontuação parcial por critério quando o conceito estiver incompleto (múltiplos de 0,5).
- Identifique erros conceituais (ex.: confundir lucro com caixa, débito com entrada de dinheiro, A.V. com A.H.).
- Siga a terminologia da disciplina mesmo que difira de outras fontes.
- Comentários curtos, em português do Brasil, dirigidos ao aluno.
Responda apenas com o JSON pedido.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['criteria', 'conceptualErrors'],
  properties: {
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'earned', 'comment'],
        properties: {
          id: { type: 'string' },
          earned: { type: 'number' },
          comment: { type: 'string' },
        },
      },
    },
    conceptualErrors: { type: 'array', items: { type: 'string' } },
  },
};

export async function gradeEssayLLM(stem: string, text: string, rubric: Rubric): Promise<EssayGrade> {
  const rubricText = rubric.criteria
    .map((c) => `- id "${c.id}" (${c.points} pts): ${c.description}`)
    .join('\n');
  const errorsText = (rubric.seriousErrors ?? []).map((e) => `- ${e.description}`).join('\n') || '- (nenhum listado)';
  const numbersRule = rubric.requireNumbers
    ? '\nREGRA DA DISCIPLINA: resposta sem números (valores, A.V., A.H.) vale no máximo metade; além disso, cada critério exige o número que o sustenta.'
    : '';
  const prompt = `QUESTÃO:\n${stem}\n\nRUBRICA:\n${rubricText}\n\nERROS GRAVES A OBSERVAR:\n${errorsText}\n\nRESPOSTA-MODELO (referência do professor; não exija as mesmas palavras):\n${rubric.modelAnswer}${numbersRule}\n\n<resposta_do_aluno>\n${text}\n</resposta_do_aluno>\n\nPara cada critério devolva "earned" entre 0 e o máximo do critério.`;

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });
  if (response.stop_reason === 'refusal') throw new Error('refusal');
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') throw new Error('resposta sem texto');
  const parsed = JSON.parse(textBlock.text) as {
    criteria: { id: string; earned: number; comment: string }[];
    conceptualErrors: string[];
  };

  const total = rubric.criteria.reduce((s, c) => s + c.points, 0);
  const criteria = rubric.criteria.map((c) => {
    const r = parsed.criteria.find((x) => x.id === c.id);
    const earned = Math.max(0, Math.min(c.points, Number(r?.earned) || 0));
    return { id: c.id, description: c.description, points: c.points, earned, met: earned >= c.points * 0.75, comment: r?.comment };
  });
  let earned = Math.min(total, criteria.reduce((s, c) => s + c.earned, 0));
  const seriousErrors = parsed.conceptualErrors ?? [];
  if (rubric.requireNumbers && !/\d/.test(text)) {
    earned = Math.min(earned, total / 2);
    seriousErrors.push('Resposta sem números: na prova, resposta sem número vale no máximo metade.');
  }
  return { earned, total, criteria, seriousErrors, method: 'llm' };
}
