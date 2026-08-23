const logEvent = (category, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  // Ensure sensitive fields are stripped
  const safeMeta = { ...meta };
  delete safeMeta.password;
  delete safeMeta.token;
  delete safeMeta.accessToken;
  delete safeMeta.refreshToken;
  delete safeMeta.apiKey;

  console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`, Object.keys(safeMeta).length ? JSON.stringify(safeMeta) : '');
};

module.exports = { logEvent };
