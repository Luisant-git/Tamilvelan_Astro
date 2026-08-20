import { apiClient } from './client';
import type { PanchangResponse } from '../types/panchang.types';

export const panchangApi = {
  fetchToday(isoDate?: string) {
    return apiClient
      .get<PanchangResponse>('/panchang/today', { params: isoDate ? { date: isoDate } : undefined })
      .then((r) => r.data);
  },
};
