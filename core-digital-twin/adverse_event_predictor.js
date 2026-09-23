const PhysicsModels = require('./physics_models');

/**
 * Real-Time Adverse Health Event Predictor
 * Detects impending catastrophic clinical events before onset.
 */
class AdverseEventPredictor {
  static evaluateAdverseEvents(vitals, baselineEHR = {}) {
    const hemodynamics = PhysicsModels.computeHemodynamicProfile(vitals, baselineEHR);
    const hr = vitals.heartRate || 75;
    const sbp = vitals.systolicBP || 120;
    const dbp = vitals.diastolicBP || 80;
    const spo2 = vitals.spo2 || 98;
    const temp = vitals.temperature || 37.0;
    const rr = vitals.respiratoryRate || 16;
    const glucose = vitals.glucose || 105;
    const oldpeak = vitals.oldpeak || 0.0;

    const events = [];

    // 1. CARDIAC ARREST / ACUTE CORONARY SYNDROME PREDICTION
    let cardiacRisk = 5;
    let cardiacTime = "N/A";
    if (hemodynamics.shockIndex >= 0.95 || (hr > 125 && oldpeak > 2.0) || (hemodynamics.cardiacStress > 250)) {
      cardiacRisk = 92;
      cardiacTime = "Within 10-25 mins";
      events.push({
        id: "CARDIAC_ARREST_IMMINENT",
        title: "Impending Cardiac Arrest / Acute Coronary Syndrome",
        severity: "CRITICAL",
        probability: cardiacRisk,
        estimatedTimeToEvent: cardiacTime,
        primaryDrivers: ["Elevated Shock Index (" + hemodynamics.shockIndex + ")", "Severe Myocardial Workload (" + hemodynamics.heartWorkload + ")", "ST Depression (" + oldpeak + " mm)"],
        recommendedAction: "Activate Rapid Response / Cath Lab Alert. Prepare defibrillator, oxygen, IV antiarrhythmics."
      });
    } else if (hemodynamics.shockIndex > 0.80 || oldpeak > 1.2 || hr > 110) {
      cardiacRisk = 58;
      cardiacTime = "Within 1-3 hours";
      events.push({
        id: "CARDIAC_ISCHEMIA_WARNING",
        title: "Myocardial Ischemia & Hemodynamic Instability",
        severity: "WARNING",
        probability: cardiacRisk,
        estimatedTimeToEvent: cardiacTime,
        primaryDrivers: ["Sub-endocardial stress", "Elevated Rate Pressure Product (" + hemodynamics.ratePressureProduct + ")"],
        recommendedAction: "12-lead ECG, Troponin I/T assay, titration of nitrates/beta-blockers."
      });
    }

    // 2. SEPTIC SHOCK PROGRESSION PREDICTION
    // SIRS criteria: Temp > 38.3 or < 36, HR > 90, RR > 20, plus MAP < 65 or Shock Index > 0.85
    const sirsCount = (temp > 38.3 || temp < 36.0 ? 1 : 0) + (hr > 90 ? 1 : 0) + (rr > 20 ? 1 : 0);
    if (sirsCount >= 2 && (hemodynamics.map < 65 || hemodynamics.shockIndex > 0.85)) {
      events.push({
        id: "SEPTIC_SHOCK_DETERIORATION",
        title: "Septic Shock Refractory Hypotension",
        severity: hemodynamics.map < 60 ? "CRITICAL" : "WARNING",
        probability: hemodynamics.map < 60 ? 89 : 68,
        estimatedTimeToEvent: "Within 30-45 mins",
        primaryDrivers: ["MAP Hypoperfusion (" + hemodynamics.map + " mmHg)", "SIRS criteria met (" + sirsCount + "/3)", "High Shock Index (" + hemodynamics.shockIndex + ")"],
        recommendedAction: "Initiate Surviving Sepsis Bundle: 30mL/kg crystalloid bolus, blood cultures, broad-spectrum IV antibiotics, Norepinephrine titration."
      });
    }

    // 3. HYPERTENSIVE CRISIS / STROKE RISK
    if (sbp >= 180 || dbp >= 120) {
      events.push({
        id: "HYPERTENSIVE_EMERGENCY",
        title: "Hypertensive Crisis & Acute Cerebrovascular Stroke Risk",
        severity: "CRITICAL",
        probability: 84,
        estimatedTimeToEvent: "Within 1-2 hours",
        primaryDrivers: ["Systolic BP (" + sbp + " mmHg)", "Diastolic BP (" + dbp + " mmHg)", "Pulse Pressure Strain (" + hemodynamics.pulsePressure + ")"],
        recommendedAction: "Gradual BP reduction with IV Nicardipine or Labetalol (reduce MAP by 20-25% over 1st hour to avoid cerebral hypoperfusion)."
      });
    }

    // 4. ACUTE HYPOXIC RESPIRATORY FAILURE
    if (spo2 < 90) {
      events.push({
        id: "ACUTE_HYPOXIA",
        title: "Acute Hypoxemic Respiratory Failure",
        severity: spo2 < 85 ? "CRITICAL" : "WARNING",
        probability: spo2 < 85 ? 95 : 74,
        estimatedTimeToEvent: "Immediate (5-15 mins)",
        primaryDrivers: ["SpO2 Desaturation (" + spo2 + "%)", "Tachypnea (RR " + rr + "/min)"],
        recommendedAction: "High-flow nasal cannula or non-invasive positive pressure ventilation (BiPAP). Prepare for endotracheal intubation if refractory."
      });
    }

    // 5. HYPOGLYCEMIC SHOCK
    if (glucose < 65) {
      events.push({
        id: "HYPOGLYCEMIC_CRISIS",
        title: "Neuroglycopenic Shock / Severe Hypoglycemia",
        severity: glucose < 50 ? "CRITICAL" : "WARNING",
        probability: 91,
        estimatedTimeToEvent: "Within 15-30 mins",
        primaryDrivers: ["Blood Glucose (" + glucose + " mg/dL)", "Autonomic adrenergic surge"],
        recommendedAction: "Administer 25-50mL of 50% Dextrose (D50W) IV push or 1mg IM Glucagon."
      });
    }

    return {
      overallStatus: events.some(e => e.severity === "CRITICAL") ? "CRITICAL" : events.length > 0 ? "WARNING" : "STABLE",
      activeThreatCount: events.length,
      predictedEvents: events,
      hemodynamics,
      evaluatedAt: new Date().toISOString()
    };
  }
}

module.exports = AdverseEventPredictor;
