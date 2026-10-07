import { useMemo, useState } from 'react';
import { GROUPS, type GroupId } from '../../shared/topics';
import { ROTEIRO_PARTS } from '../../shared/cases';
import { PercentBars } from '../components/Charts';
import { FeedbackPanel, scoreText } from '../components/Feedback';
import { QuestionBody } from '../components/QuestionView';
import { formatDuration } from '../lib/examState';
import { diagnosis, getRecord, reviewPlan, summarizeResults } from '../lib/progress';
import { navigate } from '../lib/router';

const fmt = (n: number, d = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: d });
type Filter = 'all' | 'wrong' | 'correct';

export function Report({ id }: { id: string }) {
  const rec = useMemo(() => getRecord(id), [id]);
  const [filter, setFilter] = useState<Filter>('wrong');
  const [expandAll, setExpandAll] = useState(false);

  if (!rec) {
    return (
      <div className="page narrow">
        <h1>Relatório não encontrado</h1>
        <button className="btn btn-primary" onClick={() => navigate('/historico')}>
          Ver histórico
        </button>
      </div>
    );
  }

  const s = summarizeResults(rec.results);
  const plan = reviewPlan(rec.results);
  const diag = diagnosis(rec.results);
  const groups = (Object.keys(s.byGroup) as GroupId[]).map((g) => ({
    label: GROUPS[g].short,
    pct: (s.byGroup[g].earned / s.byGroup[g].total) * 100,
    detail: `(${fmt(s.byGroup[g].earned)}/${s.byGroup[g].total})`,
  }));
  const parts = ([1, 2, 3] as const).filter((p) => s.byPart[p]).map((p) => ({
    label: ROTEIRO_PARTS[p].title.split(' — ')[0],
    pct: (s.byPart[p].earned / s.byPart[p].total) * 100,
    detail: `(${fmt(s.byPart[p].earned)}/${s.byPart[p].total})`,
  }));
  const qById = new Map(rec.questions.map((q) => [q.id, q]));
  const indexed = rec.results.map((r, i) => ({ r, i }));
  const shown = indexed.filter(({ r }) => (filter === 'all' ? true : filter === 'wrong' ? r.status !== 'correct' : r.status === 'correct'));

  const startReview = () => {
    const wrong = rec.results.filter((r) => r.status !== 'correct');
    const topics = plan.map((p) => p.topic).join(',');
    const count = Math.min(15, Math.max(6, plan.reduce((n, p) => n + p.count, 0)));
    navigate(
      `/estudo?mode=review&count=${count}&skills=${encodeURIComponent(wrong.map((r) => r.skill).join(','))}&ids=${encodeURIComponent(wrong.map((r) => r.id).join(','))}&topics=${topics}`,
    );
  };

  return (
    <div className={`page report ${expandAll ? 'print-all' : ''}`}>
      <p className="eyebrow">Relatório da prova</p>
      <h1>{rec.title}</h1>
      <p className="muted">
        {new Date(rec.date).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })} · {rec.questions.length} questões
      </p>

      <section className="score-board" aria-label="Resultado">
        <div className="score-main">
          <span className="stat-label">Nota</span>
          <span className="score-big">
            {fmt(s.earned)}/{s.total}
          </span>
          <span className="score-pct">{fmt(s.percent, 0)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tempo</span>
          <span className="stat-value">{formatDuration(rec.durationSec)}</span>
          {rec.timeLimitSec && <span className="muted small">de {Math.round(rec.timeLimitSec / 60)} min</span>}
        </div>
        <div className="stat">
          <span className="stat-label">Objetivas</span>
          <span className="stat-value">
            {s.objective.correct}/{s.objective.total}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Discursivas</span>
          <span className="stat-value">
            {fmt(s.discursive.earned)}/{s.discursive.total}
          </span>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          {parts.length > 0 && (
            <>
              <h2>Por parte do roteiro</h2>
              <PercentBars rows={parts} />
              <p className="muted small">Nota em pontos: cada pergunta vale 1 ponto (10 na rubrica). Resposta sem número vale no máximo metade.</p>
            </>
          )}
          <h2 className={parts.length ? 'mt' : ''}>Por assunto</h2>
          <PercentBars rows={groups} />
        </section>
        <section className="card">
          <h2>Diagnóstico</h2>
          <p>{diag}</p>
          <h2 className="mt">Plano de revisão</h2>
          {plan.length ? (
            <ol className="plan">
              {plan.map((p) => (
                <li key={p.topic}>
                  {p.count} questões de {p.label} <span className="muted">({fmt(p.pct, 0)}% nesta prova)</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nenhum tema abaixo de 80%. Faça um novo simulado completo para confirmar o domínio.</p>
          )}
          <div className="row no-print">
            <button className="btn btn-primary" onClick={startReview} disabled={!rec.results.some((r) => r.status !== 'correct')}>
              Iniciar revisão personalizada
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setExpandAll(true);
                setFilter('all');
                setTimeout(() => window.print(), 50);
              }}
            >
              Exportar relatório (PDF)
            </button>
          </div>
        </section>
      </div>

      <section className="corrections">
        <div className="corr-head">
          <h2>Correção questão a questão</h2>
          <div className="seg no-print" role="group" aria-label="Filtrar questões">
            {(
              [
                ['wrong', 'Erros e parciais'],
                ['all', 'Todas'],
                ['correct', 'Acertos'],
              ] as [Filter, string][]
            ).map(([f, l]) => (
              <button key={f} className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {!shown.length && <p className="muted">Nenhuma questão neste filtro.</p>}
        {shown.map(({ r, i }) => {
          const q = qById.get(r.id);
          return (
            <details key={r.id} className={`corr-item ${r.status}`} open={expandAll || undefined}>
              <summary>
                <span className="corr-n">Questão {i + 1}</span>
                <span className={`pill ${r.status}`}>
                  {r.status === 'correct' ? 'Correta' : r.status === 'partial' ? 'Parcial' : r.status === 'blank' ? 'Em branco' : 'Incorreta'}
                </span>
                <span className="corr-score">{scoreText(r.earned, r.points)}</span>
              </summary>
              {q && (
                <div className="corr-q">
                  <QuestionBody q={q} />
                </div>
              )}
              <FeedbackPanel r={r} showFixation={!expandAll} />
            </details>
          );
        })}
      </section>

      <div className="row no-print">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Voltar ao painel
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/prova?preset=${rec.kind === 'ambev' ? 'ambev' : rec.kind === 'roteiro' ? 'roteiro' : 'p1'}`)}>
          Novo simulado
        </button>
      </div>
    </div>
  );
}
