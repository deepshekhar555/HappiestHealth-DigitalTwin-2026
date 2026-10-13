const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
};

const buildEvidenceSummary = (patient = {}, recommendation = {}) => {
  const evidence = [];
  const vitals = patient.vitals || {};
  const lifestyle = patient.lifestyle || {};
  const biomarkers = patient.biomarkers || {};
  const medications = Array.isArray(patient.medications) ? patient.medications : [];

  if (typeof vitals.bpSystolic === 'number' && vitals.bpSystolic > 140) {
    evidence.push({
      type: 'vital',
      severity: 'high',
      title: 'Elevated blood pressure',
      detail: `Systolic blood pressure is ${vitals.bpSystolic} mmHg, which heightens cardiovascular risk.`,
      source: 'patient.vitals.bpSystolic'
    });
  }

  if (typeof vitals.sugar === 'number' && vitals.sugar > 140) {
    evidence.push({
      type: 'metabolic',
      severity: 'medium',
      title: 'Hyperglycemia',
      detail: `Blood glucose is ${vitals.sugar} mg/dL, indicating active metabolic stress.`,
      source: 'patient.vitals.sugar'
    });
  }

  if (lifestyle.smoking === 'Yes' || lifestyle.smoking === 'Past') {
    evidence.push({
      type: 'lifestyle',
      severity: 'medium',
      title: 'Smoking history',
      detail: 'Smoking exposure increases cardiovascular and respiratory risk.',
      source: 'patient.lifestyle.smoking'
    });
  }

  const pharmacogenomicMarkers = biomarkers.pharmacogenomics || {};
  const cyp2c19 = pharmacogenomicMarkers.cyp2c19;
  if (cyp2c19) {
    evidence.push({
      type: 'pharmacogenomic',
      severity: 'medium',
      title: 'Pharmacogenomic marker present',
      detail: `CYP2C19 status is ${cyp2c19}, which may alter drug metabolism and dosing.`,
      source: 'patient.biomarkers.pharmacogenomics.cyp2c19'
    });
  }

  if (medications.length > 0) {
    const names = medications.map((med) => med.name).filter(Boolean).join(', ');
    evidence.push({
      type: 'medication',
      severity: 'low',
      title: 'Current medication regimen',
      detail: `The patient is currently taking: ${names || 'No medication names provided'}.`,
      source: 'patient.medications'
    });
  }

  const recommendationMeds = Array.isArray(recommendation.medications) ? recommendation.medications : [];
  if (recommendationMeds.length > 0) {
    const names = recommendationMeds.map((med) => med.name).filter(Boolean);
    if (names.length > 0) {
      evidence.push({
        type: 'recommendation',
        severity: 'low',
        title: 'Recommendation medication set',
        detail: `The proposed protocol includes ${names.join(', ')}.`,
        source: 'recommendation.medications'
      });
    }
  }

  return evidence.slice(0, 6);
};

const evaluateRecommendationSafety = (patient = {}, recommendation = {}) => {
  const evidence = buildEvidenceSummary(patient, recommendation);
  const riskFlags = [];
  const monitoring = normalizeList(recommendation.monitoring);

  const vitals = patient.vitals || {};
  const lifestyle = patient.lifestyle || {};
  const medications = Array.isArray(patient.medications) ? patient.medications : [];
  const recommendedMeds = Array.isArray(recommendation.medications) ? recommendation.medications : [];

  if (typeof vitals.bpSystolic === 'number' && vitals.bpSystolic > 160) {
    riskFlags.push('Severe hypertension requires close blood pressure monitoring before or during treatment escalation.');
  } else if (typeof vitals.bpSystolic === 'number' && vitals.bpSystolic > 140) {
    riskFlags.push('Blood pressure is elevated and should be re-checked before finalizing urgent therapy changes.');
  }

  if (typeof vitals.sugar === 'number' && vitals.sugar > 180) {
    riskFlags.push('Hyperglycemia is significant and may require tighter metabolic monitoring.');
  }

  if (lifestyle.smoking === 'Yes') {
    riskFlags.push('Smoking history adds cardiovascular and respiratory risk and should be addressed in the plan.');
  }

  const highRiskMedicationPattern = /warfarin|digoxin|amiodarone|clopidogrel|insulin|methotrexate|azathioprine/i;
  const medicationNames = [...medications.map((m) => m.name || ''), ...recommendedMeds.map((m) => m.name || '')].filter(Boolean);
  if (medicationNames.some((name) => highRiskMedicationPattern.test(name))) {
    riskFlags.push('A high-risk medication class is present; careful monitoring and dose review are required.');
  }

  const requiredMonitoring = new Set([
    ...monitoring,
    'Blood pressure trends',
    'Medication adverse effects',
    'Adherence and tolerability'
  ]);

  if (typeof vitals.sugar === 'number') {
    requiredMonitoring.add('Blood glucose monitoring');
  }

  if (typeof vitals.bpSystolic === 'number') {
    requiredMonitoring.add('Blood pressure monitoring');
  }

  const safetyStatus = riskFlags.length === 0 ? 'approved' : 'needs_review';
  const confidence = clamp((1 - (riskFlags.length * 0.14)) + 0.15, 0.1, 0.98);

  return {
    status: safetyStatus,
    riskFlags,
    evidence,
    requiredMonitoring: Array.from(requiredMonitoring),
    confidence: Number(confidence.toFixed(2)),
    summary: riskFlags.length === 0
      ? 'Recommendation is clinically consistent with the current profile and no major risk flags were identified.'
      : `Recommendation needs clinician review due to ${riskFlags.length} relevant safety concern(s).`,
    generatedAt: new Date().toISOString()
  };
};

module.exports = {
  buildEvidenceSummary,
  evaluateRecommendationSafety
};
