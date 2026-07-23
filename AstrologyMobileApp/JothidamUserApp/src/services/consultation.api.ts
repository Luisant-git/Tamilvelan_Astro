import { apiClient } from './client';
import type {
  Astrologer,
  BookConsultationRequest,
  BookConsultationResponse,
  ConsultationListResponse,
} from '../types/consultation.types';

export const consultationApi = {
  // Plain array response — verified directly against the route handler.
  fetchAstrologers() {
    return apiClient.get<Astrologer[]>('/consultation/astrologers').then((r) => r.data);
  },
  book(payload: BookConsultationRequest) {
    return apiClient.post<BookConsultationResponse>('/consultation/book', payload).then((r) => r.data);
  },
  fetchList() {
    return apiClient.get<ConsultationListResponse>('/consultation/list').then((r) => r.data);
  },
};
