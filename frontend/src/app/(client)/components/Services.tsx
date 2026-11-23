import Link from "next/link";
import { Smartphone, Laptop, Tv, Gamepad2, Printer, Wrench, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";

const SERVICES = [
  { icon: Smartphone, title: "Điện thoại", desc: "Thay màn hình, pin, sửa lỗi phần mềm cho mọi hãng." },
  { icon: Laptop, title: "Laptop & PC", desc: "Vệ sinh, nâng cấp RAM/SSD, sửa lỗi nguồn, màn hình." },
  { icon: Tv, title: "Tivi & Màn hình", desc: "Sửa chân đế, mainboard, thay panel chính hãng." },
  { icon: Gamepad2, title: "Thiết bị chơi game", desc: "Sửa máy chơi game, tay cầm, ổ đĩa, lỗi kết nối." },
  { icon: Printer, title: "Máy in & Văn phòng", desc: "Vệ sinh đầu phun, thay mực, sửa lỗi kết nối mạng." },
  { icon: Wrench, title: "Sửa chữa khác", desc: "Đem thiết bị đến, chúng tôi kiểm tra & báo giá miễn phí." },
];

export default function Services() {
  return (
    <section>
      <Container className="py-16 md:py-20">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="mb-3 text-2xl font-medium text-neutral-900 md:text-3xl">
          Dịch vụ sửa chữa
        </h2>
        <p className="mx-auto max-w-xl text-base text-neutral-600">
          Đa dạng dịch vụ cho mọi loại thiết bị điện tử, kiểm tra miễn phí trước khi sửa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {SERVICES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="transition-shadow hover:shadow-md">
            <CardContent>
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary-50"
            >
              <Icon size={22} className="text-primary-400" />
            </div>
            <h3 className="mb-1.5 text-base font-medium text-neutral-900">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              {desc}
            </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-600"
        >
          Xem tất cả dịch vụ
          <ArrowRight size={16} />
        </Link>
      </div>
      </Container>
    </section>
  );
}
