const config = require('../config');

let tokenData = {
  accessToken: null,
  expiresAt: 0,
  refreshPromise: null,
};

async function requestToken() {
  const url = `${config.turn14.apiBase}/token`;
  const body = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: config.turn14.clientId,
    client_secret: config.turn14.clientSecret,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turn14 token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + config.turn14.tokenRefreshMinutes * 60 * 1000,
  };
}

async function getToken() {
  if (tokenData.accessToken && Date.now() < tokenData.expiresAt) {
    return tokenData.accessToken;
  }

  if (tokenData.refreshPromise) {
    await tokenData.refreshPromise;
    return tokenData.accessToken;
  }

  tokenData.refreshPromise = requestToken()
    .then((result) => {
      tokenData.accessToken = result.accessToken;
      tokenData.expiresAt = result.expiresAt;
      tokenData.refreshPromise = null;
    })
    .catch((err) => {
      tokenData.refreshPromise = null;
      throw err;
    });

  await tokenData.refreshPromise;
  return tokenData.accessToken;
}

function clearToken() {
  tokenData.accessToken = null;
  tokenData.expiresAt = 0;
}

module.exports = { getToken, clearToken };
