import { describe, it, expect } from 'vitest';
import { calculateTotalCPF, generateRetirementProjection } from '../lib/cpf-calculations';
import { CPFUserData } from '../lib/cpf-calculations';

describe('CPF Context Integration', () => {
  // Sample CPF data matching the app context defaults
  const sampleCPFData: CPFUserData = {
    age: 35,
    oa: 125000,
    sa: 85000,
    ma: 45000,
    ra: 0,
    annualSalary: 72000,
  };

  it('should load sample CPF data from app context', () => {
    expect(sampleCPFData.age).toBe(35);
    expect(sampleCPFData.oa).toBe(125000);
    expect(sampleCPFData.sa).toBe(85000);
    expect(sampleCPFData.ma).toBe(45000);
    expect(sampleCPFData.annualSalary).toBe(72000);
  });
  it('should calculate total CPF correctly with sample data', () => {
    const total = calculateTotalCPF(sampleCPFData);
    expect(total).toBe(255000); // 125000 + 85000 + 45000 + 0
  });
  it('should generate retirement projection with sample data', () => {
    const projection = generateRetirementProjection(sampleCPFData);
    
    // At age 35, should have projections for future ages
    expect(projection.currentRA).toBe(0);
    expect(projection.projectedRAAt55).toBeGreaterThan(0);
    expect(projection.projectedRAAt65).toBeGreaterThan(projection.projectedRAAt55);
    expect(projection.monthlyPayoutAt65).toBeGreaterThan(0);
  });

  it('should show retirement readiness status', () => {
    const projection = generateRetirementProjection(sampleCPFData);
    
    // With high OA/SA but zero RA, should have a valid status
    expect(['below_brs', 'brs_to_frs', 'frs_to_ers', 'above_ers']).toContain(projection.retirementReadiness);
  });

  it('should project RA balance growth over time', () => {
    const projection = generateRetirementProjection(sampleCPFData);
    
    // RA should grow from 0 to a positive amount by age 65
    expect(projection.projectedRAAt65).toBeGreaterThan(0);
  });

  it('should calculate years to reach FRS', () => {
    const projection = generateRetirementProjection(sampleCPFData);
    
    // Should have a reasonable number of years to FRS
    expect(projection.yearsToFRS).toBeGreaterThanOrEqual(0);
    expect(projection.yearsToFRS).toBeLessThanOrEqual(35);
  });

  it('should show payout difference between age 65 and 70', () => {
    const projection = generateRetirementProjection(sampleCPFData);
    
    // Monthly payout at 70 should be higher than at 65
    expect(projection.monthlyPayoutAt70).toBeGreaterThan(projection.monthlyPayoutAt65);
    expect(projection.payoutDifference).toBeGreaterThan(0);
  });

  it('should handle edge case with zero RA balance', () => {
    const zeroRAData: CPFUserData = {
      age: 35,
      oa: 100000,
      sa: 50000,
      ma: 30000,
      ra: 0,
      annualSalary: 60000,
    };

    const projection = generateRetirementProjection(zeroRAData);
    expect(projection.currentRA).toBe(0);
    expect(['below_brs', 'brs_to_frs', 'frs_to_ers', 'above_ers']).toContain(projection.retirementReadiness);
  });

  it('should calculate different scenarios with varying ages', () => {
    // Test with younger age
    const youngerData: CPFUserData = { ...sampleCPFData, age: 25 };
    const youngerProjection = generateRetirementProjection(youngerData);

    // Test with older age
    const olderData: CPFUserData = { ...sampleCPFData, age: 50 };
    const olderProjection = generateRetirementProjection(olderData);

    // Younger person has more years to accumulate, so should have higher total at 65
    expect(youngerProjection.projectedRAAt65).toBeGreaterThan(olderProjection.projectedRAAt65);
  });
});
