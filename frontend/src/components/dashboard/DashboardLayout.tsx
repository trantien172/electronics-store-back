"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, LogOut,
  Menu, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { dashboardNavigation, isDashboardPathActive } from "./navigation";

const titles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/dashboard/repairs": "Phiếu sửa chữa",
  "/dashboard/warranties": "Bảo hành",
  "/dashboard/products": "Sản phẩm / Kho",
  "/dashboard/old-products": "Máy cũ",
  "/dashboard/orders": "Bán hàng / Hóa đơn",
  "/dashboard/social": "Bài viết / Đăng bài MXH",
  "/dashboard/reports": "Báo cáo",
  "/dashboard/notifications": "Quản lý thông báo",
  "/dashboard/staff": "Quản lý nhân sự",
  "/dashboard/users": "Người dùng",
  "/dashboard/appearance": "Quản lý giao diện",
  "/dashboard/website": "Thông tin website",
  "/dashboard/settings": "Cấu hình",
  "/dashboard/account": "Thông tin tài khoản",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(dashboardNavigation.map((group) => group.label));

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("fixpro-dashboard-sidebar") === "collapsed");
    const savedGroups = window.sessionStorage.getItem("fixpro-dashboard-groups");
    if (savedGroups) {
      try { setExpandedGroups(JSON.parse(savedGroups) as string[]); } catch { /* Ignore stale preference data. */ }
    }
  }, []);

  const breadcrumb = useMemo(() => {
    const exactTitle = titles[pathname];
    if (pathname === "/dashboard") return [{ label: "Tổng quan" }];
    const matchedItem = dashboardNavigation.flatMap((group) => group.items.map((item) => ({ group, item }))).find(({ item }) => item.href === pathname);
    if (matchedItem) return [{ label: matchedItem.group.label, href: "/dashboard" }, { label: matchedItem.item.label }];
    if (exactTitle) return [{ label: "Tổng quan", href: "/dashboard" }, { label: exactTitle }];
    const segments = pathname.split("/").filter(Boolean);
    const parentHref = `/${segments.slice(0, -1).join("/")}`;
    return [{ label: "Tổng quan", href: "/dashboard" }, { label: titles[parentHref] ?? "Dashboard", href: parentHref }, { label: segments.at(-1)?.replaceAll("-", " ") ?? "" }];
  }, [pathname]);

  const displayName = user?.name?.trim() || "Quản trị viên";
  const role = user?.role?.toLowerCase() === "owner" ? "Owner" : "Admin";
  const initial = displayName.charAt(0).toLocaleUpperCase("vi-VN");

  function toggleGroup(label: string) {
    setExpandedGroups((current) => {
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      window.sessionStorage.setItem("fixpro-dashboard-groups", JSON.stringify(next));
      return next;
    });
  }

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("fixpro-dashboard-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  function signOut() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex h-dvh min-h-[480px] overflow-hidden bg-background text-foreground">
      <button
        aria-label="Đóng menu"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        disabled={!mobileOpen}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        onClick={(event) => {
          if (!collapsed || !window.matchMedia("(min-width: 768px)").matches) return;
          if (event.target instanceof Element && event.target.closest("a, button")) return;
          toggleSidebar();
        }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col bg-surface-dark text-sidebar-foreground transition-[width,transform,translate] duration-[300ms] ease-out motion-reduce:transition-none md:static md:z-20 md:translate-x-0 ${collapsed ? "md:w-[76px]" : "md:w-[250px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 ${collapsed ? "md:justify-center md:px-2" : "justify-between"}`}>
          <Link href="/dashboard" aria-label="FixPro, Tổng quan" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">F</span>
            <span className={`truncate text-base font-bold tracking-wide ${collapsed ? "md:hidden" : ""}`}>FixPro <span className="font-normal text-white/55">Dashboard</span></span>
          </Link>
          <button onClick={() => setMobileOpen(false)} aria-label="Đóng menu" className="rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"><X className="size-5" /></button>
          {!collapsed && <button onClick={toggleSidebar} aria-label="Thu gọn thanh điều hướng" title="Thu gọn" className="hidden rounded-lg p-2 text-white/65 hover:bg-white/10 hover:text-white md:block">
             <PanelLeftClose className="size-4" />
          </button>
          }
        </div>

        <nav aria-label="Điều hướng dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {dashboardNavigation.map((group) => {
            const visibleItems = group.items.filter((item) => !item.ownerOnly || role === "Owner");
            if (!visibleItems.length) return null;
            const expanded = expandedGroups.includes(group.label);
            return <section key={group.label}>
              <button onClick={() => toggleGroup(group.label)} aria-expanded={expanded} className={`mb-1 flex w-full items-center justify-between rounded px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-white/40 hover:text-white/75 ${collapsed ? "md:justify-center" : ""}`}>
                <span className={collapsed ? "md:hidden" : ""}>{group.label}</span><ChevronDown className={`size-3.5 transition-transform ${expanded ? "" : "-rotate-90"} ${collapsed ? "md:hidden" : ""}`} />
              </button>
              <ul className={`space-y-1 ${expanded && !collapsed ? "md:hidden" : ""} ${!expanded && mobileOpen ? "hidden" : ""}`}>{visibleItems.map((item) => {
                const active = isDashboardPathActive(pathname, item.href);
                const Icon = item.icon;
                return <li key={item.href}><Link href={item.href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary/15 text-primary" : "text-white/65 hover:bg-white/[0.07] hover:text-white"} ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                  <Icon className="size-[17px] shrink-0" /><span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                  {collapsed && <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-surface-dark/70 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:md:block group-focus-visible:md:block">{item.label}</span>}
                </Link></li>;
              })}</ul>
            </section>;
          })}
        </nav>

        <div className={`hidden border-t border-white/10 p-3 md:block ${collapsed ? "text-center" : ""}`}>
          <button onClick={toggleSidebar} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-xs text-white/50 hover:bg-white/[0.07] hover:text-white ${collapsed ? "justify-center px-0" : ""}`} aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}>
            {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /><span>Thu gọn thanh bên</span></>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setMobileOpen(true)} aria-label="Mở menu" className="-ml-2 rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"><Menu className="size-5" /></button>
            <nav aria-label="Breadcrumb" className="min-w-0"><ol className="flex items-center gap-1.5 overflow-hidden text-sm">
              {breadcrumb.map((item, index) => <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && <span aria-hidden="true" className="text-muted-foreground/50">/</span>}
                {item.href && index < breadcrumb.length - 1 ? <Link href={item.href} className="truncate text-muted-foreground hover:text-foreground">{item.label}</Link> : <span aria-current="page" className={`truncate ${index === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{item.label}</span>}
              </li>)}
            </ol></nav>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="relative">
              <button onClick={() => { setNotificationsOpen((open) => !open); setAccountOpen(false); }} aria-label="Thông báo" aria-expanded={notificationsOpen} className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Bell className="size-[19px]" /></button>
              {notificationsOpen && <><button aria-label="Đóng thông báo" className="fixed inset-0 z-30 cursor-default" onClick={() => setNotificationsOpen(false)} /><section aria-label="Thông báo gần đây" className="absolute right-0 top-12 z-40 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">Thông báo</h2><span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">0 chưa đọc</span></div>
                <div className="px-5 py-8 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><Bell className="size-5" /></span><p className="mt-3 text-sm font-medium">Chưa có thông báo</p><p className="mt-1 text-xs text-muted-foreground">Thông báo mới sẽ xuất hiện tại đây.</p></div>
                <Link href="/dashboard/notifications" onClick={() => setNotificationsOpen(false)} className="block border-t border-border px-4 py-3 text-center text-xs font-medium text-primary-600 hover:bg-muted/60">Xem tất cả thông báo</Link>
              </section></>}
            </div>
            <div className="relative">
              <button onClick={() => { setAccountOpen((open) => !open); setNotificationsOpen(false); }} aria-expanded={accountOpen} aria-label="Mở menu tài khoản" className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" /> : <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{initial || <CircleUserRound className="size-4" />}</span>}
                <span className="hidden max-w-36 text-left sm:block"><span className="block truncate text-xs font-semibold leading-4">{displayName}</span><span className="block text-[10px] leading-4 text-muted-foreground">{role}</span></span><ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
              </button>
              {accountOpen && <><button aria-label="Đóng menu tài khoản" className="fixed inset-0 z-30 cursor-default" onClick={() => setAccountOpen(false)} /><section aria-label="Tài khoản" className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl">
                <div className="border-b border-border px-3 py-2.5"><p className="truncate text-sm font-semibold">{displayName}</p><p className="text-xs text-muted-foreground">{role}</p>{user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}</div>
                <Link href="/dashboard/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"><CircleUserRound className="size-4 text-muted-foreground" />Thông tin tài khoản</Link>
                <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-bg"><LogOut className="size-4" />Đăng xuất</button>
              </section></>}
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><div className="min-h-full p-4 sm:p-5 lg:p-6">{children}</div></main>
      </div>
    </div>
  );
}
