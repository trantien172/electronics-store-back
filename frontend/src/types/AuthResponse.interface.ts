import { User } from '@/types/User.interface'

export interface AuthResponse {
    user: User,
    access_token: string
}