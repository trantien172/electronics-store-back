import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";

const demoRepairs: Record<string, { customer: string; phone: string; device: string; technician: string; reason: string; status: string }> = {
  P9: { customer: "Trần Minh Khoa", phone: "0903456789", device: "iPhone 13", technician: "Minh", reason: "Chờ lấy 12 ngày · Đã hủy", status: "Đã hủy" },
  P4: { customer: "Nguyễn Thu Hà", phone: "0912340567", device: "MacBook Air M1", technician: "Tuấn", reason: "Trễ hẹn 15/11", status: "Đang sửa" },
  P7: { customer: "Lê Hoàng Nam", phone: "0988123456", device: "Samsung S22", technician: "Minh", reason: "Chờ lấy 10 ngày · Đã sửa xong", status: "Hoàn tất" },
  P6: { customer: "Phạm Ngọc Anh", phone: "0909123456", device: "iPad Pro", technician: "Huy", reason: "Chờ lấy 9 ngày · Đã hủy", status: "Chờ linh kiện" },
  P13: { customer: "Đỗ Quốc Bảo", phone: "0934567890", device: "iPhone 12", technician: "Tuấn", reason: "Chờ lấy 8 ngày · Đã sửa xong", status: "Hoàn tất" },
};

export default async function RepairDetailPage({ params }: { params: Promise<{ repairId: string }> }) {
  const { repairId } = await params;
  const repair = demoRepairs[repairId.toUpperCase()];
  if (!repair) notFound();

  return <div className="mx-auto w-full max-w-4xl space-y-5">
    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Quay lại tổng quan</Link>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-primary-600">Phiếu sửa chữa</p><h1 className="mt-1 text-2xl font-semibold">Chi tiết phiếu {repairId.toUpperCase()}</h1></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">{repair.status}</span></header>
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="text-sm font-semibold">Thông tin tiếp nhận</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Khách hàng</dt><dd className="mt-1 text-sm font-medium">{repair.customer}</dd></div><div><dt className="text-xs text-muted-foreground">Số điện thoại</dt><dd className="mt-1 text-sm font-medium">{repair.phone}</dd></div><div><dt className="text-xs text-muted-foreground">Thiết bị</dt><dd className="mt-1 text-sm font-medium">{repair.device}</dd></div><div><dt className="text-xs text-muted-foreground">Thợ phụ trách</dt><dd className="mt-1 text-sm font-medium">{repair.technician}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Cần chú ý</dt><dd className="mt-1 text-sm font-medium">{repair.reason}</dd></div></dl>
      <a href={`tel:${repair.phone}`} className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-200"><Phone className="size-4" />Gọi khách</a>
    </section>
    <p className="rounded-xl border border-warning/25 bg-warning-bg/45 px-4 py-3 text-xs leading-5 text-warning">Đây là trang chi tiết minh họa. Thông tin thật sẽ hiển thị sau khi kết nối backend.</p>
  </div>;
}
