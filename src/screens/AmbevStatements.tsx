import { AMBEV_SOURCE, ambevAnnex } from '../../shared/ambev';
import { RENNER_SOURCE, rennerAnnex } from '../../shared/renner';
import type { DataTable } from '../../shared/types';
import { DataTableView } from '../components/DataTable';

export function AnnexPanel({ tables, note }: { tables: DataTable[]; note?: string }) {
  return (
    <div className="ambev-panel">
      {note && <p className="badge badge-real">{note}</p>}
      {tables.map((t, i) => (
        <DataTableView key={i} table={t} />
      ))}
    </div>
  );
}

export function AmbevStatementsPanel() {
  return <AnnexPanel tables={ambevAnnex()} note={AMBEV_SOURCE} />;
}

export function AmbevStatements() {
  return (
    <div className="page">
      <p className="eyebrow">Anexos das DFs</p>
      <h1>Demonstrações financeiras dos casos reais</h1>
      <p className="lead">
        Os anexos com A.V. e A.H. prontos, no formato da planilha da disciplina. Na prova a consulta ao anexo é permitida; nas análises, cite sempre os números.
      </p>
      <h2>Ambev S.A. — 2025 × 2024</h2>
      <AnnexPanel tables={ambevAnnex()} note={AMBEV_SOURCE} />
      <h2 className="mt">Lojas Renner S.A. — 2025 × 2024</h2>
      <AnnexPanel tables={rennerAnnex()} note={RENNER_SOURCE} />
    </div>
  );
}
