const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const TelemetryStreamer = require('../../iot-telemetry-streamer/streamer');
const streamerInstance = new TelemetryStreamer();
streamerInstance.start();

/**
 * GET /api/telemetry/live
 * Fetches real-time digital twin state with physics & adverse evaluation
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: streamerInstance.getState(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/telemetry/scenarios
 * Returns all clinical demonstration scenarios
 */
router.get('/scenarios', (req, res) => {
  const scenariosDir = path.join(__dirname, '../../iot-telemetry-streamer/scenarios');
  const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.json'));
  const scenarios = files.map(f => {
    const raw = fs.readFileSync(path.join(scenariosDir, f), 'utf8');
    return JSON.parse(raw);
  });
  res.json({ success: true, count: scenarios.length, scenarios });
});

/**
 * POST /api/telemetry/scenario/:id
 * Activates a clinical scenario (e.g. 02_acute_cardiac_arrest)
 */
router.post('/scenario/:id', (req, res) => {
  const scenarioId = req.params.id;
  const loaded = streamerInstance.loadScenario(scenarioId);
  if (!loaded) {
    return res.status(404).json({ success: false, error: 'Scenario not found' });
  }
  res.json({
    success: true,
    message: 'Scenario activated: ' + loaded.name,
    scenario: loaded
  });
});

/**
 * POST /api/telemetry/vitals
 * Ingest external IoT / wearable vitals directly
 */
router.post('/vitals', (req, res) => {
  const newVitals = req.body;
  const state = streamerInstance.twin.updateTelemetry(newVitals);
  res.json({
    success: true,
    message: 'Telemetry updated via IoT gateway',
    state
  });
});

/**
 * POST /api/telemetry/stream/start
 */
router.post('/stream/start', (req, res) => {
  streamerInstance.start();
  res.json({ success: true, message: 'Telemetry streaming started' });
});

/**
 * POST /api/telemetry/stream/stop
 */
router.post('/stream/stop', (req, res) => {
  streamerInstance.stop();
  res.json({ success: true, message: 'Telemetry streaming paused' });
});

module.exports = {
  router,
  streamerInstance
};
