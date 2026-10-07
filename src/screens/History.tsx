import { useMemo, useState } from 'react';
import { formatDuration } from '../lib/examState';
import { getHistory } from '../lib/progress';
import { navigate } from '../lib/router';
import { KEYS, removeKey } from '../lib/storage';

const KIND_LABEL: Record<string, string> = {
  p1: 'Prova real',
  ambev: 'Caso Ambev',
  custom: 'Prova',
  study: 'Estudo guiado',
  review: 'Revisão dos erros',
  topic: 'Treino por tema',
  adaptive: 'Adaptativa',
  roteiro: 'Roteiro da prova',
};

export function History() {
  const [version, setVersion] = useState(0);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const hist = useMemo(getHistory, [version]);

  return (
    <div className="page">
      <p className="eyebrow">Histórico</p>
      <h1>Histórico de simulados</h1>
      {!hist.length ? (
        <p className="lead">Nenhuma sessão registrada ainda.</p>
      ) : (
        <div className="dt-scroll" tabIndex={0} role="region" aria-label="Histórico">
          <table className="history">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Tipo</th>
                <th scope="col">Título</th>
                <th scope="col" className="num">
                  Questões
                </th>
                <th scope="col" className="num">
                  Nota
                </th>
                <th scope="col" className="num">
                  Duração
                </th>
                <th scope="col">
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {hist.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{KIND_LABEL[r.kind] ?? r.kind}</td>
                  <td>{r.title}</td>
                  <td className="num">{r.questions.length}</td>
                  <td className="num">
                    {r.earned.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/{r.total} · <strong>{r.percent.toFixed(0)}%</strong>
                  </td>
                  <td className="num">{formatDuration(r.durationSec)}</td>
                  <td>
                    <button className="btn btn-ghost small" onClick={() => navigate(`/relatorio/${r.id}`)}>
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details className="danger-zone">
        <summary>Apagar dados locais</summary>
        <p className="muted">Remove histórico, tentativas e domínio deste navegador. Não pode ser desfeito.</p>
        {confirmWipe ? (
          <span className="row">
            <button
              className="btn btn-danger small"
              onClick={() => {
                [KEYS.history, KEYS.attempts, KEYS.seen, KEYS.activeExam].forEach(removeKey);
                setConfirmWipe(false);
                setVersion((v) => v + 1);
              }}
            >
              Confirmar: apagar tudo
            </button>
            <button className="btn btn-ghost small" onClick={() => setConfirmWipe(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <button className="btn btn-danger small" onClick={() => setConfirmWipe(true)}>
            Apagar tudo
          </button>
        )}
      </details>
    </div>
  );
}
