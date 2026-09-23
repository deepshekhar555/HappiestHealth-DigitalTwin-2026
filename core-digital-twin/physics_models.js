/**
 * Physics-Informed Hemodynamic & Cardiovascular Digital Twin Models
 * Synthesized from Digital-Twin VLSI equations & clinical hemodynamic principles.
 */
class PhysicsModels {
  static calculateMAP(sbp, dbp) {
    if (!sbp || !dbp) return 0;
    return parseFloat(((sbp + 2 * dbp) / 3).toFixed(1));
  }

  static calculatePulsePressure(sbp, dbp) {
    if (!sbp || !dbp) return 0;
    return parseFloat((sbp - dbp).toFixed(1));
  }

  static calculateCardiacLoad(sbp, hr) {
    if (!sbp || !hr) return 0;
    return parseFloat((sbp * hr).toFixed(0));
  }

  static calculateCardiacStress(oldpeak, hr) {
    const op = oldpeak || 0;
    return parseFloat((op * (hr || 75)).toFixed(1));
  }

  static calculateHeartWorkload(sbp, hr, oldpeak) {
    const op = oldpeak || 0;
    return parseFloat(((sbp || 120) * (hr || 75) * (1 + op)).toFixed(0));
  }

  static calculateShockIndex(hr, sbp) {
    if (!sbp || sbp === 0) return 0;
    return parseFloat(((hr || 75) / sbp).toFixed(2));
  }

  static calculateRPP(hr, sbp) {
    return parseFloat((((hr || 75) * (sbp || 120)) / 100).toFixed(0));
  }

  static computeHemodynamicProfile(vitals, baselineEHR = {}) {
    const hr = vitals.heartRate || 75;
    const sbp = vitals.systolicBP || 120;
    const dbp = vitals.diastolicBP || 80;
    const spo2 = vitals.spo2 || 98;
    const temp = vitals.temperature || 37.0;
    const oldpeak = vitals.oldpeak || baselineEHR.oldpeak || 0.0;
    const age = baselineEHR.age || 60;

    const map = this.calculateMAP(sbp, dbp);
    const pulsePressure = this.calculatePulsePressure(sbp, dbp);
    const cardiacLoad = this.calculateCardiacLoad(sbp, hr);
    const cardiacStress = this.calculateCardiacStress(oldpeak, hr);
    const heartWorkload = this.calculateHeartWorkload(sbp, hr, oldpeak);
    const shockIndex = this.calculateShockIndex(hr, sbp);
    const rpp = this.calculateRPP(hr, sbp);

    const normalizedRisk = Math.min(
      100,
      Math.max(
        0,
        (0.20 * (age / 80) * 100) +
        (0.25 * (Math.abs(sbp - 120) / 60) * 100) +
        (0.25 * (cardiacStress / 200) * 100) +
        (0.15 * (shockIndex > 0.8 ? (shockIndex - 0.8) * 150 : 0)) +
        (0.15 * (spo2 < 95 ? (95 - spo2) * 10 : 0))
      )
    );

    return {
      map,
      pulsePressure,
      cardiacLoad,
      cardiacStress,
      heartWorkload,
      shockIndex,
      ratePressureProduct: rpp,
      compositeRiskScore: parseFloat(normalizedRisk.toFixed(1)),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = PhysicsModels;
