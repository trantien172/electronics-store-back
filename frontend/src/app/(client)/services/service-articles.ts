export type ServiceArticle = {
  slug: string;
  title: string;
  excerpt: string;
  published: boolean;
  showOnServices: boolean;
  deviceCategory: string;
  category: string;
  publishedAt: string;
  coverUrl?: string;
  seoTitle?: string;
  metaDescription?: string;
  icon: "repair" | "guide" | "care" | "news";
  coverClass: string;
  intro: string;
  bookingPrefill?: { deviceCategory: string; serviceName: string };
  sections: { heading: string; paragraphs: string[]; bullets?: string[]; content?: ({ type: "paragraph"; text: string } | { type: "list"; items: string[] } | { type: "link"; label: string; href: string } | { type: "image"; src: string; alt: string } | { type: "video"; src: string; title: string })[] }[];
  relatedProducts?: { id: number; name: string; imageUrl?: string; description?: string; available: boolean }[];
  relatedServices?: { id: number; name: string; imageUrl?: string; description?: string; href?: string; available: boolean }[];
};

// Editorial fixtures used until the public content API is available.
export const serviceArticles: ServiceArticle[] = [
  {
    slug: "sua-chua-dien-thoai",
    title: "Sửa chữa điện thoại minh bạch, đúng lỗi",
    excerpt: "Quy trình kiểm tra, tư vấn và sửa chữa điện thoại với báo giá rõ ràng trước khi thực hiện.",
    published: true,
    showOnServices: true,
    deviceCategory: "Điện thoại",
    category: "Dịch vụ sửa chữa",
    publishedAt: "12/11/2026",
    coverUrl: "/images/services/phone-repair.svg",
    seoTitle: "Sửa chữa điện thoại minh bạch | FixPro",
    metaDescription: "Quy trình kiểm tra và sửa chữa điện thoại với phương án, chi phí được trao đổi trước khi thực hiện.",
    icon: "repair",
    coverClass: "service-cover--phone",
    intro: "Một chiếc điện thoại gặp sự cố không đồng nghĩa với việc phải thay linh kiện ngay. Tại FixPro, thiết bị được kiểm tra để xác định nguyên nhân, sau đó kỹ thuật viên trao đổi phương án và chi phí trước khi bắt đầu sửa chữa.",
    bookingPrefill: { deviceCategory: "Điện thoại", serviceName: "Sửa chữa điện thoại" },
    sections: [
      { heading: "Bắt đầu từ việc kiểm tra đúng lỗi", paragraphs: [], content: [
        { type: "paragraph", text: "Kỹ thuật viên tiếp nhận mô tả của khách hàng, kiểm tra các biểu hiện thực tế và ghi nhận tình trạng thiết bị. Pin tụt nhanh, màn hình chập chờn hay máy không nhận sạc đều có thể đến từ nhiều nguyên nhân." },
        { type: "paragraph", text: "Nếu kiểm tra xác định pin đã xuống cấp, khách hàng có thể xem linh kiện mẫu được đề cập trong bài:" },
        { type: "link", label: "Pin iPhone 13 dung lượng chuẩn", href: "/products/1" },
        { type: "paragraph", text: "Khách hàng cũng có thể gửi yêu cầu để kỹ thuật viên kiểm tra pin và tư vấn phương án:" },
        { type: "link", label: "Kiểm tra và thay pin điện thoại", href: "/services/kiem-tra-va-thay-pin-dien-thoai" },
        { type: "paragraph", text: "FixPro giải thích phương án xử lý và báo giá trước khi bắt đầu; khách hàng quyết định có tiếp tục sửa hay không." },
      ] },
      { heading: "Theo dõi tình trạng sửa chữa", paragraphs: ["Mỗi yêu cầu được ghi nhận theo mã phiếu để khách hàng có thể tra cứu tiến độ. Khi cần xác nhận phương án hoặc báo giá, khách hàng có thể đăng nhập để xem chi tiết và phản hồi ngay trên website."] },
      { heading: "Thiết bị được kiểm tra lại trước khi bàn giao", paragraphs: ["Sau khi hoàn tất, kỹ thuật viên kiểm tra các chức năng liên quan đến lỗi ban đầu và cập nhật kết quả xử lý. Thông tin bảo hành được cung cấp theo từng dịch vụ và linh kiện thực tế."] },
    ],
    relatedProducts: [
      { id: 1, name: "Pin iPhone 13 dung lượng chuẩn", imageUrl: "/images/services/battery-check.svg", description: "Pin thay thế tương thích iPhone 13, có hỗ trợ lắp đặt.", available: true },
      { id: 2, name: "Củ sạc nhanh USB-C 20W", imageUrl: "/images/services/phone-repair.svg", description: "Phụ kiện sạc USB-C cho thiết bị tương thích.", available: true },
    ],
    relatedServices: [
      { id: 1, name: "Kiểm tra và thay pin điện thoại", imageUrl: "/images/services/battery-check.svg", description: "Kiểm tra pin và trao đổi phương án trước khi sửa.", href: "/services/kiem-tra-va-thay-pin-dien-thoai", available: true },
      { id: 2, name: "Sửa chữa điện thoại", imageUrl: "/images/services/phone-repair.svg", description: "Tiếp nhận và chẩn đoán các lỗi điện thoại.", href: "/services/sua-chua-dien-thoai", available: true },
    ],
  },
  {
    slug: "kiem-tra-va-thay-pin-dien-thoai",
    title: "Kiểm tra và thay pin điện thoại đúng tình trạng",
    excerpt: "Tìm hiểu các bước kiểm tra pin, dấu hiệu cần lưu ý và cách xác nhận máy sau khi thay.",
    published: true,
    showOnServices: true,
    deviceCategory: "Điện thoại",
    category: "Dịch vụ sửa chữa",
    publishedAt: "15/11/2026",
    coverUrl: "/images/services/battery-check.svg",
    icon: "repair",
    coverClass: "service-cover--battery",
    intro: "Thời lượng pin giảm có thể do nhiều nguyên nhân. Kiểm tra tình trạng thiết bị trước giúp xác định có cần thay pin hay nên xử lý vấn đề khác.",
    bookingPrefill: { deviceCategory: "Điện thoại", serviceName: "Kiểm tra và thay pin điện thoại" },
    sections: [
      { heading: "Kiểm tra trước khi thay", paragraphs: ["Kỹ thuật viên trao đổi biểu hiện của máy, kiểm tra tình trạng pin và các yếu tố liên quan như cổng sạc, ứng dụng chạy nền hoặc nhiệt độ khi sử dụng."] },
      { heading: "Thống nhất phương án và chi phí", paragraphs: ["Nếu pin cần thay, khách hàng được thông tin về phương án và chi phí trước khi sửa. Việc thay linh kiện chỉ bắt đầu sau khi khách hàng xác nhận."] },
      { heading: "Kiểm tra lại thiết bị", paragraphs: ["Sau khi thay, máy được kiểm tra sạc và các chức năng liên quan. Thông tin bảo hành được cung cấp theo linh kiện thực tế."] },
    ],
  },
  {
    slug: "sua-chua-laptop-theo-nguyen-nhan",
    title: "Sửa chữa laptop sau khi xác định nguyên nhân",
    excerpt: "Quy trình kiểm tra laptop gặp lỗi nguồn, màn hình hoặc hiệu năng trước khi tiến hành sửa chữa.",
    published: true,
    showOnServices: true,
    deviceCategory: "Laptop",
    category: "Dịch vụ sửa chữa",
    publishedAt: "14/11/2026",
    coverUrl: "/images/services/laptop-care.svg",
    icon: "repair",
    coverClass: "service-cover--laptop",
    intro: "Một biểu hiện lỗi có thể liên quan đến nhiều bộ phận. FixPro kiểm tra thiết bị và trao đổi phương án trước khi thực hiện sửa chữa.",
    bookingPrefill: { deviceCategory: "Laptop", serviceName: "Sửa chữa laptop" },
    sections: [
      { heading: "Ghi nhận lỗi và tình trạng máy", paragraphs: ["Kỹ thuật viên ghi nhận mô tả lỗi, phụ kiện đi kèm và tình trạng bên ngoài của thiết bị khi tiếp nhận."] },
      { heading: "Báo phương án trước khi sửa", paragraphs: ["Sau khi kiểm tra, khách hàng được thông tin về nguyên nhân dự kiến, phương án xử lý và chi phí để quyết định có tiếp tục hay không."] },
      { heading: "Kiểm tra trước khi bàn giao", paragraphs: ["Laptop được kiểm tra lại theo hạng mục đã thống nhất. Khách hàng nhận thông tin kết quả và điều kiện bảo hành khi nhận máy."] },
    ],
  },
  {
    slug: "sua-chua-may-tinh-bang",
    title: "Dịch vụ kiểm tra và sửa chữa máy tính bảng",
    excerpt: "Tiếp nhận máy tính bảng gặp vấn đề về màn hình, pin, sạc hoặc phần mềm với quy trình rõ ràng.",
    published: true,
    showOnServices: true,
    deviceCategory: "Máy tính bảng",
    category: "Dịch vụ sửa chữa",
    publishedAt: "13/11/2026",
    coverUrl: "/images/services/phone-repair.svg",
    icon: "repair",
    coverClass: "service-cover--phone",
    intro: "FixPro kiểm tra máy tính bảng theo tình trạng thực tế, giải thích phương án sửa và chỉ thực hiện sau khi khách hàng đồng ý.",
    bookingPrefill: { deviceCategory: "Máy tính bảng", serviceName: "Sửa chữa máy tính bảng" },
    sections: [
      { heading: "Kiểm tra biểu hiện và chức năng", paragraphs: ["Kỹ thuật viên ghi nhận lỗi, kiểm tra các chức năng liên quan và trao đổi thêm khi cần xác nhận thông tin từ khách hàng."] },
      { heading: "Minh bạch phương án sửa chữa", paragraphs: ["Phương án và chi phí được trao đổi trước. Nếu khách hàng chưa đồng ý sửa, thiết bị không được thay linh kiện."] },
      { heading: "Bàn giao sau khi kiểm tra", paragraphs: ["Sau khi hoàn tất, thiết bị được kiểm tra theo lỗi ban đầu và bàn giao kèm thông tin kết quả xử lý."] },
    ],
  },
  {
    slug: "bao-duong-laptop-dinh-ky",
    title: "Bảo dưỡng laptop định kỳ để máy hoạt động ổn định",
    excerpt: "Khi nào nên vệ sinh laptop, các dấu hiệu cần chú ý và những bước kiểm tra thường gặp.",
    published: true,
    showOnServices: true,
    deviceCategory: "Laptop",
    category: "Kiến thức kỹ thuật",
    publishedAt: "08/11/2026",
    coverUrl: "/images/services/laptop-care.svg",
    icon: "care",
    coverClass: "service-cover--laptop",
    intro: "Laptop nóng bất thường, quạt chạy ồn hoặc hiệu năng giảm có thể là dấu hiệu thiết bị cần được kiểm tra và bảo dưỡng.",
    sections: [
      { heading: "Dấu hiệu nên kiểm tra laptop", paragraphs: [], content: [
        { type: "paragraph", text: "Nếu máy nóng lên nhanh, tự tắt khi tải nặng hoặc quạt phát tiếng ồn kéo dài, bụi bẩn và hệ thống tản nhiệt có thể cần được kiểm tra. Hiệu năng chậm cũng có thể đến từ phần mềm hoặc ổ lưu trữ, không chỉ do nhiệt độ." },
        { type: "paragraph", text: "Khi cần nâng cấp ổ lưu trữ, bài viết có đề cập đến sản phẩm mẫu sau:" },
        { type: "link", label: "Ổ cứng SSD 500GB SATA", href: "/products/6" },
        { type: "paragraph", text: "Bạn có thể gửi yêu cầu để được kiểm tra hệ thống tản nhiệt và tình trạng laptop:" },
        { type: "link", label: "Bảo dưỡng laptop định kỳ", href: "/services/bao-duong-laptop-dinh-ky" },
      ] },
      { heading: "Bảo dưỡng gồm những gì?", paragraphs: ["Tùy tình trạng thiết bị, kỹ thuật viên có thể kiểm tra quạt, khe tản nhiệt, ổ lưu trữ và tình trạng pin. Mọi thao tác được trao đổi trước với khách hàng để lựa chọn phương án phù hợp."] },
      { heading: "Sao lưu dữ liệu trước khi mang máy đến", paragraphs: ["Bạn nên sao lưu các tệp quan trọng trước khi gửi thiết bị đi kiểm tra. Không cung cấp mật khẩu cá nhân nếu không cần thiết cho hạng mục sửa chữa đã thống nhất."] },
    ],
    relatedProducts: [
      { id: 6, name: "Ổ cứng SSD 500GB SATA", imageUrl: "/images/services/laptop-care.svg", description: "Ổ SSD SATA 2.5 inch để nâng cấp máy tương thích.", available: true },
      { id: 5, name: "Cáp sạc USB-C to USB-C 1m", imageUrl: "/images/services/laptop-care.svg", description: "Cáp USB-C dùng với các thiết bị tương thích.", available: true },
    ],
    relatedServices: [
      { id: 3, name: "Bảo dưỡng laptop định kỳ", imageUrl: "/images/services/laptop-care.svg", description: "Kiểm tra hệ thống tản nhiệt và tình trạng máy.", href: "/services/bao-duong-laptop-dinh-ky", available: true },
      { id: 4, name: "Nâng cấp laptop", imageUrl: "/images/services/laptop-care.svg", description: "Tư vấn linh kiện tương thích trước khi nâng cấp.", href: "/#booking", available: true },
    ],
  },
  {
    slug: "cach-nhan-biet-pin-dien-thoai-can-thay",
    title: "Những dấu hiệu pin điện thoại cần được kiểm tra",
    excerpt: "Pin giảm nhanh, máy nóng hoặc tự tắt nguồn: đâu là lúc nên mang điện thoại đi kiểm tra?",
    published: true,
    showOnServices: true,
    deviceCategory: "Điện thoại",
    category: "Hướng dẫn sử dụng",
    publishedAt: "02/11/2026",
    coverUrl: "/images/services/battery-check.svg",
    icon: "guide",
    coverClass: "service-cover--battery",
    intro: "Thời lượng sử dụng giảm theo thời gian là điều bình thường. Tuy vậy, một số biểu hiện có thể cho thấy pin hoặc bộ phận liên quan cần được kiểm tra.",
    sections: [
      { heading: "Không chỉ nhìn vào phần trăm pin", paragraphs: ["Máy tụt pin nhanh có thể do ứng dụng chạy nền, kết nối mạng kém, nhiệt độ môi trường hoặc pin đã xuống cấp. Hãy quan sát tình trạng trong vài ngày và kiểm tra lịch sử sử dụng pin trước khi kết luận."] },
      { heading: "Khi nào nên dừng sử dụng?", paragraphs: ["Nếu pin phồng, màn hình bị đội lên hoặc thiết bị nóng bất thường khi không sử dụng, hãy tắt máy và mang đến nơi sửa chữa để được kiểm tra. Không tự chọc, ép hoặc tháo pin tại nhà."] },
    ],
  },
  {
    slug: "quy-trinh-tiep-nhan-thiet-bi-tai-fixpro",
    title: "Quy trình tiếp nhận thiết bị tại FixPro",
    excerpt: "Từ lúc ghi nhận yêu cầu đến khi bàn giao, khách hàng có thể theo dõi những thông tin nào?",
    published: true,
    showOnServices: true,
    deviceCategory: "Thiết bị chung",
    category: "Tin tức FixPro",
    publishedAt: "28/10/2026",
    coverUrl: "/images/services/workshop-process.svg",
    icon: "news",
    coverClass: "service-cover--workshop",
    intro: "FixPro xây dựng quy trình tiếp nhận theo từng bước để khách hàng nắm được tình trạng thiết bị và phương án xử lý.",
    sections: [
      { heading: "Ghi nhận tình trạng ban đầu", paragraphs: ["Thông tin thiết bị, mô tả lỗi và phụ kiện đi kèm được ghi nhận khi tiếp nhận. Khách hàng nhận mã phiếu để tra cứu các cập nhật tiếp theo."] },
      { heading: "Trao đổi phương án trước khi sửa", paragraphs: ["Sau khi kiểm tra, FixPro thông báo phương án và báo giá. Với phiếu cần khách hàng xác nhận, khách có thể đăng nhập và phản hồi trên chi tiết phiếu sửa chữa."] },
      { heading: "Kiểm tra và bàn giao", paragraphs: ["Thiết bị được kiểm tra lại theo hạng mục sửa chữa trước khi bàn giao. Thông tin về kết quả và bảo hành được cung cấp cùng phiếu."] },
    ],
  },
];

export function getServiceArticle(slug: string) {
  return serviceArticles.find((article) => article.slug === slug && article.published);
}
