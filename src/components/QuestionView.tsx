import { useId } from 'react';
import type { Answer, PublicPart, PublicQuestion } from '../../shared/types';
import { unitLabel } from '../../shared/numeric';
import { TOPICS } from '../../shared/topics';
import { DataTableView } from './DataTable';

const DIFF: Record<string, string> = { easy: 'Fácil', medium: 'Média', hard: 'Difícil' };
const LEVEL: Record<string, string> = {
  recognition: 'Reconhecer',
  calculation: 'Calcular',
  interpretation: 'Interpretar',
  analysis: 'Analisar',
};

export function SourceBadge({ q }: { q: PublicQuestion }) {
  if (q.dataSource === 'real-ambev') return <span className="badge badge-real">Dados reais — Ambev (DFP 2025 × 2024)</span>;
  if (q.dataSource === 'ficticio') return <span className="badge badge-fict">Caso fictício para estudo</span>;
  return null;
}

export function MetaLine({ q }: { q: PublicQuestion }) {
  if (!q.topic) return null;
  return (
    <p className="meta-line">
      <span>Tema: {TOPICS[q.topic].label}</span>
      {q.difficulty && <span>· {DIFF[q.difficulty]}</span>}
      {q.cognitiveLevel && <span>· {LEVEL[q.cognitiveLevel]}</span>}
    </p>
  );
}

function percentHelp(unit?: string) {
  if (unit === 'percent') return 'Aceita 18, 18% ou 0,18 para 18%.';
  if (unit === 'times') return 'Ex.: 0,61 ou 0,61x.';
  if (unit === 'ratio') return 'Ex.: 0,96.';
  return undefined;
}

function NumericInput({ id, value, unit, decimals, onChange, disabled, label }: { id: string; value: string; unit?: string; decimals?: number; onChange: (v: string) => void; disabled?: boolean; label: string }) {
  const help = percentHelp(unit);
  return (
    <div className="numeric">
      <label htmlFor={id}>{label}</label>
      <div className="numeric-row">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-help`}
        />
        {unit && <span className="unit">{unitLabel(unit as any)}</span>}
      </div>
      <p id={`${id}-help`} className="help">
        {decimals != null && `Arredonde para ${decimals} casa${decimals === 1 ? '' : 's'} decimal${decimals === 1 ? '' : 'is'}. `}
        {help}
      </p>
    </div>
  );
}

function ChoiceList({ name, options, value, onChange, disabled, label }: { name: string; options: { id: string; text: string }[]; value?: string; onChange: (v: string) => void; disabled?: boolean; label: string }) {
  return (
    <fieldset className="choices" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <label key={o.id} className={`choice ${value === o.id ? 'selected' : ''}`}>
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
          <span className="letter" aria-hidden="true">
            {o.id}
          </span>
          <span className="choice-text">{o.text}</span>
        </label>
      ))}
    </fieldset>
  );
}

function TextAnswer({ id, value, onChange, disabled, label, rows = 6 }: { id: string; value: string; onChange: (v: string) => void; disabled?: boolean; label: string; rows?: number }) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="text-answer">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={rows} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      <p className="help">{words} palavra{words === 1 ? '' : 's'} · Seja objetivo: a correção avalia conceitos, não extensão.</p>
    </div>
  );
}

function Segmented({ label, options, value, onChange, disabled }: { label: string; options: { id: string; label: string }[]; value?: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="seg-row" role="group" aria-label={label}>
      <span className="seg-label">{label}</span>
      <div className="seg">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={value === o.id ? 'on' : ''}
            aria-pressed={value === o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PartView({ qid, part, value, onChange, disabled }: { qid: string; part: PublicPart; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const id = `${qid}-${part.id}`;
  const pts = `(${part.points.toLocaleString('pt-BR')} pt${part.points === 1 ? '' : 's'})`;
  return (
    <div className="part">
      <p className="part-prompt">
        <strong>{part.id})</strong> {part.prompt} <span className="pts">{pts}</span>
      </p>
      {part.kind === 'numeric' && <NumericInput id={id} label="Resposta" value={value} unit={part.unit} decimals={part.decimals} onChange={onChange} disabled={disabled} />}
      {part.kind === 'choice' && <ChoiceList name={id} label={part.prompt} options={part.options} value={value} onChange={onChange} disabled={disabled} />}
      {part.kind === 'text' && <TextAnswer id={id} label="Sua resposta" rows={4} value={value} onChange={onChange} disabled={disabled} />}
    </div>
  );
}

export function QuestionBody({ q }: { q: PublicQuestion }) {
  return (
    <>
      {q.context && <p className="context">{q.context}</p>}
      {q.tables?.map((t, i) => <DataTableView key={i} table={t} />)}
      <div className="stem">
        {q.stem.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {q.operation && (
        <p className="operation">
          <span>Fato contábil:</span> {q.operation}
        </p>
      )}
    </>
  );
}

interface Props {
  q: PublicQuestion;
  answer?: Answer;
  onChange: (a: Answer) => void;
  disabled?: boolean;
}

export function AnswerInput({ q, answer, onChange, disabled }: Props) {
  const uid = useId();
  const id = `${uid}-${q.id}`;
  switch (q.type) {
    case 'multiple-choice':
      return (
        <ChoiceList
          name={id}
          label="Alternativas"
          options={q.options ?? []}
          value={answer?.kind === 'choice' ? answer.value : undefined}
          onChange={(v) => onChange({ kind: 'choice', value: v })}
          disabled={disabled}
        />
      );
    case 'true-false': {
      const v = answer?.kind === 'boolean' ? answer.value : undefined;
      return (
        <fieldset className="choices tf" disabled={disabled}>
          <legend className="sr-only">Verdadeiro ou falso</legend>
          {[
            { val: true, label: 'Verdadeiro', key: 'V' },
            { val: false, label: 'Falso', key: 'F' },
          ].map((o) => (
            <label key={o.label} className={`choice ${v === o.val ? 'selected' : ''}`}>
              <input type="radio" name={id} checked={v === o.val} onChange={() => onChange({ kind: 'boolean', value: o.val })} />
              <span className="letter" aria-hidden="true">
                {o.key}
              </span>
              <span className="choice-text">{o.label}</span>
            </label>
          ))}
        </fieldset>
      );
    }
    case 'numeric':
      return (
        <NumericInput
          id={id}
          label="Sua resposta"
          value={answer?.kind === 'number' ? answer.value : ''}
          unit={q.unit}
          decimals={q.decimals}
          onChange={(v) => onChange({ kind: 'number', value: v })}
          disabled={disabled}
        />
      );
    case 'short-answer':
    case 'essay':
      return (
        <TextAnswer
          id={id}
          label={q.type === 'essay' ? 'Resposta discursiva' : 'Resposta curta'}
          rows={q.type === 'essay' ? 9 : 5}
          value={answer?.kind === 'text' ? answer.value : ''}
          onChange={(v) => onChange({ kind: 'text', value: v })}
          disabled={disabled}
        />
      );
    case 'classification': {
      const map = answer?.kind === 'map' ? answer.value : {};
      return (
        <div className="classify">
          {(q.items ?? []).map((it) => (
            <Segmented
              key={it.id}
              label={it.label}
              options={q.categories ?? []}
              value={map[it.id]}
              disabled={disabled}
              onChange={(v) => onChange({ kind: 'map', value: { ...map, [it.id]: v } })}
            />
          ))}
        </div>
      );
    }
    case 'debit-credit': {
      const map = answer?.kind === 'map' ? answer.value : {};
      return (
        <div className="classify dc">
          {(q.accounts ?? []).map((a) => (
            <Segmented
              key={a.id}
              label={a.label}
              options={[
                { id: 'D', label: 'Débito' },
                { id: 'C', label: 'Crédito' },
              ]}
              value={map[a.id]}
              disabled={disabled}
              onChange={(v) => onChange({ kind: 'map', value: { ...map, [a.id]: v } })}
            />
          ))}
        </div>
      );
    }
    case 'ordering': {
      const items = q.items ?? [];
      const order = answer?.kind === 'order' && answer.value.length === items.length ? answer.value : items.map((i) => i.id);
      const label = (oid: string) => items.find((i) => i.id === oid)?.label ?? oid;
      const move = (i: number, d: number) => {
        const next = [...order];
        const j = i + d;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        onChange({ kind: 'order', value: next });
      };
      return (
        <div className="ordering">
          <ol>
            {order.map((oid, i) => (
              <li key={oid}>
                <span className="ord-n">{i + 1}</span>
                <span className="ord-label">{label(oid)}</span>
                <span className="ord-btns">
                  <button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Subir "${label(oid)}"`}>
                    ↑
                  </button>
                  <button type="button" disabled={disabled || i === order.length - 1} onClick={() => move(i, 1)} aria-label={`Descer "${label(oid)}"`}>
                    ↓
                  </button>
                </span>
              </li>
            ))}
          </ol>
          {answer?.kind !== 'order' && !disabled && (
            <button type="button" className="btn btn-ghost small" onClick={() => onChange({ kind: 'order', value: order })}>
              Confirmar esta ordem
            </button>
          )}
        </div>
      );
    }
    case 'multi-part': {
      const map = answer?.kind === 'parts' ? answer.value : {};
      return (
        <div className="parts">
          {(q.parts ?? []).map((p) => (
            <PartView key={p.id} qid={id} part={p} value={map[p.id] ?? ''} disabled={disabled} onChange={(v) => onChange({ kind: 'parts', value: { ...map, [p.id]: v } })} />
          ))}
        </div>
      );
    }
  }
}

/** Atalhos de teclado A–E / V–F para escolher alternativas. Retorna true se tratou a tecla. */
export function handleChoiceKey(e: KeyboardEvent, q: PublicQuestion | undefined, onChange: (a: Answer) => void): boolean {
  if (!q) return false;
  const k = e.key.toUpperCase();
  if (q.type === 'multiple-choice' && q.options?.some((o) => o.id === k)) {
    onChange({ kind: 'choice', value: k });
    return true;
  }
  if (q.type === 'true-false' && (k === 'V' || k === 'F' || k === 'A' || k === 'B')) {
    onChange({ kind: 'boolean', value: k === 'V' || k === 'A' });
    return true;
  }
  return false;
}

export function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' && (el as HTMLInputElement).type !== 'radio' ? true : tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}
