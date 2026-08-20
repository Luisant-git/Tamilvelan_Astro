import axios, { AxiosRequestHeaders } from 'axios';

// NEXT_PUBLIC_API_URL is the backend's origin only (no /api suffix) —
// frontend and backend are now separate processes/origins (previously the
// same Next.js app served both, so a relative '/api' path worked).
const api = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jothidam_token');
    if (token) {
      const headers = (config.headers ??= {} as AxiosRequestHeaders);
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
