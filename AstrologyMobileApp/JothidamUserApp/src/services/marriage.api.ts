import { apiClient } from './client';
import type { MarriageMatchRequest, MarriageMatchResponse, MarriageHistoryResponse } from '../types/marriage.types';

export const marriageApi = {
  match(payload: MarriageMatchRequest) {
    return apiClient.post<MarriageMatchResponse>('/marriage/match', payload).then((r) => r.data);
  },
  fetchHistory() {
    return apiClient.get<MarriageHistoryResponse>('/marriage/history').then((r) => r.data);
  },
};
