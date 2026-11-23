"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Box, CalendarDays,
  CheckCircle2, CircleHelp, Clock3, Package, Phone, RefreshCw, ShoppingBag,
  Smartphone, Users, Wrench,
} from "lucide-react";
import {
  Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

type Preset = "last7" | "last30" | "last12Months" | "custom";
type Period = { start: string; end: string };
type ChartPoint = { label: string; repair: number; sales: number; total: number; previous: number };

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const presets: { id: Preset; label: string }[] = [
  { id: "last7", label: "7 ngày" }, { id: "last30", label: "1 tháng" },
  { id: "last12Months", label: "12 tháng" },
  { id: "custom", label: "Tùy chọn" },
];

function dateInVietnam(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function utcDate(iso: string) { return new Date(`${iso}T00:00:00Z`); }
function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
function shiftDays(iso: string, amount: number) { const date = utcDate(iso); date.setUTCDate(date.getUTCDate() + amount); return isoDate(date); }
function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  return new Intl.DateTimeFormat("vi-VN", { ...options, timeZone: "UTC" }).format(utcDate(iso));
}
function monthStart(iso: string) { return `${iso.slice(0, 7)}-01`; }
function rangeDays(period: Period) { return Math.floor((utcDate(period.end).getTime() - utcDate(period.start).getTime()) / 86400000) + 1; }
function money(value: number) { return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) + " ₫"; }
function count(value: number) { return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value); }
function compactMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}
function presetPeriod(preset: Preset, today: string): Period {
  if (preset === "last7") return { start: shiftDays(today, -6), end: today };
  if (preset === "last12Months") {
    const first = utcDate(monthStart(today)); first.setUTCMonth(first.getUTCMonth() - 11);
    return { start: isoDate(first), end: today };
  }
  return { start: shiftDays(today, -29), end: today };
}
function previousPeriod(period: Period, preset: Preset): Period {
  if (preset === "last12Months") {
    const date = utcDate(period.start); date.setUTCMonth(date.getUTCMonth() - 12);
    return { start: isoDate(date), end: shiftDays(period.start, -1) };
  }
  const days = rangeDays(period);
  return { start: shiftDays(period.start, -days), end: shiftDays(period.start, -1) };
}
function periodLabel(period: Period) { return `${formatDate(period.start)} – ${formatDate(period.end)}`; }
function chartBuckets(period: Period, interval: "day" | "week" | "month") {
  const buckets: string[] = [];
  for (let day = period.start; day <= period.end; day = shiftDays(day, 1)) {
    let bucket = day;
    if (interval === "week") {
      const weekday = utcDate(day).getUTCDay();
      bucket = shiftDays(day, -((weekday + 6) % 7));
    } else if (interval === "month") bucket = monthStart(day);
    if (buckets[buckets.length - 1] !== bucket) buckets.push(bucket);
  }
  return buckets;
}

const repairsNeedingAttention = [
  { code: "P9", customer: "Trần Minh Khoa", phone: "0903456789", device: "iPhone 13", tech: "Minh", reason: "Chờ lấy 12 ngày", tag: "Đã hủy", state: "Đã hủy" },
  { code: "P4", customer: "Nguyễn Thu Hà", phone: "0912340567", device: "MacBook Air M1", tech: "Tuấn", reason: "Trễ hẹn 15/11", tag: "Đang sửa", state: "Đang sửa" },
  { code: "P7", customer: "Lê Hoàng Nam", phone: "0988123456", device: "Samsung S22", tech: "Minh", reason: "Chờ lấy 10 ngày", tag: "Đã sửa xong", state: "Hoàn tất" },
  { code: "P6", customer: "Phạm Ngọc Anh", phone: "0909123456", device: "iPad Pro", tech: "Huy", reason: "Chờ lấy 9 ngày", tag: "Đã hủy", state: "Chờ linh kiện" },
  { code: "P13", customer: "Đỗ Quốc Bảo", phone: "0934567890", device: "iPhone 12", tech: "Tuấn", reason: "Chờ lấy 8 ngày", tag: "Đã sửa xong", state: "Hoàn tất" },
];
const appointments = [
  { item: "iPhone 14 Pro · IMEI …8821", phone: "0903 456 789", expires: "10:45 · 19/11" },
  { item: "MacBook Pro 14 · M2", phone: "0912 340 567", expires: "13:20 · 19/11" },
];
const workers = [
  { name: "Huy Nguyễn", load: 1, waiting: 0, overdue: 0, jobs: ["P15 · iPhone 11 · Đang sửa"] },
  { name: "Minh Trần", load: 2, waiting: 1, overdue: 1, jobs: ["P4 · MacBook Air · Đang sửa", "P9 · iPhone 13 · Đang sửa"] },
  { name: "Tuấn Lê", load: 3, waiting: 1, overdue: 0, jobs: ["P7 · Samsung S22 · Đang sửa", "P13 · iPhone 12 · Đang sửa", "P16 · iPad Air · Đã phân công", "+1 đơn khác"] },
];
const inventory = [
  { name: "Tụ điện 330μF", sku: "CAP-330", stock: 0, threshold: 5 },
  { name: "Pin iPhone 11", sku: "BAT-IP11", stock: 2, threshold: 10 },
  { name: "Cáp sạc Type-C", sku: "CBL-TC01", stock: 9, threshold: 10 },
];

function ActionLink({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600">{children}<ArrowRight className="size-3.5" /></span>;
}
function Panel({ title, icon: Icon, description, action, children, className = "" }: {
  title: string; icon: typeof Wrench; description?: React.ReactNode; action?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return <section className={`min-w-0 rounded-2xl border border-border bg-card shadow-card ${className}`}>
    <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-600"><Icon className="size-4" /></span><div className="min-w-0"><h2 className="truncate text-sm font-semibold sm:text-[15px]">{title}</h2>{description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}</div></div>{action}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>;
}
function Metric({ label, value, hint, danger = false }: { label: string; value: string | number; hint?: string; danger?: boolean }) {
  return <div className={`rounded-xl border p-3.5 ${danger ? "border-danger/25 bg-danger-bg/55" : "border-border/80 bg-background/70"}`}>
    <p className={`text-[11px] font-medium leading-4 ${danger ? "text-danger" : "text-muted-foreground"}`}>{label}</p>
    <p className={`mt-1 text-2xl font-semibold tracking-tight ${danger ? "text-danger" : "text-foreground"}`}>{typeof value === "number" ? count(value) : value}</p>
    {hint && <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{hint}</p>}
  </div>;
}
function MockAction({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return <div aria-disabled={disabled} title={disabled ? "Màn hình này sẽ được bổ sung sau" : undefined} className={disabled ? "cursor-not-allowed opacity-90" : ""}>{children}</div>;
}

type AttentionRepair = (typeof repairsNeedingAttention)[number];
function AttentionRepairRow({ item }: { item: AttentionRepair }) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldToCall = useRef(false);

  function startHold() {
    heldToCall.current = false;
    holdTimer.current = setTimeout(() => {
      heldToCall.current = true;
      window.location.assign(`tel:${item.phone}`);
    }, 3000);
  }
  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }

  return <Link
    href={`/dashboard/repairs/${item.code}`}
    onPointerDown={(event) => { if (event.button === 0) startHold(); }}
    onPointerUp={cancelHold}
    onPointerLeave={cancelHold}
    onPointerCancel={cancelHold}
    onContextMenu={(event) => event.preventDefault()}
    onClick={(event) => {
      if (heldToCall.current) {
        event.preventDefault();
        heldToCall.current = false;
      }
    }}
    className="block select-none touch-pan-y rounded-lg px-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    aria-label={`Phiếu ${item.code}, ${item.device}, ${item.reason}. Nhấn để xem chi tiết, giữ 3 giây để gọi ${item.phone}.`}
  >
    <div className="flex min-w-0 items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-primary-600">{item.code}</span><span className="truncate text-xs font-medium">{item.device}</span><span className="hidden truncate text-[10px] text-muted-foreground sm:inline">· {item.customer}</span></div>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[10px] text-muted-foreground"><Phone className="size-3 shrink-0" />{item.phone}<span>· {item.reason} · {item.tag}{item.tech ? ` · ${item.tech}` : ""}</span></p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${item.state === "Đang sửa" ? "bg-info-bg text-info" : item.state === "Chờ linh kiện" ? "bg-warning-bg text-warning" : "bg-muted text-muted-foreground"}`}>{item.state}</span>
    </div>
  </Link>;
}

function DemoRevenueChart({ period, previous }: { period: Period; previous: Period }) {
  const days = rangeDays(period);
  const interval = days <= 31 ? "day" : days <= 120 ? "week" : "month";
  const bucketDates = chartBuckets(period, interval);
  const previousDates = chartBuckets(previous, interval);
  const bucketCount = bucketDates.length;
  const prevBucketCount = previousDates.length;
  const total = 14_500_000;
  const previousTotal = 10_000_000;
  const weights = Array.from({ length: bucketCount }, (_, index) => Math.max(0.35, 0.7 + Math.sin((index + 1) * 1.7) * 0.22 + ((index % 4) * 0.035)));
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const points: ChartPoint[] = Array.from({ length: bucketCount }, (_, index) => {
    const previousWeight = Math.max(0.3, 0.72 + Math.cos((index + 2) * 1.1) * 0.2);
    const currentValue = Math.round(total * weights[index] / weightTotal);
    const prevVal = index < prevBucketCount ? Math.round(previousTotal * previousWeight / Math.max(1, prevBucketCount)) : 0;
    const date = bucketDates[index];
    return {
      label: interval === "month" ? formatDate(date, { month: "short" }) : formatDate(date),
      repair: Math.round(currentValue * 0.4483),
      sales: currentValue - Math.round(currentValue * 0.4483),
      total: currentValue,
      previous: prevVal,
    };
  });

  if (!total) return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">Chưa có doanh thu trong kỳ này</div>;

  return <div className="h-[280px] w-full sm:h-[320px]" role="img" aria-label="Biểu đồ cột chồng doanh thu sửa chữa và bán hàng">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={points} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={Math.max(0, Math.floor(bucketCount / 8) - 1)} />
        <YAxis tickFormatter={compactMoney} tickLine={false} axisLine={false} width={48} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.55 }} />
        <Bar dataKey="repair" name="Sửa chữa" stackId="revenue" fill="#ef9f27" radius={[0, 0, 0, 0]} maxBarSize={32} />
        <Bar dataKey="sales" name="Bán hàng" stackId="revenue" fill="#444441" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Line dataKey="previous" name="Tổng doanh thu kỳ trước" type="monotone" stroke="#1d9e75" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-primary" />Sửa chữa</span><span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-neutral-800" />Bán hàng</span><span className="inline-flex items-center gap-1.5"><i className="h-0 w-4 border-t-2 border-dashed border-success" />Tổng doanh thu kỳ trước</span>
    </div>
    <p className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">Đường nét đứt cho biết tổng doanh thu tại mốc tương ứng của kỳ trước ({periodLabel(previous)}), để so sánh xu hướng. · Dữ liệu minh họa</p>
  </div>;
}
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; dataKey?: string; payload?: ChartPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  if (!point) return null;
  return <div className="min-w-44 rounded-xl border border-border bg-card p-3 shadow-xl"><p className="mb-2 text-xs font-semibold">{label}</p><p className="flex justify-between gap-5 text-xs"><span className="text-muted-foreground">Sửa chữa</span><b>{money(point.repair)}</b></p><p className="mt-1 flex justify-between gap-5 text-xs"><span className="text-muted-foreground">Bán hàng</span><b>{money(point.sales)}</b></p><p className="mt-2 flex justify-between gap-5 border-t border-border pt-2 text-xs"><span>Tổng kỳ này</span><b>{money(point.total)}</b></p><p className="mt-1 flex justify-between gap-5 text-xs"><span className="text-muted-foreground">Tổng kỳ trước</span><b>{money(point.previous)}</b></p></div>;
}

export default function DashboardHomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const today = useMemo(() => dateInVietnam(), []);
  const [preset, setPreset] = useState<Preset>("last30");
  const [period, setPeriod] = useState<Period>(() => presetPeriod("last30", dateInVietnam()));
  const [draft, setDraft] = useState<Period>(period);
  const [filterError, setFilterError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get("startDate"); const end = params.get("endDate");
    if (start && end) { setPeriod({ start, end }); setDraft({ start, end }); setPreset("custom"); }
    else {
      const next = presetPeriod("last30", dateInVietnam()); setPeriod(next); setDraft(next);
      router.replace(`${pathname}?startDate=${next.start}&endDate=${next.end}`, { scroll: false });
    }
  }, [pathname, router]);

  const previous = useMemo(() => previousPeriod(period, preset), [period, preset]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    window.setTimeout(() => { setUpdatedAt(new Date()); setRefreshing(false); }, 500);
  }, []);

  useEffect(() => {
    onRefresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") onRefresh(); }, 60_000);
    const onVisible = () => { if (document.visibilityState === "visible") onRefresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [onRefresh]);

  function applyPreset(nextPreset: Preset) {
    setPreset(nextPreset); setFilterError("");
    if (nextPreset === "custom") { setDraft(period); return; }
    const next = presetPeriod(nextPreset, today); setPeriod(next); setDraft(next);
    router.replace(`${pathname}?startDate=${next.start}&endDate=${next.end}`, { scroll: false });
  }
  function applyCustom() {
    if (!draft.start || !draft.end) { setFilterError("Vui lòng chọn ngày bắt đầu và ngày kết thúc."); return; }
    if (draft.end < draft.start) { setFilterError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu."); return; }
    if (draft.end > today || draft.start > today) { setFilterError("Không thể chọn ngày trong tương lai."); return; }
    if (rangeDays(draft) > 366) { setFilterError("Khoảng thời gian tối đa là 366 ngày."); return; }
    setPeriod(draft); setFilterError(""); setPreset("custom");
    router.replace(`${pathname}?startDate=${draft.start}&endDate=${draft.end}`, { scroll: false });
  }

  const periodDays = rangeDays(period);
  const revenue = preset === "last7" ? 5_850_000 : preset === "last12Months" ? 87_400_000 : 14_500_000;
  const repairRevenue = Math.round(revenue * (6.5 / 14.5)); const salesRevenue = revenue - repairRevenue;
  const compareRepairCount = preset === "last12Months" ? 31 : 4;
  const repairCount = preset === "last12Months" ? 37 : preset === "last7" ? 2 : 3;
  const orderCount = preset === "last12Months" ? 44 : preset === "last7" ? 4 : 1;
  const chartPrevious = previous;
  const updatedLabel = updatedAt ? new Intl.DateTimeFormat("vi-VN", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(updatedAt) : "--:--";

  return <div className="mx-auto w-full max-w-[1600px] space-y-5 lg:space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Tổng quan</h1><span className="rounded-full border border-warning/30 bg-warning-bg px-2 py-0.5 text-[10px] font-medium text-warning">DỮ LIỆU DEMO</span></div><p className="mt-1 text-sm text-muted-foreground">Tình hình vận hành và kết quả kinh doanh của cửa hàng.</p></div>
      <div className="flex items-center justify-between gap-3 sm:justify-end"><p className="text-xs text-muted-foreground">Cập nhật lúc <span className="font-medium text-foreground">{updatedLabel}</span></p><button onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium shadow-sm transition hover:bg-muted disabled:cursor-wait disabled:opacity-60"><RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Đang cập nhật" : "Làm mới"}</button></div>
    </div>

    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
      <Panel title="Đơn sửa" icon={Wrench} description={<><b className="text-foreground">10</b> phiếu đang mở · 5 phiếu cần chú ý</>} action={<button disabled title="Danh sách đơn sửa sẽ được bổ sung sau" className="hidden sm:block"><ActionLink>Xem tất cả</ActionLink></button>}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Metric label="Chờ duyệt" value={2} hint="Yêu cầu mới" />
          <Metric label="Chờ linh kiện" value={1} hint="Cần đặt hàng" />
          <Metric label="Chờ duyệt báo giá" value={1} hint="Cần liên hệ khách" />
          <Metric label="Quá hạn hẹn trả" value={1} hint="Cần ưu tiên" danger />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-accent/70 px-3.5 py-3"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-card text-primary-600"><Package className="size-4" /></span><div><p className="text-xs font-semibold">Chờ khách lấy <span className="ml-1 text-base">5</span></p><p className="text-[10px] text-muted-foreground">5 thiết bị: 3 đã sửa xong · 2 đã hủy</p></div></div><span className="rounded-full bg-danger-bg px-2.5 py-1 text-[10px] font-semibold text-danger">4 quá 7 ngày</span></div>
        <div className="mt-4"><div className="mb-2 flex flex-wrap items-center justify-between gap-1"><h3 className="text-xs font-semibold">Đơn cần chú ý</h3><span className="text-[10px] text-muted-foreground">Nhấn xem chi tiết · giữ 3 giây để gọi</span></div><div className="divide-y divide-border/70">{repairsNeedingAttention.map((item) => <AttentionRepairRow key={item.code} item={item} />)}</div></div>
      </Panel>

      <Panel title="Đơn hàng hôm nay" icon={ShoppingBag} description={`Ngày ${formatDate(today)}`} action={<button disabled title="Danh sách đơn hàng sẽ được bổ sung sau" className="hidden sm:block"><ActionLink>Xem tất cả</ActionLink></button>}>
        <section className="rounded-xl border border-border/80 p-3.5">
          <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold"><CalendarDays className="size-4 text-primary-600" />Lịch xem hôm nay</h3><span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">5 lịch</span></div>
          <div className="mt-3 grid grid-cols-3 gap-2"><div><p className="text-lg font-semibold text-success">2</p><p className="text-[10px] text-muted-foreground">Đã đến xem</p></div><div><p className="text-lg font-semibold">2</p><p className="text-[10px] text-muted-foreground">Chưa đến</p></div><div><p className="text-lg font-semibold text-danger">1</p><p className="text-[10px] text-muted-foreground">Hết hạn / hủy</p></div></div>
        </section>
        <section className="mt-2.5 flex items-center justify-between gap-3 rounded-xl bg-background px-3.5 py-3"><div><p className="text-xs font-semibold">Bán được hôm nay</p><p className="mt-0.5 text-[10px] text-muted-foreground">Trong đó 1 đơn từ lịch xem</p></div><div className="text-right"><p className="text-sm font-semibold">2 đơn</p><p className="text-[10px] text-muted-foreground">10.000.000 ₫</p></div></section>
        <div className="mt-4"><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold">Lịch chưa đến</h3><button disabled title="Danh sách lịch hẹn sẽ được bổ sung sau"><ActionLink>Xem tất cả</ActionLink></button></div>{appointments.map((appointment) => <MockAction key={appointment.item} disabled><div className="flex items-center justify-between gap-3 border-t border-border/70 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-medium">{appointment.item}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{appointment.phone}</p></div><span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-warning"><Clock3 className="size-3" />{appointment.expires}</span></div></MockAction>)}</div>
      </Panel>

      <Panel title="Thợ" icon={Users} description="Tải hiện tại · sắp xếp theo số đơn đang làm" action={<span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-semibold text-success">2/3 đi làm</span>} className="md:max-lg:col-span-2">
        <div className="mb-3 flex items-center justify-between rounded-xl bg-background px-3.5 py-3"><div><p className="text-xs font-medium">Chờ phân công</p><p className="mt-0.5 text-[10px] text-muted-foreground">Phiếu đã nhận tại cửa hàng</p></div><div className="flex items-center gap-3"><b className="text-xl">1</b><button disabled title="Danh sách đơn sửa sẽ được bổ sung sau" className="rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground opacity-60">Phân công</button></div></div>
        <div className="space-y-2.5">{workers.map((worker, index) => <div key={worker.name} className="rounded-xl border border-border/80 p-3.5"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{worker.name.split(" ").map((part) => part[0]).slice(-2).join("")}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{worker.name}</p><p className="text-[10px] text-success">Đi làm</p></div></div>{worker.overdue > 0 && <span className="rounded-full bg-danger-bg px-2 py-1 text-[10px] font-medium text-danger">Quá hạn: {worker.overdue}</span>}</div><div className="mt-3 flex items-center gap-3"><span className="w-12 shrink-0 text-[10px] text-muted-foreground">Tải <b className="ml-1 text-sm text-foreground">{worker.load}</b></span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(18, worker.load / 3 * 100)}%` }} /></div><span className="shrink-0 text-[10px] text-muted-foreground">Đang chờ: {worker.waiting}</span></div><div className="mt-2.5 space-y-1 border-t border-border/70 pt-2.5">{worker.jobs.slice(0, 3).map((job) => <p key={job} className="truncate text-[10px] text-muted-foreground">{job.startsWith("+") ? <button disabled className="font-medium text-primary-600">{job}</button> : job}</p>)}</div></div>)}</div>
      </Panel>

      <Panel title="Vật tư và kho" icon={Box} description="Cảnh báo tồn kho và máy cũ đang bán" action={<button disabled title="Danh sách kho sẽ được bổ sung sau" className="hidden sm:block"><ActionLink>Xem kho</ActionLink></button>}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warning-bg/65 px-3.5 py-3"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-card text-warning"><AlertTriangle className="size-4" /></span><div><p className="text-xs font-semibold">3 mặt hàng dưới ngưỡng</p><p className="text-[10px] text-muted-foreground">Trong đó 1 mặt hàng hết hàng</p></div></div><button disabled title="Danh sách tồn kho sẽ được bổ sung sau" className="text-xs font-medium text-warning">Kiểm tra kho <ArrowRight className="ml-1 inline size-3.5" /></button></div>
        <div className="mt-3 divide-y divide-border/70">{inventory.map((item) => <MockAction key={item.sku} disabled><div className="flex items-center justify-between gap-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-medium">{item.name}</p><p className="text-[10px] text-muted-foreground">SKU: {item.sku}</p></div><div className="shrink-0 text-right"><p className={`text-xs font-semibold ${item.stock === 0 ? "text-danger" : "text-warning"}`}>{item.stock} <span className="font-normal text-muted-foreground">/ {item.threshold}</span></p><p className="text-[10px] text-muted-foreground">Tồn / ngưỡng</p></div></div></MockAction>)}</div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border/80 px-3.5 py-3"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Smartphone className="size-4" /></span><span className="text-xs font-medium">Máy cũ đang bán</span></div><span className="text-lg font-semibold">6</span></div>
      </Panel>
    </div>

    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2"><h2 className="text-base font-semibold">Kết quả kinh doanh</h2><span className="inline-flex text-muted-foreground" title="Bộ lọc chỉ áp dụng cho doanh thu, phiếu hoàn tất và biểu đồ"><CircleHelp className="size-3.5" /></span></div><p className="mt-1 text-xs text-muted-foreground">Số liệu theo kỳ · {periodLabel(period)}</p></div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/70 p-1">{presets.map((item) => <button key={item.id} onClick={() => applyPreset(item.id)} className={`rounded-lg px-2.5 py-2 text-[11px] font-medium transition sm:px-3 ${preset === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}</div>
      </div>
      {preset === "custom" && <div className="flex flex-col gap-2 border-b border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-end sm:px-5"><label className="flex-1 text-[11px] font-medium text-muted-foreground">Từ ngày<input type="date" max={today} value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} className="mt-1 block h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground" /></label><label className="flex-1 text-[11px] font-medium text-muted-foreground">Đến ngày<input type="date" max={today} value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} className="mt-1 block h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground" /></label><button onClick={applyCustom} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-200">Áp dụng</button></div>}
      {filterError && <p role="alert" className="border-b border-danger/20 bg-danger-bg/50 px-5 py-2.5 text-xs text-danger">{filterError}</p>}
      <div className="p-4 sm:p-5">
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard title="Doanh thu" value={money(revenue)} detail={`Sửa chữa ${money(repairRevenue)} · Bán hàng ${money(salesRevenue)}`} compare="▲ 45,0%" previous={money(10_000_000)} icon={ShoppingBag} positive />
          <KpiCard title="Phiếu sửa hoàn tất" value={count(repairCount)} detail="Phiếu ghi nhận trong kỳ" compare="▼ 25,0%" previous={count(compareRepairCount)} icon={CheckCircle2} />
          <KpiCard title="Đơn bán" value={count(orderCount)} detail="Không tính đơn đã hủy" compare="Mới" previous="0" icon={Package} positive />
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Doanh thu theo thời gian</h3><p className="mt-0.5 text-[10px] text-muted-foreground">Sửa chữa và bán hàng · VNĐ</p></div><span className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">{periodDays <= 31 ? "Theo ngày" : periodDays <= 120 ? "Theo tuần" : "Theo tháng"}</span></div>
        <DemoRevenueChart period={period} previous={chartPrevious} />
      </div>
    </section>
    <p className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-bg/45 px-3.5 py-3 text-[11px] leading-5 text-warning"><AlertTriangle className="mt-0.5 size-4 shrink-0" />Dashboard đang hiển thị dữ liệu minh họa. Số liệu thật, tự làm mới và điều hướng đến danh sách sẽ hoạt động sau khi backend và các màn hình nghiệp vụ được kết nối.</p>
  </div>;
}

function KpiCard({ title, value, detail, compare, previous, icon: Icon, positive = false }: {
  title: string; value: string; detail: string; compare: string; previous: string; icon: typeof ShoppingBag; positive?: boolean;
}) {
  const isUp = compare.startsWith("▲");
  const isNew = compare === "Mới";
  return <article className="min-w-0 rounded-xl border border-border bg-background/60 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{title}</p><span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary-600"><Icon className="size-4" /></span></div><p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{detail}</p><div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-2.5 text-[10px]"><span className={`inline-flex items-center gap-0.5 font-semibold ${isNew || (positive && isUp) ? "text-success" : "text-danger"}`}>{isNew ? <ArrowUpRight className="size-3" /> : isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{compare}</span><span className="text-muted-foreground">· Kỳ trước: {previous}</span></div></article>;
}
