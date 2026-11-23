"use client";

import Link from "next/link";
import { ArrowUpRight, RefreshCw, Wrench } from "lucide-react";
import { useCategory } from "@/hooks/useCategory";

type FeaturedService = { id: number; name: string; description?: string | null; usageCount?: number; categoryName: string };

export function FeaturedServices() {
  const { data: categories, isPending, isError, refetch } = useCategory();
  const serviceById = new Map<number, FeaturedService>();
  for (const category of categories ?? []) {
    for (const service of category.services ?? []) {
      if (!serviceById.has(service.id)) serviceById.set(service.id, { ...service, categoryName: category.name });
    }
  }
  const services = [...serviceById.values()]
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, 5);
  const hasUsageRanking = services.some((service) => typeof service.usageCount === "number");

  return (
    <section aria-labelledby="featured-services" className="mb-16 md:mb-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">FixPro · Chăm sóc thiết bị</p>
          <h2 id="featured-services" className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{hasUsageRanking ? "Dịch vụ được sử dụng nhiều" : "Dịch vụ tại FixPro"}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{hasUsageRanking ? "Năm dịch vụ có lượt sử dụng cao nhất tại FixPro." : "Khám phá các dịch vụ sửa chữa và hỗ trợ thiết bị tại cửa hàng."}</p>
        </div>
        <Link href="/#booking" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800">Đặt dịch vụ <ArrowUpRight className="size-4" /></Link>
      </div>

      {isPending ? <div className="grid min-h-[26rem] animate-pulse gap-4 lg:grid-cols-10" aria-label="Đang tải dịch vụ">
        <div className="rounded-2xl bg-muted lg:col-span-6" />
        <div className="grid gap-3 lg:col-span-4">{[0, 1, 2, 3].map((item) => <div key={item} className="rounded-xl bg-muted" />)}</div>
      </div> : isError ? <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Không tải được danh sách dịch vụ.</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium"><RefreshCw className="size-4" /> Thử lại</button>
      </div> : services.length === 0 ? <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Dịch vụ đang được cập nhật.</div> : (
        <div className="grid gap-4 lg:min-h-[26rem] lg:grid-cols-10">
          {services[0] && <Link href="/#booking" className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-2xl bg-surface-dark p-6 text-neutral-50 outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-9 lg:col-span-6">
            <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-primary-200/20 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative flex items-start justify-between gap-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral-50"><Wrench className="size-3.5" />{hasUsageRanking ? "#1 · Được sử dụng nhiều nhất" : "Dịch vụ tại FixPro"}</span>
              <ArrowUpRight className="size-5 text-primary-200 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
            <div className="relative mt-12 max-w-xl">
              <p className="text-sm font-medium text-primary-200">{services[0].categoryName}</p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{services[0].name}</h3>
              {services[0].description && <p className="mt-4 max-w-lg text-base leading-7 text-neutral-200">{services[0].description}</p>}
              <span className="mt-7 inline-flex min-h-11 items-center rounded-md bg-primary-200 px-5 text-sm font-semibold text-surface-dark transition-colors group-hover:bg-primary-100">Đặt lịch sửa chữa</span>
            </div>
          </Link>}

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            {services.slice(1).map((service, index) => <Link key={service.id} href="/#booking" className="group flex min-h-24 items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary-200 hover:bg-accent/50">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Wrench className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">{service.categoryName}{typeof service.usageCount === "number" ? ` · ${service.usageCount} lượt` : ""}</span>
                <span className="mt-1 block font-semibold leading-snug group-hover:text-primary-600">{service.name}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>)}
          </div>
        </div>
      )}
    </section>
  );
}
