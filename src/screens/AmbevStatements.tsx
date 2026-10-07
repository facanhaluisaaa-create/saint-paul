import { AMBEV_SOURCE, ambevBalanceTable, ambevIncomeTable } from '../../shared/ambev';
import { DataTableView } from '../components/DataTable';

export function AmbevStatementsPanel() {
  return (
    <div className="ambev-panel">
      <p className="badge badge-real">{AMBEV_SOURCE} Valores em R$ mil.</p>
      <DataTableView table={ambevBalanceTable()} />
      <DataTableView table={ambevIncomeTable()} />
    </div>
  );
}

export function AmbevStatements() {
  return (
    <div className="page">
      <p className="eyebrow">Caso Ambev</p>
      <h1>Demonstrações financeiras — Ambev 2025 × 2024</h1>
      <p className="lead">Balanço Patrimonial e DRE consolidados usados nas questões do caso. Nas análises, cite sempre os números.</p>
      <AmbevStatementsPanel />
    </div>
  );
}
