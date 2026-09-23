const PhysicsModels = require('./physics_models');
const AdverseEventPredictor = require('./adverse_event_predictor');

/**
 * Dynamic Virtual Patient Twin State
 * Synthesizes Static EHR Records with Live Wearable IoT Streams
 */
class DigitalTwinState {
  constructor(initialEHR = {}) {
    this.patientId = initialEHR.id || "PT-HAPPIEST-2026";
    this.name = initialEHR.name || "Alex Mercer";
    this.age = initialEHR.age || 62;
    this.gender = initialEHR.gender || "Male";
    this.chronicConditions = initialEHR.chronicConditions || ["Type 2 Diabetes", "Hypertension", "Coronary Artery Disease"];
    this.medications = initialEHR.medications || ["Metformin 1000mg", "Lisinopril 20mg", "Atorvastatin 40mg"];
    this.allergies = initialEHR.allergies || ["Penicillin"];
    this.pharmacogenomics = initialEHR.pharmacogenomics || {
      CYP2C19: "*2/*2 (Poor Metabolizer)",
      CYP2D6: "*1/*1 (Normal Metabolizer)",
      SLCO1B1: "T521C (Statin Myopathy Risk)"
    };

    // Real-Time Dynamic Stream
    this.currentVitals = {
      heartRate: 74,
      systolicBP: 122,
      diastolicBP: 80,
      spo2: 98,
      temperature: 36.8,
      respiratoryRate: 16,
      glucose: 104,
      oldpeak: 0.2
    };

    this.telemetryHistory = [];
    this.organHealth = {
      heart: 95,
      lungs: 98,
      brain: 96,
      kidneys: 92
    };

    this.hemodynamics = PhysicsModels.computeHemodynamicProfile(this.currentVitals, { age: this.age });
    this.adverseEvaluation = AdverseEventPredictor.evaluateAdverseEvents(this.currentVitals, { age: this.age });
  }

  updateTelemetry(newVitals) {
    this.currentVitals = { ...this.currentVitals, ...newVitals, timestamp: new Date().toISOString() };
    this.hemodynamics = PhysicsModels.computeHemodynamicProfile(this.currentVitals, { age: this.age });
    this.adverseEvaluation = AdverseEventPredictor.evaluateAdverseEvents(this.currentVitals, { age: this.age });

    // Update Organ System Vitality Index (0 - 100)
    const shock = this.hemodynamics.shockIndex;
    const map = this.hemodynamics.map;
    const spo2 = this.currentVitals.spo2;
    const stress = this.hemodynamics.cardiacStress;

    this.organHealth.heart = Math.max(10, Math.min(100, Math.round(100 - (stress / 3) - (shock > 0.8 ? (shock - 0.8) * 60 : 0))));
    this.organHealth.lungs = Math.max(10, Math.min(100, Math.round(spo2 > 95 ? 100 : spo2 * 1.05 - 10)));
    this.organHealth.brain = Math.max(10, Math.min(100, Math.round(map >= 70 && map <= 110 ? 98 : 98 - Math.abs(map - 85))));
    this.organHealth.kidneys = Math.max(10, Math.min(100, Math.round(map < 65 ? (map / 65) * 80 : 94)));

    // Keep sliding window of last 60 data points (e.g. 1 minute at 1Hz)
    this.telemetryHistory.push({
      ...this.currentVitals,
      hemodynamics: this.hemodynamics,
      riskScore: this.hemodynamics.compositeRiskScore,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.telemetryHistory.length > 60) {
      this.telemetryHistory.shift();
    }

    return this.getState();
  }

  getState() {
    return {
      patientProfile: {
        id: this.patientId,
        name: this.name,
        age: this.age,
        gender: this.gender,
        chronicConditions: this.chronicConditions,
        medications: this.medications,
        allergies: this.allergies,
        pharmacogenomics: this.pharmacogenomics
      },
      currentVitals: this.currentVitals,
      hemodynamics: this.hemodynamics,
      adverseEvaluation: this.adverseEvaluation,
      organHealth: this.organHealth,
      telemetryHistory: this.telemetryHistory,
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = DigitalTwinState;
