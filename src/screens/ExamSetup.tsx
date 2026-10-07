import { useState } from 'react';
import { api } from '../lib/api';
import { clearSession, createSession, loadSession, saveSession, type ExamMode } from '../lib/examState';
import { navigate } from '../lib/router';

const PRESETS: Record<string, { mode: ExamMode; title: string; count: number; minutes: number | null; desc: string }> = {
  p1: {
    mode: 'p1',
    title: 'Simulado P1',
    count: 25,
    minutes: 60,
    desc: 'Distribuição de temas semelhante à P1: fundamentos e BP, débito e crédito, DRE e competência, A.V./A.H., margens, liquidez, ROE/DuPont e estratégia.',
  },
  ambev: {
    mode: 'ambev',
    title: 'Simulado Caso Ambev',
    count: 12,
    minutes: 45,
    desc: 'Questões com os dados reais da DFP consolidada da Ambev (2025 × 2024). As demonstrações completas ficam disponíveis durante a prova.',
  },
};

const TIME_OPTIONS: { label: string; value: number | null | 'custom' }[] = [
  { label: 'Sem limite', value: null },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: 'Personalizado', value: 'custom' },
];

export function ExamSetup({ preset }: { preset: string }) {
  const p = PRESETS[preset] ?? PRESETS.p1;
  const existing = loadSession();
  const [count, setCount] = useState(p.count);
  const [time, setTime] = useState<number | null | 'custom'>(p.minutes);
  const [custom, setCustom] = useState(75);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const questions = await api.buildExam({ mode: p.mode === 'ambev' ? 'ambev' : 'p1', count, revealMeta: false });
      if (!questions.length) throw new Error('Nenhuma questão disponível.');
      const minutes = time === 'custom' ? custom : time;
      const s = createSession(questions, {
        mode: p.mode,
        title: p.title,
        timeLimitSec: minutes == null ? null : minutes * 60,
        autoSubmit,
      });
      saveSession(s);
      navigate('/prova/executar');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <p className="eyebrow">Modo prova real</p>
      <h1>{p.title}</h1>
      <p className="lead">{p.desc}</p>

      {existing && (
        <div className="alert resume" role="status">
          <span>
            Há uma prova em andamento (<strong>{existing.title}</strong>). Iniciar outra descarta a atual.
          </span>
          <span className="row">
            <button className="btn btn-primary" onClick={() => navigate('/prova/executar')}>
              Retomar
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (confirm('Descartar a prova em andamento?')) {
                  clearSession();
                  navigate(`/prova?preset=${preset}&r=${Date.now()}`);
                }
              }}
            >
              Descartar
            </button>
          </span>
        </div>
      )}

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
      >
        <div className="field">
          <label htmlFor="count">Número de questões</label>
          <input id="count" type="number" min={5} max={p.mode === 'ambev' ? 24 : 50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          <p className="help">{p.mode === 'ambev' ? 'Entre 5 e 24.' : 'Sugerido: 20 a 25 questões.'}</p>
        </div>

        <fieldset className="field">
          <legend>Tempo de prova</legend>
          <div className="seg wrap">
            {TIME_OPTIONS.map((o) => (
              <button type="button" key={o.label} className={time === o.value ? 'on' : ''} aria-pressed={time === o.value} onClick={() => setTime(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          {time === 'custom' && (
            <div className="inline-field">
              <label htmlFor="custom">Minutos</label>
              <input id="custom" type="number" min={5} max={240} value={custom} onChange={(e) => setCustom(Number(e.target.value))} />
            </div>
          )}
        </fieldset>

        <label className="check">
          <input type="checkbox" checked={autoSubmit} onChange={(e) => setAutoSubmit(e.target.checked)} disabled={time === null} />
          Entregar automaticamente quando o tempo acabar
        </label>

        <div className="rules">
          <h2>Regras desta simulação</h2>
          <ul>
            <li>Uma questão por vez, com navegação livre e marcação para revisão.</li>
            <li>O tema da questão não é exibido: identifique sozinho qual conceito aplicar.</li>
            <li>Sem dicas e sem correção durante a prova. O relatório completo aparece após a entrega.</li>
            <li>Suas respostas são salvas automaticamente. Se fechar a página, retome pelo painel (o cronômetro pausa enquanto a página está fechada).</li>
            <li>Atalhos: A–E escolhem alternativas, V/F em verdadeiro ou falso, ← → navegam, R marca para revisão.</li>
          </ul>
        </div>

        {error && (
          <p className="alert bad" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy || count < 5}>
          {busy ? 'Montando a prova…' : 'Começar a prova'}
        </button>
      </form>
    </div>
  );
}
