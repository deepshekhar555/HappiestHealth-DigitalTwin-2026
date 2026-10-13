const { evaluateRecommendationSafety } = require('../services/clinicalSafety.service');

describe('Clinical safety evaluation', () => {
  it('flags high-risk patient metrics and returns evidence', () => {
    const patient = {
      vitals: { bpSystolic: 170, sugar: 200 },
      lifestyle: { smoking: 'Yes' },
      biomarkers: { pharmacogenomics: { cyp2c19: 'Poor Metabolizer' } },
      medications: [{ name: 'Metformin' }, { name: 'Warfarin' }]
    };

    const recommendation = {
      medications: [
        { name: 'Warfarin', dose: '2mg', frequency: 'daily' }
      ],
      monitoring: ['INR', 'Blood pressure']
    };

    const result = evaluateRecommendationSafety(patient, recommendation);

    expect(result.status).toBe('needs_review');
    expect(result.riskFlags.length).toBeGreaterThan(0);
    expect(Array.isArray(result.evidence)).toBe(true);
    expect(Array.isArray(result.requiredMonitoring)).toBe(true);
    expect(result.summary).toMatch(/needs clinician review/i);
  });

  it('approves low-risk recommendations with minimal flags', () => {
    const patient = {
      vitals: { bpSystolic: 120, sugar: 100 },
      lifestyle: { smoking: 'No' },
      biomarkers: { pharmacogenomics: { cyp2c19: 'Normal Metabolizer' } },
      medications: [{ name: 'Aspirin' }]
    };

    const recommendation = {
      medications: [{ name: 'Aspirin', dose: '81mg', frequency: 'daily' }],
      monitoring: ['Follow-up visit']
    };

    const result = evaluateRecommendationSafety(patient, recommendation);

    expect(result.status).toBe('approved');
    expect(result.riskFlags.length).toBe(0);
    expect(result.summary).toMatch(/no major risk flags/i);
  });
});
