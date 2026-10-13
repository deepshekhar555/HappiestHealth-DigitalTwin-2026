const AuditLog = require('../models/AuditLog');
const { isMongoReady } = require('../config/mongo');

const sanitizeAuditDetails = (value) => {
  if (value === null || typeof value === 'undefined') return value;
  if (typeof value === 'string') return value.slice(0, 2000);
  if (Array.isArray(value)) return value.slice(0, 20).map(sanitizeAuditDetails);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).slice(0, 20).map(([key, nested]) => [key, sanitizeAuditDetails(nested)])
    );
  }
  return value;
};

const auditMiddleware = (req, res, next) => {
  res.on('finish', async () => {
    try {
      if (!req.user) return;

      const resourceId = req.params.id || req.body?.patientId || req.body?.id || 'N/A';
      const details = {
        status: res.statusCode,
        method: req.method,
        path: req.originalUrl,
        body: sanitizeAuditDetails(req.body),
        query: sanitizeAuditDetails(req.query),
        params: sanitizeAuditDetails(req.params)
      };

      if (isMongoReady()) {
        const log = new AuditLog({
          user: req.user.id || req.user.email || 'unknown',
          role: req.user.role || 'unknown',
          action: `${req.method} ${req.originalUrl}`,
          resourceId,
          details
        });

        await log.save();
      }
    } catch (err) {
      console.error('Audit Log failed:', err.message);
    }
  });

  next();
};

module.exports = auditMiddleware;
