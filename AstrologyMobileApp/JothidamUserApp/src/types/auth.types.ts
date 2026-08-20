// Shapes verified directly against the live backend (src/app/api/auth/*).

export interface AuthResponseUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthResponseUser;
}

export interface LoginRequest {
  identifier: string; // email or 10-digit mobile
  otp: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  otp: string;
}

export interface MeResponseUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface MeResponse {
  user: MeResponseUser;
}
