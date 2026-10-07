import { useEffect, useState } from 'react';
import type { CaseInfo } from '../../shared/cases';
import { api } from '../lib/api';
import { clearSession, createSession, loadSession, saveSession, type ExamMode } from '../lib/examState';
import { navigate } from '../lib/router';

const PRESETS: Record<string, { mode: ExamMode; title: string; count: number; minutes: number | null; desc: string }> = {
  roteiro: {
    mode: 'roteiro',
    title: 'Simulado P1 — roteiro em 3 partes',
    count: 12,
    minutes: 90,
    desc: 'O formato anunciado na Aula 5: 12 perguntas em 3 partes (Balanço · DRE · Estratégia) sobre as DFs de uma empresa, com consulta ao anexo. Resposta sem número vale no máximo metade.',
  },
  p1: {
    mode: 'p1',
    title: 'Simulado misto — Aulas 1 a 5',
    count: 25,
    minutes: 60,
    desc: 'Prova de questões variadas (objetivas, numéricas e discursivas curtas) cobrindo todo o conteúdo: fundamentos e BP, débito e crédito, DRE e competência, A.V./A.H., margens, liquidez, ROE e DuPont.',
  },
  ambev: {
    mode: 'ambev',
    title: 'Treino — casos reais (Ambev e Renner)',
    count: 12,
    minutes: 45,
    desc: 'Questões objetivas e numéricas sobre os dados reais da Ambev e da Renner, com o anexo das DFs disponível.',
  },
};

const TIME_OPTIONS: { label: string; value: number | null | 'custom' }[] = [
  { label: 'Sem limite', value: null },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
  { label: 'Personalizado', value: 'custom' },
];

export function ExamSetup({ preset }: { preset: string }) {
  const key = PRESETS[preset] ? preset : 'roteiro';
  const p = PRESETS[key];
  const existing = loadSession();
  const [count, setCount] = useState(p.count);
  const [time, setTime] = useState<number | null | 'custom'>(p.minutes);
  const [custom, setCustom] = useState(75);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<(CaseInfo & { questions: number })[]>([]);
  const [caseId, setCaseId] = useState<string>('surpresa');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    setCount(p.count);
    setTime(p.minutes);
  }, [key]);

  useEffect(() => {
    if (key === 'roteiro') api.cases().then(setCases).catch((e) => setError(e.message));
  }, [key]);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const minutes = time === 'custom' ? custom : time;
      if (p.mode === 'roteiro') {
        const pool = cases.length ? cases : [];
        if (!pool.length) throw new Error('Nenhum caso disponível.');
        const chosen = caseId === 'surpresa' ? pool[Math.floor(Math.random() * pool.length)] : pool.find((c) => c.id === caseId)!;
        const r = await api.buildExamWithAnnex({ mode: 'roteiro', caseId: chosen.id });
        if (!r.questions.length) throw new Error('Caso sem questões.');
        const s = createSession(r.questions, {
          mode: 'roteiro',
          title: `Simulado P1 — ${chosen.label}`,
          timeLimitSec: minutes == null ? null : minutes * 60,
          autoSubmit,
          caseTables: r.caseTables,
          caseId: chosen.id,
        });
        saveSession(s);
        navigate('/prova/executar');
        return;
      }
      const questions = await api.buildExam({ mode: p.mode === 'ambev' ? 'ambev' : 'p1', count, revealMeta: false });
      if (!questions.length) throw new Error('Nenhuma questão disponível.');
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

      <div className="seg wrap" role="group" aria-label="Tipo de simulado">
        {(['roteiro', 'p1', 'ambev'] as const).map((k) => (
          <button key={k} type="button" className={key === k ? 'on' : ''} aria-pressed={key === k} onClick={() => navigate(`/prova?preset=${k}`)}>
            {k === 'roteiro' ? 'Formato da prova (roteiro)' : k === 'p1' ? 'Prova mista' : 'Casos reais'}
          </button>
        ))}
      </div>

      {existing && (
        <div className="alert resume" role="status">
          <span>
            Há uma prova em andamento (<strong>{existing.title}</strong>). Iniciar outra descarta a atual.
          </span>
          <span className="row">
            <button className="btn btn-primary" onClick={() => navigate('/prova/executar')}>
              Retomar
            </button>
            {confirmDiscard ? (
              <button
                className="btn btn-danger"
                onClick={() => {
                  clearSession();
                  setConfirmDiscard(false);
                  navigate(`/prova?preset=${key}&r=${Date.now()}`);
                }}
              >
                Confirmar descarte
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={() => setConfirmDiscard(true)}>
                Descartar
              </button>
            )}
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
        {p.mode === 'roteiro' ? (
          <fieldset className="field">
            <legend>Empresa do caso</legend>
            <div className="case-grid">
              <button type="button" className={`case-card ${caseId === 'surpresa' ? 'on' : ''}`} aria-pressed={caseId === 'surpresa'} onClick={() => setCaseId('surpresa')}>
                <span className="topic-name">Surpresa</span>
                <span className="topic-meta">Sorteia um dos casos — como na prova, você não sabe qual empresa vem.</span>
              </button>
              {cases.map((c) => (
                <button key={c.id} type="button" className={`case-card ${caseId === c.id ? 'on' : ''}`} aria-pressed={caseId === c.id} onClick={() => setCaseId(c.id)}>
                  <span className="topic-name">
                    {c.label}
                    <span className={`badge ${c.source === 'real' ? 'badge-real' : 'badge-fict'}`}>{c.source === 'real' ? 'real' : 'fictício'}</span>
                  </span>
                  <span className="topic-meta">{c.description}</span>
                </button>
              ))}
            </div>
            <p className="help">12 perguntas: 4 de Balanço, 5 de DRE e 3 de Estratégia. O anexo com as DFs (A.V. e A.H. prontos) fica disponível no botão "Consultar anexo".</p>
          </fieldset>
        ) : (
          <div className="field">
            <label htmlFor="count">Número de questões</label>
            <input id="count" type="number" min={5} max={p.mode === 'ambev' ? 40 : 50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            <p className="help">{p.mode === 'ambev' ? 'Entre 5 e 40.' : 'Sugerido: 20 a 25 questões.'}</p>
          </div>
        )}

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
            {p.mode === 'roteiro' ? (
              <>
                <li>Responda com base nas demonstrações anexas, citando sempre os números (A.V. e A.H.) que sustentam a análise.</li>
                <li>Resposta sem número vale no máximo metade — a correção aplica essa regra.</li>
                <li>Julgue sempre por comparação: ano anterior, pares, custo de capital. Evite "bom/ruim" sem referência.</li>
                <li>A correção automática das discursivas é aproximada; compare sua resposta com a resposta-modelo no relatório.</li>
              </>
            ) : (
              <>
                <li>Uma questão por vez, com navegação livre e marcação para revisão.</li>
                <li>O tema da questão não é exibido: identifique sozinho qual conceito aplicar.</li>
                <li>Sem dicas e sem correção durante a prova. O relatório completo aparece após a entrega.</li>
              </>
            )}
            <li>Suas respostas são salvas automaticamente. Se fechar a página, retome pelo painel (o cronômetro pausa enquanto a página está fechada).</li>
            <li>Atalhos: A–E escolhem alternativas, V/F em verdadeiro ou falso, ← → navegam, R marca para revisão.</li>
          </ul>
        </div>

        {error && (
          <p className="alert bad" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy || (p.mode !== 'roteiro' && count < 5) || (p.mode === 'roteiro' && !cases.length)}>
          {busy ? 'Montando a prova…' : 'Começar a prova'}
        </button>
      </form>
    </div>
  );
}
