// Backend is now wired up — the real client lives in client.ts (interceptors,
// token handling, error normalization). Kept as a stable re-export path.
export { apiClient as api } from './client';
