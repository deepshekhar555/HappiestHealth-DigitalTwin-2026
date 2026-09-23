/**
 * BioTwin Metrics Microservice / In-Memory Session Store
 * Manages discrete walking rehabilitation sessions combining biomechanics & vitals.
 */
const { generateSessionSnapshot, deriveExplainability } = require('./metricsEngine');

class MetricsService {
  constructor(maxSessions = 30) {
    this.maxSessions = maxSessions;
    this.sessions = [];
    this.sessionCounter = 0;
  }

  getAllSessions() {
    return this.sessions;
  }

  getLatestSession() {
    if (this.sessions.length === 0) {
      return {
        session: null,
        explainability: null,
        message: 'No sessions recorded yet. Click "Record New Rehabilitation Session" to begin.',
      };
    }
    const latest = this.sessions[this.sessions.length - 1];
    return {
      session: latest,
      explainability: deriveExplainability(latest, this.sessions.length),
    };
  }

  recordNewSession() {
    this.sessionCounter++;
    const session = generateSessionSnapshot(this.sessionCounter);
    this.sessions.push(session);

    if (this.sessions.length > this.maxSessions) {
      this.sessions.shift();
    }

    const explainability = deriveExplainability(session, this.sessions.length);

    return {
      session,
      explainability,
      totalSessions: this.sessions.length,
    };
  }

  resetStore() {
    this.sessions = [];
    this.sessionCounter = 0;
    return { message: 'Metrics session store has been successfully reset.' };
  }
}

const serviceInstance = new MetricsService();

module.exports = serviceInstance;
module.exports.MetricsService = MetricsService;
module.exports.metricsEngine = require('./metricsEngine');
