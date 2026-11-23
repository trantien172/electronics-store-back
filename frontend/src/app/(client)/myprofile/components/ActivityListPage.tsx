"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Package, Search, ShieldCheck, Wrench } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

const pageConfig = {
  repairs: {
    title: "Đơn sửa chữa",
    description: "Tra cứu phiếu sửa chữa và tình trạng thiết bị của bạn.",
    icon: Wrench,
    filters: ["Tất cả", "Chờ tiếp nhận", "Đang sửa", "Chờ báo giá", "Hoàn tất"],
    empty: "Chưa có phiếu sửa chữa",
  },
  warranties: {
    title: "Bảo hành",
    description: "Theo dõi các yêu cầu và thông tin bảo hành của bạn.",
    icon: ShieldCheck,
    filters: ["Tất cả", "Đang xử lý", "Đã duyệt", "Hoàn tất"],
    empty: "Chưa có yêu cầu bảo hành",
  },
  orders: {
    title: "Đơn hàng",
    description: "Xem lịch sử mua hàng tại FixPro.",
    icon: Package,
    filters: ["Tất cả", "Đang xử lý", "Hoàn tất", "Đã hủy"],
    empty: "Chưa có đơn hàng",
  },
} as const;

type PageKind = keyof typeof pageConfig;

const bottomLinks = [
  { href: "/myprofile/repairs", label: "Đơn sửa", icon: Wrench },
  { href: "/myprofile/warranties", label: "Bảo hành", icon: ShieldCheck },
  { href: "/myprofile/orders", label: "Đơn hàng", icon: Package },
];

export function ActivityListPage({ kind }: { kind: PageKind }) {
  const { isAuthenticated } = useAuth();
  const config = pageConfig[kind];
  const Icon = config.icon;
  const [filter, setFilter] = useState<(typeof config.filters)[number]>(config.filters[0]);
  const [search, setSearch] = useState("");
  const emptyMessage = useMemo(() => search.trim() ? "Không tìm thấy kết quả phù hợp" : config.empty, [search, config.empty]);

  if (!isAuthenticated) {
    const returnUrl = `/myprofile/${kind}`;
    return <main className="min-h-[65vh] bg-background"><Container className="flex min-h-[65vh] max-w-xl flex-col items-center justify-center py-16 text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary-600"><Icon className="size-6" /></div><h1 className="mt-4 text-2xl font-semibold">Đăng nhập để xem {config.title.toLocaleLowerCase("vi-VN")}</h1><p className="mt-2 text-sm text-muted-foreground">Danh sách này chỉ dành cho tài khoản của bạn.</p><Button render={<Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} />} nativeButton={false} className="mt-5">Đăng nhập</Button></Container></main>;
  }

  return <main className="min-h-[70vh] bg-background pb-24 lg:pb-16">
    <div className="border-b border-border bg-surface-dark text-white"><Container className="py-7 md:py-9"><Link href="/myprofile" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="size-4" /> Hồ sơ cá nhân</Link><div className="mt-4 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary text-surface-dark"><Icon className="size-5" /></span><div><h1 className="text-2xl font-semibold md:text-3xl">{config.title}</h1><p className="mt-1 text-sm text-white/65">{config.description}</p></div></div></Container></div>
    <Container className="py-7 md:py-9">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={kind === "repairs" ? "Tìm mã phiếu, thiết bị..." : kind === "orders" ? "Tìm mã đơn hàng..." : "Tìm mã yêu cầu..."} className="pl-9" aria-label="Tìm kiếm" /></div>
        <p className="text-xs text-muted-foreground">Bộ lọc và danh sách sẽ dùng dữ liệu tài khoản khi backend sẵn sàng.</p>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Lọc theo trạng thái">{config.filters.map((item) => <Button key={item} type="button" aria-pressed={filter === item} variant={filter === item ? "secondary" : "outline"} size="sm" className="shrink-0" onClick={() => setFilter(item)}>{item}</Button>)}</div>
      <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-6" /></div><h2 className="mt-4 text-lg font-semibold">{emptyMessage}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{search.trim() ? "Thử đổi từ khóa hoặc trạng thái lọc." : `Bạn chưa có dữ liệu ${config.title.toLocaleLowerCase("vi-VN")} trong bản demo.`}</p>{kind === "repairs" && <Button render={<Link href="/services" />} nativeButton={false} className="mt-5">Khám phá dịch vụ</Button>}</section>
      <p className="mt-4 text-center text-xs text-muted-foreground">Bản demo · dữ liệu danh sách chưa kết nối backend.</p>
    </Container>
    <nav aria-label="Điều hướng tài khoản" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">{bottomLinks.map(({ href, label, icon: NavIcon }) => <Link key={href} href={href} aria-current={href.endsWith(`/${kind}`) ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium ${href.endsWith(`/${kind}`) ? "bg-accent text-primary-800" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><NavIcon className="size-4" />{label}</Link>)}</nav>
  </main>;
}
