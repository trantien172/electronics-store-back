export type ProductKind = "part" | "used";
export type ProductCondition = "new" | "used" | "good" | "worn" | "functional";

export type Product = {
  id: number;
  thumbnailUrl?: string;
  createdAt?: string;
  kind: ProductKind;
  name: string;
  model: string;
  brand: string;
  category: string;
  deviceType: string;
  sellingPrice: number;
  quantity: number;
  warrantyMonths: number;
  manufactureYear: number;
  condition: string;
  conditions: ProductCondition[];
  description: string;
  shortDescription: string;
  features: string[];
  specifications: { parameter: string; value: string; unit?: string }[];
  status: "available" | "sold";
  bookable?: boolean;
};

// Sample catalog for reviewing the storefront before the product API has data.
// All values in this file are illustrative and must not be treated as inventory facts.
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1, kind: "part", name: "Pin iPhone 13 dung lượng chuẩn", model: "IP13-BAT", brand: "FixPro Parts", category: "Linh kiện", deviceType: "Điện thoại",
    sellingPrice: 450000, quantity: 12, warrantyMonths: 6, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Pin thay thế cho iPhone 13, có hỗ trợ lắp đặt tại cửa hàng.",
    description: "Pin thay thế dung lượng ổn định, phù hợp cho iPhone 13. Sản phẩm được kiểm tra trước khi giao và hỗ trợ lắp đặt tại cửa hàng.",
    features: ["Tương thích iPhone 13", "Bảo hành 6 tháng", "Kiểm tra trước khi lắp"],
    specifications: [{ parameter: "Mã tương thích", value: "A2633 / A2482" }, { parameter: "Bảo hành", value: "6", unit: "tháng" }],
  },
  {
    id: 2, kind: "part", name: "Củ sạc nhanh USB-C 20W", model: "PD20W-C", brand: "Anker", category: "Phụ kiện", deviceType: "Điện thoại",
    sellingPrice: 390000, quantity: 25, warrantyMonths: 12, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Củ sạc USB-C nhỏ gọn hỗ trợ Power Delivery.",
    description: "Củ sạc USB-C nhỏ gọn, hỗ trợ sạc nhanh Power Delivery cho điện thoại và thiết bị tương thích.",
    features: ["Công suất tối đa 20W", "Cổng USB-C", "Bảo hành 12 tháng"],
    specifications: [{ parameter: "Công suất", value: "20", unit: "W" }, { parameter: "Cổng ra", value: "USB-C" }],
  },
  {
    id: 3, kind: "part", name: "Màn hình thay thế Samsung Galaxy A52", model: "SM-A525F-DIS", brand: "FixPro Parts", category: "Linh kiện", deviceType: "Điện thoại",
    sellingPrice: 1250000, quantity: 4, warrantyMonths: 3, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Cụm màn hình thay thế, cần xác nhận phiên bản máy trước khi đặt.",
    description: "Cụm màn hình thay thế cho Samsung Galaxy A52. Vui lòng liên hệ kỹ thuật viên để xác nhận đúng phiên bản máy trước khi đặt.",
    features: ["Dành cho Galaxy A52", "Kiểm tra tương thích trước khi thay", "Bảo hành 3 tháng"],
    specifications: [{ parameter: "Mã máy tương thích", value: "SM-A525F" }, { parameter: "Bảo hành", value: "3", unit: "tháng" }],
  },
  {
    id: 4, kind: "part", name: "Tai nghe Bluetooth chụp tai FX-200", model: "FX-200", brand: "FixPro Audio", category: "Phụ kiện", deviceType: "Âm thanh",
    sellingPrice: 690000, quantity: 8, warrantyMonths: 12, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Tai nghe không dây đệm tai êm, có thể gập gọn.",
    description: "Tai nghe không dây đệm tai êm, phù hợp nghe nhạc và học tập hằng ngày. Có thể gập gọn để mang theo.",
    features: ["Kết nối Bluetooth", "Đệm tai êm, có thể gập gọn", "Bảo hành 12 tháng"],
    specifications: [{ parameter: "Kết nối", value: "Bluetooth" }, { parameter: "Bảo hành", value: "12", unit: "tháng" }],
  },
  {
    id: 5, kind: "part", name: "Cáp sạc USB-C to USB-C 1m", model: "C-C-100", brand: "Baseus", category: "Phụ kiện", deviceType: "Điện thoại",
    sellingPrice: 150000, quantity: 31, warrantyMonths: 6, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Cáp USB-C dài 1 mét dùng để sạc và truyền dữ liệu.",
    description: "Cáp USB-C dài 1 mét dùng để sạc và truyền dữ liệu với các thiết bị có cổng USB-C.",
    features: ["Chiều dài 1 mét", "Đầu nối USB-C hai đầu", "Bảo hành 6 tháng"],
    specifications: [{ parameter: "Chiều dài", value: "1", unit: "m" }, { parameter: "Đầu nối", value: "USB-C to USB-C" }],
  },
  {
    id: 6, kind: "part", name: "Ổ cứng SSD 500GB SATA", model: "BX500-500", brand: "Crucial", category: "Linh kiện", deviceType: "Máy tính",
    sellingPrice: 990000, quantity: 6, warrantyMonths: 36, manufactureYear: 2025, condition: "Mới", conditions: ["new"], status: "available", bookable: false,
    shortDescription: "Ổ SSD SATA 2.5 inch để nâng cấp máy tính tương thích.",
    description: "Ổ cứng SSD SATA 2.5 inch để nâng cấp máy tính bàn hoặc laptop có hỗ trợ chuẩn SATA.",
    features: ["Dung lượng 500GB", "Chuẩn SATA 2.5 inch", "Bảo hành 36 tháng"],
    specifications: [{ parameter: "Dung lượng", value: "500", unit: "GB" }, { parameter: "Chuẩn", value: "SATA 2.5 inch" }],
  },
  {
    id: 101, kind: "used", name: "iPhone 12 128GB", model: "A2403", brand: "Apple", category: "Máy cũ", deviceType: "Điện thoại",
    sellingPrice: 5990000, quantity: 1, warrantyMonths: 3, manufactureYear: 2020, condition: "Đã qua sử dụng · Ngoại hình đẹp", conditions: ["used", "good", "functional"], status: "available", bookable: true,
    shortDescription: "Máy đã qua sử dụng, minh họa tình trạng ngoại hình đẹp.",
    description: "Đây là dữ liệu minh họa cho một máy cũ đơn chiếc. Tình trạng, phụ kiện đi kèm và khả năng xem máy cần được cửa hàng xác nhận trước khi giao dịch.",
    features: ["Máy cũ · dữ liệu minh họa", "Có thể đặt lịch xem khi còn khả dụng"],
    specifications: [{ parameter: "Dung lượng", value: "128", unit: "GB" }, { parameter: "Năm sản xuất", value: "2020" }],
  },
  {
    id: 102, kind: "used", name: "MacBook Air M1 8GB / 256GB", model: "A2337", brand: "Apple", category: "Máy cũ", deviceType: "Máy tính",
    sellingPrice: 11990000, quantity: 1, warrantyMonths: 1, manufactureYear: 2020, condition: "Đã qua sử dụng · Đầy đủ chức năng", conditions: ["used", "functional"], status: "available", bookable: true,
    shortDescription: "Máy đã qua sử dụng, minh họa trạng thái còn khả dụng.",
    description: "Đây là dữ liệu minh họa cho một máy cũ đơn chiếc. Vui lòng liên hệ để cửa hàng xác nhận tình trạng và lịch xem thực tế.",
    features: ["Máy cũ · dữ liệu minh họa", "Có thể đặt lịch xem khi còn khả dụng"],
    specifications: [{ parameter: "Bộ nhớ", value: "8", unit: "GB" }, { parameter: "Ổ cứng", value: "256", unit: "GB" }],
  },
  {
    id: 103, kind: "used", name: "Samsung Galaxy A52 128GB", model: "SM-A525F", brand: "Samsung", category: "Máy cũ", deviceType: "Điện thoại",
    sellingPrice: 2790000, quantity: 1, warrantyMonths: 1, manufactureYear: 2021, condition: "Đã qua sử dụng · Ngoại hình có trầy xước", conditions: ["used", "worn", "functional"], status: "available", bookable: true,
    shortDescription: "Máy đã qua sử dụng, minh họa trạng thái ngoại hình có trầy xước.",
    description: "Đây là dữ liệu minh họa cho một máy cũ đơn chiếc. Ảnh và mô tả thực tế cần được cập nhật từ cửa hàng trước khi đăng bán.",
    features: ["Máy cũ · dữ liệu minh họa", "Tình trạng cần được cửa hàng xác nhận"],
    specifications: [{ parameter: "Dung lượng", value: "128", unit: "GB" }, { parameter: "Năm sản xuất", value: "2021" }],
  },
];

export const formatProductPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
