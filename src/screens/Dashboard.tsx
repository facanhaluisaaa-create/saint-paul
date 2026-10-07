import { useEffect, useMemo, useState } from 'react';
import { GROUPS } from '../../shared/topics';
import { MasteryBars, TrendChart } from '../components/Charts';
import { api, type Catalog } from '../lib/api';
import { formatClock, loadSession, remainingSec, summary } from '../lib/examState';
import { dashboardStats, masteryByGroup, studentSignals, studyPriorities } from '../lib/progress';
import { navigate } from '../lib/router';

const pct = (v: number | null) => (v == null ? '—' : `${v.toFixed(0)}%`);

export function Dashboard() {
  const stats = useMemo(dashboardStats, []);
  const mastery = useMemo(() => masteryByGroup(), []);
  const priorities = useMemo(() => studyPriorities(3), []);
  const active = useMemo(loadSession, []);
  const wrongCount = useMemo(() => studentSignals().wrongSkills.length, []);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.catalog().then(setCatalog).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Avaliação P1 · Simulados</p>
          <h1>Sua preparação</h1>
          <p className="lead">
            Simule a prova, corrija com profundidade e repita até dominar. {catalog && <>Banco com {catalog.total} questões construídas a partir das Aulas 1 a 5, da atividade da Aula 4, da planilha e do Caso Ambev.</>}
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/prova?preset=roteiro')}>
            Iniciar P1 simulada
          </button>
          <p className="muted small">Formato da prova: roteiro em 3 partes com consulta às DFs.</p>
        </div>
      </section>

      {error && (
        <div className="alert bad" role="alert">
          Não foi possível conectar ao servidor de correção ({error}). Rode <code>npm run dev</code> e recarregue a página.
        </div>
      )}

      {active && (
        <div className="alert resume" role="status">
          <div>
            <strong>Prova em andamento:</strong> {active.title} — {summary(active).answered} de {active.questions.length} respondidas
            {active.timeLimitSec != null && <> · tempo restante {formatClock(remainingSec(active) ?? 0)}</>}.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/prova/executar')}>
            Retomar prova
          </button>
        </div>
      )}

      <section className="stats" aria-label="Indicadores de desempenho">
        <div className="stat">
          <span className="stat-label">Nota média</span>
          <span className="stat-value">{pct(stats.average)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Melhor simulado</span>
          <span className="stat-value">{pct(stats.best)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Último</span>
          <span className="stat-value">{pct(stats.last)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Questões realizadas</span>
          <span className="stat-value">{stats.questionsDone}</span>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>Domínio por tema</h2>
          <p className="muted small">Escala 0–100. Considera acertos, dificuldade, recência e recuperação após erro.</p>
          <MasteryBars values={mastery} />
        </section>

        <section className="card">
          <h2>Prioridade de estudo</h2>
          {priorities.length ? (
            <ol className="priorities">
              {priorities.map((p) => (
                <li key={p.group}>
                  <span>{GROUPS[p.group].label}</span>
                  <span className="muted">{p.mastery == null ? 'não iniciado' : `domínio ${p.mastery}`}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Todos os temas estão acima de 85. Faça um simulado completo para confirmar.</p>
          )}
          <h3 className="mt">Evolução nos simulados</h3>
          <TrendChart points={stats.trend} />
        </section>
      </div>

      <section className="actions" aria-label="Ações">
        <h2>O que fazer agora</h2>
        <div className="action-grid">
          <ActionCard title="Prova no formato da P1" text="Roteiro em 3 partes (Balanço · DRE · Estratégia) sobre as DFs de uma empresa, com consulta ao anexo. Ambev, Renner ou caso surpresa." onClick={() => navigate('/prova?preset=roteiro')} />
          <ActionCard title="Prova mista" text="25 questões objetivas, numéricas e discursivas curtas cobrindo as Aulas 1 a 5, com cronômetro e correção só no final." onClick={() => navigate('/prova?preset=p1')} />
          <ActionCard title="Estudo guiado" text="Correção e explicação após cada resposta, com dica, fórmula e solução passo a passo." onClick={() => navigate('/estudo?mode=mixed&count=12')} />
          <ActionCard
            title="Treinar meus erros"
            text={wrongCount ? `${wrongCount} habilidade(s) pendente(s). Variações das questões que você errou.` : 'Disponível depois que você responder algumas questões.'}
            onClick={() => navigate('/estudo?mode=review&count=10')}
            disabled={!wrongCount}
          />
          <ActionCard title="Treinar tema" text="Escolha um ou mais temas (BP, débito e crédito, DRE, A.V./A.H., margens, DuPont...)." onClick={() => navigate('/tema')} />
          <ActionCard title="Casos reais: Ambev e Renner" text="Questões objetivas e numéricas sobre as DFs reais 2025 × 2024, com o anexo disponível." onClick={() => navigate('/prova?preset=ambev')} />
          <ActionCard title="Prova adaptativa" text="A dificuldade sobe quando você acerta; ao errar, volta aos fundamentos antes de avançar." onClick={() => navigate('/adaptativa')} />
          <ActionCard title="Revisão expressa" text="Todas as fórmulas e regras da P1 em cartões compactos." onClick={() => navigate('/expressa')} />
          <ActionCard title="Histórico" text={`${stats.exams} simulado(s) realizado(s). Abra qualquer prova antiga com a correção completa.`} onClick={() => navigate('/historico')} />
        </div>
      </section>
    </div>
  );
}

function ActionCard({ title, text, onClick, disabled }: { title: string; text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button className="action-card" onClick={onClick} disabled={disabled}>
      <span className="action-title">{title}</span>
      <span className="action-text">{text}</span>
    </button>
  );
}
