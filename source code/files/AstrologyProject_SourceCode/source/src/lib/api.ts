import axios, { AxiosRequestHeaders } from 'axios';

const api = axios.create({ baseURL: '/api' });

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
