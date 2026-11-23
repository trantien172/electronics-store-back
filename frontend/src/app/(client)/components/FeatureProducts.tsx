"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DEMO_PRODUCTS, formatProductPrice } from "../products/products.data";
import { ProductArtwork } from "../products/components/ProductArtwork";
import { productFavoriteKey, useFavorites } from "@/hooks/useFavorites";

export default function FeaturedProducts() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const products = DEMO_PRODUCTS.slice(0, 4);

  return (
    <section className="bg-surface-muted">
      <Container className="py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div><h2 className="mb-3 text-2xl font-medium text-neutral-900 md:text-3xl">Sản phẩm nổi bật</h2><p className="text-base text-neutral-600">Linh kiện và phụ kiện tại FixPro.</p></div>
          <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-600">Xem tất cả<ArrowRight size={16} /></Link>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((product) => {
            const href = product.kind === "used" ? `/products/old/${product.id}` : `/products/${product.id}`;
            const favoriteKey = productFavoriteKey(product.kind, product.id);
            const favorite = isFavorite(favoriteKey);
            return <Card key={`${product.kind}-${product.id}`} className="relative overflow-hidden">
              <Link href={href} className="block rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ProductArtwork product={product} className="m-3 aspect-square" />
                <CardContent><Badge variant="secondary" className="mb-2">{product.category}</Badge><h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug text-neutral-900">{product.name}</h3><p className="mt-3 font-semibold text-primary-600">{product.sellingPrice ? formatProductPrice(product.sellingPrice) : "Liên hệ"}</p></CardContent>
              </Link>
              <button type="button" onClick={() => toggleFavorite(favoriteKey)} aria-pressed={favorite} aria-label={favorite ? "Bỏ khỏi danh sách quan tâm" : "Thêm vào danh sách quan tâm"} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm hover:text-danger"><Heart className={`size-5 ${favorite ? "fill-danger text-danger" : ""}`} /></button>
              <div className="px-4 pb-4"><Button render={<Link href={href} />} nativeButton={false} variant="outline" className="w-full">Xem chi tiết</Button></div>
            </Card>;
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Dữ liệu mô phỏng trong bản xem trước.</p>
      </Container>
    </section>
  );
}
