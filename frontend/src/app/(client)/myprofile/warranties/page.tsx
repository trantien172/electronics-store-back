"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ChevronRight, CircleAlert, FileText, Heart, History, Search, ShieldCheck, Smartphone, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, productFavoriteKey } from "@/hooks/useFavorites";
import { ProductArtwork } from "../../products/components/ProductArtwork";
import { DEMO_PRODUCTS, formatProductPrice, type Product } from "../../products/products.data";

type WarrantyStatus = "active" | "expired" | "unknown";
type WarrantySource = "purchase" | "repair";

type WarrantyRecord = {
  id: string;
  deviceName: string;
  brand: string;
  model: string;
  deviceType: string;
  serial?: string;
  source: WarrantySource;
  sourceCode?: string;
  sourceDate?: string;
  startsAt?: string;
  endsAt?: string;
  status: WarrantyStatus;
  coverage?: string;
  updatedAt: string;
  requests: { code: string; date: string; status: string }[];
};

const demoWarranties: WarrantyRecord[] = [
  { id: "BH-FP-0056", deviceName: "Điện thoại", brand: "Apple", model: "iPhone 12 128GB", deviceType: "Điện thoại", serial: "•••••••6672", source: "purchase", sourceCode: "DH-2026-0056", sourceDate: "2026-11-15", startsAt: "2026-11-15", endsAt: "2027-02-15", status: "active", coverage: "Thời hạn minh họa; điều kiện cụ thể cần đối chiếu với giao dịch đã ghi nhận.", updatedAt: "2026-11-15T11:05:00+07:00", requests: [] },
  { id: "BH-FP-0136", deviceName: "Máy tính xách tay", brand: "Dell", model: "Inspiron 14", deviceType: "Máy tính", serial: "•••••••1140", source: "repair", sourceCode: "FP-2026-0136", sourceDate: "2026-11-09", startsAt: "2026-11-10", endsAt: "2026-12-10", status: "active", coverage: "Bảo hành phần việc đã sửa theo điều kiện của cửa hàng.", updatedAt: "2026-11-10T16:45:00+07:00", requests: [] },
  { id: "BH-FP-0042", deviceName: "Điện thoại", brand: "Apple", model: "iPhone 12 128GB", deviceType: "Điện thoại", serial: "•••••••5520", source: "purchase", sourceCode: "DH-2026-0042", sourceDate: "2026-04-30", startsAt: "2026-04-30", endsAt: "2026-10-30", status: "expired", coverage: "Điều kiện áp dụng theo hóa đơn và chính sách tại thời điểm mua.", updatedAt: "2026-10-30T23:59:00+07:00", requests: [{ code: "YC-BH-0091", date: "2026-08-12", status: "Đã hoàn tất" }] },
  { id: "BH-FP-0028", deviceName: "Điện thoại", brand: "Samsung", model: "Galaxy A52", deviceType: "Điện thoại", serial: "•••••••4826", source: "purchase", sourceCode: "DH-2026-0019", sourceDate: "2026-02-05", status: "unknown", updatedAt: "2026-10-21T09:10:00+07:00", requests: [] },
];

const statusLabels: Record<WarrantyStatus, string> = { active: "Còn hạn", expired: "Hết hạn", unknown: "Chưa xác định" };
const statusStyles: Record<WarrantyStatus, string> = { active: "bg-success-bg text-success", expired: "bg-muted text-muted-foreground", unknown: "bg-warning-bg text-warning" };
const bottomLinks = [
  { href: "/myprofile/repairs", label: "Đơn sửa", icon: Wrench },
  { href: "/myprofile/warranties", label: "Bảo hành", icon: ShieldCheck },
  { href: "/myprofile/orders", label: "Đơn hàng", icon: FileText },
];

function formatDate(value?: string) {
  if (!value) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function MyWarrantiesPage() {
  const { user, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<"all" | WarrantyStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestWarranty, setRequestWarranty] = useState<WarrantyRecord | null>(null);
  const [issueDescription, setIssueDescription] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && demoWarranties.some((item) => item.id === code)) setSelectedId(code);
  }, []);

  const filteredWarranties = useMemo(() => demoWarranties
    .filter((item) => filter === "all" || item.status === filter)
    .filter((item) => [item.id, item.deviceName, item.brand, item.model, item.serial, item.sourceCode].some((value) => value?.toLowerCase().includes(keyword.trim().toLowerCase())))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [filter, keyword]);

  const relatedProducts = useMemo(() => {
    if (!selectedId) return [];
    const selected = demoWarranties.find(({ id }) => id === selectedId);
    return DEMO_PRODUCTS.filter((product) => product.status === "available" && product.deviceType === selected?.deviceType).slice(0, 3);
  }, [selectedId]);

  if (!isAuthenticated || !user) {
    return <main className="min-h-[65vh] bg-background"><Container className="flex min-h-[65vh] max-w-xl flex-col items-center justify-center py-16 text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary-600"><ShieldCheck className="size-6" /></div><h1 className="mt-4 text-2xl font-semibold">Đăng nhập để xem bảo hành</h1><p className="mt-2 text-sm text-muted-foreground">Thông tin bảo hành chỉ hiển thị với tài khoản đã xác thực.</p><Button render={<Link href="/login?returnUrl=%2Fmyprofile%2Fwarranties" />} nativeButton={false} className="mt-5">Đăng nhập</Button></Container></main>;
  }

  const openRequest = (item: WarrantyRecord) => {
    setIssueDescription("");
    setRequestWarranty(item);
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestWarranty || issueDescription.trim().length < 10) return;
    toast.info("Bản demo chưa kết nối backend nên chưa gửi yêu cầu. Nội dung bạn nhập vẫn được giữ lại.");
  };

  return <main className="min-h-screen bg-background pb-24 lg:pb-16">
    <div className="border-b border-border bg-surface-dark text-white"><Container className="py-7 md:py-9"><Link href="/myprofile" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowRight className="size-4 rotate-180" /> Hồ sơ cá nhân</Link><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100">Tài khoản của bạn</p><h1 className="mt-1 text-3xl font-semibold">Bảo hành của tôi</h1><p className="mt-2 text-sm text-white/65">Tra cứu tình trạng bảo hành và gửi yêu cầu hỗ trợ cho thiết bị của bạn.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><ShieldCheck className="size-5 text-primary-100" /><span className="text-sm text-white/70">Tổng số</span><strong className="text-lg">{demoWarranties.length}</strong></div></div><nav aria-label="Đường dẫn" className="mt-4 flex items-center gap-2 text-xs text-white/55"><Link href="/" className="hover:text-white">Trang chủ</Link><ChevronRight className="size-3.5" /><Link href="/myprofile" className="hover:text-white">Trang cá nhân</Link><ChevronRight className="size-3.5" /><span className="text-white">Bảo hành của tôi</span></nav></Container></div>

    <Container className="py-7 md:py-9">
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-info/20 bg-info-bg/60 px-4 py-3 text-sm text-info"><CircleAlert className="mt-0.5 size-4 shrink-0" /><p>Dữ liệu minh họa cho giao diện. Trạng thái và khả năng gửi yêu cầu thực tế cần được xác nhận từ hệ thống.</p></div>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5" aria-label="Tìm kiếm bảo hành">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Mã bảo hành, thiết bị, mã đơn hàng hoặc phiếu sửa..." className="pl-9" aria-label="Tìm thông tin bảo hành" /></div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Lọc theo tình trạng">{([ ["all", "Tất cả"], ["active", "Còn hạn"], ["expired", "Hết hạn"], ["unknown", "Chưa xác định"] ] as const).map(([value, label]) => <Button key={value} type="button" aria-pressed={filter === value} variant={filter === value ? "secondary" : "outline"} size="sm" className="shrink-0" onClick={() => setFilter(value)}>{label}</Button>)}</div>
        <p className="mt-3 text-xs text-muted-foreground">{filteredWarranties.length} / {demoWarranties.length} bản ghi · Cập nhật mới nhất trước</p>
      </section>

      <div className="mt-5 space-y-4">
        {filteredWarranties.map((item) => {
          const open = selectedId === item.id;
          const sourceLabel = item.source === "repair" ? "Sửa chữa" : "Mua hàng";
          return <article key={item.id} className={`overflow-hidden rounded-2xl border bg-card shadow-card transition ${open ? "border-primary-200 ring-1 ring-primary/15" : "border-border"}`}>
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-center gap-4"><div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-600"><Smartphone className="size-7" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-semibold">{item.brand} {item.model}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.deviceName}{item.serial ? ` · ${item.serial}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Mã bảo hành <span className="font-medium text-foreground">{item.id}</span> · {sourceLabel}{item.sourceCode ? ` · ${item.sourceCode}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">{item.startsAt || item.endsAt ? `Bảo hành ${formatDate(item.startsAt)} – ${formatDate(item.endsAt)}` : "Thời hạn chưa được xác nhận"}</p></div></div>
              <Button type="button" variant={open ? "secondary" : "outline"} onClick={() => setSelectedId(open ? null : item.id)} aria-expanded={open} className="shrink-0">{open ? "Ẩn thông tin" : "Xem thông tin"}<ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} /></Button>
            </div>
            {open && <div className="border-t border-border bg-background/70 px-4 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2"><section className="rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4 text-primary-600" />Thông tin thiết bị</h3><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Thiết bị</dt><dd className="text-right font-medium">{item.deviceName}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Thương hiệu / Model</dt><dd className="text-right font-medium">{item.brand} {item.model}</dd></div>{item.serial && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Mã định danh</dt><dd className="text-right font-medium">{item.serial}</dd></div>}<div className="flex justify-between gap-3"><dt className="text-muted-foreground">Nguồn</dt><dd className="text-right font-medium">{sourceLabel}</dd></div>{item.sourceCode && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Mã liên quan</dt><dd className="text-right font-medium">{item.sourceCode}</dd></div>}{item.sourceDate && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Ngày phát sinh</dt><dd className="text-right font-medium">{formatDate(item.sourceDate)}</dd></div>}</dl></section>
                <section className="rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-primary-600" />Thông tin bảo hành</h3><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Mã bảo hành</dt><dd className="text-right font-medium">{item.id}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Bắt đầu</dt><dd className="text-right font-medium">{formatDate(item.startsAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Kết thúc</dt><dd className="text-right font-medium">{formatDate(item.endsAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Tình trạng</dt><dd><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span></dd></div></dl>{item.coverage && <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">{item.coverage}</p>}{item.status === "unknown" && <p className="mt-3 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">Thời hạn chưa xác nhận. FixPro cần kiểm tra thông tin trước khi xác định quyền lợi.</p>}</section></div>
              <section className="mt-4 rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><History className="size-4 text-primary-600" />Lịch sử yêu cầu bảo hành</h3>{item.requests.length ? <div className="mt-3 space-y-2">{item.requests.map((request) => <div key={request.code} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm"><span><span className="font-medium">{request.code}</span><span className="ml-2 text-muted-foreground">{formatDate(request.date)}</span></span><span className="rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success">{request.status}</span></div>)}</div> : <p className="mt-2 text-sm text-muted-foreground">Chưa ghi nhận yêu cầu bảo hành trước đây.</p>}</section>
              <div className="mt-4 flex flex-wrap gap-3">{item.status === "active" && <Button type="button" onClick={() => openRequest(item)}>Yêu cầu bảo hành</Button>}{item.status === "expired" && <Button render={<Link href="/services" />} nativeButton={false} variant="outline"><Wrench className="size-4" />Yêu cầu sửa chữa</Button>}{item.status === "unknown" && <Button render={<Link href="/services" />} nativeButton={false} variant="outline"><CircleAlert className="size-4" />Liên hệ cửa hàng để xác minh</Button>}{item.source === "repair" && item.sourceCode && <Button render={<Link href={`/myprofile/repairs/${item.sourceCode}`} />} nativeButton={false} variant="outline">Xem phiếu sửa chữa <ArrowRight className="size-4" /></Button>}</div>
            </div>}
          </article>;
        })}
        {filteredWarranties.length === 0 && <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Search className="size-5" /></div><h2 className="mt-4 text-lg font-semibold">{demoWarranties.length === 0 ? "Chưa có thông tin bảo hành" : "Không tìm thấy thông tin phù hợp"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{demoWarranties.length === 0 ? "Thông tin bảo hành sẽ xuất hiện khi được liên kết với tài khoản của bạn." : "Hãy thử mã khác hoặc đổi tình trạng lọc."}</p><Button type="button" variant="outline" onClick={() => { setKeyword(""); setFilter("all"); }} className="mt-4">Xóa bộ lọc</Button></section>}
      </div>

      {relatedProducts.length > 0 && <section className="mt-9"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Tham khảo thêm</p><h2 className="mt-1 text-xl font-semibold">Sản phẩm có thể bạn quan tâm</h2><p className="mt-1 text-sm text-muted-foreground">Một số sản phẩm cùng nhóm thiết bị · thông tin minh họa.</p></div><Link href="/products" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-600">Xem tất cả <ArrowRight className="size-4" /></Link></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{relatedProducts.map((product: Product) => { const favoriteKey = productFavoriteKey(product.kind, product.id); return <article key={`${product.kind}-${product.id}`} className="overflow-hidden rounded-2xl border border-border bg-card"><Link href={product.kind === "used" ? `/products/old/${product.id}` : `/products/${product.id}`}><ProductArtwork product={product} className="m-3 aspect-square" /><div className="px-4 pb-3"><p className="line-clamp-2 min-h-10 text-sm font-medium">{product.name}</p><p className="mt-2 text-sm font-semibold text-primary-700">{formatProductPrice(product.sellingPrice)}</p><p className="mt-1 text-xs text-muted-foreground">{product.condition}</p></div></Link><div className="px-4 pb-4"><Button type="button" variant="outline" className="w-full" onClick={() => toggleFavorite(favoriteKey)}><Heart className={`size-4 ${isFavorite(favoriteKey) ? "fill-current text-danger" : ""}`} />{isFavorite(favoriteKey) ? "Đã quan tâm" : "Quan tâm"}</Button></div></article>; })}</div></section>}
      <p className="mt-8 text-center text-xs text-muted-foreground">Dữ liệu bảo hành và sản phẩm trong bản demo không phải thông tin tồn kho hoặc quyền lợi thực tế.</p>
    </Container>

    <nav aria-label="Điều hướng tài khoản" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">{bottomLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={href === "/myprofile/warranties" ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium ${href === "/myprofile/warranties" ? "bg-accent text-primary-800" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" />{label}</Link>)}</nav>

    {requestWarranty && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4"><button type="button" aria-label="Đóng biểu mẫu" onClick={() => setRequestWarranty(null)} className="absolute inset-0 size-full cursor-default" /><section role="dialog" aria-modal="true" aria-labelledby="warranty-request-title" className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex size-10 items-center justify-center rounded-xl bg-success-bg text-success"><ShieldCheck className="size-5" /></div><h2 id="warranty-request-title" className="mt-3 text-xl font-semibold">Yêu cầu kiểm tra bảo hành</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin tham chiếu đã được điền sẵn. Cửa hàng sẽ xác minh điều kiện sau khi tiếp nhận.</p></div><Button type="button" variant="ghost" size="icon" aria-label="Đóng" onClick={() => setRequestWarranty(null)}><X /></Button></div><form onSubmit={submitRequest} className="mt-5 space-y-4"><div className="grid gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-2"><p className="text-sm"><span className="block text-xs text-muted-foreground">Thiết bị</span><span className="font-medium">{requestWarranty.brand} {requestWarranty.model}{requestWarranty.serial ? ` · ${requestWarranty.serial}` : ""}</span></p><p className="text-sm"><span className="block text-xs text-muted-foreground">Mã bảo hành</span><span className="font-medium">{requestWarranty.id}</span></p><p className="text-sm"><span className="block text-xs text-muted-foreground">Mã liên quan · {requestWarranty.source === "repair" ? "Phiếu sửa" : "Đơn hàng"}</span><span className="font-medium">{requestWarranty.sourceCode ?? "Chưa có dữ liệu"}</span></p><p className="text-sm"><span className="block text-xs text-muted-foreground">Khách hàng</span><span className="font-medium">{user.name} · {user.phone}</span></p></div><label className="block text-sm font-medium">Mô tả tình trạng / sự cố<textarea value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)} required minLength={10} rows={4} placeholder="Mô tả vấn đề bạn gặp phải (ít nhất 10 ký tự)" className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></label><p className="rounded-lg bg-warning-bg px-3 py-2 text-xs leading-relaxed text-warning">Gửi yêu cầu không đồng nghĩa với việc thiết bị được xác nhận bảo hành miễn phí. Bản demo hiện chưa gửi dữ liệu tới cửa hàng.</p><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setRequestWarranty(null)}>Hủy</Button><Button type="submit" disabled={issueDescription.trim().length < 10}>Gửi yêu cầu</Button></div></form></section></div>}
  </main>;
}
