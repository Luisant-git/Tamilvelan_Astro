import { apiClient } from './client';
import type {
  DailyRasiResponse,
  GenerateHoroscopeRequest,
  GenerateHoroscopeResponse,
  HoroscopeHistoryResponse,
  GeocodeResponse,
} from '../types/horoscope.types';

export const horoscopeApi = {
  fetchDailyRasi(rasi: number) {
    return apiClient.get<DailyRasiResponse>(`/horoscope/daily/${rasi}`).then((r) => r.data);
  },
  generate(payload: GenerateHoroscopeRequest) {
    return apiClient.post<GenerateHoroscopeResponse>('/horoscope/generate', payload).then((r) => r.data);
  },
  fetchHistory() {
    return apiClient.get<HoroscopeHistoryResponse>('/horoscope/history').then((r) => r.data);
  },
  geocode(place: string) {
    return apiClient
      .get<GeocodeResponse>('/horoscope/geocode', { params: { place }, timeout: 5000 })
      .then((r) => r.data);
  },
};
