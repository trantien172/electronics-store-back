import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FeaturedServices } from "./FeaturedServices";
import { ServicesBrowser } from "./ServicesBrowser";
import { serviceArticles } from "./service-articles";

export default function ServicesPage() {
  return (
    <div className="pb-20">
      <div className="border-b border-border bg-card">
        <Container className="py-5">
          <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="min-h-11 inline-flex items-center hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="size-4" />
            <span aria-current="page" className="font-medium text-foreground">Dịch vụ</span>
          </nav>
        </Container>
      </div>

      <Container className="pt-12 md:pt-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Dịch vụ</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Tìm hiểu các dịch vụ, hướng dẫn kỹ thuật và thông tin hữu ích từ FixPro.
          </p>
        </header>
        <FeaturedServices />
        <ServicesBrowser articles={serviceArticles} />
      </Container>
    </div>
  );
}
