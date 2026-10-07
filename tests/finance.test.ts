import { describe, expect, it } from 'vitest';
import * as F from '../shared/finance';
import { AMBEV } from '../shared/ambev';

describe('fórmulas da disciplina', () => {
  it('A.V. = conta / base × 100', () => {
    expect(F.analiseVertical(250, 1000)).toBe(25);
    expect(F.round(F.analiseVertical(AMBEV.bp[2025].intangivel, AMBEV.bp[2025].ativoTotal), 2)).toBe(36.24);
  });

  it('A.H. = (atual − anterior) / anterior × 100, com sinal', () => {
    expect(F.analiseHorizontal(120, 100)).toBeCloseTo(20);
    expect(F.analiseHorizontal(80, 100)).toBeCloseTo(-20);
    expect(F.round(F.analiseHorizontal(AMBEV.dre[2025].receitaLiquida, AMBEV.dre[2024].receitaLiquida), 2)).toBe(-1.35);
    // Base negativa: piora de −2.318 para −4.001 é variação negativa
    expect(F.analiseHorizontal(-4001728, -2318249)).toBeLessThan(0);
  });

  it('margens bruta, operacional e líquida', () => {
    expect(F.margem(180, 1000)).toBe(18);
    expect(F.margem(120, 1000)).toBe(12);
    const d = AMBEV.dre[2025];
    expect(F.round(F.margem(d.lucroBruto, d.receitaLiquida), 2)).toBe(51.42);
    expect(F.round(F.margem(d.lucroOperacional, d.receitaLiquida), 2)).toBe(26.54);
    expect(F.round(F.margem(d.lucroLiquido, d.receitaLiquida), 2)).toBe(18.12);
  });

  it('Liquidez Corrente = AC / PC', () => {
    expect(F.round(F.liquidezCorrente(43, 45), 2)).toBe(0.96);
    expect(F.round(F.liquidezCorrente(AMBEV.bp[2024].ativoCirculante, AMBEV.bp[2024].passivoCirculante), 2)).toBe(1.1);
    expect(F.round(F.liquidezCorrente(AMBEV.bp[2025].ativoCirculante, AMBEV.bp[2025].passivoCirculante), 2)).toBe(0.96);
  });

  it('ROE, giro e alavancagem', () => {
    expect(F.roe(18, 100)).toBe(18);
    expect(F.giro(500, 1000)).toBe(0.5);
    expect(F.alavancagem(1630, 1000)).toBeCloseTo(1.63);
    const b = AMBEV.bp[2025];
    const d = AMBEV.dre[2025];
    expect(F.round(F.roe(d.lucroLiquido, b.patrimonioLiquido), 2)).toBe(18.01);
    expect(F.round(F.giro(d.receitaLiquida, b.ativoTotal), 2)).toBe(0.61);
    expect(F.round(F.alavancagem(b.ativoTotal, b.patrimonioLiquido), 2)).toBe(1.63);
  });

  it('DuPont: ML × Giro × Alavancagem = ROE', () => {
    expect(F.dupont(16.6, 0.55, 1.63)).toBeCloseTo(14.88, 2);
    expect(F.dupont(18.1, 0.61, 1.63)).toBeCloseTo(18.0, 1);
    for (const y of [2024, 2025] as const) {
      const b = AMBEV.bp[y];
      const d = AMBEV.dre[y];
      expect(F.dupontDemonstracoes(d.lucroLiquido, d.receitaLiquida, b.ativoTotal, b.patrimonioLiquido)).toBeCloseTo(
        F.roe(d.lucroLiquido, b.patrimonioLiquido),
        10,
      );
    }
  });

  it('margem de contribuição e ponto de equilíbrio (exemplo da água)', () => {
    expect(F.margemContribuicaoUnitaria(2, 1)).toBe(1);
    expect(F.pontoEquilibrio(1000, 2, 1)).toBe(1000);
  });

  it('arredondamento meia para cima sem erro de ponto flutuante', () => {
    expect(F.round(1.005, 2)).toBe(1.01);
    expect(F.round(0.955, 2)).toBe(0.96);
    expect(F.round(-1.345, 2)).toBe(-1.35);
  });
});

describe('dados reais da Ambev fecham', () => {
  for (const y of [2024, 2025] as const) {
    it(`Ativo = Passivo + PL e subtotais da DRE (${y})`, () => {
      const b = AMBEV.bp[y];
      const d = AMBEV.dre[y];
      expect(b.ativoTotal).toBe(b.passivoCirculante + b.passivoNaoCirculante + b.patrimonioLiquido);
      expect(b.ativoTotal).toBe(b.ativoCirculante + b.ativoNaoCirculante);
      expect(d.lucroBruto).toBe(d.receitaLiquida + d.custoVendas);
      expect(d.lair).toBe(d.lucroOperacional + d.resultadoFinanceiro);
      expect(d.lucroLiquido).toBe(d.lair + d.irCs);
    });
  }
});
