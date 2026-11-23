import { BatteryCharging, BookOpenText, Laptop, Newspaper, Smartphone, Wrench } from "lucide-react";
import type { ServiceArticle } from "./service-articles";

const iconByType = {
  repair: Smartphone,
  guide: BookOpenText,
  care: Laptop,
  news: Newspaper,
} satisfies Record<ServiceArticle["icon"], typeof Smartphone>;

export function ArticleCover({ article, compact = false }: { article: ServiceArticle; compact?: boolean }) {
  const Icon = iconByType[article.icon];

  if (article.coverUrl) {
    return <div className={`service-cover ${compact ? "service-cover--compact" : ""}`}><img src={article.coverUrl} alt={article.title} className="size-full object-cover" /></div>;
  }

  return (
    <div className={`service-cover ${article.coverClass} ${compact ? "service-cover--compact" : ""}`} aria-hidden="true">
      <div className="service-cover__glow" />
      <div className="service-cover__device"><Icon className="size-12 md:size-16" strokeWidth={1.2} /></div>
      <div className="service-cover__mark"><Wrench className="size-4" /> FIXPRO</div>
      <BatteryCharging className="service-cover__detail" />
    </div>
  );
}
