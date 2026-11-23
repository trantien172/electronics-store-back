import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@base-ui/react"
export default function CTA() {
  return (
    <section>
      <Container className="py-16 md:py-20">
      <div
        className="relative overflow-hidden rounded-2xl bg-surface-dark px-6 py-12 text-center text-white md:px-12 md:py-16"
      >
        <div
          className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary-200/10"
        />

        <h2 className="relative mb-3 text-2xl font-medium md:text-3xl">
          Thiết bị đang gặp vấn đề?
        </h2>
        <p className="relative mx-auto mb-8 max-w-lg text-base text-neutral-200">
          Đặt lịch ngay để được kỹ thuật viên kiểm tra và báo giá miễn phí trong vòng 30 phút.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
          <Button render={<Link href="/booking" />} nativeButton={false} className="h-12 px-7 text-base">
            Đặt lịch ngay
            <ArrowRight size={18} />
          </Button>
          <a href="tel:0912345678" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-surface-dark2 bg-transparent px-7 text-base font-medium text-white transition-colors hover:bg-white/10">
            <Phone size={18} />
            0912 345 678
          </a>
        </div>
      </div>
      </Container>
    </section>
  );
}
