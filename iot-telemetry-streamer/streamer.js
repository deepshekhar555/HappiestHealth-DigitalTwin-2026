const fs = require('fs');
const path = require('path');
const DigitalTwinState = require('../core-digital-twin/twin_state');
const CEPAlarmEngine = require('./cep_alarm_engine');

/**
 * IoT & Wearable Vital Telemetry Streamer
 * Streams real-time telemetry, simulates clinical trajectories, and emits CEP alerts.
 */
class TelemetryStreamer {
  constructor(socketIO = null) {
    this.io = socketIO;
    this.twin = new DigitalTwinState();
    this.cep = new CEPAlarmEngine((alert) => this.onCEPAlert(alert));
    this.activeScenario = null;
    this.scenarioProgressSec = 0;
    this.timer = null;
    this.intervalMs = 1000; // 1 Hz stream
  }

  loadScenario(scenarioId) {
    const filename = scenarioId.includes('.json') ? scenarioId : scenarioId + '.json';
    const filePath = path.join(__dirname, 'scenarios', filename);
    if (fs.existsSync(filePath)) {
      this.activeScenario = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.scenarioProgressSec = 0;
      console.log("[Streamer] Loaded Scenario: " + this.activeScenario.name);
      return this.activeScenario;
    }
    return null;
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    if (!this.activeScenario) {
      this.loadScenario('01_baseline_stable.json');
    }

    this.timer = setInterval(() => this.tick(), this.intervalMs);
    console.log("[Streamer] Real-time telemetry streaming started at " + (1000 / this.intervalMs) + " Hz.");
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("[Streamer] Streaming paused.");
    }
  }

  tick() {
    const vitals = this.generateNextVitals();
    const updatedState = this.twin.updateTelemetry(vitals);
    this.cep.processTick(updatedState.currentVitals, updatedState.hemodynamics);

    if (this.io) {
      this.io.emit('telemetry:tick', updatedState);
      if (updatedState.adverseEvaluation.overallStatus === 'CRITICAL') {
        this.io.emit('alarm:critical', updatedState.adverseEvaluation);
      }
    }

    return updatedState;
  }

  generateNextVitals() {
    if (!this.activeScenario || !this.activeScenario.keyFrames) {
      return this.twin.currentVitals;
    }

    this.scenarioProgressSec = (this.scenarioProgressSec + 1) % (this.activeScenario.durationSeconds || 60);
    const keyFrames = this.activeScenario.keyFrames;

    // Find bounding keyframes
    let kfBefore = keyFrames[0];
    let kfAfter = keyFrames[keyFrames.length - 1];

    for (let i = 0; i < keyFrames.length - 1; i++) {
      if (this.scenarioProgressSec >= keyFrames[i].time && this.scenarioProgressSec <= keyFrames[i + 1].time) {
        kfBefore = keyFrames[i];
        kfAfter = keyFrames[i + 1];
        break;
      }
    }

    const span = Math.max(1, kfAfter.time - kfBefore.time);
    const alpha = (this.scenarioProgressSec - kfBefore.time) / span;

    // Interpolate with physiological noise
    const noise = (scale) => (Math.random() - 0.5) * scale;

    return {
      heartRate: Math.round(kfBefore.heartRate + alpha * (kfAfter.heartRate - kfBefore.heartRate) + noise(2)),
      systolicBP: Math.round(kfBefore.systolicBP + alpha * (kfAfter.systolicBP - kfBefore.systolicBP) + noise(2)),
      diastolicBP: Math.round(kfBefore.diastolicBP + alpha * (kfAfter.diastolicBP - kfBefore.diastolicBP) + noise(1.5)),
      spo2: Math.min(100, Math.max(50, Math.round(kfBefore.spo2 + alpha * (kfAfter.spo2 - kfBefore.spo2) + noise(0.8)))),
      temperature: parseFloat((kfBefore.temperature + alpha * (kfAfter.temperature - kfBefore.temperature) + noise(0.05)).toFixed(1)),
      respiratoryRate: Math.round(kfBefore.respiratoryRate + alpha * (kfAfter.respiratoryRate - kfBefore.respiratoryRate) + noise(1)),
      glucose: Math.round(kfBefore.glucose + alpha * (kfAfter.glucose - kfBefore.glucose) + noise(1)),
      oldpeak: parseFloat(Math.max(0, kfBefore.oldpeak + alpha * (kfAfter.oldpeak - kfBefore.oldpeak) + noise(0.05)).toFixed(2))
    };
  }

  onCEPAlert(alert) {
    if (this.io) {
      this.io.emit('alarm:cep', alert);
    }
  }

  getState() {
    return this.twin.getState();
  }
}

module.exports = TelemetryStreamer;
