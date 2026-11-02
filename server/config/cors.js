const isAllowedOrigin = origin => {
  if (!origin) return true;

  const configuredOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_FRONTEND_URL,
  ].filter(Boolean);

  if (configuredOrigins.includes(origin)) return true;

  return /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin)
    || /https:\/\/.*\.(vercel\.app|netlify\.app|netlify\.com|github\.dev)/i.test(origin);
};

module.exports = { isAllowedOrigin };
