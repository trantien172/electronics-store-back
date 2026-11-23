"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProductArtwork } from "../products/components/ProductArtwork";
import { DEMO_PRODUCTS, formatProductPrice, type Product, type ProductKind } from "../products/products.data";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const { favoriteKeys, toggleFavorite } = useFavorites();
  const favorites = favoriteKeys.map((key) => {
    const [kind, id] = key.split(":") as [ProductKind, string];
    return { key, kind, id, product: DEMO_PRODUCTS.find((item) => item.kind === kind && item.id === Number(id)) };
  });

  return <main className="min-h-[60vh]"><Container className="py-10 md:py-14">
    <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"><Link href="/" className="min-h-11 inline-flex items-center hover:text-foreground">Trang chủ</Link><span>/</span><span aria-current="page" className="font-medium text-foreground">Danh sách quan tâm</span></nav>
    <header className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Đã lưu trên thiết bị này</p><h1 className="mt-2 text-3xl font-semibold">Danh sách quan tâm</h1><p className="mt-3 text-muted-foreground">Danh sách này được lưu trong trình duyệt và không yêu cầu đăng nhập.</p></header>
    {favorites.length === 0 ? <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center"><Heart className="mx-auto size-9 text-muted-foreground" /><h2 className="mt-4 font-semibold">Bạn chưa lưu sản phẩm nào</h2><p className="mt-2 text-sm text-muted-foreground">Chọn biểu tượng trái tim trên sản phẩm để lưu tại đây.</p><Button render={<Link href="/products" />} nativeButton={false} className="mt-5">Khám phá sản phẩm</Button></div> : <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{favorites.map(({ key, kind, id, product }) => <Card key={key} className="overflow-hidden"><Link href={kind === "used" ? `/products/old/${id}` : `/products/${id}`}><ProductArtwork product={product ?? ({ id: Number(id), kind, name: `Sản phẩm #${id}`, brand: "FixPro", category: kind === "used" ? "Máy cũ" : "Linh kiện" } as Product)} className="m-3 aspect-square" /><CardContent><p className="line-clamp-2 min-h-10 text-sm font-medium">{product?.name ?? `Sản phẩm #${id}`}</p><p className="mt-2 text-xs text-muted-foreground">{product?.condition ?? "Thông tin sẽ tải từ sản phẩm"}</p><p className="mt-2 font-semibold text-primary-600">{product?.sellingPrice ? formatProductPrice(product.sellingPrice) : "Xem chi tiết"}</p></CardContent></Link><div className="px-4 pb-4"><Button variant="outline" className="w-full" onClick={() => toggleFavorite(key)}><Trash2 className="size-4" />Bỏ khỏi danh sách</Button></div></Card>)}</div>}
  </Container></main>;
}
