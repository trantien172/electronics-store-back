"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Wrench } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  function loginAs(role: "owner" | "admin") {
    const name = role === "owner" ? "Chủ cửa hàng" : "Quản trị viên";
    setAuth({ name, phone: role === "owner" ? "0900000001" : "0900000002", role, avatarUrl: "" }, `demo-dashboard-${role}`);
    router.replace("/dashboard");
  }

  return <main className="flex min-h-svh items-center justify-center bg-background p-4">
    <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Về trang đăng nhập khách hàng</Link>
      <div className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Wrench className="size-6" /></div>
      <p className="mt-5 text-sm font-semibold text-primary-600">FIXPRO · QUẢN TRỊ</p>
      <h1 className="mt-1 text-2xl font-semibold">Đăng nhập Dashboard</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Backend chưa được kết nối. Chọn vai trò demo để xem giao diện quản trị.</p>
      <div className="mt-6 space-y-3">
        <button onClick={() => loginAs("owner")} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border px-4 text-left transition hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><ShieldCheck className="size-5" /></span>
          <span><span className="block text-sm font-semibold">Tiếp tục với Owner</span><span className="block text-xs text-muted-foreground">Đầy đủ quyền quản trị trong bản demo</span></span>
        </button>
        <button onClick={() => loginAs("admin")} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border px-4 text-left transition hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><ShieldCheck className="size-5" /></span>
          <span><span className="block text-sm font-semibold">Tiếp tục với Admin</span><span className="block text-xs text-muted-foreground">Quyền quản trị viên trong bản demo</span></span>
        </button>
      </div>
      <p className="mt-5 rounded-lg bg-warning-bg px-3 py-2.5 text-xs leading-5 text-warning">Đăng nhập này chỉ dùng để xem giao diện. Chưa xác thực danh tính và không bảo vệ dữ liệu thực.</p>
    </section>
  </main>;
}
