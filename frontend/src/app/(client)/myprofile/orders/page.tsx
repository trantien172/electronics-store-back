"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, ChevronRight, FileText, Package, Search, ShieldCheck, Store, Wrench } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { formatVnd } from "../repairs/repairs.data";

type PurchaseLine = {
  sku?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  warrantyEndsAt?: string;
  warrantyCode?: string;
  relatedRepairCode?: string;
};

type PurchaseTransaction = {
  code: string;
  invoiceCode?: string;
  purchasedAt: string;
  source: string;
  paymentMethod: string;
  items: PurchaseLine[];
  subtotal: number;
  discount: number;
  extraFee: number;
  total: number;
};

const demoTransactions: PurchaseTransaction[] = [
  {
    code: "DH-2026-0061", invoiceCode: "HD-0061", purchasedAt: "2026-11-16T16:20:00+07:00", source: "Mua trực tiếp tại cửa hàng", paymentMethod: "Tiền mặt",
    items: [
      { sku: "PD20W-C", name: "Củ sạc nhanh USB-C 20W", quantity: 1, unitPrice: 390000, warrantyEndsAt: "2027-11-16" },
      { sku: "C-C-100", name: "Cáp sạc USB-C to USB-C 1m", quantity: 2, unitPrice: 150000 },
    ], subtotal: 690000, discount: 30000, extraFee: 0, total: 660000,
  },
  {
    code: "DH-2026-0056", invoiceCode: "HD-0056", purchasedAt: "2026-11-15T11:05:00+07:00", source: "Mua trực tiếp tại cửa hàng", paymentMethod: "Chuyển khoản",
    items: [{ sku: "IP12-128-BK", name: "iPhone 12 128GB", quantity: 1, unitPrice: 5990000, warrantyEndsAt: "2027-02-15", warrantyCode: "BH-FP-0056" }], subtotal: 5990000, discount: 0, extraFee: 0, total: 5990000,
  },
  {
    code: "DH-2026-0042", invoiceCode: "HD-0042", purchasedAt: "2026-04-30T14:42:00+07:00", source: "Mua trực tiếp tại cửa hàng", paymentMethod: "Thẻ ngân hàng",
    items: [{ sku: "IP12-128", name: "iPhone 12 128GB", quantity: 1, unitPrice: 5990000, warrantyEndsAt: "2026-10-30", warrantyCode: "BH-FP-0042" }], subtotal: 5990000, discount: 0, extraFee: 0, total: 5990000,
  },
];

const pageSize = 2;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function PurchaseHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const transactions = useMemo(() => demoTransactions
    .filter((item) => !keyword.trim() || `${item.code} ${item.invoiceCode ?? ""}`.toLowerCase().includes(keyword.trim().toLowerCase()))
    .filter((item) => !fromDate || item.purchasedAt.slice(0, 10) >= fromDate)
    .filter((item) => !toDate || item.purchasedAt.slice(0, 10) <= toDate)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)), [keyword, fromDate, toDate]);

  const clearFilters = () => {
    setKeyword("");
    setFromDate("");
    setToDate("");
    setVisibleCount(pageSize);
  };

  if (!isAuthenticated) {
    return <main className="min-h-[65vh] bg-background"><Container className="flex min-h-[65vh] max-w-xl flex-col items-center justify-center py-16 text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary-600"><Package className="size-6" /></div><h1 className="mt-4 text-2xl font-semibold">Đăng nhập để xem lịch sử mua hàng</h1><p className="mt-2 text-sm text-muted-foreground">Chỉ giao dịch đã được liên kết với tài khoản của bạn mới hiển thị tại đây.</p><Button render={<Link href="/login?returnUrl=%2Fmyprofile%2Forders" />} nativeButton={false} className="mt-5">Đăng nhập</Button></Container></main>;
  }

  return <main className="min-h-screen bg-background pb-24 lg:pb-10">
    <div className="border-b border-border bg-surface-dark text-white"><Container className="py-7 md:py-9"><Link href="/myprofile" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="size-4" /> Hồ sơ cá nhân</Link><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100">Tài khoản của bạn</p><h1 className="mt-1 text-3xl font-semibold">Lịch sử mua hàng</h1><p className="mt-2 text-sm text-white/65">Các giao dịch đã được cửa hàng ghi nhận và liên kết với tài khoản của bạn.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><FileText className="size-5 text-primary-100" /><span className="text-sm text-white/70">Tổng số giao dịch</span><strong className="text-lg">{demoTransactions.length}</strong></div></div><nav aria-label="Đường dẫn" className="mt-4 flex items-center gap-2 text-xs text-white/55"><Link href="/" className="hover:text-white">Trang chủ</Link><ChevronRight className="size-3.5" /><Link href="/myprofile" className="hover:text-white">Trang cá nhân</Link><ChevronRight className="size-3.5" /><span className="text-white">Lịch sử mua hàng</span></nav></Container></div>

    <Container className="py-7 md:py-9">
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-info/20 bg-info-bg/60 px-4 py-3 text-sm text-info"><Store className="mt-0.5 size-4 shrink-0" /><p>Dữ liệu minh họa cho giao dịch mua trực tiếp. Giao dịch thực tế chỉ xuất hiện sau khi cửa hàng ghi nhận và xác minh liên kết với tài khoản.</p></div>
      <section aria-label="Tìm kiếm lịch sử mua hàng" className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center gap-2"><Search className="size-4 text-primary-600" /><h2 className="font-semibold">Tìm kiếm giao dịch</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.3fr)_minmax(160px,.8fr)_minmax(160px,.8fr)_auto]">
          <label className="relative block text-xs font-medium text-muted-foreground">Mã giao dịch hoặc hóa đơn<Input value={keyword} onChange={(event) => { setKeyword(event.target.value); setVisibleCount(pageSize); }} placeholder="Ví dụ: DH-2026-0061" className="mt-1.5 pl-9" /><Search className="pointer-events-none absolute left-3 top-[2.35rem] size-4" /></label>
          <label className="block text-xs font-medium text-muted-foreground">Mua từ<span className="relative mt-1.5 block"><Input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setVisibleCount(pageSize); }} className="pl-9" /><CalendarDays className="pointer-events-none absolute left-3 top-3 size-4" /></span></label>
          <label className="block text-xs font-medium text-muted-foreground">Đến ngày<span className="relative mt-1.5 block"><Input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setVisibleCount(pageSize); }} className="pl-9" /><CalendarDays className="pointer-events-none absolute left-3 top-3 size-4" /></span></label>
          <Button type="button" variant="ghost" onClick={clearFilters} className="self-end">Xóa lọc</Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{transactions.length === 0 ? 0 : Math.min(visibleCount, transactions.length)} / {transactions.length} giao dịch · Mới nhất trước</p>
      </section>

      <div className="mt-5 space-y-4">
        {transactions.slice(0, visibleCount).map((transaction) => {
          const isExpanded = selectedCode === transaction.code;
          const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0);
          return <article key={transaction.code} className={`overflow-hidden rounded-2xl border bg-card shadow-card transition ${isExpanded ? "border-primary-200 ring-1 ring-primary/15" : "border-border"}`}>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{transaction.code}</h2>{transaction.invoiceCode && <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Hóa đơn {transaction.invoiceCode}</span>}</div><p className="mt-2 text-sm text-muted-foreground">{formatDateTime(transaction.purchasedAt)} · {transaction.source}</p></div>
              <Button type="button" variant={isExpanded ? "secondary" : "outline"} onClick={() => setSelectedCode(isExpanded ? null : transaction.code)} aria-expanded={isExpanded} className="shrink-0">{isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}<ChevronDown className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></Button>
            </div>
            <div className="grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:px-6">
              <div><div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Package className="size-4" />{itemCount} mặt hàng</div><ul className="space-y-1.5">{transaction.items.slice(0, 2).map((item) => <li key={item.sku ?? item.name} className="flex justify-between gap-3 text-sm"><span className="line-clamp-1">{item.name}<span className="ml-1 text-xs text-muted-foreground">× {item.quantity}</span></span><span className="shrink-0 text-muted-foreground">{formatVnd(item.unitPrice * item.quantity)}</span></li>)}</ul>{transaction.items.length > 2 && <p className="mt-2 text-xs text-muted-foreground">và {transaction.items.length - 2} sản phẩm khác</p>}</div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pt-0 sm:pl-5"><div className="sm:text-right"><p className="text-xs text-muted-foreground">Tổng thanh toán</p><p className="mt-1 text-lg font-semibold text-primary-700">{formatVnd(transaction.total)}</p></div><p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p></div>
            </div>
            {isExpanded && <div className="border-t border-border bg-background/70 p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Mã giao dịch</p><p className="mt-1 text-sm font-semibold">{transaction.code}</p></div><div className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Ngày giờ mua</p><p className="mt-1 text-sm font-semibold">{formatDateTime(transaction.purchasedAt)}</p></div><div className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Nguồn / thanh toán</p><p className="mt-1 text-sm font-semibold">{transaction.source} · {transaction.paymentMethod}</p></div></div>
              <section className="mt-4 overflow-hidden rounded-xl border border-border bg-card"><div className="border-b border-border px-4 py-3"><h3 className="font-semibold">Sản phẩm trong giao dịch</h3></div><div className="divide-y divide-border">{transaction.items.map((item) => <div key={item.sku ?? item.name} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_120px_120px] sm:items-center"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.sku ? `Mã sản phẩm ${item.sku}` : "Không có mã sản phẩm"}{item.warrantyEndsAt ? ` · Bảo hành đến ${formatDate(item.warrantyEndsAt)}` : " · Không có thông tin bảo hành"}</p></div><p className="text-sm text-muted-foreground">SL: {item.quantity}</p><p className="text-sm">{formatVnd(item.unitPrice)} / sp</p><div className="flex flex-col items-start gap-1 sm:items-end"><strong className="text-sm">{formatVnd(item.unitPrice * item.quantity)}</strong>{item.warrantyCode && <Link href={`/myprofile/warranties?code=${encodeURIComponent(item.warrantyCode)}`} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800"><ShieldCheck className="size-3.5" />Xem bảo hành</Link>}{item.relatedRepairCode && <Link href={`/myprofile/repairs/${item.relatedRepairCode}`} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800"><Wrench className="size-3.5" />Phiếu sửa liên quan</Link>}</div></div>)}</div></section>
              <div className="mt-4 flex justify-end"><dl className="w-full max-w-sm space-y-2 rounded-xl border border-border bg-card p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tổng tiền hàng</dt><dd>{formatVnd(transaction.subtotal)}</dd></div>{transaction.discount > 0 && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Giảm giá</dt><dd>−{formatVnd(transaction.discount)}</dd></div>}{transaction.extraFee > 0 && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Phí phát sinh</dt><dd>{formatVnd(transaction.extraFee)}</dd></div>}<div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold"><dt>Tổng thanh toán</dt><dd className="text-primary-700">{formatVnd(transaction.total)}</dd></div></dl></div>
            </div>}
          </article>;
        })}
        {transactions.length === 0 && <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Search className="size-5" /></div><h2 className="mt-4 text-lg font-semibold">{demoTransactions.length === 0 ? "Chưa có giao dịch mua hàng" : "Không tìm thấy giao dịch phù hợp"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{demoTransactions.length === 0 ? "Nếu bạn đã mua hàng tại cửa hàng, hãy liên hệ nhân viên để kiểm tra việc liên kết giao dịch với tài khoản." : "Thử thay đổi mã giao dịch hoặc khoảng thời gian."}</p><Button type="button" variant="outline" onClick={clearFilters} className="mt-4">Xóa bộ lọc</Button></section>}
      </div>
      {visibleCount < transactions.length && <div className="mt-6 text-center"><Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + pageSize)}>Tải thêm giao dịch <ChevronDown className="size-4" /></Button></div>}
      <p className="mt-8 text-center text-xs text-muted-foreground">Bản demo · số lượng và giá là dữ liệu minh họa, chưa kết nối lịch sử giao dịch thực tế.</p>
    </Container>
    <nav aria-label="Điều hướng tài khoản" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"><Link href="/myprofile/repairs" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Wrench className="size-4" />Đơn sửa</Link><Link href="/myprofile/warranties" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><ShieldCheck className="size-4" />Bảo hành</Link><Link href="/myprofile/orders" aria-current="page" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg bg-accent text-[11px] font-medium text-primary-800"><Package className="size-4" />Đơn hàng</Link></nav>
  </main>;
}
