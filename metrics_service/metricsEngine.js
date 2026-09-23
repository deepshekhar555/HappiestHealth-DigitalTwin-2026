/**
 * BioTwin Full-Spectrum Metrics Engine: Complete Biomechanical, Cardiovascular,
 * Pulmonary, Hemodynamic, Metabolic & Thermoregulation Intelligence
 */

const SESSION_PROFILES = [
  // Sessions 1-3: Early mobilization, higher stress, mild hypoxemia risk, lower symmetry
  {
    symmetry: 68, cadence: 92,  stride: 1.12, speed: 0.82, fallRisk: 62,
    hr: 104, sbp: 130, dbp: 84, spo2: 96.2, rr: 21, temp: 37.2, glucose: 118,
    calories: 24, exertion: 74, cardiacStress: 22.4, ecg: 'Sinus Tachycardia (Mild)'
  },
  {
    symmetry: 71, cadence: 94,  stride: 1.15, speed: 0.85, fallRisk: 58,
    hr: 101, sbp: 128, dbp: 82, spo2: 96.6, rr: 20, temp: 37.1, glucose: 114,
    calories: 26, exertion: 69, cardiacStress: 19.8, ecg: 'Sinus Tachycardia (Mild)'
  },
  {
    symmetry: 74, cadence: 96,  stride: 1.18, speed: 0.88, fallRisk: 53,
    hr: 98,  sbp: 126, dbp: 80, spo2: 97.0, rr: 19, temp: 36.9, glucose: 110,
    calories: 28, exertion: 63, cardiacStress: 17.5, ecg: 'Normal Sinus Rhythm'
  },
  // Sessions 4-7: Mid-phase conditioning, plateau, hemodynamic adaptation
  {
    symmetry: 73, cadence: 95,  stride: 1.17, speed: 0.87, fallRisk: 55,
    hr: 97,  sbp: 125, dbp: 80, spo2: 96.8, rr: 19, temp: 36.9, glucose: 108,
    calories: 27, exertion: 61, cardiacStress: 16.8, ecg: 'Normal Sinus Rhythm'
  },
  {
    symmetry: 72, cadence: 94,  stride: 1.16, speed: 0.86, fallRisk: 57,
    hr: 99,  sbp: 127, dbp: 81, spo2: 96.7, rr: 20, temp: 37.0, glucose: 111,
    calories: 27, exertion: 64, cardiacStress: 17.9, ecg: 'Normal Sinus Rhythm'
  },
  {
    symmetry: 70, cadence: 93,  stride: 1.14, speed: 0.84, fallRisk: 60,
    hr: 102, sbp: 129, dbp: 83, spo2: 96.4, rr: 21, temp: 37.1, glucose: 115,
    calories: 26, exertion: 68, cardiacStress: 19.2, ecg: 'Normal Sinus Rhythm'
  },
  {
    symmetry: 69, cadence: 91,  stride: 1.11, speed: 0.82, fallRisk: 63,
    hr: 105, sbp: 131, dbp: 85, spo2: 96.1, rr: 22, temp: 37.2, glucose: 119,
    calories: 25, exertion: 72, cardiacStress: 21.0, ecg: 'Sinus Tachycardia (Mild)'
  },
  // Sessions 8-12+: High-functioning recovery, optimal vitals & balance
  {
    symmetry: 76, cadence: 98,  stride: 1.21, speed: 0.91, fallRisk: 48,
    hr: 94,  sbp: 123, dbp: 78, spo2: 97.4, rr: 18, temp: 36.8, glucose: 105,
    calories: 31, exertion: 54, cardiacStress: 14.5, ecg: 'Normal Sinus Rhythm'
  },
  {
    symmetry: 79, cadence: 101, stride: 1.25, speed: 0.95, fallRisk: 43,
    hr: 91,  sbp: 121, dbp: 77, spo2: 97.8, rr: 17, temp: 36.7, glucose: 102,
    calories: 34, exertion: 48, cardiacStress: 12.8, ecg: 'Normal Sinus Rhythm'
  },
  {
    symmetry: 82, cadence: 103, stride: 1.28, speed: 0.98, fallRisk: 38,
    hr: 88,  sbp: 119, dbp: 76, spo2: 98.2, rr: 16, temp: 36.7, glucose: 99,
    calories: 37, exertion: 42, cardiacStress: 11.2, ecg: 'Optimal Sinus Rhythm'
  },
  {
    symmetry: 85, cadence: 105, stride: 1.31, speed: 1.01, fallRisk: 34,
    hr: 85,  sbp: 118, dbp: 75, spo2: 98.6, rr: 16, temp: 36.6, glucose: 97,
    calories: 40, exertion: 37, cardiacStress: 9.8, ecg: 'Optimal Sinus Rhythm'
  },
  {
    symmetry: 87, cadence: 107, stride: 1.34, speed: 1.04, fallRisk: 30,
    hr: 82,  sbp: 117, dbp: 74, spo2: 99.0, rr: 15, temp: 36.6, glucose: 95,
    calories: 43, exertion: 32, cardiacStress: 8.5, ecg: 'Optimal Sinus Rhythm'
  },
];

const jitter = (val, range = 1.5, decimals = 1) =>
  parseFloat((val + (Math.random() * range * 2 - range)).toFixed(decimals));

function generateSessionSnapshot(sessionCounter) {
  const profileIdx = Math.min(sessionCounter - 1, SESSION_PROFILES.length - 1);
  const base = SESSION_PROFILES[profileIdx];

  // 1. Biomechanical Mobility
  const symmetryScore = jitter(base.symmetry, 1.2, 1);
  const cadence       = Math.round(jitter(base.cadence, 1.5, 0));
  const strideLength  = jitter(base.stride, 0.02, 2);
  const walkingSpeed  = jitter(base.speed, 0.02, 2);
  const fallRiskScore = jitter(base.fallRisk, 1.8, 1);
  const dominantSide  = sessionCounter <= 3 ? 'Left' : sessionCounter <= 7 ? 'Bilateral' : 'Right';

  // 2. Cardiovascular & Hemodynamics
  const heartRate   = Math.round(jitter(base.hr, 2, 0));
  const systolicBP  = Math.round(jitter(base.sbp, 2, 0));
  const diastolicBP = Math.round(jitter(base.dbp, 1.5, 0));
  const bloodPressure = `${systolicBP}/${diastolicBP}`;
  const map = parseFloat(((systolicBP + 2 * diastolicBP) / 3).toFixed(1)); // Mean Arterial Pressure
  const shockIndex = parseFloat((heartRate / systolicBP).toFixed(2));
  const cardiacStress = jitter(base.cardiacStress, 1.0, 1);
  const ecgStatus = base.ecg;

  // 3. Pulmonary
  const spo2            = jitter(base.spo2, 0.3, 1);
  const respiratoryRate = Math.round(jitter(base.rr, 1, 0));

  // 4. Metabolic & Thermoregulation
  const temperature    = jitter(base.temp, 0.1, 1);
  const glucose        = Math.round(jitter(base.glucose, 2, 0));
  const caloriesBurned = Math.round(jitter(base.calories, 1.5, 0));
  const exertionIndex  = Math.round(jitter(base.exertion, 2, 0));

  return {
    sessionId: sessionCounter,
    timestamp: new Date().toISOString(),
    dominantSide,
    // Biomechanical
    symmetryScore,
    cadence,
    strideLength,
    walkingSpeed,
    fallRiskScore,
    // Cardiovascular
    heartRate,
    systolicBP,
    diastolicBP,
    bloodPressure,
    map,
    shockIndex,
    cardiacStress,
    ecgStatus,
    // Pulmonary
    spo2,
    respiratoryRate,
    // Metabolic & Thermic
    temperature,
    glucose,
    caloriesBurned,
    exertionIndex,
  };
}

function deriveExplainability(session, totalSessions) {
  const factors = [];

  // Biomechanical
  if (session.symmetryScore < 75) {
    factors.push({
      category: 'Biomechanics',
      name: 'Gait Asymmetry',
      weight: Math.round(100 - session.symmetryScore),
      direction: 'risk',
      detail: `L/R asymmetry (${session.symmetryScore}%). Target is >80% for unassisted ambulation.`,
    });
  } else {
    factors.push({
      category: 'Biomechanics',
      name: 'Bilateral Balance',
      weight: Math.round(session.symmetryScore - 70),
      direction: 'protective',
      detail: `Strong bilateral symmetry (${session.symmetryScore}%). Reduced joint shear risk.`,
    });
  }

  if (session.cadence < 95) {
    factors.push({
      category: 'Biomechanics',
      name: 'Sub-Optimal Cadence',
      weight: Math.round(100 - session.cadence),
      direction: 'risk',
      detail: `Cadence (${session.cadence} spm) is below clinical target range (95-115 spm).`,
    });
  }

  // Cardiovascular
  if (session.heartRate > 100) {
    factors.push({
      category: 'Cardiovascular',
      name: 'Elevated Ambulation Heart Rate',
      weight: Math.min(Math.round((session.heartRate - 90) * 2), 85),
      direction: 'risk',
      detail: `Walking HR is ${session.heartRate} bpm with cardiac stress index of ${session.cardiacStress}%.`,
    });
  } else {
    factors.push({
      category: 'Cardiovascular',
      name: 'Cardiopulmonary Adaptation',
      weight: Math.round((95 - session.heartRate) * 2),
      direction: 'protective',
      detail: `Normocardic pacing (${session.heartRate} bpm) with stable shock index (${session.shockIndex}).`,
    });
  }

  // Pulmonary
  if (session.spo2 < 96.5) {
    factors.push({
      category: 'Pulmonary',
      name: 'Mild Exercise Desaturation',
      weight: Math.round((98 - session.spo2) * 20),
      direction: 'risk',
      detail: `SpO2 dipped to ${session.spo2}%. Respiratory rate is ${session.respiratoryRate}/min.`,
    });
  } else {
    factors.push({
      category: 'Pulmonary',
      name: 'Optimal Arterial Oxygenation',
      weight: Math.round((session.spo2 - 94) * 10),
      direction: 'protective',
      detail: `Stable SpO2 (${session.spo2}%) demonstrates adequate tissue perfusion under exertion.`,
    });
  }

  // Metabolic & Temperature
  if (session.glucose > 115) {
    factors.push({
      category: 'Metabolic',
      name: 'Elevated Post-Activity Glucose',
      weight: Math.round(session.glucose - 100),
      direction: 'risk',
      detail: `Glucose (${session.glucose} mg/dL). Pre-gait glycogen surge detected.`,
    });
  } else {
    factors.push({
      category: 'Metabolic',
      name: 'Euglycemic Balance',
      weight: 15,
      direction: 'protective',
      detail: `Blood glucose stable at ${session.glucose} mg/dL; ${session.caloriesBurned} kcal burned.`,
    });
  }

  if (session.temperature > 37.1) {
    factors.push({
      category: 'Thermic',
      name: 'Thermoregulation Elevation',
      weight: 20,
      direction: 'risk',
      detail: `Body temp (${session.temperature}°C) mildly elevated during physical exertion.`,
    });
  }

  // System depth
  factors.push({
    category: 'System',
    name: 'Longitudinal Depth',
    weight: Math.min(totalSessions * 5, 45),
    direction: 'protective',
    detail: `${totalSessions} session(s) documented. Longitudinal data reinforces predictive twin accuracy.`,
  });

  let riskLevel = 'Low';
  if (session.fallRiskScore >= 55 || session.heartRate > 102) riskLevel = 'Moderate';
  if (session.fallRiskScore >= 65 || (session.heartRate > 110 && session.spo2 < 95.5)) riskLevel = 'High';

  const confidenceScore = Math.min(52 + totalSessions * 4, 96);

  return {
    factors,
    riskLevel,
    confidenceScore,
    clinicalRecommendation:
      riskLevel === 'High'
        ? 'Supervised ambulation with cardiac telemetry recommended. Introduce rest pauses.'
        : riskLevel === 'Moderate'
        ? 'Continue active rehabilitation with targeted bilateral resistance exercises.'
        : 'Patient progressing towards independence. Safe for progressive endurance walking.',
  };
}

module.exports = {
  generateSessionSnapshot,
  deriveExplainability,
  SESSION_PROFILES,
};
