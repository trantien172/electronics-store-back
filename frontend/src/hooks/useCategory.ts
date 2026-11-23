import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios"; // chỉnh path theo đúng file axios instance của bạn
import type { Category } from "@/types/Category.interface";

export interface CategoryWithServices extends Category {
  services?: { id: number; name: string; description?: string | null; usageCount?: number }[];
}

async function fetchCategory(): Promise<CategoryWithServices[]> {
  const { data } = await api.get<CategoryWithServices[]>("/product/category");
  return data;
} 
export function useCategory() {
  return useQuery({
    queryKey: ["category"],
    queryFn: fetchCategory,

    // // Data này ít thay đổi → cache lâu, không fetch lại liên tục
    // staleTime: 1000 * 60 * 30,     // 30 phút coi là "còn mới"
    // gcTime: 1000 * 60 * 60,        // giữ trong cache 1 giờ dù không dùng
    staleTime: 0
    // refetchOnWindowFocus: false,   // không cần fetch lại khi quay lại tab
  });
}
