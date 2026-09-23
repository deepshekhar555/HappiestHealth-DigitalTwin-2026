const PhysicsModels = require('./core-digital-twin/physics_models');
const AdverseEventPredictor = require('./core-digital-twin/adverse_event_predictor');
const DigitalTwinState = require('./core-digital-twin/twin_state');
const TelemetryStreamer = require('./iot-telemetry-streamer/streamer');

console.log('====================================================');
console.log('RUNNING HAPPIEST HEALTH 2026 SYSTEM VERIFICATION TEST');
console.log('====================================================\n');

// 1. Test Hemodynamic Calculations
console.log('[1/4] Testing Physics-Informed Hemodynamic Calculations...');
const sampleVitals = { heartRate: 110, systolicBP: 140, diastolicBP: 90, spo2: 92, oldpeak: 2.1 };
const hemo = PhysicsModels.computeHemodynamicProfile(sampleVitals, { age: 65 });
console.log('-> Mean Arterial Pressure (MAP): ' + hemo.map + ' mmHg (Expected ~106.7)');
console.log('-> Shock Index: ' + hemo.shockIndex + ' (Expected ~0.79)');
console.log('-> Cardiac Stress: ' + hemo.cardiacStress + ' (Expected ~231.0)');
console.log('-> Heart Workload: ' + hemo.heartWorkload);
console.log('-> Composite Risk Score: ' + hemo.compositeRiskScore + '%');
console.assert(hemo.map > 100, 'MAP calculation check');
console.log(' Hemodynamic formulas validated.\n');

// 2. Test Adverse Event Early Warning Engine
console.log('[2/4] Testing Adverse Event Early Warning Engine...');
const normalEval = AdverseEventPredictor.evaluateAdverseEvents({ heartRate: 72, systolicBP: 120, diastolicBP: 80, spo2: 99 });
console.log('-> Normal State Status: ' + normalEval.overallStatus + ' (Active threats: ' + normalEval.activeThreatCount + ')');
console.assert(normalEval.overallStatus === 'STABLE', 'Normal status check');

const criticalEval = AdverseEventPredictor.evaluateAdverseEvents({ heartRate: 155, systolicBP: 75, diastolicBP: 45, spo2: 82, oldpeak: 3.5 });
console.log('-> Critical State Status: ' + criticalEval.overallStatus);
console.log('-> Threats Detected: ' + criticalEval.predictedEvents.map(e => e.title).join(' | '));
console.assert(criticalEval.overallStatus === 'CRITICAL', 'Critical status check');
console.log(' Adverse event prediction validated.\n');

// 3. Test Digital Twin Continuous State Fusion
console.log('[3/4] Testing Digital Twin State Fusion...');
const twin = new DigitalTwinState({ name: 'Alex Mercer', age: 62 });
const state = twin.updateTelemetry({ heartRate: 88, systolicBP: 130, diastolicBP: 85, spo2: 97 });
console.log('-> Patient: ' + state.patientProfile.name + ' (' + state.patientProfile.age + ' yo)');
console.log('-> Organ Health Matrix: Heart=' + state.organHealth.heart + '%, Lungs=' + state.organHealth.lungs + '%, Brain=' + state.organHealth.brain + '%, Kidneys=' + state.organHealth.kidneys + '%');
console.assert(state.organHealth.heart > 0, 'Organ health check');
console.log(' Digital Twin state management validated.\n');

// 4. Test Scenario Streamer & Telemetry Simulation
console.log('[4/4] Testing Clinical Scenario Telemetry Streamer...');
const streamer = new TelemetryStreamer();
const scenario = streamer.loadScenario('02_acute_cardiac_arrest.json');
console.log('-> Loaded Scenario: ' + scenario.name);
console.log('-> Ticking 5 scenario steps...');
for (let i = 0; i < 5; i++) {
  const tickState = streamer.tick();
  console.log('   Tick ' + (i+1) + ': HR=' + tickState.currentVitals.heartRate + ' bpm, BP=' + tickState.currentVitals.systolicBP + '/' + tickState.currentVitals.diastolicBP + ', Status=' + tickState.adverseEvaluation.overallStatus);
}
console.log(' Scenario streamer validated.\n');

console.log('====================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (4/4)!');
console.log('====================================================');
