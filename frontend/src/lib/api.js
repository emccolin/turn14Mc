const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    next: options.next || { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/products?${qs}`);
  },

  getProduct: (id) => fetchApi(`/products/${id}`),

  searchProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/search?${qs}`);
  },

  getBrands: () => fetchApi('/brands'),
  getCategories: () => fetchApi('/categories'),
  getCategoryTree: () => fetchApi('/categories/tree'),

  getYears: () => fetchApi('/vehicles/years'),
  getMakes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/vehicles/makes?${qs}`);
  },
  getModels: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/vehicles/models?${qs}`);
  },
  getSubmodels: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/vehicles/submodels?${qs}`);
  },
  getEngines: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/vehicles/engines?${qs}`);
  },
  getVehicleProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/vehicles/products?${qs}`);
  },
};
