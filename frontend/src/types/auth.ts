/** Stage 2 auth types: shapes exchanged with the Django API. */

export interface HealthResponse {
  status: string;
  service: string;
}

export interface UserProfile {
  phone: string;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access: string;
}

export interface ProtectedTestResponse {
  message: string;
  user: string;
}

/** DRF error shape: { field: [messages] } or { detail: message }. */
export type ApiErrorData = Record<string, string[] | string>;
