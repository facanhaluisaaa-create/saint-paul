import type { NumericUnit } from './types';

/**
 * Converte texto digitado em número, aceitando formato brasileiro e internacional:
 * "18", "18%", "0,18", "1.234,56", "1,234.56", "R$ 1.000", "0,96x", "-12,5%".
 */
export function parseNumberInput(raw: string): { value: number; hasPercent: boolean } | null {
  if (raw == null) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;
  const hasPercent = s.includes('%');
  s = s.replace(/r\$|%|x|vezes|unidades|un\.?|pp|p\.p\./g, '').replace(/\s+/g, '');
  s = s.replace(/[−–—]/g, '-');
  if (!s) return null;
  if (!/^[-+]?[\d.,]+$/.test(s)) return null;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    // O separador que aparece por último é o decimal.
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (lastComma >= 0) {
    const commas = s.split(',').length - 1;
    if (commas > 1) s = s.replace(/,/g, '');
    else s = s.replace(',', '.');
  } else if (lastDot >= 0) {
    const dots = s.split('.').length - 1;
    const after = s.length - lastDot - 1;
    // "1.000" ou "1.000.000" → milhar; "0.96" / "1.5" → decimal
    if (dots > 1 || (after === 3 && !/^[-+]?0\./.test(s))) s = s.replace(/\./g, '');
  }
  const value = Number(s);
  if (!Number.isFinite(value)) return null;
  return { value, hasPercent };
}

/**
 * Normaliza a resposta para a unidade esperada.
 * Para percentuais: "18", "18%" e "0,18" são equivalentes quando o esperado é 18%.
 * "0,18%" NÃO é equivalente a 18% (pegadinha clássica de escala).
 */
export function normalizeToUnit(raw: string, unit: NumericUnit, expected: number): number | null {
  const parsed = parseNumberInput(raw);
  if (!parsed) return null;
  const { value, hasPercent } = parsed;
  if (unit === 'percent') {
    if (hasPercent) return value;
    // Fração decimal digitada (0,18) quando a resposta esperada está claramente em % (> 1,5).
    if (Math.abs(value) <= 1 && Math.abs(expected) > 1.5) return value * 100;
    return value;
  }
  if ((unit === 'ratio' || unit === 'times') && hasPercent) {
    // "96%" para um índice de 0,96
    return value / 100;
  }
  return value;
}

export function defaultTolerance(unit: NumericUnit, decimals: number): number {
  // Meia unidade da última casa pedida + folga de arredondamento intermediário.
  const half = 0.5 * 10 ** -decimals;
  switch (unit) {
    case 'percent':
      return Math.max(half * 2, 0.1);
    case 'ratio':
    case 'times':
      return Math.max(half * 2, 0.01);
    case 'currency':
    case 'units':
      return Math.max(half * 2, 1);
  }
}

export function isNumericCorrect(
  raw: string,
  unit: NumericUnit,
  expected: number,
  decimals: number,
  tolerance?: number,
): boolean {
  const v = normalizeToUnit(raw, unit, expected);
  if (v == null) return false;
  const tol = tolerance ?? defaultTolerance(unit, decimals);
  return Math.abs(v - expected) <= tol + 1e-9;
}

export function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatWithUnit(value: number, unit: NumericUnit, decimals: number): string {
  const n = formatNumber(value, decimals);
  switch (unit) {
    case 'percent':
      return `${n}%`;
    case 'times':
      return `${n}x`;
    case 'currency':
      return `R$ ${n}`;
    case 'units':
      return `${n} unidades`;
    default:
      return n;
  }
}

export function unitLabel(unit: NumericUnit): string {
  return { percent: '%', ratio: 'índice', times: 'vezes (x)', currency: 'R$', units: 'unidades' }[unit];
}
