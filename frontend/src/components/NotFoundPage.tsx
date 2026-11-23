import Link from "next/link"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"; // Cài lucide-react nếu chưa có

export function NotFoundPage({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 select-none">
      {/* Container chính bọc hiệu ứng trượt nhẹ từ trên xuống */}
      <div className="text-center max-w-md space-y-6 animate-in fade-in slide-in-from-top-6 duration-500 ease-out">
        
        {/* Icon 404 sinh động */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full w-32 h-32 mx-auto" />
          <div className="relative p-10 rounded-full shadow-xl">
            <FileQuestion className="w-16 h-16 text-primary animate-bounce duration-1000" />
          </div>
        </div>

        {/* Mã lỗi và thông báo */}
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tighter text-primary">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight">
            Không tìm thấy trang
          </h2>
          <p className="text-muted-foreground text-sm px-4">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị di dời sang một địa chỉ khác.
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex  items-center justify-center gap-3 pt-2">
          {/* Nút quay lại trang trước */}
          {onGoBack && (
            <button type="button" onClick={onGoBack} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-neutral-800 hover:bg-neutral-50">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          )}
          
          {/* Nút về trang chủ */}
          <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-400">
              <Home className="w-4 h-4" /> Về trang chủ
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/services">Dịch vụ sửa chữa</Link>
            <Link href = "/contact">Liên hệ hỗ trợ</Link>
        </div>
      </div>
    </div>
  );
}
