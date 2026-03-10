const config = require('../config');
const { getToken, clearToken } = require('./turn14Auth');

const REQUEST_INTERVAL_MS = Math.ceil(1000 / config.turn14.rateLimit.requestsPerSecond);
let lastRequestTime = 0;

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function apiRequest(endpoint, options = {}) {
  await throttle();

  const token = await getToken();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${config.turn14.apiBase}${endpoint}`;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    const newToken = await getToken();
    const retry = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!retry.ok) {
      throw new Error(`Turn14 API error (${retry.status}): ${await retry.text()}`);
    }
    return retry.json();
  }

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
    console.warn(`Turn14 rate limited. Waiting ${retryAfter}s...`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return apiRequest(endpoint, options);
  }

  if (!res.ok) {
    throw new Error(`Turn14 API error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

async function fetchAllPages(endpoint, options = {}) {
  const results = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${endpoint}${separator}page=${page}`;
    const data = await apiRequest(url, options);

    if (data?.data && Array.isArray(data.data)) {
      results.push(...data.data);
      const meta = data.meta;
      if (meta && meta.total_pages && page < meta.total_pages) {
        page++;
      } else if (data.data.length === 0) {
        hasMore = false;
      } else {
        hasMore = meta?.total_pages ? page < meta.total_pages : false;
        page++;
      }
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        hasMore = false;
      } else {
        results.push(...data);
        page++;
      }
    } else {
      results.push(data);
      hasMore = false;
    }
  }

  return results;
}

const turn14 = {
  getItems: (page = 1) => apiRequest(`/items?page=${page}`),
  getItem: (id) => apiRequest(`/items/${id}`),
  getItemData: (id) => apiRequest(`/items/${id}/data`),
  getItemFitment: (id) => apiRequest(`/items/${id}/fitment`),
  getItemsByBrand: (brandId, page = 1) => apiRequest(`/items/brand/${brandId}?page=${page}`),

  getBrands: () => apiRequest('/brands'),
  getBrand: (id) => apiRequest(`/brands/${id}`),

  getCategories: () => apiRequest('/categories'),

  fetchAllPages,
  apiRequest,
};

module.exports = turn14;
