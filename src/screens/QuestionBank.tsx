// Rota de desenvolvimento (/question-bank): auditoria do banco. Não existe no build de produção.
import { useEffect, useMemo, useState } from 'react';
import { TOPICS } from '../../shared/topics';
import { api } from '../lib/api';

type Q = any;

function answerOf(q: Q): string {
  switch (q.type) {
    case 'multiple-choice':
      return `${q.correct}) ${q.options.find((o: any) => o.id === q.correct)?.text}`;
    case 'true-false':
      return q.correct ? 'Verdadeiro' : 'Falso';
    case 'numeric':
      return `${q.correct} (${q.unit}, ${q.decimals} casas) ← ${q.calc.fn}(${q.calc.args.join(', ')})`;
    case 'classification':
      return q.items.map((i: any) => `${i.label}: ${q.correct[i.id]}`).join(' · ');
    case 'debit-credit':
      return q.accounts.map((a: any) => `${q.correct[a.id]} ${a.label}`).join(' · ');
    case 'ordering':
      return q.items.map((i: any) => i.label).join(' → ');
    case 'multi-part':
      return q.parts.map((p: any) => `${p.id}) ${p.kind === 'text' ? 'rubrica' : p.correct}`).join(' · ');
    default:
      return `rubrica (${q.rubric.criteria.length} critérios)`;
  }
}

export function QuestionBank() {
  const [data, setData] = useState<{ questions: Q[]; issues: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    api.devBank().then(setData).catch((e) => setError(e.message));
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const t = text.toLowerCase();
    return data.questions.filter((q) => (!topic || q.topic === topic) && (!t || JSON.stringify(q).toLowerCase().includes(t)));
  }, [data, topic, text]);

  if (error) return <div className="page">Erro: {error}</div>;
  if (!data) return <div className="page loading">Carregando banco…</div>;

  const count = (k: string) => data.questions.reduce<Record<string, number>>((a, q) => ((a[q[k]] = (a[q[k]] ?? 0) + 1), a), {});
  const errors = data.issues.filter((i) => i.level === 'error');

  return (
    <div className="page wide">
      <p className="eyebrow">Modo professor / debug — somente desenvolvimento</p>
      <h1>Banco de questões ({data.questions.length})</h1>
      <p className={errors.length ? 'alert bad' : 'alert ok'}>
        Validação: {errors.length} erro(s), {data.issues.length - errors.length} aviso(s).
      </p>
      <div className="grid-3">
        {(['difficulty', 'cognitiveLevel', 'type', 'dataSource'] as const).map((k) => (
          <section key={k} className="card">
            <h2>{k}</h2>
            <ul className="kv">
              {Object.entries(count(k)).map(([v, n]) => (
                <li key={v}>
                  <span>{v}</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="row wrap">
        <select aria-label="Filtrar por tema" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">Todos os temas</option>
          {Object.entries(TOPICS).map(([id, t]) => (
            <option key={id} value={id}>
              {t.label}
            </option>
          ))}
        </select>
        <input aria-label="Buscar" placeholder="Buscar texto…" value={text} onChange={(e) => setText(e.target.value)} />
        <span className="muted">{rows.length} questões</span>
      </div>
      <div className="dt-scroll">
        <table className="bank">
          <thead>
            <tr>
              <th>id</th>
              <th>tema</th>
              <th>dif.</th>
              <th>nível</th>
              <th>tipo</th>
              <th>origem</th>
              <th>enunciado</th>
              <th>resposta</th>
              <th>fonte</th>
              <th>validação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const iss = data.issues.filter((i) => i.id === q.id);
              return (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{TOPICS[q.topic as keyof typeof TOPICS]?.label}</td>
                  <td>{q.difficulty}</td>
                  <td>{q.cognitiveLevel}</td>
                  <td>{q.type}</td>
                  <td>{q.dataSource}</td>
                  <td className="clip">{q.stem}</td>
                  <td className="clip">{answerOf(q)}</td>
                  <td className="clip">{q.sourceReference}</td>
                  <td>{iss.length ? iss.map((i) => i.message).join('; ') : 'OK'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
