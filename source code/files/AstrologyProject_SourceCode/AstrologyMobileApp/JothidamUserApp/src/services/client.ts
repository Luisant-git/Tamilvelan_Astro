import axios, { AxiosError } from 'axios';

// Centralized Axios client. baseURL comes from EXPO_PUBLIC_API_URL (set in
// .env — see .env.example). EXPO_PUBLIC_* vars are inlined at bundle time,
// so changing .env requires restarting Metro with cache clear (`expo start -c`).
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Force the XHR adapter — Expo SDK 54's fetch-based networking on Android
  // (Hermes) has a confirmed regression that surfaces as a generic axios
  // "Network Error" with no response, even though the same request succeeds
  // from a browser (https://github.com/expo/expo/issues/40061). RN's XHR
  // implementation is unaffected.
  adapter: 'xhr',
});

// Mirrors the current auth token outside React state so the request
// interceptor can read it synchronously (AsyncStorage is async, and we don't
// want every request to await a storage read). AuthContext calls this
// whenever the token changes (login/register/restore-on-mount/logout).
let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Lets AuthContext react to a 401 (expired/invalid token) without client.ts
// importing AuthContext directly (that would be circular — AuthContext
// imports setAuthToken from here).
let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

// Every backend route in this project responds with `{ error: "..." }` on
// failure (verified across every route read for the integration plan) —
// normalize whatever Axios throws into one string screens can display.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ error?: string; errors?: { field: string; msg: string }[] }>;
    const data = axiosErr.response?.data;
    if (data?.error) return data.error;
    if (data?.errors?.length) return data.errors.map((e) => e.msg).join(', ');
    if (axiosErr.code === 'ECONNABORTED') return 'இணைய இணைப்பு தாமதமானது / Request timed out';
    if (!axiosErr.response) return 'இணைய இணைப்பு இல்லை / Network error — check your connection';
    return axiosErr.message;
  }
  if (err instanceof Error) return err.message;
  return 'எதிர்பாராத பிழை / Something went wrong';
}
