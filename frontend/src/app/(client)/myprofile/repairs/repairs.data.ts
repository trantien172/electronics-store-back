export type RepairStatus = "pending" | "received" | "assigned" | "in_progress" | "waiting_parts" | "waiting_quote" | "completed" | "delivered" | "cancelled";
export type RepairItemStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type QuoteStatus = "pending" | "accepted" | "rejected";

export interface RepairQuoteLine {
  label: string;
  partsCost: number;
  laborCost: number;
}

export interface RepairHistoryEntry {
  at: string;
  title: string;
  note?: string;
}

export interface RepairDevice {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serial?: string;
  problem: string;
  receivedCondition: string;
  diagnosis?: string;
  publicNote?: string;
  status: RepairItemStatus;
  quote?: { status: QuoteStatus; updatedAt: string; lines: RepairQuoteLine[] };
  finalCost?: number;
  paymentStatus?: "unpaid" | "paid";
  handedOverAt?: string;
  handoverNote?: string;
  warranty?: { period: string; expiresAt: string; code: string };
  history: RepairHistoryEntry[];
}

export interface RepairRecord {
  code: string;
  receivedAt: string;
  pickupAt?: string;
  status: RepairStatus;
  devices: RepairDevice[];
}

export const repairStatuses: { value: RepairStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "received", label: "Đã tiếp nhận" },
  { value: "assigned", label: "Đã phân công" },
  { value: "in_progress", label: "Đang sửa chữa" },
  { value: "waiting_parts", label: "Chờ linh kiện" },
  { value: "waiting_quote", label: "Chờ xác nhận báo giá" },
  { value: "completed", label: "Đã hoàn tất" },
  { value: "delivered", label: "Đã bàn giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export const repairStatusLabels: Record<RepairStatus | RepairItemStatus, string> = {
  pending: "Chờ tiếp nhận",
  received: "Đã tiếp nhận",
  assigned: "Đã phân công",
  in_progress: "Đang sửa chữa",
  waiting_parts: "Chờ linh kiện",
  waiting_quote: "Chờ xác nhận báo giá",
  completed: "Đã hoàn tất",
  delivered: "Đã bàn giao",
  cancelled: "Đã hủy",
};

export const demoRepairs: RepairRecord[] = [
  {
    code: "FP-2026-0148",
    receivedAt: "2026-11-15T09:20:00+07:00",
    pickupAt: "2026-11-19",
    status: "waiting_quote",
    devices: [
      {
        id: "device-1", name: "Điện thoại", brand: "Apple", model: "iPhone 13", serial: "•••••••7281",
        problem: "Màn hình bị sọc xanh, cảm ứng đôi lúc không phản hồi.",
        receivedCondition: "Máy có trầy nhẹ ở cạnh viền. Đã nhận kèm ốp lưng.",
        diagnosis: "Màn hình có dấu hiệu lỗi tấm nền; các chức năng khác hoạt động bình thường.",
        publicNote: "Dữ liệu cá nhân trên thiết bị không được truy cập trong quá trình kiểm tra.",
        status: "in_progress",
        quote: { status: "pending", updatedAt: "2026-11-16T14:35:00+07:00", lines: [{ label: "Thay cụm màn hình", partsCost: 1850000, laborCost: 250000 }] },
        history: [
          { at: "2026-11-15T09:20:00+07:00", title: "Đã tiếp nhận thiết bị", note: "Kiểm tra ngoại quan và ghi nhận tình trạng ban đầu." },
          { at: "2026-11-16T14:35:00+07:00", title: "Đã kiểm tra và gửi báo giá", note: "Báo giá đang chờ bạn xác nhận." },
        ],
      },
      {
        id: "device-2", name: "Máy tính xách tay", brand: "Apple", model: "MacBook Air M1",
        problem: "Pin tụt nhanh, thời lượng sử dụng giảm rõ rệt.",
        receivedCondition: "Vỏ máy nguyên vẹn, có dấu hiệu hao mòn thông thường.",
        diagnosis: "Pin đã chai, cần kiểm tra thêm chu kỳ sạc trước khi đề xuất thay thế.",
        status: "in_progress",
        history: [{ at: "2026-11-15T09:20:00+07:00", title: "Đã tiếp nhận thiết bị" }, { at: "2026-11-17T10:10:00+07:00", title: "Đang kiểm tra pin" }],
      },
    ],
  },
  {
    code: "FP-2026-0142", receivedAt: "2026-11-12T15:05:00+07:00", pickupAt: "2026-11-20", status: "in_progress",
    devices: [{
      id: "device-3", name: "Điện thoại", brand: "Samsung", model: "Galaxy S22", serial: "•••••••9034",
      problem: "Cổng sạc tiếp xúc chập chờn.", receivedCondition: "Mặt kính có vết xước nhỏ, khung máy bình thường.", diagnosis: "Cổng sạc bám bụi và tiếp xúc kém; cần vệ sinh, kiểm tra lại.", status: "in_progress",
      quote: { status: "accepted", updatedAt: "2026-11-13T11:00:00+07:00", lines: [{ label: "Vệ sinh và cân chỉnh cổng sạc", partsCost: 0, laborCost: 180000 }] },
      history: [{ at: "2026-11-12T15:05:00+07:00", title: "Đã tiếp nhận thiết bị" }, { at: "2026-11-13T11:00:00+07:00", title: "Bạn đã xác nhận báo giá" }, { at: "2026-11-14T09:30:00+07:00", title: "Kỹ thuật viên đang xử lý" }],
    }],
  },
  {
    code: "FP-2026-0136", receivedAt: "2026-11-08T10:40:00+07:00", pickupAt: "2026-11-10", status: "delivered",
    devices: [{
      id: "device-4", name: "Máy tính xách tay", brand: "Dell", model: "Inspiron 14", serial: "•••••••1140",
      problem: "Bàn phím một số phím không hoạt động.", receivedCondition: "Không ghi nhận hư hại ngoại quan đáng kể.", diagnosis: "Cáp bàn phím lỏng, đã vệ sinh và kết nối lại.", status: "completed",
      quote: { status: "accepted", updatedAt: "2026-11-08T16:20:00+07:00", lines: [{ label: "Vệ sinh và kết nối lại bàn phím", partsCost: 0, laborCost: 350000 }] },
      finalCost: 350000, paymentStatus: "paid", handedOverAt: "2026-11-10T16:45:00+07:00", handoverNote: "Khách đã kiểm tra bàn phím và nhận đủ phụ kiện.",
      warranty: { period: "30 ngày", expiresAt: "2026-12-10", code: "BH-FP-0136" },
      history: [{ at: "2026-11-08T10:40:00+07:00", title: "Đã tiếp nhận thiết bị" }, { at: "2026-11-08T16:20:00+07:00", title: "Bạn đã xác nhận báo giá" }, { at: "2026-11-09T14:00:00+07:00", title: "Đã hoàn tất sửa chữa" }, { at: "2026-11-10T16:45:00+07:00", title: "Đã bàn giao thiết bị" }],
    }],
  },
  {
    code: "FP-2026-0129", receivedAt: "2026-11-04T13:15:00+07:00", status: "cancelled",
    devices: [{
      id: "device-5", name: "Máy tính bảng", brand: "Apple", model: "iPad Air", problem: "Thiết bị không khởi động.", receivedCondition: "Màn hình còn nguyên vẹn.", status: "cancelled",
      history: [{ at: "2026-11-04T13:15:00+07:00", title: "Đã tiếp nhận thiết bị" }, { at: "2026-11-05T09:20:00+07:00", title: "Phiếu sửa chữa đã hủy" }],
    }],
  },
];

export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

export function formatRepairDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function quoteTotal(device: RepairDevice) {
  return device.quote?.lines.reduce((total, line) => total + line.partsCost + line.laborCost, 0) ?? 0;
}

export function confirmedCost(repair: RepairRecord) {
  return repair.devices.reduce((total, device) => total + (device.quote?.status === "accepted" ? (device.finalCost ?? quoteTotal(device)) : 0), 0);
}
