import { apiClient } from './client';
import type { KadhalMatchRequest, KadhalMatchResponse } from '../types/kadhal.types';

export const kadhalApi = {
  match(payload: KadhalMatchRequest) {
    return apiClient.post<KadhalMatchResponse>('/kadhal/match', payload).then((r) => r.data);
  },
};
