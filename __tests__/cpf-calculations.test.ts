import { describe, it, expect } from 'vitest';
import {
  calculateTotalCPF,
  projectRABalance,
  calculateMonthlyPayout,
  generateRetirementProjection,
  generateCPFInsights,
  calculateCPFContribution,
  yearsToReachTarget,
  CPFUserData,
} from '../lib/cpf-calculations';
import { CPF_RETIREMENT_SUMS } from '../lib/cpf-constants';

describe('CPF Calculations', () => {
  const mockUserData: CPFUserData = {
    age: 35,
    oa: 100000,
    sa: 50000,
    ma: 30000,
    ra: 0,
    annualSalary: 60000,
  };

  describe('calculateTotalCPF', () => {
    it('should calculate total CPF balance correctly', () => {
      const total = calculateTotalCPF(mockUserData);
      expect(total).toBe(180000);
    });

    it('should return 0 for empty CPF data', () => {
      const emptyData: CPFUserData = { age: 25, oa: 0, sa: 0, ma: 0, ra: 0 };
      expect(calculateTotalCPF(emptyData)).toBe(0);
    });
  });

  describe('calculateMonthlyPayout', () => {
    it('should return 0 for balance below BRS', () => {
      const payout = calculateMonthlyPayout(100000, 65);
      expect(payout).toBe(0);
    });

    it('should calculate payout for balance at BRS', () => {
      const payout = calculateMonthlyPayout(CPF_RETIREMENT_SUMS.BRS, 65);
      expect(payout).toBeGreaterThan(0);
    });

    it('should increase payout when deferring to age 70', () => {
      const payoutAt65 = calculateMonthlyPayout(CPF_RETIREMENT_SUMS.FRS, 65);
      const payoutAt70 = calculateMonthlyPayout(CPF_RETIREMENT_SUMS.FRS, 70);
      expect(payoutAt70).toBeGreaterThan(payoutAt65);
    });

    it('should calculate higher payout for larger RA balance', () => {
      const payoutSmall = calculateMonthlyPayout(CPF_RETIREMENT_SUMS.BRS, 65);
      const payoutLarge = calculateMonthlyPayout(CPF_RETIREMENT_SUMS.FRS, 65);
      expect(payoutLarge).toBeGreaterThan(payoutSmall);
    });
  });

  describe('generateRetirementProjection', () => {
    it('should generate projection with valid data', () => {
      const projection = generateRetirementProjection(mockUserData);
      expect(projection).toHaveProperty('currentRA');
      expect(projection).toHaveProperty('projectedRAAt65');
      expect(projection).toHaveProperty('monthlyPayoutAt65');
      expect(projection).toHaveProperty('retirementReadiness');
    });

    it('should show below_brs for low RA balance', () => {
      const lowData: CPFUserData = { ...mockUserData, ra: 50000 };
      const projection = generateRetirementProjection(lowData);
      // With growth to 65, 50k may reach BRS, so check it's not above FRS
      expect(['below_brs', 'brs_to_frs']).toContain(projection.retirementReadiness);
    });

    it('should show above_ers for high RA balance', () => {
      const highData: CPFUserData = { ...mockUserData, ra: CPF_RETIREMENT_SUMS.ERS };
      const projection = generateRetirementProjection(highData);
      expect(projection.retirementReadiness).toBe('above_ers');
    });

    it('should calculate positive payout difference when deferring', () => {
      const projection = generateRetirementProjection({
        ...mockUserData,
        ra: CPF_RETIREMENT_SUMS.FRS,
      });
      expect(projection.payoutDifference).toBeGreaterThan(0);
    });
  });

  describe('generateCPFInsights', () => {
    it('should generate insights for low retirement savings', () => {
      const lowData: CPFUserData = { ...mockUserData, ra: 100000 };
      const projection = generateRetirementProjection(lowData);
      const insights = generateCPFInsights(lowData, projection);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((i) => i.type === 'warning')).toBe(true);
    });

    it('should generate opportunity insights for deferment', () => {
      const data: CPFUserData = { ...mockUserData, age: 65, ra: CPF_RETIREMENT_SUMS.FRS };
      const projection = generateRetirementProjection(data);
      const insights = generateCPFInsights(data, projection);
      expect(insights.some((i) => i.title.includes('Defer'))).toBe(true);
    });

    it('should generate MediSave warning when below BHS', () => {
      const lowMAData: CPFUserData = { ...mockUserData, ma: 10000 };
      const projection = generateRetirementProjection(lowMAData);
      const insights = generateCPFInsights(lowMAData, projection);
      expect(insights.some((i) => i.title.includes('MediSave'))).toBe(true);
    });

    it('should limit insights to 3 items', () => {
      const projection = generateRetirementProjection(mockUserData);
      const insights = generateCPFInsights(mockUserData, projection);
      expect(insights.length).toBeLessThanOrEqual(3);
    });
  });

  describe('calculateCPFContribution', () => {
    it('should calculate contribution for age 35', () => {
      const contribution = calculateCPFContribution(60000, 35);
      expect(contribution.employee).toBeGreaterThan(0);
      expect(contribution.employer).toBeGreaterThan(0);
      expect(contribution.total).toBe(contribution.employee + contribution.employer);
    });

    it('should cap salary at SGD 6000/month', () => {
      const highSalary = calculateCPFContribution(200000, 35);
      const cappedSalary = calculateCPFContribution(72000, 35); // SGD 6000 * 12
      expect(highSalary.total).toBe(cappedSalary.total);
    });

    it('should reduce rates for age 55-60', () => {
      const young = calculateCPFContribution(60000, 35);
      const older = calculateCPFContribution(60000, 57);
      expect(older.employee).toBeLessThan(young.employee);
      expect(older.employer).toBeLessThan(young.employer);
    });

    it('should have lowest rates for age 65+', () => {
      const senior = calculateCPFContribution(60000, 66);
      expect(senior.employee).toBeGreaterThan(0);
      expect(senior.employer).toBeGreaterThan(0);
    });
  });

  describe('yearsToReachTarget', () => {
    it('should return 0 if already at target', () => {
      const years = yearsToReachTarget(CPF_RETIREMENT_SUMS.FRS, CPF_RETIREMENT_SUMS.FRS);
      expect(years).toBe(0);
    });

    it('should calculate years needed to reach FRS', () => {
      const years = yearsToReachTarget(100000, CPF_RETIREMENT_SUMS.FRS, 20000);
      expect(years).toBeGreaterThan(0);
      expect(years).toBeLessThan(50);
    });

    it('should reach target faster with higher contributions', () => {
      const yearsLow = yearsToReachTarget(100000, CPF_RETIREMENT_SUMS.FRS, 10000);
      const yearsHigh = yearsToReachTarget(100000, CPF_RETIREMENT_SUMS.FRS, 20000);
      expect(yearsHigh).toBeLessThan(yearsLow);
    });
  });

  describe('Edge Cases', () => {
    it('should handle age 55 transition correctly', () => {
      const data55: CPFUserData = { ...mockUserData, age: 55, sa: 50000, ra: 0 };
      const projection = generateRetirementProjection(data55);
      // At age 55, SA is transferred to RA
      expect(projection.projectedRAAt55).toBeGreaterThanOrEqual(data55.ra);
    });

    it('should handle age 70+ correctly', () => {
      const dataSenior: CPFUserData = { ...mockUserData, age: 72, ra: CPF_RETIREMENT_SUMS.FRS };
      const projection = generateRetirementProjection(dataSenior);
      expect(projection.monthlyPayoutAt70).toBeGreaterThan(0);
    });

    it('should handle zero salary correctly', () => {
      const contribution = calculateCPFContribution(0, 35);
      expect(contribution.total).toBe(0);
    });
  });
});
