// src/components/providers.tsx
"use client" // Bắt buộc phải có dòng này

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient bên trong useState để đảm bảo mỗi request trên Next.js 
  // không bị chia sẻ chung data cache (tránh rò rỉ dữ liệu giữa các user)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Đặt mặc định cache 5 phút cho đỡ gọi API liên tục
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}