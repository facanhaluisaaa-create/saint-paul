import { useCallback, useEffect, useRef, useState } from 'react';
import type { Answer } from '../../shared/types';
import { AnswerInput, QuestionBody, SourceBadge, handleChoiceKey, isTypingTarget } from '../components/QuestionView';
import { AmbevStatementsPanel, AnnexPanel } from './AmbevStatements';
import { ROTEIRO_PARTS } from '../../shared/cases';
import { api } from '../lib/api';
import {
  clearSession,
  formatClock,
  goTo,
  isAnswered,
  isExpired,
  loadSession,
  remainingSec,
  saveSession,
  setAnswer,
  summary,
  tick,
  toggleFlag,
  type ExamSession,
} from '../lib/examState';
import { logAttempts, saveRecord, summarizeResults } from '../lib/progress';
import { navigate } from '../lib/router';

export function ExamRunner() {
  const [s, setS] = useState<ExamSession | null>(loadSession);
  const [view, setView] = useState<'question' | 'review'>('question');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDFs, setShowDFs] = useState(false);
  const submittedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Cronômetro (pausa quando a página está fechada; o tempo decorrido é salvo).
  useEffect(() => {
    if (!s) return;
    const t = setInterval(() => setS((prev) => (prev && !submittedRef.current ? tick(prev, 1) : prev)), 1000);
    return () => clearInterval(t);
  }, [!!s]);

  // Autosave: respostas na hora; tempo a cada 5 s.
  const lastTimeSave = useRef(0);
  useEffect(() => {
    if (!s || submittedRef.current) return;
    if (s.elapsedSec - lastTimeSave.current >= 5 || s.elapsedSec < lastTimeSave.current) {
      lastTimeSave.current = s.elapsedSec;
      saveSession(s);
    }
  }, [s?.elapsedSec]);
  useEffect(() => {
    if (s && !submittedRef.current) saveSession(s);
  }, [s?.answers, s?.flags, s?.current]);

  const submit = useCallback(async () => {
    if (!s || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    saveSession(s);
    try {
      const results = await api.grade(s.questions.map((q) => ({ id: q.id, answer: s.answers[q.id] })));
      const sum = summarizeResults(results);
      saveRecord({
        id: s.id,
        kind: s.mode,
        title: s.title,
        date: Date.now(),
        durationSec: s.elapsedSec,
        timeLimitSec: s.timeLimitSec,
        questions: s.questions,
        answers: s.answers,
        results,
        earned: sum.earned,
        total: sum.total,
        percent: sum.percent,
      });
      logAttempts(results, s.mode);
      clearSession();
      navigate(`/relatorio/${s.id}`);
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(`Não foi possível corrigir agora (${(e as Error).message}). Suas respostas estão salvas; tente novamente.`);
    }
  }, [s]);

  const expired = s ? isExpired(s) : false;
  useEffect(() => {
    if (expired && s?.autoSubmit && !submittedRef.current) submit();
  }, [expired]);

  const q = s?.questions[s.current];
  const update = useCallback(
    (a: Answer) => {
      if (!q || expired) return;
      setS((prev) => (prev ? setAnswer(prev, q.id, a) : prev));
    },
    [q?.id, expired],
  );

  // Atalhos de teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s || view !== 'question' || confirming || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowRight') {
        setS((p) => (p ? goTo(p, p.current + 1) : p));
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        setS((p) => (p ? goTo(p, p.current - 1) : p));
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'r' && q) {
        setS((p) => (p ? toggleFlag(p, q.id) : p));
      } else if (!expired && handleChoiceKey(e, q, update)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s?.current, view, confirming, q, update, expired]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [s?.current, view]);

  if (!s || !q) {
    return (
      <div className="page narrow">
        <h1>Nenhuma prova em andamento</h1>
        <p className="lead">Inicie um simulado pelo painel.</p>
        <button className="btn btn-primary" onClick={() => navigate('/prova?preset=p1')}>
          Configurar simulado
        </button>
      </div>
    );
  }

  const sum = summary(s);
  const rem = remainingSec(s);
  const flagged = s.flags.includes(q.id);
  const last = s.current === s.questions.length - 1;

  return (
    <div className="exam">
      <header className="exam-bar">
        <div className="exam-bar-inner">
          <div className="exam-title">
            <strong>{s.title}</strong>
            <span>Contabilidade para Tomada de Decisões I</span>
          </div>
          <div className="exam-progress" aria-label="Progresso">
            <span>
              Questão {s.current + 1} de {s.questions.length}
            </span>
            <span className="progress-track" aria-hidden="true">
              <span style={{ width: `${sum.progressPct}%` }} />
            </span>
            <span>{sum.progressPct}% concluído</span>
          </div>
          <div className={`timer ${rem != null && rem <= 300 ? 'warn' : ''}`} role="timer" aria-live="off">
            {rem != null ? (
              <>
                <span className="timer-label">Tempo restante</span>
                <span className="timer-value">{formatClock(rem)}</span>
              </>
            ) : (
              <>
                <span className="timer-label">Tempo decorrido</span>
                <span className="timer-value">{formatClock(s.elapsedSec)}</span>
              </>
            )}
          </div>
          <div className="exam-bar-actions">
            {(s.mode === 'ambev' || s.caseTables?.length) && (
              <button className="btn btn-ghost small" onClick={() => setShowDFs((v) => !v)} aria-expanded={showDFs}>
                {showDFs ? 'Ocultar anexo' : 'Consultar anexo (DFs)'}
              </button>
            )}
            <button className="btn btn-secondary small" onClick={() => setView('review')}>
              Revisar e entregar
            </button>
          </div>
        </div>
      </header>

      {rem != null && rem <= 300 && rem > 0 && (
        <p className="sr-only" aria-live="polite">
          {rem === 300 ? 'Restam 5 minutos.' : rem === 60 ? 'Resta 1 minuto.' : ''}
        </p>
      )}

      <div className="exam-layout">
        <aside className="navigator" aria-label="Navegador de questões">
          <h2 className="nav-title">Questões</h2>
          <ol className="nav-grid">
            {s.questions.map((qq, i) => {
              const answered = isAnswered(s.answers[qq.id]);
              const fl = s.flags.includes(qq.id);
              const state = `${i === s.current ? 'current' : ''} ${answered ? 'answered' : 'empty'} ${fl ? 'flagged' : ''}`;
              return (
                <li key={qq.id}>
                  <button
                    className={`nav-cell ${state}`}
                    aria-current={i === s.current ? 'step' : undefined}
                    aria-label={`Questão ${i + 1}: ${answered ? 'respondida' : 'não respondida'}${fl ? ', marcada para revisão' : ''}`}
                    onClick={() => {
                      setView('question');
                      setS(goTo(s, i));
                    }}
                  >
                    {i + 1}
                    {fl && <span className="flag-dot" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ol>
          <ul className="legend">
            <li>
              <span className="nav-cell sample current" /> Atual
            </li>
            <li>
              <span className="nav-cell sample answered" /> Respondida
            </li>
            <li>
              <span className="nav-cell sample empty" /> Não respondida
            </li>
            <li>
              <span className="nav-cell sample flagged">
                <span className="flag-dot" />
              </span>{' '}
              Marcada
            </li>
          </ul>
        </aside>

        <section className="exam-main">
          {showDFs && (
            <div className="dfs-drawer">
              {s.caseTables?.length ? <AnnexPanel tables={s.caseTables} note="Anexo das DFs — consulta permitida, como na prova. Valores em R$ milhões, com A.V. e A.H. prontos." /> : <AmbevStatementsPanel />}
            </div>
          )}

          {expired && !s.autoSubmit && (
            <div className="alert bad" role="alert">
              Tempo esgotado. As respostas foram travadas. Entregue a prova para ver o relatório.
              <button className="btn btn-primary" onClick={() => submit()} disabled={submitting}>
                Entregar agora
              </button>
            </div>
          )}
          {error && (
            <div className="alert bad" role="alert">
              {error}
            </div>
          )}

          {view === 'question' ? (
            <article className="question-card" aria-labelledby="qtitle">
              {q.roteiroPart && (
                <div className="part-banner">
                  <strong>{ROTEIRO_PARTS[q.roteiroPart].title}</strong>
                  <span>{ROTEIRO_PARTS[q.roteiroPart].subtitle}</span>
                </div>
              )}
              <header className="q-head">
                <h1 id="qtitle" ref={headingRef} tabIndex={-1}>
                  Questão {s.current + 1}
                </h1>
                <SourceBadge q={q} />
                {flagged && <span className="badge badge-flag">Marcada para revisão</span>}
              </header>
              <QuestionBody q={q} />
              <AnswerInput q={q} answer={s.answers[q.id]} onChange={update} disabled={expired || submitting} />
              <footer className="q-foot">
                <button className="btn btn-ghost" onClick={() => setS(goTo(s, s.current - 1))} disabled={s.current === 0}>
                  ← Anterior
                </button>
                <button className={`btn btn-flag ${flagged ? 'on' : ''}`} aria-pressed={flagged} onClick={() => setS(toggleFlag(s, q.id))}>
                  ⚑ {flagged ? 'Desmarcar revisão' : 'Marcar para revisão'}
                </button>
                {last ? (
                  <button className="btn btn-primary" onClick={() => setView('review')}>
                    Revisar antes de entregar
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setS(goTo(s, s.current + 1))}>
                    Próxima →
                  </button>
                )}
              </footer>
            </article>
          ) : (
            <section className="question-card review-panel" aria-labelledby="rtitle">
              <h1 id="rtitle" ref={headingRef} tabIndex={-1}>
                Revisar antes de entregar
              </h1>
              <div className="review-stats">
                <div>
                  <span className="stat-value">{sum.answered}</span>
                  <span className="stat-label">respondidas</span>
                </div>
                <div className={sum.unanswered ? 'warn' : ''}>
                  <span className="stat-value">{sum.unanswered}</span>
                  <span className="stat-label">não respondidas</span>
                </div>
                <div className={sum.flagged ? 'flag' : ''}>
                  <span className="stat-value">{sum.flagged}</span>
                  <span className="stat-label">marcadas</span>
                </div>
              </div>
              <ReviewList title="Não respondidas" idx={sum.unansweredIdx} onGo={(i) => (setView('question'), setS(goTo(s, i)))} />
              <ReviewList title="Respondidas parcialmente" idx={sum.incompleteIdx} onGo={(i) => (setView('question'), setS(goTo(s, i)))} />
              <ReviewList title="Marcadas para revisão" idx={sum.flaggedIdx} onGo={(i) => (setView('question'), setS(goTo(s, i)))} />
              <p className="muted">Depois de entregar, as respostas ficam travadas e o relatório completo é exibido.</p>
              <div className="row">
                <button className="btn btn-ghost" onClick={() => setView('question')}>
                  Voltar à prova
                </button>
                <button className="btn btn-primary" onClick={() => setConfirming(true)} disabled={submitting}>
                  Entregar prova
                </button>
              </div>
            </section>
          )}
        </section>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Entregar a prova?"
          body={
            sum.unanswered
              ? `Você ainda tem ${sum.unanswered} questão(ões) sem resposta${sum.flagged ? ` e ${sum.flagged} marcada(s) para revisão` : ''}. Questões em branco valem zero.`
              : sum.flagged
                ? `Todas respondidas, mas ${sum.flagged} ainda está(ão) marcada(s) para revisão.`
                : 'Todas as questões foram respondidas.'
          }
          confirmLabel={submitting ? 'Corrigindo…' : 'Confirmar entrega'}
          busy={submitting}
          onCancel={() => setConfirming(false)}
          onConfirm={() => submit()}
        />
      )}
    </div>
  );
}

function ReviewList({ title, idx, onGo }: { title: string; idx: number[]; onGo: (i: number) => void }) {
  if (!idx.length) return null;
  return (
    <div className="review-list">
      <h2>{title}</h2>
      <div className="chips">
        {idx.map((i) => (
          <button key={i} className="chip" onClick={() => onGo(i)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfirmDialog(props: { title: string; body: string; confirmLabel: string; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="modal-backdrop" role="presentation" onClick={props.onCancel}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-b" onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-t">{props.title}</h2>
        <p id="dlg-b">{props.body}</p>
        <div className="row end">
          <button ref={ref} className="btn btn-ghost" onClick={props.onCancel} disabled={props.busy}>
            Continuar revisando
          </button>
          <button className="btn btn-primary" onClick={props.onConfirm} disabled={props.busy}>
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
