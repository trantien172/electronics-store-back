"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { ServiceArticle } from "./service-articles";

const SERVICE_BATCH_SIZE = 3;
const POST_PAGE_SIZE = 3;
const SERVICE_ARTICLE_TYPE = "Dịch vụ sửa chữa";

function publicationTime(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function publicationDate(value: string) {
  const [day, month, year] = value.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function ArticleRow({ article }: { article: ServiceArticle }) {
  return (
    <Link href={`/services/${article.slug}`} className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-primary-200 group-hover:bg-accent/20">
        <div className="flex flex-col sm:min-h-44 sm:flex-row">
          <div className="aspect-[16/9] shrink-0 overflow-hidden bg-muted sm:h-44 sm:aspect-auto sm:w-56">
            {article.coverUrl ? <img src={article.coverUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="flex size-full min-h-40 items-center justify-center bg-surface-dark text-lg font-semibold tracking-widest text-primary-200">FIXPRO</div>}
          </div>
          <CardContent className="flex min-w-0 flex-1 flex-col justify-center p-5 md:px-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">{article.category}</span>
              <time dateTime={publicationDate(article.publishedAt)}>{article.publishedAt}</time>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight group-hover:text-primary-600 md:text-xl">{article.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
            <span className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600">Đọc bài viết <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function ServicesBrowser({ articles }: { articles: ServiceArticle[] }) {
  const [search, setSearch] = useState("");
  const [deviceCategory, setDeviceCategory] = useState("");
  const [contentType, setContentType] = useState("");
  const [serviceCount, setServiceCount] = useState(SERVICE_BATCH_SIZE);
  const [pageByType, setPageByType] = useState<Record<string, number>>({});

  const publicArticles = useMemo(() => articles.filter((article) => article.published && article.showOnServices), [articles]);
  const deviceCategories = useMemo(() => [...new Set(publicArticles.map((article) => article.deviceCategory))].sort((a, b) => a.localeCompare(b, "vi")), [publicArticles]);
  const contentTypes = useMemo(() => [...new Set(publicArticles.map((article) => article.category))].sort((a, b) => a.localeCompare(b, "vi")), [publicArticles]);

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    return publicArticles
      .filter((article) => !normalizedSearch || article.title.toLocaleLowerCase("vi").includes(normalizedSearch))
      .filter((article) => !deviceCategory || article.deviceCategory === deviceCategory)
      .filter((article) => !contentType || article.category === contentType)
      .sort((a, b) => publicationTime(b.publishedAt) - publicationTime(a.publishedAt));
  }, [publicArticles, search, deviceCategory, contentType]);

  const serviceArticles = filteredArticles.filter((article) => article.category === SERVICE_ARTICLE_TYPE);
  const postTypes = [...new Set(filteredArticles.filter((article) => article.category !== SERVICE_ARTICLE_TYPE).map((article) => article.category))];
  const otherArticles = filteredArticles.filter((article) => article.category !== SERVICE_ARTICLE_TYPE);
  const hasFilters = Boolean(search.trim() || deviceCategory || contentType);

  const resetPagination = () => {
    setServiceCount(SERVICE_BATCH_SIZE);
    setPageByType({});
  };
  const resetFilters = () => {
    setSearch("");
    setDeviceCategory("");
    setContentType("");
    resetPagination();
  };

  return (
    <>
      <section aria-label="Tìm kiếm và lọc bài viết" className="mb-12 rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_minmax(180px,230px)_minmax(180px,230px)]">
          <label className="relative block">
            <span className="mb-2 block text-sm font-medium">Tìm bài viết</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-[42px] size-4 text-muted-foreground" />
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPagination(); }} placeholder="Nhập tiêu đề bài viết" className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Danh mục thiết bị</span>
            <select value={deviceCategory} onChange={(event) => { setDeviceCategory(event.target.value); resetPagination(); }} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Tất cả thiết bị</option>
              {deviceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Loại nội dung</span>
            <select value={contentType} onChange={(event) => { setContentType(event.target.value); resetPagination(); }} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Tất cả nội dung</option>
              {contentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground"><SlidersHorizontal aria-hidden="true" className="mr-2 inline size-4" />{filteredArticles.length} bài viết</p>
          {hasFilters && <button type="button" onClick={resetFilters} className="min-h-11 rounded-md px-3 text-sm font-medium text-primary-600 hover:bg-accent">Xóa bộ lọc</button>}
        </div>
      </section>

      {filteredArticles.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">{hasFilters ? "Không tìm thấy bài viết phù hợp" : "Hiện chưa có bài viết"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{hasFilters ? "Thử đổi từ khóa hoặc chọn điều kiện lọc khác." : "Nội dung sẽ được cập nhật tại đây."}</p>
        {hasFilters && <button type="button" onClick={resetFilters} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-medium">Xóa bộ lọc</button>}
      </div> : <div className="space-y-16">
        {serviceArticles.length > 0 && <section aria-labelledby="service-articles-title">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">Hướng dẫn & thông tin dịch vụ</p>
            <h2 id="service-articles-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Bài viết dịch vụ</h2>
            <p className="mt-2 text-sm text-muted-foreground">Thông tin chi tiết về các dịch vụ đang được cung cấp tại FixPro.</p>
          </div>
          <div className="space-y-4">{serviceArticles.slice(0, serviceCount).map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
          {serviceCount < serviceArticles.length && <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-muted-foreground">Đang hiển thị {Math.min(serviceCount, serviceArticles.length)} / {serviceArticles.length} bài viết dịch vụ</p>
            <button type="button" onClick={() => setServiceCount((count) => count + SERVICE_BATCH_SIZE)} className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-accent">Tải thêm bài dịch vụ</button>
          </div>}
        </section>}

        {postTypes.map((type) => {
          const typeArticles = otherArticles.filter((article) => article.category === type);
          const pageCount = Math.ceil(typeArticles.length / POST_PAGE_SIZE);
          const page = Math.min(pageByType[type] ?? 1, pageCount);
          const pageArticles = typeArticles.slice((page - 1) * POST_PAGE_SIZE, page * POST_PAGE_SIZE);
          return <section key={type} aria-labelledby={`posts-${type}`}>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">Bài đăng</p>
              <h2 id={`posts-${type}`} className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{type}</h2>
            </div>
            <div className="space-y-4">{pageArticles.map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
            {pageCount > 1 && <nav aria-label={`Phân trang ${type}`} className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPageByType((current) => ({ ...current, [type]: page - 1 }))} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" /> Trước</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} type="button" aria-current={pageNumber === page ? "page" : undefined} onClick={() => setPageByType((current) => ({ ...current, [type]: pageNumber }))} className={`size-10 rounded-md border text-sm font-medium ${pageNumber === page ? "border-primary-200 bg-primary-200 text-surface-dark" : "border-border bg-card hover:bg-accent"}`}>{pageNumber}</button>)}
              <button type="button" disabled={page === pageCount} onClick={() => setPageByType((current) => ({ ...current, [type]: page + 1 }))} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">Sau <ArrowRight className="size-4" /></button>
            </nav>}
          </section>;
        })}
      </div>}
    </>
  );
}
