import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, PhoneCall } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { RepairRequestModal } from "../../components/RepairRequestModal";
import { ArticleCover } from "../ArticleCover";
import { getServiceArticle, serviceArticles, type ServiceArticle } from "../service-articles";

type ServiceArticlePageProps = { params: Promise<{ slug: string }> };

type ArticleContentBlock = NonNullable<ServiceArticle["sections"][number]["content"]>[number];

function ArticleContent({ block }: { block: ArticleContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-base leading-8 text-muted-foreground">{block.text}</p>;
    case "list":
      return <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "link":
      return block.href.startsWith("/")
        ? <Link href={block.href} className="font-medium text-primary-600 underline underline-offset-4">{block.label}</Link>
        : <a href={block.href} className="font-medium text-primary-600 underline underline-offset-4">{block.label}</a>;
    case "image":
      return <figure className="overflow-hidden rounded-xl bg-muted"><img src={block.src} alt={block.alt} className="h-auto max-h-[36rem] w-full object-contain" /></figure>;
    case "video":
      return <video controls preload="metadata" aria-label={block.title} className="w-full rounded-xl bg-black"><source src={block.src} />Trình duyệt không thể phát video này.</video>;
    default:
      return null;
  }
}

export function generateStaticParams() {
  return serviceArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ServiceArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getServiceArticle(slug);
  if (!article) return { title: "Không tìm thấy bài viết | FixPro" };
  return {
    title: article.seoTitle || `${article.title} | FixPro`,
    description: article.metaDescription || article.excerpt,
  };
}

export default async function ServiceArticlePage({ params }: ServiceArticlePageProps) {
  const { slug } = await params;
  const article = getServiceArticle(slug);
  if (!article) notFound();

  const relatedProducts = article.relatedProducts?.filter((item) => item.available) ?? [];
  const relatedServices = article.relatedServices?.filter((item) => item.available) ?? [];
  const sidebarItems = [
    ...relatedProducts.map((item) => ({ ...item, kind: "Sản phẩm" as const, href: `/products/${item.id}` })),
    ...relatedServices.map((item) => ({ ...item, kind: "Dịch vụ" as const, href: item.href ?? "/#booking" })),
  ];

  return (
    <div className="pb-20">
      <div className="border-b border-border bg-card">
        <Container className="py-5">
          <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="min-h-11 inline-flex items-center hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="size-4" />
            <Link href="/services" className="min-h-11 inline-flex items-center hover:text-foreground">Dịch vụ</Link>
            <ChevronRight className="size-4" />
            <span aria-current="page" className="max-w-56 truncate font-medium text-foreground">{article.title}</span>
          </nav>
        </Container>
      </div>

      <Container className="pt-8 md:pt-12">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <article className="min-w-0">
          <Link href="/services" className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Tất cả bài viết
          </Link>

          <header className="mb-8">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{article.category}</span>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{article.publishedAt}</span>
            </div>
          </header>

          <ArticleCover article={article} />

          <div className="mx-auto mt-9 max-w-3xl">
            <p className="border-l-4 border-primary-200 pl-5 text-lg font-medium leading-8 text-foreground">{article.intro}</p>
            <div className="article-prose mt-8 space-y-9">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
                  {section.content ? <div className="mt-4 space-y-4">{section.content.map((block, index) => <ArticleContent key={`${block.type}-${index}`} block={block} />)}</div> : <>
                    {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-8 text-muted-foreground">{paragraph}</p>)}
                    {section.bullets && <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  </>}
                </section>
              ))}
            </div>

          </div>
          {article.category === "Dịch vụ sửa chữa" && article.bookingPrefill && <section className="mt-10 rounded-2xl bg-surface-dark p-6 text-neutral-50 md:p-8" aria-labelledby="repair-request-title">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-200">FixPro hỗ trợ bạn</p>
            <h2 id="repair-request-title" className="mt-2 text-2xl font-semibold">Bạn cần sử dụng dịch vụ này?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-200">Mở form ngay tại đây; thông tin ban đầu được lấy từ bài viết để bạn kiểm tra trước khi gửi.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <RepairRequestModal initialValues={{ ...article.bookingPrefill, description: `${article.title}: ${article.excerpt}` }} />
              <a href="tel:0866840075" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold text-neutral-50 transition-colors hover:bg-white/10">
                <PhoneCall className="size-4" /> Liên hệ trực tiếp
              </a>
            </div>
          </section>}
        </article>

        {sidebarItems.length > 0 && <aside aria-labelledby="related-items" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Tham khảo thêm</p>
            <h2 id="related-items" className="mt-2 text-xl font-semibold">Sản phẩm & dịch vụ liên quan</h2>
            <div className="mt-5 space-y-3">
              {sidebarItems.map((item) => item.kind === "Sản phẩm" ? (
                <Link key={`${item.kind}-${item.id}`} href={item.href} className="group relative isolate flex min-h-52 flex-col justify-end overflow-hidden rounded-xl bg-surface-dark p-4 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url("${item.imageUrl || article.coverUrl || "/images/services/phone-repair.svg"}")` }} />
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/55 to-black/5" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-100">{item.kind}</span>
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">{item.name}</h3>
                  {item.description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/80">{item.description}</p>}
                </Link>
              ) : (
                <Link key={`${item.kind}-${item.id}`} href={item.href} className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary-200 hover:bg-accent/30">
                  <div aria-hidden="true" className="size-20 shrink-0 overflow-hidden rounded-lg bg-surface-dark bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl || article.coverUrl || "/images/services/workshop-process.svg"}")` }} />
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-primary-600">{item.kind}</span>
                    <span className="mt-1 block font-semibold leading-snug group-hover:text-primary-600">{item.name}</span>
                    {item.description && <span className="mt-1 line-clamp-2 block text-sm leading-5 text-muted-foreground">{item.description}</span>}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
            <Link href="/services" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600">Tất cả bài viết <ArrowRight className="size-4" /></Link>
          </div>
        </aside>}
        </div>
      </Container>
    </div>
  );
}
