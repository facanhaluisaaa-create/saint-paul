import { describe, expect, it } from 'vitest';
import { isNumericCorrect, normalizeToUnit, parseNumberInput } from '../shared/numeric';

describe('leitura de números', () => {
  it('aceita formato brasileiro e internacional', () => {
    expect(parseNumberInput('1.234,56')?.value).toBe(1234.56);
    expect(parseNumberInput('1,234.56')?.value).toBe(1234.56);
    expect(parseNumberInput('0,96')?.value).toBe(0.96);
    expect(parseNumberInput('0.96')?.value).toBe(0.96);
    expect(parseNumberInput('1.000')?.value).toBe(1000);
    expect(parseNumberInput('R$ 15.988.433')?.value).toBe(15988433);
    expect(parseNumberInput('0,61x')?.value).toBe(0.61);
    expect(parseNumberInput('−12,5%')).toEqual({ value: -12.5, hasPercent: true });
    expect(parseNumberInput('abc')).toBeNull();
    expect(parseNumberInput('')).toBeNull();
  });
});

describe('equivalência 0,18 / 18% / 18', () => {
  it('normaliza para a unidade percentual', () => {
    expect(normalizeToUnit('18', 'percent', 18)).toBe(18);
    expect(normalizeToUnit('18%', 'percent', 18)).toBe(18);
    expect(normalizeToUnit('0,18', 'percent', 18)).toBeCloseTo(18);
    expect(normalizeToUnit('-0,12', 'percent', -12)).toBeCloseTo(-12);
  });

  it('aceita as três formas como corretas', () => {
    for (const v of ['18', '18%', '0,18', '18,0', '17,95', '18,04%']) expect(isNumericCorrect(v, 'percent', 18, 1)).toBe(true);
  });

  it('rejeita o erro de escala 0,18%', () => {
    expect(isNumericCorrect('0,18%', 'percent', 18, 1)).toBe(false);
    expect(isNumericCorrect('1,8', 'percent', 18, 1)).toBe(false);
  });

  it('respeita a tolerância de arredondamento', () => {
    expect(isNumericCorrect('17,99', 'percent', 18.0, 2)).toBe(true);
    expect(isNumericCorrect('17,8', 'percent', 18.0, 2)).toBe(false);
    expect(isNumericCorrect('0,96', 'ratio', 0.96, 2)).toBe(true);
    expect(isNumericCorrect('0,97', 'ratio', 0.96, 2)).toBe(true); // tolerância 0,01
    expect(isNumericCorrect('0,95', 'ratio', 0.962, 2)).toBe(false);
    expect(isNumericCorrect('96%', 'ratio', 0.96, 2)).toBe(true);
    expect(isNumericCorrect('1.000', 'units', 1000, 0)).toBe(true);
  });

  it('percentual pequeno esperado não é multiplicado por 100', () => {
    // Esperado 0,5%: digitar 0,5 deve valer 0,5%
    expect(isNumericCorrect('0,5', 'percent', 0.5, 1)).toBe(true);
  });
});
