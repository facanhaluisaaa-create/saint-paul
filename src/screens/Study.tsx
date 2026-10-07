import { useCallback, useEffect, useRef, useState } from 'react';
import type { Answer, GradedQuestion, PublicQuestion } from '../../shared/types';
import { TOPICS, type TopicId } from '../../shared/topics';
import { FeedbackPanel } from '../components/Feedback';
import { AnswerInput, MetaLine, QuestionBody, SourceBadge, handleChoiceKey, isTypingTarget } from '../components/QuestionView';
import { api } from '../lib/api';
import { isAnswered, newId } from '../lib/examState';
import { logAttempts, saveRecord, studentSignals, summarizeResults, type SessionKind } from '../lib/progress';
import { navigate } from '../lib/router';

type Mode = 'mixed' | 'topic' | 'review' | 'ambev';
const TITLES: Record<Mode, string> = {
  mixed: 'Estudo guiado',
  topic: 'Treino por tema',
  review: 'Revisão dos erros',
  ambev: 'Treino — Caso Ambev',
};
const KIND: Record<Mode, SessionKind> = { mixed: 'study', topic: 'topic', review: 'review', ambev: 'topic' };

interface Item {
  q: PublicQuestion;
  answer?: Answer;
  result?: GradedQuestion;
  /** Resultado da 1ª tentativa — é o que conta para o domínio. */
  first?: GradedQuestion;
  aids: { kind: string; text: string }[];
}

export function Study({ params }: { params: URLSearchParams }) {
  const mode = (['mixed', 'topic', 'review', 'ambev'].includes(params.get('mode') ?? '') ? params.get('mode') : 'mixed') as Mode;
  const count = Math.max(3, Math.min(40, Number(params.get('count')) || 10));
  const topics = (params.get('topics') ?? '').split(',').filter((t): t is TopicId => t in TOPICS);
  const [items, setItems] = useState<Item[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const skills = params.get('skills')?.split(',').filter(Boolean);
    const ids = params.get('ids')?.split(',').filter(Boolean);
    if (mode === 'review' && !skills?.length && !studentSignals().wrongSkills.length) {
      setItems([]);
      return;
    }
    api
      .buildExam({
        mode: mode === 'mixed' ? 'mixed' : mode,
        count,
        topics: topics.length ? topics : undefined,
        revealMeta: true,
        wrongSkills: skills?.length ? [...new Set(skills)] : undefined,
        wrongIds: ids?.length ? ids : undefined,
      })
      .then((qs) => setItems(qs.map((q) => ({ q, aids: [] }))))
      .catch((e) => setError(e.message));
  }, []);

  const cur = items?.[idx];
  const patch = useCallback((i: number, p: Partial<Item>) => setItems((list) => list && list.map((it, k) => (k === i ? { ...it, ...p } : it))), []);

  const submit = async (reveal = false) => {
    if (!cur) return;
    setBusy(true);
    setError(null);
    try {
      const [r] = await api.grade([{ id: cur.q.id, answer: reveal && !isAnswered(cur.answer) ? undefined : cur.answer }]);
      patch(idx, { result: r, first: cur.first ?? r });
      if (!cur.first) logAttempts([r], KIND[mode]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const aid = async (kind: 'hint' | 'formula' | 'concept') => {
    if (!cur || cur.aids.some((a) => a.kind === kind)) return;
    try {
      const r = await api.aids(cur.q.id, kind);
      patch(idx, { aids: [...cur.aids, { kind, text: r.text }] });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const finish = () => {
    if (!items) return;
    const answered = items.filter((it) => it.first);
    if (!answered.length) return navigate('/');
    const results = answered.map((it) => it.first!);
    const sum = summarizeResults(results);
    const id = newId('st');
    saveRecord({
      id,
      kind: KIND[mode],
      title: TITLES[mode] + (topics.length ? ` — ${topics.map((t) => TOPICS[t].label).join(', ')}` : ''),
      date: Date.now(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      timeLimitSec: null,
      questions: answered.map((it) => it.q),
      answers: Object.fromEntries(answered.map((it) => [it.q.id, it.answer!]).filter(([, a]) => a)),
      results,
      earned: sum.earned,
      total: sum.total,
      percent: sum.percent,
    });
    setDone(id);
  };

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!cur || cur.result || isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (handleChoiceKey(e, cur.q, (a) => patch(idx, { answer: a }))) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, idx]);

  if (error && !items) {
    return (
      <div className="page narrow">
        <div className="alert bad" role="alert">
          Erro ao carregar: {error}
        </div>
      </div>
    );
  }
  if (!items) return <div className="page narrow loading">Montando a sessão…</div>;
  if (!items.length) {
    return (
      <div className="page narrow">
        <h1>{TITLES[mode]}</h1>
        <p className="lead">{mode === 'review' ? 'Ainda não há erros registrados. Faça um simulado ou um treino primeiro.' : 'Nenhuma questão encontrada para esta seleção.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Voltar ao painel
        </button>
      </div>
    );
  }

  if (done) {
    const results = items.filter((i) => i.first).map((i) => i.first!);
    const s = summarizeResults(results);
    return (
      <div className="page narrow">
        <h1>Sessão concluída</h1>
        <p className="lead">
          Primeira tentativa: {s.earned.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de {s.total} ({s.percent.toFixed(0)}%). O domínio por tema foi atualizado.
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => navigate(`/relatorio/${done}`)}>
            Ver relatório
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Painel
          </button>
        </div>
      </div>
    );
  }

  const q = cur!.q;
  const r = cur!.result;
  const last = idx === items.length - 1;
  const correctCount = items.filter((i) => i.first?.status === 'correct').length;
  const streak = (() => {
    let n = 0;
    for (let k = idx; k >= 0; k--) {
      if (items[k].first?.status === 'correct') n++;
      else if (items[k].first) break;
    }
    return n;
  })();

  return (
    <div className="page study">
      <header className="study-head">
        <div>
          <p className="eyebrow">{TITLES[mode]}</p>
          <p className="muted">
            Questão {idx + 1} de {items.length} · {correctCount} acerto(s) na 1ª tentativa
            {streak >= 3 && <> · sequência de {streak} acertos</>}
          </p>
        </div>
        <div className="progress-track wide" aria-hidden="true">
          <span style={{ width: `${((idx + (r ? 1 : 0)) / items.length) * 100}%` }} />
        </div>
      </header>

      <article className="question-card">
        <header className="q-head">
          <h1 ref={headRef} tabIndex={-1}>
            Questão {idx + 1}
          </h1>
          <SourceBadge q={q} />
        </header>
        <MetaLine q={q} />
        <QuestionBody q={q} />
        <AnswerInput q={q} answer={cur!.answer} onChange={(a) => patch(idx, { answer: a })} disabled={!!r || busy} />

        {!r && (
          <div className="aids no-print">
            <button className="btn btn-ghost small" onClick={() => aid('hint')}>
              Dica
            </button>
            <button className="btn btn-ghost small" onClick={() => aid('formula')}>
              Mostrar fórmula
            </button>
            <button className="btn btn-ghost small" onClick={() => aid('concept')}>
              Explicar conceito
            </button>
          </div>
        )}
        {!r &&
          cur!.aids.map((a) => (
            <div key={a.kind} className="aid-box">
              <strong>{a.kind === 'hint' ? 'Dica' : a.kind === 'formula' ? 'Fórmula' : 'Conceito'}:</strong> {a.text}
            </div>
          ))}

        {error && (
          <p className="alert bad" role="alert">
            {error}
          </p>
        )}

        <footer className="q-foot">
          {!r ? (
            <>
              <button className="btn btn-ghost" onClick={() => submit(true)} disabled={busy}>
                Ver solução passo a passo
              </button>
              <button className="btn btn-primary" onClick={() => submit()} disabled={busy || !isAnswered(cur!.answer)}>
                {busy ? 'Corrigindo…' : 'Responder'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => patch(idx, { result: undefined, answer: undefined, aids: [] })}>
                Tentar novamente
              </button>
              {last ? (
                <button className="btn btn-primary" onClick={finish}>
                  Concluir sessão
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                  Próxima →
                </button>
              )}
            </>
          )}
        </footer>
      </article>

      {r && <FeedbackPanel r={r} />}
      {r && cur!.first && cur!.first !== r && <p className="muted small">Para o domínio por tema vale a 1ª tentativa ({cur!.first.status === 'correct' ? 'correta' : 'não correta'}).</p>}
    </div>
  );
}
