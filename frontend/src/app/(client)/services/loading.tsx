import { Container } from "@/components/layout/Container";

export default function ServicesLoading() {
  return (
    <Container className="animate-pulse py-12 md:py-16" aria-label="Đang tải nội dung dịch vụ">
      <div className="mb-12 max-w-2xl space-y-4">
        <div className="h-10 w-56 rounded bg-muted" />
        <div className="h-5 max-w-xl rounded bg-muted" />
      </div>
      {[0, 1].map((group) => (
        <section key={group} className="mb-12">
          <div className="mb-6 h-7 w-64 rounded bg-muted" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((card) => <div key={card} className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-[16/9] bg-muted" />
              <div className="space-y-3 p-5"><div className="h-5 w-3/4 rounded bg-muted" /><div className="h-4 rounded bg-muted" /><div className="h-4 w-2/3 rounded bg-muted" /></div>
            </div>)}
          </div>
        </section>
      ))}
    </Container>
  );
}
