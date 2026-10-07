import type { DataTable as DT } from '../../shared/types';

const isNumeric = (v: string | number) => typeof v === 'number' || /^[-−(]?\s*(R\$\s*)?[\d.,]+%?\)?x?$/.test(String(v).trim());
const fmt = (v: string | number) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v);

export function DataTableView({ table }: { table: DT }) {
  return (
    <figure className="dt">
      {table.caption && <figcaption className="dt-caption">{table.caption}</figcaption>}
      <div className="dt-scroll" tabIndex={0} role="region" aria-label={table.caption ?? 'Tabela de dados'}>
        <table>
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} scope="col" className={i > 0 ? 'num' : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className={table.totalRows?.includes(r) ? 'total' : undefined}>
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row" className={String(cell).startsWith('  ') ? 'indent' : undefined}>
                      {String(cell).trim()}
                    </th>
                  ) : (
                    <td key={c} className={isNumeric(cell) ? 'num' : undefined}>
                      {fmt(cell)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note && <p className="dt-note">{table.note}</p>}
    </figure>
  );
}
