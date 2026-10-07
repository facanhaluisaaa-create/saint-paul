import { describe, expect, it } from 'vitest';
import * as F from '../shared/finance';
import { AMBEV } from '../shared/ambev';

describe('fórmulas da disciplina', () => {
  it('A.V. = conta / base × 100', () => {
    expect(F.analiseVertical(250, 1000)).toBe(25);
    expect(F.round(F.analiseVertical(AMBEV.bp[2025].agio, AMBEV.bp[2025].ativoTotal), 2)).toBe(28.63);
    expect(F.round(F.analiseVertical(AMBEV.bp[2025].intangivel, AMBEV.bp[2025].ativoTotal), 2)).toBe(7.61);
  });

  it('A.H. = (atual − anterior) / anterior × 100, com sinal', () => {
    expect(F.analiseHorizontal(120, 100)).toBeCloseTo(20);
    expect(F.analiseHorizontal(80, 100)).toBeCloseTo(-20);
    expect(F.round(F.analiseHorizontal(AMBEV.dre[2025].receitaLiquida, AMBEV.dre[2024].receitaLiquida), 2)).toBe(-1.35);
    // Convenção da planilha (|atual|/|anterior| − 1): resultado financeiro de −2.318 para −4.002 cresceu 72,6%
    expect(F.round(F.analiseHorizontal(-4002, -2318), 1)).toBe(72.6);
    // CPV caiu: −43.615 → −42.864 = −1,72%
    expect(F.round(F.analiseHorizontal(AMBEV.dre[2025].custoVendas, AMBEV.dre[2024].custoVendas), 2)).toBe(-1.72);
    // Sinal mudou (Renner: +61,7 → −82,5): não significativo
    expect(Number.isNaN(F.analiseHorizontal(-82.5, 61.7))).toBe(true);
    expect(F.variacaoPct(-4002, -2318)).toBeLessThan(0);
  });

  it('margens bruta, operacional e líquida', () => {
    expect(F.margem(180, 1000)).toBe(18);
    expect(F.margem(120, 1000)).toBe(12);
    const d = AMBEV.dre[2025];
    expect(F.round(F.margem(d.lucroBruto, d.receitaLiquida), 2)).toBe(51.42);
    expect(F.round(F.margem(d.lucroOperacional, d.receitaLiquida), 2)).toBe(26.43);
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

describe('dados reais da Renner fecham e batem com os slides', () => {
  it('BP e DRE somam; ROE 13,9% como no slide', async () => {
    const { RENNER } = await import('../shared/renner');
    const b = RENNER.bp[2025];
    const d = RENNER.dre[2025];
    expect(F.round(b.passivoCirculante + b.passivoNaoCirculante + b.patrimonioLiquido, 1)).toBe(b.ativoTotal);
    expect(F.round(b.ativoCirculante + b.ativoNaoCirculante, 1)).toBe(b.ativoTotal);
    expect(F.round(d.lucroOperacional + d.resultadoFinanceiro + d.irCs, 1)).toBe(d.lucroLiquido);
    expect(F.round(F.roe(d.lucroLiquido, b.patrimonioLiquido), 1)).toBe(13.9);
    expect(F.round(F.margem(d.lucroLiquido, d.receitaLiquida), 1)).toBe(9.2);
    expect(F.round(F.analiseHorizontal(d.lucroOperacional, RENNER.dre[2024].lucroOperacional), 1)).toBe(42.7);
  });
});

describe('dados reais da Ambev fecham', () => {
  for (const y of [2024, 2025] as const) {
    it(`Ativo = Passivo + PL e subtotais da DRE (${y})`, () => {
      const b = AMBEV.bp[y];
      const d = AMBEV.dre[y];
      // Planilha em R$ milhões arredondados: tolerância de ±1,5
      expect(Math.abs(b.ativoTotal - (b.passivoCirculante + b.passivoNaoCirculante + b.patrimonioLiquido))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(b.ativoTotal - (b.ativoCirculante + b.ativoNaoCirculante))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(d.lucroBruto - (d.receitaLiquida + d.custoVendas))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(d.lair - (d.lucroOperacional + d.resultadoFinanceiro + d.participacaoColigadas))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(d.lucroLiquido - (d.lair + d.irCs))).toBeLessThanOrEqual(1.5);
    });
  }
});
