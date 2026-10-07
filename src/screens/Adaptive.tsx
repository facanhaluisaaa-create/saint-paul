import { useEffect, useRef, useState } from 'react';
import type { Answer, GradedQuestion, PublicQuestion } from '../../shared/types';
import { GROUPS, GROUP_IDS, TOPICS, TOPIC_IDS, type GroupId, type TopicId } from '../../shared/topics';
import { FeedbackPanel } from '../components/Feedback';
import { AnswerInput, MetaLine, QuestionBody, SourceBadge, handleChoiceKey, isTypingTarget } from '../components/QuestionView';
import { DIFF_LABEL, recordAnswer, skipStep, startAdaptive, type AdaptiveState } from '../lib/adaptive';
import { api } from '../lib/api';
import { isAnswered, newId } from '../lib/examState';
import { logAttempts, saveRecord, summarizeResults } from '../lib/progress';
import { navigate } from '../lib/router';

const CORE: TopicId[] = ['classificacao', 'debito-credito', 'dre', 'competencia-caixa', 'av', 'ah', 'margens', 'liquidez', 'roe', 'dupont'];

export function Adaptive() {
  const [scope, setScope] = useState<'core' | GroupId>('core');
  const [max, setMax] = useState(15);
  const [st, setSt] = useState<AdaptiveState | null>(null);
  const [q, setQ] = useState<PublicQuestion | null>(null);
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [result, setResult] = useState<GradedQuestion | null>(null);
  const [results, setResults] = useState<{ q: PublicQuestion; r: GradedQuestion; a?: Answer }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());
  const headRef = useRef<HTMLHeadingElement>(null);

  // Busca a questão do passo atual (pula passos sem questão disponível).
  const fetchedFor = useRef('');
  const stepKey = (x: AdaptiveState) => `${x.log.length}|${x.current?.topic}|${x.current?.difficulty}`;
  useEffect(() => {
    if (!st?.current || fetchedFor.current === stepKey(st)) return;
    let cancelled = false;
    (async () => {
      let state = st;
      for (let guard = 0; guard < 12 && state.current; guard++) {
        const next = await api.adaptiveNext(state.current.topic, state.current.difficulty, state.asked).catch((e) => {
          setError(e.message);
          return null;
        });
        if (cancelled) return;
        if (next) {
          fetchedFor.current = stepKey(state);
          if (state !== st) setSt(state);
          setQ(next);
          setAnswer(undefined);
          setResult(null);
          headRef.current?.focus({ preventScroll: true });
          return;
        }
        state = skipStep(state);
      }
      setSt({ ...state, current: null });
    })();
    return () => {
      cancelled = true;
    };
  }, [st?.log.length, st?.current?.topic, st?.current?.difficulty, !!st]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || result || isTypingTarget(e.target) || e.ctrlKey || e.metaKey) return;
      if (handleChoiceKey(e, q, setAnswer)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, result]);

  const start = () => {
    const topics = scope === 'core' ? CORE : TOPIC_IDS.filter((t) => TOPICS[t].group === scope);
    setResults([]);
    setSt(startAdaptive(topics, max));
  };

  const submit = async () => {
    if (!q || !st) return;
    setBusy(true);
    try {
      const [r] = await api.grade([{ id: q.id, answer }]);
      setResult(r);
      setResults((rs) => [...rs, { q, r, a: answer }]);
      logAttempts([r], 'adaptive');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!st || !q || !result) return;
    setQ(null);
    setSt(recordAnswer(st, q.id, result.status === 'correct'));
  };

  const finished = st && !st.current;
  useEffect(() => {
    if (!finished || !results.length) return;
    const sum = summarizeResults(results.map((x) => x.r));
    saveRecord({
      id: newId('ad'),
      kind: 'adaptive',
      title: 'Prova adaptativa',
      date: Date.now(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      timeLimitSec: null,
      questions: results.map((x) => x.q),
      answers: Object.fromEntries(results.filter((x) => x.a).map((x) => [x.q.id, x.a!])),
      results: results.map((x) => x.r),
      earned: sum.earned,
      total: sum.total,
      percent: sum.percent,
    });
  }, [finished]);

  if (!st) {
    return (
      <div className="page narrow">
        <p className="eyebrow">Prova adaptativa</p>
        <h1>A dificuldade acompanha você</h1>
        <p className="lead">
          Dois acertos seguidos sobem o nível do tema. Um erro desce o nível e, em temas compostos, volta aos fundamentos. Ao errar DuPont, por exemplo, você responde
          Margem, Giro e Alavancagem separadamente antes de recompor DuPont.
        </p>
        <div className="card form">
          <fieldset className="field">
            <legend>Abrangência</legend>
            <div className="seg wrap">
              <button type="button" className={scope === 'core' ? 'on' : ''} aria-pressed={scope === 'core'} onClick={() => setScope('core')}>
                Núcleo da P1
              </button>
              {GROUP_IDS.map((g) => (
                <button type="button" key={g} className={scope === g ? 'on' : ''} aria-pressed={scope === g} onClick={() => setScope(g)}>
                  {GROUPS[g].short}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="amax">Número de questões</label>
            <input id="amax" type="number" min={5} max={40} value={max} onChange={(e) => setMax(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={start}>
            Começar
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const sum = summarizeResults(results.map((x) => x.r));
    const finalLevels = Object.entries(st.levels) as [TopicId, keyof typeof DIFF_LABEL][];
    return (
      <div className="page narrow">
        <h1>Prova adaptativa concluída</h1>
        <p className="lead">
          {results.length} questões · {sum.percent.toFixed(0)}% de aproveitamento.
        </p>
        <section className="card">
          <h2>Nível alcançado por tema</h2>
          <ul className="levels">
            {finalLevels.map(([t, d]) => (
              <li key={t}>
                <span>{TOPICS[t].label}</span>
                <span className={`pill lvl-${d}`}>{DIFF_LABEL[d]}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="row">
          <button className="btn btn-primary" onClick={() => setSt(null)}>
            Nova prova adaptativa
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page study">
      <header className="study-head">
        <div>
          <p className="eyebrow">Prova adaptativa</p>
          <p className="muted">
            Questão {st.log.length + 1} de {st.max}
            {st.current && (
              <>
                {' '}
                · <strong>{st.current.reason}</strong>
              </>
            )}
          </p>
        </div>
        <div className="progress-track wide" aria-hidden="true">
          <span style={{ width: `${(st.log.length / st.max) * 100}%` }} />
        </div>
      </header>
      {error && (
        <p className="alert bad" role="alert">
          {error}
        </p>
      )}
      {!q ? (
        <p className="loading">Escolhendo a próxima questão…</p>
      ) : (
        <>
          <article className="question-card">
            <header className="q-head">
              <h1 ref={headRef} tabIndex={-1}>
                Questão {st.log.length + 1}
              </h1>
              <SourceBadge q={q} />
            </header>
            <MetaLine q={q} />
            <QuestionBody q={q} />
            <AnswerInput q={q} answer={answer} onChange={setAnswer} disabled={!!result || busy} />
            <footer className="q-foot">
              {!result ? (
                <button className="btn btn-primary" onClick={submit} disabled={busy || !isAnswered(answer)}>
                  {busy ? 'Corrigindo…' : 'Responder'}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={next}>
                  Próxima →
                </button>
              )}
            </footer>
          </article>
          {result && <FeedbackPanel r={result} showFixation={false} />}
        </>
      )}
    </div>
  );
}
