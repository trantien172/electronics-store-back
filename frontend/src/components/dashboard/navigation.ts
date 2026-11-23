import {
  Archive, BarChart3, Bell, ClipboardList, FileText, Globe, LayoutDashboard,
  Package, Palette, Settings, ShieldCheck, UserRoundCog, Users, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const dashboardNavigation: DashboardNavGroup[] = [
  { label: "Tổng quan", items: [{ label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard }] },
  { label: "Vận hành", items: [
    { label: "Phiếu sửa chữa", href: "/dashboard/repairs", icon: Wrench },
    { label: "Bảo hành", href: "/dashboard/warranties", icon: ShieldCheck },
  ] },
  { label: "Sản phẩm và kinh doanh", items: [
    { label: "Sản phẩm / Kho", href: "/dashboard/products", icon: Package },
    { label: "Máy cũ", href: "/dashboard/old-products", icon: Archive },
    { label: "Bán hàng / Hóa đơn", href: "/dashboard/orders", icon: ClipboardList },
  ] },
  { label: "Nội dung", items: [{ label: "Bài viết / Đăng bài MXH", href: "/dashboard/social", icon: FileText }] },
  { label: "Quản trị", items: [
    { label: "Báo cáo", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Quản lý thông báo", href: "/dashboard/notifications", icon: Bell },
    { label: "Quản lý nhân sự", href: "/dashboard/staff", icon: UserRoundCog },
    { label: "Quản lý người dùng", href: "/dashboard/users", icon: Users, ownerOnly: true },
    { label: "Quản lý giao diện", href: "/dashboard/appearance", icon: Palette, ownerOnly: true },
    { label: "Thông tin website", href: "/dashboard/website", icon: Globe, ownerOnly: true },
    { label: "Cấu hình", href: "/dashboard/settings", icon: Settings, ownerOnly: true },
  ] },
];

export function isDashboardPathActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
