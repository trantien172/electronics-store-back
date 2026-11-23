"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useFavorites, productFavoriteKey } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect";
import { Button } from "@/components/ui/Button";
import { DEMO_PRODUCTS, formatProductPrice, type Product, type ProductCondition, type ProductKind } from "./products.data";
import { ProductArtwork } from "./components/ProductArtwork";

type ApiProduct = {
  id: number; type?: ProductKind; kind?: ProductKind; name?: string; model?: string | null; code?: string | null;
  brand?: string | { id?: number; name?: string } | null; brands?: { name: string }[];
  category?: string | { id?: number; name?: string } | null; deviceType?: string;
  sellingPrice?: number | string | null; price?: number | string | null; quantity?: number | null;
  warrantyMonths?: number | null; manufactureYear?: number | null; condition?: string | { code?: string; label?: string } | null;
  conditions?: ProductCondition[]; availability?: string; status?: "available" | "sold"; bookable?: boolean;
  description?: string | null; shortDescription?: string | null; features?: string[]; highlights?: string[];
  specifications?: Product["specifications"]; thumbnailUrl?: string; createdAt?: string;
  used?: { description?: string | null; conditions?: { code: string; label: string }[]; warrantyNote?: string | null } | null;
  oldProduct?: { conditionStatus?: string; status?: string; sellingPrice?: number | string; warrantyMonths?: number };
  oldProducts?: { conditionStatus?: string; status?: string; sellingPrice?: number | string; warrantyMonths?: number }[];
};
type ProductListResponse = ApiProduct[] | { items?: ApiProduct[]; total?: number; totalPages?: number };

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: "new", label: "Mới" }, { value: "used", label: "Đã qua sử dụng" },
  { value: "good", label: "Ngoại hình đẹp" }, { value: "worn", label: "Có trầy xước" },
  { value: "functional", label: "Đầy đủ chức năng" },
];
const conditionMap: Record<string, ProductCondition> = {
  new: "new", used: "used", good_appearance: "good", fair_appearance: "worn", fully_functional: "functional",
};

function normalizeProduct(item: ApiProduct): Product {
  const old = item.oldProduct ?? item.oldProducts?.[0];
  const kind: ProductKind = item.type ?? item.kind ?? (old || item.used ? "used" : "part");
  const demo = DEMO_PRODUCTS.find((product) => product.id === Number(item.id) && product.kind === kind);
  const condition = old?.conditionStatus ?? (typeof item.condition === "string" ? item.condition : item.condition?.label) ?? item.used?.conditions?.map((entry) => entry.label).join(" · ") ?? demo?.condition ?? (kind === "used" ? "Đã qua sử dụng" : "Mới");
  const conditionCodes = item.used?.conditions?.map((entry) => entry.code) ?? (typeof item.condition === "object" && item.condition?.code ? [item.condition.code] : []);
  const conditions = item.conditions ?? (conditionCodes.length ? conditionCodes.map((code) => conditionMap[code]).filter((value): value is ProductCondition => Boolean(value)) : demo?.conditions ?? (kind === "used" ? ["used"] : ["new"]));
  const brand = typeof item.brand === "string" ? item.brand : item.brand?.name;
  const category = typeof item.category === "string" ? item.category : item.category?.name;
  const availability = item.availability ?? old?.status;
  return {
    ...demo,
    id: Number(item.id), kind,
    name: item.name ?? demo?.name ?? "Sản phẩm",
    model: item.model ?? demo?.model ?? "",
    brand: brand ?? item.brands?.[0]?.name ?? demo?.brand ?? "FixPro",
    category: category ?? demo?.category ?? "Sản phẩm",
    deviceType: item.deviceType ?? category ?? demo?.deviceType ?? "Thiết bị điện tử",
    sellingPrice: Number(old?.sellingPrice ?? item.price ?? item.sellingPrice ?? demo?.sellingPrice ?? 0),
    quantity: Number(item.quantity ?? (availability === "available" ? 1 : availability === "sold" ? 0 : demo?.quantity ?? 0)),
    warrantyMonths: Number(old?.warrantyMonths ?? item.warrantyMonths ?? demo?.warrantyMonths ?? 0),
    manufactureYear: Number(item.manufactureYear ?? demo?.manufactureYear ?? new Date().getFullYear()),
    condition, conditions: conditions as ProductCondition[],
    description: [item.description, kind === "used" ? item.used?.description : undefined].filter(Boolean).join("\n\n") || demo?.description || "Liên hệ FixPro để được tư vấn thêm về sản phẩm.",
    shortDescription: item.shortDescription ?? demo?.shortDescription ?? item.description ?? "Liên hệ cửa hàng để biết thêm thông tin.",
    features: item.highlights ?? item.features ?? demo?.features ?? [],
    specifications: item.specifications ?? demo?.specifications ?? [],
    status: availability === "sold" || old?.status === "sold" ? "sold" : item.status ?? "available",
    bookable: item.bookable ?? (kind === "used" && availability !== "sold"),
    thumbnailUrl: item.thumbnailUrl,
    createdAt: item.createdAt,
  };
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | ProductKind>("all");
  const [deviceType, setDeviceType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [conditions, setConditions] = useState<ProductCondition[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { favoriteKeys, toggleFavorite, isFavorite } = useFavorites();
  const { data: apiProducts = [], isLoading, isError } = useQuery({
    queryKey: ["client-products"],
    queryFn: async () => {
      const response = (await api.get<ProductListResponse>("/product", { params: { type: "both", quantity: 100, isActive: true } })).data;
      return Array.isArray(response) ? response : response.items ?? [];
    },
  });

  const usingDemo = isError || apiProducts.length === 0;
  const products = usingDemo ? DEMO_PRODUCTS : apiProducts.map(normalizeProduct).filter((product) => product.category.toLowerCase() !== "dịch vụ");
  const devices = useMemo(() => Array.from(new Set(products.map((product) => product.deviceType))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))), [products]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    const result = products.filter((product) => {
      const searchMatch = !query || `${product.name} ${product.model} ${product.brand} ${product.category} ${product.deviceType}`.toLocaleLowerCase("vi").includes(query);
      return searchMatch &&
        (kind === "all" || product.kind === kind) &&
        (deviceType === "all" || product.deviceType === deviceType) &&
        (brand === "all" || product.brand === brand) &&
        (!minPrice || product.sellingPrice >= Number(minPrice)) &&
        (!maxPrice || product.sellingPrice <= Number(maxPrice)) &&
        (conditions.length === 0 || conditions.every((condition) => product.conditions.includes(condition)));
    });
    if (sort === "price-asc") result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    if (sort === "price-desc") result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    if (sort === "oldest" && result.every((product) => product.createdAt)) result.sort((a, b) => Date.parse(a.createdAt!) - Date.parse(b.createdAt!));
    if (sort === "newest" && result.every((product) => product.createdAt)) result.sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!));
    return result;
  }, [products, search, kind, deviceType, brand, minPrice, maxPrice, conditions, sort]);

  useEffect(() => { setPage(1); }, [search, kind, deviceType, brand, minPrice, maxPrice, conditions, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageProducts = filtered.slice((page - 1) * pageSize, page * pageSize);
  const popularProducts = usingDemo ? products.slice(0, 4) : [];
  const toggleCondition = (value: ProductCondition) => setConditions((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const clearFilters = () => { setSearch(""); setKind("all"); setDeviceType("all"); setBrand("all"); setConditions([]); setMinPrice(""); setMaxPrice(""); setSort("newest"); };
  const productHref = (product: Product) => product.kind === "used" ? `/products/old/${product.id}` : `/products/${product.id}`;

  return (
    <main className="min-h-[60vh]">
      <div className="relative overflow-hidden bg-surface-dark text-neutral-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-800),_transparent_55%)] opacity-60" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-200">FixPro · Cửa hàng</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Sản phẩm điện tử</h1>
          <p className="mt-4 max-w-2xl leading-7 text-neutral-200">Linh kiện, phụ kiện và thiết bị đã qua sử dụng. Tìm sản phẩm phù hợp hoặc liên hệ cửa hàng để được tư vấn.</p>
        </Container>
      </div>

      <Container className="py-5">
        <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/" className="min-h-11 inline-flex items-center hover:text-foreground">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page" className="font-medium text-foreground">Sản phẩm</span></nav>
      </Container>

      <Container className="pb-14">
        {usingDemo && <div className="mb-6 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm" role="status">{isError ? "Không kết nối được API sản phẩm; " : "API chưa có sản phẩm; "}đang hiển thị <strong>dữ liệu mô phỏng</strong> để bạn kiểm tra giao diện. Tình trạng và giá chưa phải thông tin tồn kho thực tế.</div>}
        <div className="mb-7">
          <h2 className="text-2xl font-semibold tracking-tight">Danh sách sản phẩm</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tìm kiếm và kết hợp các bộ lọc để thu hẹp kết quả.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-border bg-card p-5" aria-label="Bộ lọc sản phẩm">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Bộ lọc</h2><button type="button" onClick={clearFilters} className="text-sm text-primary-600 hover:underline">Xóa lọc</button></div>
            <label className="mb-5 block text-sm font-medium">Tìm kiếm<Input className="mt-2" placeholder="Tên, mã, hãng…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <fieldset className="mb-5"><legend className="mb-2 text-sm font-medium">Phân loại</legend><div className="space-y-2 text-sm">
              {[{ value: "part", label: "Linh kiện" }, { value: "used", label: "Máy cũ" }].map((option) => <label key={option.value} className="flex min-h-8 items-center gap-2"><input type="radio" name="product-kind" checked={kind === option.value} onChange={() => setKind(option.value as ProductKind)} />{option.label}</label>)}
              <label className="flex min-h-8 items-center gap-2"><input type="radio" name="product-kind" checked={kind === "all"} onChange={() => setKind("all")} />Tất cả</label>
            </div></fieldset>
            <div className="mb-5"><p className="mb-2 text-sm font-medium">Khoảng giá (₫)</p><div className="grid grid-cols-2 gap-2"><Input inputMode="numeric" aria-label="Giá từ" placeholder="Từ" value={minPrice} onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))} /><Input inputMode="numeric" aria-label="Giá đến" placeholder="Đến" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))} /></div></div>
            <label className="mb-5 block text-sm font-medium">Hãng<NativeSelect className="mt-2 w-full" value={brand} onChange={(event) => setBrand(event.target.value)}><NativeSelectOption value="all">Tất cả hãng</NativeSelectOption>{brands.map((item) => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect></label>
            <fieldset><legend className="mb-2 text-sm font-medium">Tình trạng</legend><div className="space-y-2 text-sm">{conditionOptions.map((option) => <label key={option.value} className="flex min-h-8 items-center gap-2"><input type="checkbox" checked={conditions.includes(option.value)} onChange={() => toggleCondition(option.value)} />{option.label}</label>)}</div></fieldset>
          </aside>

          <section aria-label="Kết quả sản phẩm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" aria-label="Lọc theo loại thiết bị">
                <Button size="sm" variant={deviceType === "all" ? "default" : "outline"} onClick={() => setDeviceType("all")}>Tất cả</Button>
                {devices.map((device) => <Button key={device} size="sm" variant={deviceType === device ? "default" : "outline"} onClick={() => setDeviceType(device)}>{device}</Button>)}
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">Sắp xếp<NativeSelect value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp sản phẩm"><NativeSelectOption value="newest">Mới đăng</NativeSelectOption><NativeSelectOption value="oldest">Cũ nhất</NativeSelectOption><NativeSelectOption value="price-asc">Giá tăng dần</NativeSelectOption><NativeSelectOption value="price-desc">Giá giảm dần</NativeSelectOption></NativeSelect></label>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">{isLoading ? "Đang tải sản phẩm…" : `${filtered.length} sản phẩm`}{favoriteKeys.length > 0 && <span> · {favoriteKeys.length} mục đã lưu</span>}</p>
            {isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />)}</div> : pageProducts.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                {pageProducts.map((product) => {
                  const key = productFavoriteKey(product.kind, product.id);
                  return <Card key={key} className="group relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <Link href={productHref(product)} className="block rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <ProductArtwork product={product} className="m-3 aspect-square" />
                      <CardContent className="px-4 pb-4 pt-1">
                        <div className="mb-2 flex flex-wrap gap-2"><Badge variant="secondary">{product.kind === "used" ? "Máy cũ" : product.category}</Badge><Badge variant="outline">{product.condition}</Badge></div>
                        <p className="text-xs text-muted-foreground">{product.brand} · {product.model}</p>
                        <h3 className="mt-1 line-clamp-2 min-h-10 font-medium leading-snug group-hover:text-primary-600">{product.name}</h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.shortDescription}</p>
                        <div className="mt-3 flex items-center justify-between gap-2"><span className="font-semibold text-primary-600">{product.sellingPrice > 0 ? formatProductPrice(product.sellingPrice) : "Liên hệ báo giá"}</span><span className="text-xs text-muted-foreground">{product.kind === "used" && product.status === "sold" ? "Đã bán" : product.quantity > 0 ? "Còn hàng" : "Liên hệ"}</span></div>
                      </CardContent>
                    </Link>
                    <button type="button" onClick={() => toggleFavorite(key)} aria-label={isFavorite(key) ? "Bỏ khỏi danh sách quan tâm" : "Thêm vào danh sách quan tâm"} aria-pressed={isFavorite(key)} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm hover:text-danger focus-visible:outline-2 focus-visible:outline-ring"><Heart className={`size-5 ${isFavorite(key) ? "fill-danger text-danger" : ""}`} /></button>
                    <div className="px-4 pb-4">{product.kind === "used" ? <Link href={productHref(product)} className={`inline-flex min-h-11 w-full items-center justify-center rounded-md text-sm font-medium ${product.bookable && product.status !== "sold" ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border text-muted-foreground"}`}>{product.bookable && product.status !== "sold" ? "Đặt lịch xem" : "Xem chi tiết"}</Link> : <a href="tel:0912345678" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-muted">Liên hệ cửa hàng</a>}</div>
                  </Card>;
                })}
              </div>
            ) : <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center"><Search className="mx-auto mb-3 size-8 text-muted-foreground" /><h3 className="font-semibold">Chưa tìm thấy sản phẩm phù hợp</h3><p className="mt-2 text-sm text-muted-foreground">Thử xóa một vài bộ lọc hoặc liên hệ cửa hàng để được tư vấn.</p></div>}

            {pageCount > 1 && <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang sản phẩm">
              <Button variant="outline" size="sm" aria-label="Trang đầu" disabled={page === 1} onClick={() => setPage(1)}>Đầu</Button>
              <Button variant="outline" size="icon" aria-label="Trang trước" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></Button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <Button key={number} variant={number === page ? "default" : "outline"} size="icon" aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)}>{number}</Button>)}
              <Button variant="outline" size="icon" aria-label="Trang tiếp" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight /></Button>
              <Button variant="outline" size="sm" aria-label="Trang cuối" disabled={page === pageCount} onClick={() => setPage(pageCount)}>Cuối</Button>
            </nav>}
          </section>
        </div>

        {popularProducts.length > 0 && <section className="mt-16" aria-labelledby="popular-products"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Được quan tâm</p><h2 id="popular-products" className="mt-1 text-2xl font-semibold">Sản phẩm nổi bật</h2></div><span className="text-xs text-muted-foreground">Dữ liệu minh họa</span></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{popularProducts.map((product) => <Link key={`popular-${product.kind}-${product.id}`} href={productHref(product)} className="group rounded-xl border border-border bg-card p-3 hover:shadow-md"><ProductArtwork product={product} className="aspect-[4/3]" /><p className="mt-3 line-clamp-2 min-h-10 text-sm font-medium group-hover:text-primary-600">{product.name}</p><p className="mt-1 text-sm font-semibold text-primary-600">{product.sellingPrice > 0 ? formatProductPrice(product.sellingPrice) : "Liên hệ"}</p><p className="mt-1 text-xs text-muted-foreground">{product.condition}</p></Link>)}</div>
        </section>}

        <section className="mt-14 flex flex-col gap-5 rounded-2xl bg-surface-dark p-6 text-neutral-50 md:flex-row md:items-center md:justify-between md:p-9"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary-200">Cần hỗ trợ tìm hàng?</p><h2 className="mt-2 text-2xl font-semibold">Chưa tìm thấy sản phẩm bạn cần?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-neutral-200">Liên hệ FixPro, chúng tôi sẽ hỗ trợ kiểm tra linh kiện tương thích và tình trạng sản phẩm.</p></div><div className="flex flex-wrap gap-3"><a href="https://zalo.me/0912345678" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary-200 px-5 font-semibold text-surface-dark hover:bg-primary-100">Nhắn Zalo</a><a href="tel:0912345678" className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 px-5 font-semibold hover:bg-white/10">Gọi hotline</a></div></section>
      </Container>
    </main>
  );
}
