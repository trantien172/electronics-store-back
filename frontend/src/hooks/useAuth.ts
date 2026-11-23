import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth.service";
import api from "@/lib/axios";
import type { User } from "@/types/User.interface";

/** Client-only demo auth while backend authentication is unavailable. */
export function useAuth() {
  const { setAuth, updateUser: setUser, logout, user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const login = async (phone: string, password: string) => {
    if (!phone.trim() || !password) throw new Error("Vui lòng nhập số điện thoại và mật khẩu.");
    const result = await AuthService.login({ phone, password });
    setAuth({ ...result.user, role: String(result.user.role).toLowerCase() }, result.access_token);
    const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
    router.push(returnUrl?.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : "/");
  };

  const register = async (phone: string, password: string, name: string, otp: string) => {
    if (!phone.trim() || !password || !name.trim() || !otp) throw new Error("Vui lòng xác minh số điện thoại bằng OTP.");
    const result = await AuthService.register({ phone, password, name, otp, purpose: 'register' });
    setAuth({ ...result.user, role: String(result.user.role).toLowerCase() }, result.access_token);
    router.push("/");
  };

  const signOut = async () => {
    await AuthService.logout().catch(() => undefined);
    logout();
    router.push("/login");
  };

  const updateUser = async (nextUser: User & { address?: string; birthday?: string }) => {
    const { data } = await api.patch('/user/me', { name: nextUser.name, email: nextUser.email ?? null, address: nextUser.address ?? undefined, birthday: nextUser.birthday ?? undefined });
    setUser({ ...nextUser, ...data });
  };

  return { login, register, updateUser, signOut, user, isAuthenticated };
}
