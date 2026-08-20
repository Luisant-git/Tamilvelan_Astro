import { apiClient } from './client';
import type { Report } from '../types/reports.types';

export const reportsApi = {
  // Plain array response — verified directly against the route handler.
  list() {
    return apiClient.get<Report[]>('/reports/list').then((r) => r.data);
  },
};
