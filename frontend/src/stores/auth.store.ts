import { create } from "zustand";
import { persist } from 'zustand/middleware'
import { User } from "@/types/User.interface";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        // AT lưu localStorage + store
        // RT backend tự set vào httpOnly cookie, không cần làm gì thêm
        localStorage.setItem("access_token", accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),
 
      setAccessToken: (token) => {
        localStorage.setItem("access_token", token);
        set({ accessToken: token, isAuthenticated: true });
      },
 
      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "fixpro-auth", // key trong localStorage
 
      // CHỈ persist `user` — accessToken giữ riêng ở localStorage key cũ
      // để không lưu token 2 nơi, nhưng vẫn cần set isAuthenticated theo accessToken khi rehydrate
      partialize: (state) => ({ user: state.user }),
 
      // Sau khi đọc lại `user` từ localStorage lúc app khởi động,
      // đồng bộ accessToken + isAuthenticated từ access_token đã lưu riêng
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const token = localStorage.getItem("access_token");
        if (token && state.user) {
          state.accessToken = token;
          state.isAuthenticated = true;
        } else {
          // Có user cũ trong localStorage nhưng token đã hết / bị xoá
          state.user = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
