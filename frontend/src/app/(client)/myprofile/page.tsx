"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Bell, ChevronRight, Clock3, Heart, LifeBuoy, LockKeyhole, Package, Save, ShieldCheck, UserRound, Wrench, X, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/service/auth.service";
import { apiErrorMessage } from "@/lib/api-error";

const activities = [
  { id: "favorites", icon: Heart, title: "Danh sách quan tâm", description: "Sản phẩm bạn đã lưu" },
  { id: "orders", icon: Package, title: "Đơn hàng", description: "Lịch sử mua hàng tại FixPro" },
  { id: "repairs", icon: Wrench, title: "Phiếu sửa chữa", description: "Theo dõi tiến độ sửa chữa" },
  { id: "warranties", icon: ShieldCheck, title: "Bảo hành", description: "Yêu cầu và thông tin bảo hành" },
  { id: "notifications", icon: Bell, title: "Thông báo", description: "Cập nhật từ FixPro" },
] as const;

type ActivityId = (typeof activities)[number]["id"];

const activityRoutes: Partial<Record<ActivityId, { href: string; label: string }>> = {
  favorites: { href: "/favorites", label: "Xem danh sách quan tâm" },
  orders: { href: "/myprofile/orders", label: "Xem tất cả đơn hàng" },
  repairs: { href: "/myprofile/repairs", label: "Xem tất cả đơn sửa" },
  warranties: { href: "/myprofile/warranties", label: "Xem bảo hành" },
};

const demoNotifications = [
  { id: "notice-1", title: "Chào mừng bạn đến với FixPro", body: "Cập nhật hồ sơ để chúng tôi hỗ trợ bạn tốt hơn.", time: "Vừa xong", read: false },
  { id: "notice-2", title: "Khám phá dịch vụ sửa chữa", body: "Đội ngũ kỹ thuật FixPro sẵn sàng hỗ trợ thiết bị của bạn.", time: "Hôm nay", read: false },
  { id: "notice-3", title: "Hồ sơ demo đã sẵn sàng", body: "Bạn có thể cập nhật tên và ảnh đại diện ngay trên trang cá nhân.", time: "Hôm nay", read: true },
];

export default function AccountPage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityId | null>(null);
  const [notificationFilter, setNotificationFilter] = useState("Tất cả");
  const [notifications, setNotifications] = useState(demoNotifications);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!isAvatarExpanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAvatarExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAvatarExpanded]);

  useEffect(() => {
    if (!isEditing && user) {
      setName(user.name);
      setEmail(user.email ?? "");
    }
  }, [isEditing, user?.name, user?.email]);

  const cancelEditing = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setIsEditing(false);
  };

  const changeAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh đại diện cần nhỏ hơn 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateUser({ ...user, avatarUrl: reader.result });
        toast.success("Đã cập nhật ảnh đại diện trên thiết bị này.");
      }
    };
    reader.onerror = () => toast.error("Không thể đọc ảnh. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return;
    try { await AuthService.changePassword(currentPassword, newPassword); toast.success("Mật khẩu đã được thay đổi."); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setIsPasswordEditing(false); }
    catch (error: unknown) { toast.error(apiErrorMessage(error, "Không thể thay đổi mật khẩu.")); }
  };

  const markNotificationRead = (id: string) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllNotificationsRead = () => setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  const scrollToActivity = (id: ActivityId) => {
    setActiveActivity(id);
    document.getElementById(`activity-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const openNotifications = () => scrollToActivity("notifications");

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !name.trim()) return;
    try { await updateUser({ ...user, name: name.trim(), email: email.trim() || null }); setIsEditing(false); toast.success("Đã cập nhật hồ sơ."); }
    catch (error: unknown) { toast.error(apiErrorMessage(error, "Không thể cập nhật hồ sơ.")); }
  };

  if (!isAuthenticated || !user) {
    return <main className="min-h-[65vh] bg-background"><Container className="flex min-h-[65vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary-600"><UserRound className="size-8" /></div>
      <h1 className="mt-5 text-2xl font-semibold">Đăng nhập để xem hồ sơ</h1>
      <p className="mt-2 text-sm text-muted-foreground">Đăng nhập để quản lý thông tin tài khoản và các hoạt động của bạn.</p>
      <Button render={<Link href="/login?returnUrl=%2Fmyprofile" />} nativeButton={false} className="mt-6">Đăng nhập <ArrowRight /></Button>
    </Container></main>;
  }

  const initial = user.name.trim().split(/\s+/).at(-1)?.[0]?.toUpperCase() ?? "F";

  return <main className="min-h-screen bg-background pb-24 lg:pb-16">
    <div className="border-b border-border bg-surface-dark text-white">
      <Container className="py-8 md:py-10">
        <nav aria-label="Đường dẫn" className="mb-5 flex items-center gap-2 text-sm text-white/55"><Link href="/" className="hover:text-white">Trang chủ</Link><ChevronRight className="size-4" /><span className="text-white">Tài khoản</span></nav>
        <div className="flex flex-col items-stretch justify-between gap-5 sm:flex-row sm:items-center">
          <div className="my-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100">Không gian của bạn</p><h1 className="mt-1 text-3xl font-semibold md:text-4xl">Xin chào, {user.name.split(/\s+/).at(-1)}!</h1><p className="mt-2 text-sm text-white/65">Quản lý hồ sơ và theo dõi dịch vụ FixPro tại đây.</p></div>
          <div className="flex flex-col items-end  w-full gap-3 sm:w-auto sm:justify-start">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 pr-4 sm:pr-5"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-surface-dark">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" className="size-full object-cover" /> : initial}</div><div className="min-w-0"><p className="truncate font-medium">{user.name}</p><p className="text-xs text-white/55">Thành viên FixPro</p></div><BadgeCheck className="ml-1 size-5 shrink-0 text-primary-100 sm:ml-2" /></div>
            <Button type="button" variant="outline" onClick={openNotifications} className="relative shrink-0 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Bell className="size-4" />Thông báo<span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-surface-dark">{unreadCount}</span></Button>
          </div>
        </div>
      </Container>
    </div>

    <Container className="py-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-3 shadow-card max-lg:hidden">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tài khoản</p>
          <div className="flex min-h-11 items-center gap-3 rounded-xl bg-accent px-3 text-sm font-semibold text-primary-800"><UserRound className="size-4" /> Hồ sơ cá nhân</div>
          <Link href="/myprofile/repairs" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><Wrench className="size-4" /> Đơn sửa chữa</Link>
          <Link href="/myprofile/warranties" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><ShieldCheck className="size-4" /> Bảo hành</Link>
          <Link href="/myprofile/orders" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><Package className="size-4" /> Đơn hàng</Link>
          <Link href="/favorites" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><Heart className="size-4" /> Danh sách quan tâm</Link>
          <div className="my-3 border-t border-border" />
          <div className="rounded-xl bg-muted/70 p-3"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-success" /> Tài khoản demo</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Hồ sơ được lưu trên thiết bị. Số liệu hoạt động sẽ có khi kết nối backend.</p></div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card shadow-card">
            <div className="flex justify-between gap-2 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:px-7"><div><h2 className="text-lg font-semibold">Thông tin cá nhân</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin tài khoản FixPro của bạn.</p></div><Button type="button" variant={isEditing ? "outline" : "secondary"} onClick={isEditing ? cancelEditing : () => setIsEditing(true)}>{isEditing ? <><X className="size-4" /></> : <SquarePen size={110} />}</Button></div>
            <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-start sm:px-7">
              <div className="flex shrink-0 flex-col items-center gap-2"><div className="group relative size-24 overflow-hidden rounded-full bg-accent text-3xl font-semibold text-primary-800 ring-1 ring-border">
                <button type="button" aria-label="Phóng to ảnh đại diện" onClick={() => setIsAvatarExpanded(true)} className="flex size-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện của bạn" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" /> : initial}</button>
                <label className="absolute inset-x-0 bottom-0 flex h-9 cursor-pointer items-center justify-center gap-1 bg-black/65 text-[11px] font-semibold text-white opacity-90 transition group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><span aria-hidden="true">✎</span><span>Đổi ảnh</span><input type="file" accept="image/*" className="sr-only" onChange={changeAvatar} /></label>
              </div><p className="text-center text-xs text-muted-foreground">Bấm ảnh để xem lớn · tối đa 2 MB</p></div>
              {isEditing ? <form onSubmit={saveProfile} className="grid min-w-0 flex-1 gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">Họ và tên<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập họ và tên" required /></label>
                <label className="block text-sm font-medium">Số điện thoại · Tên đăng nhập<Input value={user.phone} readOnly aria-describedby="phone-note" className="mt-2 bg-muted" /><span id="phone-note" className="mt-1 block text-xs font-normal text-muted-foreground">Tên đăng nhập không thể thay đổi.</span></label>
                <label className="block text-sm font-medium sm:col-span-2">Email <span className="font-normal text-muted-foreground">(không bắt buộc)</span><Input className="mt-2 max-w-xl" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" /></label>
                <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-4 sm:col-span-2 sm:flex-row sm:items-center"><p className="text-xs text-muted-foreground">Thông tin hồ sơ được lưu trên thiết bị này.</p><Button type="submit" disabled={!name.trim()}><Save className="size-4" />Lưu thông tin</Button></div>
              </form> : <div className="grid min-w-0 flex-1 gap-5 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Họ và tên</p><p className="mt-1 font-medium">{user.name}</p></div><div><p className="text-xs text-muted-foreground">Số điện thoại · Tên đăng nhập</p><p className="mt-1 font-medium">{user.phone}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 font-medium">{user.email || "Chưa cập nhật"}</p></div></div>}
            </div>
            <div className="border-t border-border px-5 py-5 sm:px-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><h3 className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-4 text-primary-600" />Đổi mật khẩu</h3><p className="mt-1 text-xs text-muted-foreground">Bản demo chưa kết nối hệ thống xác thực.</p></div>
                <Button type="button" variant="outline" onClick={() => setIsPasswordEditing((open) => !open)} aria-expanded={isPasswordEditing}>{isPasswordEditing ? "Ẩn biểu mẫu" : "Đổi mật khẩu"}</Button>
              </div>
              {isPasswordEditing && <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">Mật khẩu hiện tại<Input className="mt-2" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
                <span className="hidden sm:block" />
                <label className="block text-sm font-medium">Mật khẩu mới<Input className="mt-2" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><span className="mt-1 block text-xs font-normal text-muted-foreground">Tối thiểu 8 ký tự.</span></label>
                <label className="block text-sm font-medium">Nhập lại mật khẩu mới<Input className="mt-2" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required aria-invalid={Boolean(confirmPassword && confirmPassword !== newPassword)} /><span className="mt-1 block text-xs font-normal text-danger">{confirmPassword && confirmPassword !== newPassword ? "Mật khẩu nhập lại chưa khớp." : " "}</span></label>
                <div className="sm:col-span-2"><Button type="submit" disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}>Cập nhật mật khẩu</Button></div>
              </form>}
            </div>
          </section>

          <section aria-label="Tóm tắt hoạt động">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Tóm tắt hoạt động</h2><span className="text-xs text-muted-foreground">Dữ liệu demo</span></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activities.map(({ id, icon: Icon, title, description }) => <button key={id} type="button" onClick={() => scrollToActivity(id)} aria-pressed={activeActivity === id} className={`group flex min-h-28 items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-card transition hover:border-primary-200 hover:shadow-md ${activeActivity === id ? "border-primary-200 ring-2 ring-primary/15" : "border-border"}`}><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-600"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span><span className="mt-2 block text-xs font-medium text-primary-600">Xem mục <ArrowRight className="ml-1 inline size-3.5" /></span></span><span className="self-start rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{id === "notifications" ? unreadCount : "—"}</span></button>)}
            </div>
          </section>

          {activities.map(({ id, icon: Icon, title, description }) => {
            const route = activityRoutes[id];
            const filteredNotifications = notifications.filter((item) => notificationFilter === "Tất cả" || (notificationFilter === "Chưa đọc" ? !item.read : item.read));
            return <section key={id} id={`activity-${id}`} className="scroll-mt-24 rounded-2xl border border-border bg-card shadow-card">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-600"><Icon className="size-5" /></span><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>{route && <Link href={route.href} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-800">{route.label}<ArrowRight className="size-4" /></Link>}</div>
              {id === "notifications" ? <><div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6"><div className="flex flex-wrap gap-2">{["Tất cả", "Chưa đọc", "Đã đọc"].map((filter) => <Button key={filter} type="button" size="sm" variant={notificationFilter === filter ? "secondary" : "outline"} onClick={() => setNotificationFilter(filter)}>{filter}</Button>)}</div><Button type="button" variant="ghost" size="sm" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>Đánh dấu tất cả đã đọc</Button></div><div className="divide-y divide-border px-5 sm:px-6">{filteredNotifications.map((item) => <button key={item.id} type="button" onClick={() => markNotificationRead(item.id)} className={`flex w-full gap-3 py-4 text-left ${item.read ? "" : "bg-accent/40"}`}><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-primary-600"}`} /><span className="min-w-0 flex-1"><span className="block font-medium">{item.title}</span><span className="mt-1 block text-sm text-muted-foreground">{item.body}</span><span className="mt-2 block text-xs text-muted-foreground">{item.time} · {item.read ? "Đã đọc" : "Chưa đọc"}</span></span></button>)}</div>{filteredNotifications.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Không có thông báo trong mục này.</p>}<p className="px-5 pb-4 text-xs text-muted-foreground sm:px-6">Thông báo mẫu để xem trước giao diện. Dữ liệu sẽ đồng bộ khi có backend.</p></> : <div className="px-5 py-8 text-center sm:px-6"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Clock3 className="size-5" /></div><h3 className="mt-3 font-semibold">Chưa có dữ liệu</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Nội dung của mục này sẽ hiển thị tại đây khi được kết nối với backend.</p>{route && <Link href={route.href} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600">{route.label}<ArrowRight className="size-4" /></Link>}</div>}
            </section>;
          })}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"><div className="flex items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-600"><LifeBuoy className="size-5" /></div><div className="min-w-0 flex-1"><h2 className="font-semibold">Bạn cần hỗ trợ?</h2><p className="mt-1 text-sm text-muted-foreground">Khám phá dịch vụ hoặc gửi yêu cầu để FixPro hỗ trợ thiết bị của bạn.</p><Link href="/services" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800">Xem dịch vụ <ArrowRight className="size-4" /></Link></div></div></section>
        </div>
      </div>
    </Container>
    <nav aria-label="Điều hướng tài khoản" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <Link href="/myprofile/repairs" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Wrench className="size-4" />Đơn sửa</Link>
      <Link href="/myprofile/warranties" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><ShieldCheck className="size-4" />Bảo hành</Link>
      <Link href="/myprofile/orders" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Package className="size-4" />Đơn hàng</Link>
    </nav>
    {isAvatarExpanded && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"><button type="button" aria-label="Đóng ảnh" onClick={() => setIsAvatarExpanded(false)} className="absolute inset-0 size-full cursor-default" /><div role="dialog" aria-modal="true" aria-label="Ảnh đại diện phóng to" className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center rounded-2xl bg-surface-dark p-3 shadow-2xl"><Button type="button" variant="ghost" size="icon" aria-label="Đóng ảnh" onClick={() => setIsAvatarExpanded(false)} className="absolute -right-3 -top-3 z-10 rounded-full bg-card text-foreground shadow-lg hover:bg-muted"><X /></Button>{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện phóng to" className="max-h-[82vh] max-w-[85vw] rounded-xl object-contain" /> : <div className="flex size-64 items-center justify-center rounded-xl bg-accent text-7xl font-semibold text-primary-800">{initial}</div>}<p className="pt-2 text-xs text-white/70">Nhấn ngoài ảnh hoặc Esc để đóng</p></div></div>}
  </main>;
}
