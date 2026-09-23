const express = require('express');
const router = express.Router();
const metricsService = require('../../metrics_service');

/**
 * GET /api/metrics/sessions
 * Returns all recorded sessions (for Recharts trend rendering)
 */
router.get('/sessions', (req, res) => {
  const sessions = metricsService.getAllSessions();
  res.json({ success: true, count: sessions.length, sessions });
});

/**
 * GET /api/metrics/session/latest
 * Returns the most recent session with full explainability breakdown
 */
router.get('/session/latest', (req, res) => {
  const result = metricsService.getLatestSession();
  res.json({ success: true, ...result });
});

/**
 * POST /api/metrics/session/record
 * Generates and records the next combined biomechanical + cardiopulmonary session
 */
router.post('/session/record', (req, res) => {
  const result = metricsService.recordNewSession();
  res.json({ success: true, ...result });
});

/**
 * DELETE /api/metrics/sessions/reset
 * Wipes the session store for fresh demo presentations
 */
router.delete('/sessions/reset', (req, res) => {
  const result = metricsService.resetStore();
  res.json({ success: true, ...result });
});

module.exports = router;
