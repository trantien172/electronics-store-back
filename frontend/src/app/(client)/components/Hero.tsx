"use client";

import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { RepairRequestForm } from "./RepairRequestForm";

export default function Hero() {
  return (
    <section id="booking" className="bg-fixpro-hero relative overflow-hidden bg-blend-soft-light bg-no-repeat py-4">
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-200/30" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-primary-200/30" />

      <Container className="relative grid items-center gap-10 pt-28 pb-16 md:grid-cols-2 md:gap-12 md:py-20 xl:py-24">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-100/20 bg-primary-900/80 px-3.5 py-1.5 text-xs font-medium text-primary-100 shadow-sm">
            <Star size={12} /> Được hơn 5.000 khách hàng tin chọn
          </span>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            Sửa chữa điện tử<br /><span className="text-primary-200">nhanh chóng &amp; uy tín</span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-7 text-neutral-200 md:text-lg md:leading-8">
            Từ điện thoại, laptop đến thiết bị gia dụng — đội ngũ kỹ thuật viên giàu kinh nghiệm,
            báo giá minh bạch, theo dõi tiến độ sửa chữa theo thời gian thực.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button render={<Link href="/booking" />} nativeButton={false} className="h-12 rounded-lg px-7 text-base font-semibold shadow-lg shadow-black/10">Các dịch vụ <ArrowRight size={18} /></Button>
            <Button render={<Link href="/products" />} nativeButton={false} variant="outline" className="h-12 rounded-lg border-white/25 bg-white/5 px-7 text-neutral-50 backdrop-blur-sm hover:bg-white/10 hover:text-white">Xem sản phẩm</Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {[
              { icon: ShieldCheck, text: "Bảo hành đến 12 tháng" },
              { icon: Clock, text: "Sửa nhanh trong 24h" },
            ].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-2"><Icon size={16} className="text-primary-200" /><span className="text-sm text-neutral-200">{text}</span></div>)}
          </div>
        </div>

        <Card className="relative w-full max-w-xl justify-self-center rounded-2xl border-white/10 bg-surface-dark/85 text-neutral-50 shadow-2xl shadow-black/35 backdrop-blur-xl md:justify-self-end">
          <CardHeader className="border-b border-white/10 px-6 py-5">
            <CardTitle className="text-xl font-semibold tracking-tight text-neutral-50">Sử dụng dịch vụ ngay!</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0"><RepairRequestForm variant="dark" /></CardContent>
        </Card>
      </Container>
    </section>
  );
}
