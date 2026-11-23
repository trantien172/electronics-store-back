import {
  Bell, Globe, Palette, UserRoundCog, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sections: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  notifications: {
    title: "Quản lý thông báo",
    description: "Theo dõi và quản lý thông báo gửi đến khách hàng, nhân viên và quản trị viên.",
    icon: Bell,
  },
  staff: {
    title: "Quản lý nhân sự",
    description: "Quản lý hồ sơ nhân viên, kỹ thuật viên, vai trò và trạng thái làm việc.",
    icon: UserRoundCog,
  },
  users: {
    title: "Quản lý người dùng",
    description: "Quản lý tài khoản và quyền truy cập trong hệ thống FixPro.",
    icon: Users,
  },
  appearance: {
    title: "Quản lý giao diện",
    description: "Tùy chỉnh nhận diện và nội dung giao diện website cửa hàng.",
    icon: Palette,
  },
  website: {
    title: "Thông tin website",
    description: "Cập nhật thông tin liên hệ, địa chỉ, giờ hoạt động và nội dung chung của website.",
    icon: Globe,
  },
};

export default async function DashboardManagementPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const page = sections[section];
  if (!page) return <section className="rounded-2xl border border-border bg-card p-8 text-center"><h1 className="text-xl font-semibold">Trang chưa được hỗ trợ</h1><p className="mt-2 text-sm text-muted-foreground">Không tìm thấy phân hệ quản trị này.</p></section>;
  const Icon = page.icon;

  return <div className="mx-auto w-full max-w-5xl space-y-5">
    <header><h1 className="text-2xl font-semibold tracking-tight">{page.title}</h1><p className="mt-1 text-sm text-muted-foreground">{page.description}</p></header>
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary-600"><Icon className="size-5" /></div>
      <h2 className="mt-4 text-base font-semibold">Phân hệ đã sẵn sàng</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Trang này đã được thêm vào điều hướng. Nội dung quản lý và lưu dữ liệu sẽ được hoàn thiện khi backend cùng các API tương ứng sẵn sàng.</p>
      <span className="mt-4 inline-flex rounded-full border border-warning/30 bg-warning-bg px-2.5 py-1 text-[11px] font-medium text-warning">Chưa kết nối backend</span>
    </section>
  </div>;
}
