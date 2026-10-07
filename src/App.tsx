import { useEffect, useState, type ReactElement } from 'react';
import { navigate, useRoute } from './lib/router';
import { Dashboard } from './screens/Dashboard';
import { ExamSetup } from './screens/ExamSetup';
import { ExamRunner } from './screens/ExamRunner';
import { Report } from './screens/Report';
import { Study } from './screens/Study';
import { TopicPicker } from './screens/TopicPicker';
import { Adaptive } from './screens/Adaptive';
import { Express } from './screens/Express';
import { History } from './screens/History';
import { QuestionBank } from './screens/QuestionBank';
import { AmbevStatements } from './screens/AmbevStatements';

const NAV = [
  { path: '/', label: 'Painel' },
  { path: '/prova?preset=roteiro', label: 'Simular P1' },
  { path: '/tema', label: 'Treino por tema' },
  { path: '/estudo?mode=review', label: 'Meus erros' },
  { path: '/adaptativa', label: 'Adaptativa' },
  { path: '/expressa', label: 'Revisão expressa' },
  { path: '/ambev', label: 'Anexos (DFs)' },
  { path: '/historico', label: 'Histórico' },
];

export function App() {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const inExam = route.path === '/prova/executar';

  useEffect(() => setMenuOpen(false), [route.path]);

  let screen: ReactElement;
  const reportMatch = route.path.match(/^\/relatorio\/(.+)$/);
  switch (true) {
    case route.path === '/':
      screen = <Dashboard />;
      break;
    case route.path === '/prova':
      screen = <ExamSetup preset={route.params.get('preset') ?? 'p1'} />;
      break;
    case inExam:
      screen = <ExamRunner />;
      break;
    case !!reportMatch:
      screen = <Report id={reportMatch![1]} />;
      break;
    case route.path === '/estudo':
      screen = <Study key={route.params.toString()} params={route.params} />;
      break;
    case route.path === '/tema':
      screen = <TopicPicker />;
      break;
    case route.path === '/adaptativa':
      screen = <Adaptive />;
      break;
    case route.path === '/expressa':
      screen = <Express />;
      break;
    case route.path === '/historico':
      screen = <History />;
      break;
    case route.path === '/ambev':
      screen = <AmbevStatements />;
      break;
    case route.path === '/question-bank':
      screen = import.meta.env.DEV ? <QuestionBank /> : <NotFound />;
      break;
    default:
      screen = <NotFound />;
  }

  return (
    <div className={`app ${inExam ? 'exam-mode' : ''}`}>
      <a className="skip" href="#main">
        Ir para o conteúdo
      </a>
      {!inExam && (
        <header className="topbar">
          <div className="topbar-inner">
            <a className="brand" href="#/" aria-label="Painel inicial">
              <span className="brand-mark" aria-hidden="true">
                P1
              </span>
              <span className="brand-text">
                <strong>Contabilidade para Tomada de Decisões I</strong>
                <span>Escola de Negócios Saint Paul · Prof. Dr. Arthur Tornatore Siessere · 2º sem. 2026</span>
              </span>
            </a>
            <button className="menu-btn" aria-expanded={menuOpen} aria-controls="mainnav" onClick={() => setMenuOpen((v) => !v)}>
              Menu
            </button>
            <nav id="mainnav" className={menuOpen ? 'open' : ''} aria-label="Navegação principal">
              {NAV.map((n) => {
                const [np, nq = ''] = n.path.split('?');
                const active =
                  np === route.path &&
                  [...new URLSearchParams(nq)].every(([k, v]) => k === 'preset' || route.params.get(k) === v) &&
                  (np !== '/estudo' || route.params.get('mode') === 'review');
                return (
                  <a key={n.path} href={`#${n.path}`} aria-current={active ? 'page' : undefined}>
                    {n.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </header>
      )}
      <main id="main" tabIndex={-1}>
        {screen}
      </main>
      {!inExam && (
        <footer className="footer">
          <p>
            Ferramenta de estudo independente. Conteúdo baseado no resumo da P1; dados da Ambev extraídos da DFP consolidada 2025 × 2024 (CVM). Casos com outros
            nomes são fictícios.
          </p>
        </footer>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="page narrow">
      <h1>Página não encontrada</h1>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Voltar ao painel
      </button>
    </div>
  );
}
