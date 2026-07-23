import { apiClient } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, MeResponse } from '../types/auth.types';

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data);
  },
  register(payload: RegisterRequest) {
    return apiClient.post<AuthResponse>('/auth/register', payload).then((r) => r.data);
  },
  me() {
    return apiClient.get<MeResponse>('/auth/me').then((r) => r.data);
  },
};
