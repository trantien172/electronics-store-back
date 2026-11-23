"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import { Wrench, Menu, X, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { AuthService } from '@/service/auth.service';
import { RepairService, type QuickLookupRepair } from '@/service/repair.service';
import { apiErrorMessage } from '@/lib/api-error';
import { useOnlyNumber } from '@/hooks/useOnlyNumber';
import OtpModal from '../components/ModalOtp';
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/services", label: "Dịch vụ" },
  { href: "/products", label: "Sản phẩm" }
];
function getFirstLetterOfName(fullName: string) {
  if (!fullName || typeof fullName !== 'string') return '';

  // 1. Cắt khoảng trắng thừa ở 2 đầu và tách chuỗi thành mảng các từ
  const words = fullName.trim().split(/\s+/);

  // 2. Lấy từ cuối cùng (chính là Tên)
  const lastName = words[words.length - 1];

  // 3. Lấy ký tự đầu tiên của tên và viết hoa
  return lastName.charAt(0).toUpperCase();
}

function getRepairItemStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Chờ tiếp nhận', assigned: 'Đã phân công', in_progress: 'Đang sửa chữa',
    waiting_parts: 'Chờ linh kiện', waiting_quote: 'Chờ báo giá', cancelled: 'Đã hủy', completed: 'Hoàn thành',
  };
  return labels[status] || status;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomepage = pathname === "/";
  const [open, setOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const { favoriteKeys } = useFavorites();
  const [isScrolled, setIsScrolled] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const { value: trackPhone, onChange: setTrackPhone, error: trackPhoneError, isValid: trackPhoneValid } = useOnlyNumber();
  const [trackOtpOpen, setTrackOtpOpen] = useState(false);
  const [trackDevelopmentOtp, setTrackDevelopmentOtp] = useState<string>();
  const [trackNotice, setTrackNotice] = useState('');
  const [trackResult, setTrackResult] = useState<QuickLookupRepair[] | null>(null);
  const [loginPromptCode, setLoginPromptCode] = useState('');
  const [trackBusy, setTrackBusy] = useState(false);

  useEffect(() => {
    if (!isHomepage) return
    const handleScroll = () => {
      // Nếu cuộn xuống quá 50px thì set là true
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const fetchQuickLookup = async (otp?: string, showError = true) => {
    setTrackBusy(true);
    setTrackNotice('');
    try {
      const data = await RepairService.quickLookup({ phone: trackPhone, ...(otp ? { otp } : {}) });
      setTrackResult(data);
      setTrackOpen(true);
      return true;
    } catch (error: unknown) {
      setTrackNotice(apiErrorMessage(error, 'Không tải được danh sách phiếu sửa chữa.'));
      if (showError) setTrackOpen(true);
      return false;
    } finally {
      setTrackBusy(false);
    }
  };

  const requestTrackOtp = async () => {
    if (!trackPhoneValid) {
      setTrackNotice('Nhập số điện thoại gồm 10 số và bắt đầu bằng 0.');
      setTrackResult(null);
      setTrackOpen(true);
      return;
    }
    setTrackNotice('');
    setTrackResult(null);
    if (isAuthenticated && user?.phone?.trim() === trackPhone) {
      setTrackOpen(true);
      await fetchQuickLookup();
      return;
    }
    setTrackBusy(true);
    try {
      const result = await AuthService.sendOtp(trackPhone, 'repair');
      setTrackDevelopmentOtp(result.mockOtp);
      setTrackOpen(false);
      setTrackOtpOpen(true);
    } catch (error: unknown) {
      setTrackNotice(apiErrorMessage(error, 'Không gửi được OTP.'));
      setTrackOpen(true);
    } finally {
      setTrackBusy(false);
    }
  };

  return (
    <header
      className={`top-0 z-50 w-full transition-colors ` + (!isHomepage ? 'sticky bg-surface-dark' : isScrolled ? 'fixed bg-surface-dark' : 'fixed bg-transparent')}

    >
      <Container className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 py-2 md:h-16 md:flex-nowrap md:justify-between md:gap-4 md:py-0">
        {/* Logo */}
        <Link href="/" className="order-1 flex shrink-0 items-center gap-1">
          <div
            className="flex size-9 items-center justify-center rounded-lg bg-primary-200"
          >
            <Wrench size={18} className="text-surface-dark" />
          </div>
          <span className="font-medium text-lg text-neutral-50">
            FixPro
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="order-2 hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={(link.href === "/services" ? pathname.startsWith("/services") : pathname === link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors hover:text-primary-100 ${(link.href === "/services" ? pathname.startsWith("/services") : pathname === link.href) ? "text-primary-100 underline decoration-2 underline-offset-8" : "text-neutral-50"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={(event) => { event.preventDefault(); void requestTrackOtp(); }} className="order-3 flex h-11 w-full min-w-0 items-center overflow-hidden rounded-full border border-white/30 bg-black/20 text-white/80 md:w-52 md:flex-none">
          <Input aria-label="Số điện thoại tra cứu phiếu sửa" aria-invalid={Boolean(trackPhoneError)} title={trackPhoneError || 'Số điện thoại gồm 10 số, bắt đầu bằng 0'} type="tel" inputMode="numeric" maxLength={10} placeholder="Số điện thoại" value={trackPhone} onChange={(event) => setTrackPhone(event.target.value)} className="min-w-0 flex-1 border-none bg-transparent text-white focus-visible:ring-0" />
          <Button type="submit" variant="ghost" size="sm" className="h-11 shrink-0 rounded-full px-3 text-white hover:bg-white/20 hover:text-white" disabled={trackBusy}>{trackBusy ? 'Tra cứu…' : 'Tra cứu'}</Button>
        </form>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 md:order-4 md:ml-0 md:gap-2">
          <Link href="/favorites" aria-label={`Danh sách quan tâm${favoriteKeys.length ? `, ${favoriteKeys.length} sản phẩm` : ""}`} className="relative inline-flex size-10 items-center justify-center rounded-full text-neutral-50 hover:bg-white/10">
            <Heart className="size-5" />
            {favoriteKeys.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary-200 px-1 text-[11px] font-semibold leading-5 text-surface-dark">{favoriteKeys.length}</span>}
          </Link>
          {isAuthenticated && (
            <Link href="/myprofile" title={user?.name || user?.phone} className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-200 text-sm font-semibold text-black md:flex">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : getFirstLetterOfName(user?.name || "A")}
            </Link>
          )}

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button onClick={() => signOut()}>
                  Đăng xuất
                </Button>
              </>
            ) :
              <Button render={<Link href="/login" />} nativeButton={false}>
                Đăng nhập
              </Button>
            }



          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-neutral-50 hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </Button>

        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-1 border-t border-neutral-100 bg-black py-4 animate-slide-down"
        >
          {isAuthenticated &&
            <Link href="/myprofile" className="flex min-h-11 items-center justify-between px-3 py-2 text-sm font-medium text-neutral-50" >
                Tài khoản
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-200 text-sm font-semibold text-black" title={user?.name || user?.phone}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : getFirstLetterOfName(user?.name || "A")}
              </div>
            </Link>
          }
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={(link.href === "/services" ? pathname.startsWith("/services") : pathname === link.href) ? "page" : undefined}
              className={`flex min-h-11 items-center p-3 text-sm font-medium hover:bg-white/10 ${(link.href === "/services" ? pathname.startsWith("/services") : pathname === link.href) ? "text-primary-100" : "text-neutral-50"}`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link href="#" className="flex min-h-11 items-center p-3 text-sm font-medium text-neutral-50 hover:bg-white/10"
              onClick={() => { setOpen(false); signOut() }}>
              Đăng xuất
            </Link>
          ) :

            (
              <Link href="/login" className="flex min-h-11 items-center p-3 text-sm font-medium text-neutral-50 hover:bg-white/10"
                onClick={() => setOpen(false)}>
                Đăng nhập
              </Link>
            )}
        </div>
      )}
      {trackOpen && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="repair-track-title">
        <section className="w-full max-w-2xl space-y-4 rounded-xl bg-card p-5 text-foreground shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-primary-600">FixPro · Tra cứu nhanh</p><h2 id="repair-track-title" className="mt-1 text-xl font-semibold">Phiếu sửa chữa của bạn</h2></div>
            <Button variant="ghost" size="icon" aria-label="Đóng" onClick={() => setTrackOpen(false)}><X /></Button>
          </div>
          {trackNotice ? <div className="rounded-lg border border-danger/20 bg-danger-bg p-4 text-sm text-danger" role="alert"><p>{trackNotice}</p><Button variant="outline" className="mt-3" onClick={requestTrackOtp}>Thử lại</Button></div>
            : trackBusy ? <div className="space-y-3" aria-label="Đang tải phiếu sửa chữa">{[0, 1, 2].map((row) => <div key={row} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
            : trackResult?.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center"><h3 className="font-semibold">Chưa tìm thấy phiếu sửa chữa</h3><p className="mt-2 text-sm text-muted-foreground">Chưa có phiếu nào liên kết với số điện thoại đã xác minh.</p></div>
              : <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
                {trackResult?.map((repair) => {
                  const completedItems = repair.repairItems.filter((item) => item.status === 'completed');
                  const completedTotal = completedItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
                  return <article key={repair.id} className="rounded-xl border border-border bg-background p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-xs text-muted-foreground">Mã phiếu</p><h3 className="font-semibold text-primary-700">{repair.code}</h3><p className="mt-1 text-xs text-muted-foreground">Tiếp nhận {new Date(repair.receivedAt).toLocaleDateString('vi-VN')}</p></div>
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{completedItems.length} / {repair.repairItems.length} thiết bị hoàn thành</span>
                    </div>
                    <ul className="mt-4 space-y-2 border-t border-border pt-3">
                      {repair.repairItems.map((item) => <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0"><p className="font-medium">{item.category?.name || 'Thiết bị'}{item.deviceModel ? ` · ${item.deviceModel}` : ''}</p>{item.problemDescription && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.problemDescription}</p>}</div>
                        <span className={`shrink-0 text-xs font-medium ${item.status === 'completed' ? 'text-success' : 'text-danger'}`}>{getRepairItemStatusLabel(item.status)}</span>
                      </li>)}
                    </ul>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"><p className="text-sm">Tổng giá trị thiết bị hoàn thành <strong>{completedTotal.toLocaleString('vi-VN')} ₫</strong></p><Button variant="outline" onClick={() => isAuthenticated && user?.phone?.trim() === trackPhone ? router.push(`/myprofile/repairs/${encodeURIComponent(repair.code)}`) : setLoginPromptCode(repair.code)}>Xem chi tiết</Button></div>
                  </article>;
                })}
              </div>}
          {loginPromptCode && <div className="rounded-xl bg-accent/70 p-4" role="group" aria-label="Yêu cầu đăng nhập"><p className="font-medium">Đăng nhập để xem chi tiết phiếu {loginPromptCode}</p><p className="mt-1 text-sm text-muted-foreground">{isAuthenticated ? 'Đang đăng nhập bằng số điện thoại khác. Hãy đổi sang tài khoản gắn với số đã xác minh.' : 'Chi tiết và thao tác phản hồi báo giá chỉ dành cho tài khoản đã đăng nhập.'}</p><div className="mt-3 flex justify-end gap-2"><Button variant="outline" onClick={() => setLoginPromptCode('')}>Để sau</Button><Button onClick={() => {
            const loginPath = `/login?returnUrl=${encodeURIComponent(`/myprofile/repairs/${loginPromptCode}`)}`;
            if (isAuthenticated) void signOut().then(() => router.push(loginPath));
            else router.push(loginPath);
          }}>{isAuthenticated ? 'Đổi tài khoản' : 'Đăng nhập'}</Button></div></div>}
          {!trackNotice && trackResult && <Button variant="outline" className="w-full" onClick={() => { setTrackOpen(false); setTrackResult(null); }}>Tra cứu số điện thoại khác</Button>}
        </section>
      </div>}
      <OtpModal isOpen={trackOtpOpen} phone={trackPhone} developmentCode={trackDevelopmentOtp} verifyLabel="Xác minh và xem phiếu" onVerify={async (otp) => {
        const success = await fetchQuickLookup(otp, false);
        if (success) setTrackOtpOpen(false);
        return success;
      }} onResend={async () => {
        const result = await AuthService.sendOtp(trackPhone, 'repair');
        setTrackDevelopmentOtp(result.mockOtp);
      }} onClose={() => setTrackOtpOpen(false)} />
    </header>
  );
}
