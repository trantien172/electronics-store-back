import { Container } from "@/components/layout/Container";

export default function ArticleLoading() {
  return (
    <Container className="animate-pulse py-10 md:py-12" aria-label="Đang tải bài viết">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-7 h-11 w-40 rounded bg-muted" />
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="mt-5 h-12 max-w-3xl rounded bg-muted" />
          <div className="mt-4 h-5 max-w-2xl rounded bg-muted" />
          <div className="mt-8 aspect-[16/8] rounded-xl bg-muted" />
          <div className="mx-auto mt-9 max-w-3xl space-y-4">
            <div className="h-6 rounded bg-muted" />
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        </div>
        <aside className="hidden rounded-2xl border border-border p-6 lg:block">
          <div className="h-6 w-3/4 rounded bg-muted" />
          {[0, 1, 2, 3].map((item) => <div key={item} className="mt-5 h-28 rounded-xl bg-muted" />)}
        </aside>
      </div>
    </Container>
  );
}
