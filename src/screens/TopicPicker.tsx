import { useEffect, useMemo, useState } from 'react';
import { GROUPS, GROUP_IDS, TOPICS, TOPIC_IDS, type TopicId } from '../../shared/topics';
import { api, type Catalog } from '../lib/api';
import { masteryByTopic } from '../lib/progress';
import { navigate } from '../lib/router';

export function TopicPicker() {
  const [selected, setSelected] = useState<TopicId[]>([]);
  const [count, setCount] = useState(10);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const mastery = useMemo(() => masteryByTopic(), []);

  useEffect(() => {
    api.catalog().then(setCatalog).catch(() => undefined);
  }, []);

  const toggle = (t: TopicId) => setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  const available = selected.reduce((n, t) => n + (catalog?.byTopic[t] ?? 0), 0);

  return (
    <div className="page">
      <p className="eyebrow">Treino por tema</p>
      <h1>Escolha o que treinar</h1>
      <p className="lead">Selecione um ou mais temas. As questões vêm com correção imediata, dica, fórmula e solução passo a passo.</p>

      <div className="row wrap">
        <button className="btn btn-secondary" onClick={() => navigate(`/estudo?mode=mixed&count=${count}`)}>
          Misturado (todos os temas)
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/estudo?mode=ambev&count=${Math.min(count, catalog?.ambev ?? count)}`)}>
          Caso Ambev {catalog && <>({catalog.ambev})</>}
        </button>
      </div>

      {GROUP_IDS.map((g) => (
        <section key={g} className="topic-group">
          <h2>{GROUPS[g].label}</h2>
          <div className="topic-grid">
            {TOPIC_IDS.filter((t) => TOPICS[t].group === g).map((t) => {
              const on = selected.includes(t);
              const n = catalog?.byTopic[t] ?? 0;
              return (
                <button key={t} className={`topic-card ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(t)} disabled={catalog != null && n === 0}>
                  <span className="topic-name">{TOPICS[t].label}</span>
                  <span className="topic-meta">
                    {n} questões · {TOPICS[t].aula}
                    {mastery[t] != null && <> · domínio {mastery[t]}</>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky-cta">
        <label htmlFor="tcount">Questões</label>
        <input id="tcount" type="number" min={3} max={40} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <span className="muted small">{selected.length ? `${available} disponíveis nos temas escolhidos` : 'Nenhum tema selecionado'}</span>
        <button
          className="btn btn-primary"
          disabled={!selected.length}
          onClick={() => navigate(`/estudo?mode=topic&count=${Math.min(count, available)}&topics=${selected.join(',')}`)}
        >
          Iniciar treino
        </button>
      </div>
    </div>
  );
}
