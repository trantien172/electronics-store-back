"use client";

import Link from "next/link";

type ArticleErrorProps = { error: Error & { digest?: string }; reset: () => void };

export default function ArticleError({ reset }: ArticleErrorProps) {
  return (
    <div className="mx-auto flex min-h-[45vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Không tải được bài viết</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Bạn có thể thử tải lại nội dung hoặc quay về danh sách Dịch vụ.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Thử lại</button>
        <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold">Danh sách Dịch vụ</Link>
      </div>
    </div>
  );
}
