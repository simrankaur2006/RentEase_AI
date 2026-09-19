import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// The Clerk session token getter is injected once from AppContext, so no
// component needs to know about tokens and no secret key lives in the client.
let tokenGetter = null;
export const setTokenGetter = (fn) => {
  tokenGetter = fn;
};

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Not signed in - public endpoints still work.
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the RentEase API. Is the server running on port 5000?'
        : 'Something went wrong. Please try again.');
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  }
);

export default api;
