"use client";

import Link from "next/link";

type ServicesErrorProps = { error: Error & { digest?: string }; reset: () => void };

export default function ServicesError({ reset }: ServicesErrorProps) {
  return (
    <div className="mx-auto flex min-h-[45vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Không tải được nội dung dịch vụ</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Đã xảy ra lỗi khi tải trang. Bạn có thể thử lại hoặc quay về trang chủ.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Thử lại</button>
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold">Trang chủ</Link>
      </div>
    </div>
  );
}
