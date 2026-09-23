/**
 * Complex Event Processing (CEP) Alarm Engine
 * Modernized from MedStream Analytics Flink CEP patterns.
 */
class CEPAlarmEngine {
  constructor(alertCallback) {
    this.alertCallback = alertCallback || console.log;
    this.buffer = [];
    this.maxBufferSize = 30; // 30 seconds buffer
  }

  processTick(vitals, hemodynamics) {
    this.buffer.push({ vitals, hemodynamics, timestamp: Date.now() });
    if (this.buffer.length > this.maxBufferSize) this.buffer.shift();

    this.checkConsecutiveShockIndex();
    this.checkRapidMAPDrop();
    this.checkHypoxemiaTrend();
  }

  checkConsecutiveShockIndex() {
    if (this.buffer.length < 5) return;
    const last5 = this.buffer.slice(-5);
    const sustainedCriticalShock = last5.every(b => b.hemodynamics.shockIndex >= 0.9);

    if (sustainedCriticalShock) {
      this.alertCallback({
        type: "CEP_SUSTAINED_SHOCK",
        level: "CRITICAL",
        message: "Sustained Critical Shock Index (>= 0.9) detected over last 5 consecutive ticks!",
        timestamp: new Date().toISOString()
      });
    }
  }

  checkRapidMAPDrop() {
    if (this.buffer.length < 10) return;
    const oldest = this.buffer[0];
    const latest = this.buffer[this.buffer.length - 1];
    const mapDiff = oldest.hemodynamics.map - latest.hemodynamics.map;

    if (mapDiff >= 20) {
      this.alertCallback({
        type: "CEP_RAPID_MAP_COLLAPSE",
        level: "CRITICAL",
        message: "Precipitous MAP Drop: Fallen by " + mapDiff.toFixed(1) + " mmHg in under " + this.buffer.length + " seconds!",
        timestamp: new Date().toISOString()
      });
    }
  }

  checkHypoxemiaTrend() {
    if (this.buffer.length < 5) return;
    const latest = this.buffer[this.buffer.length - 1];
    if (latest.vitals.spo2 < 90) {
      this.alertCallback({
        type: "CEP_SEVERE_DESATURATION",
        level: "CRITICAL",
        message: "Severe Hypoxemia: SpO2 fallen to " + latest.vitals.spo2 + "%!",
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = CEPAlarmEngine;
