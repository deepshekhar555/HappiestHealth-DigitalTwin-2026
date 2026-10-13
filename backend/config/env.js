const getJwtSecret = () => {
  const value = process.env.JWT_SECRET && process.env.JWT_SECRET.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }

  return 'fallback_secret_for_demo_purposes_only';
};

const getApiPort = () => Number(process.env.PORT || 5000);

const getAllowedOrigins = () => {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  if (process.env.NODE_ENV === 'production') {
    return [
      'https://biotwin-azure.com',
      'https://hospital-intranet.gov',
      'https://biotwin.vercel.app',
      'https://biotwin-ai.vercel.app',
      'https://bio-twin.vercel.app',
      'https://bio-twin-ai.vercel.app'
    ];
  }

  return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
};

module.exports = {
  getJwtSecret,
  getApiPort,
  getAllowedOrigins
};
