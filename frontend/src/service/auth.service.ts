import api from '@/lib/axios'
import { AuthResponse } from '@/types/AuthResponse.interface'

export interface LoginDto {
  phone: string
  password: string
}

export interface RegisterDto extends LoginDto {
  name: string
  otp: string
  purpose: "register"
}

export const AuthService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', dto)
    return data
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', dto)
    return data
  },
  async sendOtp(phone: string, purpose: "register" | "reset" | "google" | "repair" = "register") {
    const { data } = await api.post('/auth/send-otp', { phone, purpose });
    return data as { success: boolean; mockOtp?: string };
  },
  async resetPassword(phone: string, otp: string, password: string) {
    const { data } = await api.post('/auth/password-reset', { phone, otp, purpose: 'reset', password });
    return data;
  },
  async logout() { await api.post('/auth/logout'); },
  async changePassword(currentPassword: string, newPassword: string) { const { data } = await api.patch('/user/me/password', { currentPassword, newPassword }); return data; },
  googleLoginUrl() { return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`; },
}
