import { useState } from 'react';
import type { Answer, CalcSolution, GradedQuestion, PublicQuestion } from '../../shared/types';
import { TOPICS } from '../../shared/topics';
import { api } from '../lib/api';
import { AnswerInput, QuestionBody } from './QuestionView';

const STATUS: Record<GradedQuestion['status'], { label: string; cls: string }> = {
  correct: { label: 'Resposta correta', cls: 'ok' },
  partial: { label: 'Resposta parcialmente correta', cls: 'partial' },
  wrong: { label: 'Resposta incorreta', cls: 'bad' },
  blank: { label: 'Em branco', cls: 'bad' },
};

export function scoreText(earned: number, points = 1) {
  return `${earned.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}/${points.toLocaleString('pt-BR')}`;
}

function SolutionSteps({ s }: { s: CalcSolution }) {
  return (
    <ol className="calc-steps">
      <li>
        <span>Fórmula</span>
        <code>{s.formula}</code>
      </li>
      <li>
        <span>Substituição</span>
        <code>{s.substitution}</code>
      </li>
      <li>
        <span>Conta</span>
        <code>{s.computation}</code>
      </li>
      <li>
        <span>Resultado</span>
        <strong>{s.result}</strong>
      </li>
      <li>
        <span>Unidade</span>
        {s.unit}
      </li>
      <li>
        <span>Interpretação</span>
        {s.interpretation}
      </li>
    </ol>
  );
}

function Criteria({ items }: { items: NonNullable<GradedQuestion['criteria']> }) {
  return (
    <ul className="criteria">
      {items.map((c) => (
        <li key={c.id} className={c.earned >= c.points ? 'met' : c.earned > 0 ? 'half' : 'miss'}>
          <span className="mark" aria-hidden="true">
            {c.earned >= c.points ? '✓' : c.earned > 0 ? '±' : '✗'}
          </span>
          <span>
            {c.description} <em>({scoreText(c.earned, c.points)})</em>
            {c.comment && <span className="crit-comment"> — {c.comment}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Fixation({ q }: { q: PublicQuestion }) {
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [result, setResult] = useState<GradedQuestion | null>(null);
  const [busy, setBusy] = useState(false);
  const check = async () => {
    setBusy(true);
    try {
      const [r] = await api.grade([{ id: q.id, answer }], false);
      setResult(r);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixation">
      <QuestionBody q={q} />
      <AnswerInput q={q} answer={answer} onChange={setAnswer} disabled={!!result} />
      {!result ? (
        <button type="button" className="btn btn-secondary small" disabled={!answer || busy} onClick={check}>
          Verificar
        </button>
      ) : (
        <div className={`fix-result ${STATUS[result.status].cls}`}>
          <strong>{STATUS[result.status].label}.</strong> {result.status !== 'correct' && <>Correta: {result.correctAnswer}. </>}
          {result.explanation}
        </div>
      )}
    </div>
  );
}

/** Correção completa: SUA RESPOSTA · RESPOSTA CORRETA · POR QUE · COMO PENSAR · PEGADINHA · REGRA · FIXAÇÃO. */
export function FeedbackPanel({ r, showFixation = true, compact = false }: { r: GradedQuestion; showFixation?: boolean; compact?: boolean }) {
  const st = STATUS[r.status];
  const essay = r.criteria != null && !r.parts;
  return (
    <section className={`feedback ${st.cls}`} aria-live="polite">
      <header className="fb-head">
        <strong>{st.label}</strong>
        <span className="fb-score">{scoreText(r.earned, r.points)} ponto</span>
      </header>

      {essay ? (
        <>
          <h4>Nota pela rubrica</h4>
          <p className="essay-score">
            {(r.earned * 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/10
          </p>
          <Criteria items={r.criteria!} />
          {!!r.seriousErrors?.length && (
            <div className="serious">
              <h4>Erros conceituais identificados</h4>
              <ul>
                {r.seriousErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <h4>Sua resposta</h4>
          <p className="user-text">{r.userAnswer}</p>
          <h4>Resposta-modelo</h4>
          <p>{r.modelAnswer}</p>
          {r.gradingMethod === 'keywords' && <p className="note">A correção automática de respostas discursivas é aproximada (baseada em conceitos e palavras-chave). Compare sua resposta com a resposta-modelo.</p>}
          {r.gradingMethod === 'llm' && <p className="note">Correção semântica restrita à rubrica. Ainda assim, compare com a resposta-modelo.</p>}
        </>
      ) : r.parts ? (
        <div className="parts-fb">
          {r.parts.map((p) => (
            <div key={p.id} className={`part-fb ${p.earned >= p.points ? 'ok' : p.earned > 0 ? 'partial' : 'bad'}`}>
              <p>
                <strong>{p.id})</strong> {p.prompt} <em>({scoreText(p.earned, p.points)})</em>
              </p>
              <dl>
                <dt>Sua resposta</dt>
                <dd className="user-text">{p.userAnswer}</dd>
                <dt>{p.criteria ? 'Resposta-modelo' : 'Resposta correta'}</dt>
                <dd className="pre">{p.correctAnswer}</dd>
              </dl>
              {p.criteria && <Criteria items={p.criteria} />}
              {p.solution && !compact && <SolutionSteps s={p.solution} />}
            </div>
          ))}
          {r.gradingMethod === 'keywords' && <p className="note">A parte discursiva foi corrigida de forma aproximada (conceitos e palavras-chave).</p>}
        </div>
      ) : (
        <dl className="fb-answers">
          <dt>Sua resposta</dt>
          <dd>{r.userAnswer}</dd>
          <dt>Resposta correta</dt>
          <dd>{r.correctAnswer}</dd>
        </dl>
      )}

      {r.itemDetails && (
        <table className="item-details">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Sua resposta</th>
              <th scope="col">Correta</th>
            </tr>
          </thead>
          <tbody>
            {r.itemDetails.map((d, i) => (
              <tr key={i} className={d.ok ? 'ok' : 'bad'}>
                <th scope="row">{d.label}</th>
                <td>
                  {d.user} <span className="sr-only">{d.ok ? '(correto)' : '(incorreto)'}</span>
                  <span aria-hidden="true">{d.ok ? ' ✓' : ' ✗'}</span>
                </td>
                <td>{d.correct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {r.status !== 'correct' && r.whyWrong && (
        <>
          <h4>Por que a sua está errada</h4>
          <p>{r.whyWrong}</p>
        </>
      )}

      <h4>Explicação</h4>
      <p>{r.explanation}</p>

      {r.solution && !compact && (
        <>
          <h4>Resolução passo a passo</h4>
          <SolutionSteps s={r.solution} />
        </>
      )}

      {!!r.reasoningSteps?.length && (
        <>
          <h4>Como pensar</h4>
          <ol className="reasoning">
            {r.reasoningSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </>
      )}

      {r.commonMistake && (
        <>
          <h4>Pegadinha</h4>
          <p>{r.commonMistake}</p>
        </>
      )}

      {r.formula && (
        <>
          <h4>Fórmula</h4>
          <p>
            <code>{r.formula}</code>
          </p>
        </>
      )}

      {r.rule && (
        <div className="rule">
          <h4>Regra transferível</h4>
          <p>{r.rule}</p>
        </div>
      )}

      <p className="source-ref">
        Revisar: {r.sourceReference} · Tema: {TOPICS[r.topic].label}
        {r.dataSource === 'ficticio' && ' · Caso fictício para estudo'}
        {r.dataSource === 'real-ambev' && ' · Dados reais Ambev (DFP CVM)'}
      </p>

      {showFixation && r.fixation && r.status !== 'correct' && (
        <details className="fix-wrap">
          <summary>Miniquestão de fixação</summary>
          <Fixation q={r.fixation} />
        </details>
      )}
    </section>
  );
}
