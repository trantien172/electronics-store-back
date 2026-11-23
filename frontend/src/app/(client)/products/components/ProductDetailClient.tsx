"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Maximize2, Phone, X, ZoomIn, ZoomOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useFavorites, productFavoriteKey } from "@/hooks/useFavorites";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { DEMO_PRODUCTS, formatProductPrice, type Product, type ProductKind } from "../products.data";
import { ProductArtwork } from "./ProductArtwork";

type Props = { id: string; kind: ProductKind };
type ApiProduct = Omit<Partial<Product>, "condition" | "category" | "brand" | "features" | "specifications" | "status" | "quantity"> & {
  type?: ProductKind;
  price?: number | string | null;
  availability?: string;
  bookable?: boolean;
  condition?: string | { code?: string; label?: string; group?: string } | null;
  category?: string | { name?: string } | null;
  brand?: string | { name?: string } | null;
  brands?: { name: string }[];
  media?: { fileUrl: string; description?: string | null; isPrimary?: boolean }[];
  images?: { url: string; alt?: string | null }[];
  thumbnailUrl?: string;
  highlights?: string[];
  specifications?: { parameter: string; value: string; unit?: string | null; sortOrder?: number }[];
  used?: { description?: string | null; conditions?: { code: string; label: string; group?: string }[]; warrantyNote?: string | null } | null;
  quantity?: number | null;
  status?: "available" | "sold";
  features?: string[];
  relatedServices?: { id: number; name: string; description?: string; price?: number }[];
  relatedProducts?: Product[];
  compatibleParts?: Product[];
};
type ProductDetailData = Product & Pick<ApiProduct, "media" | "relatedProducts" | "compatibleParts" | "relatedServices">;
const withEmptyRelations = (product: Product): ProductDetailData => ({
  ...product, media: [], relatedProducts: [], compatibleParts: [], relatedServices: [],
});
const conditionMap: Record<string, Product["conditions"][number]> = {
  new: "new", used: "used", good_appearance: "good", fair_appearance: "worn", fully_functional: "functional",
};

function mapProduct(item: ApiProduct, kind: ProductKind, id: number): ProductDetailData {
  const demo = DEMO_PRODUCTS.find((product) => product.id === id && product.kind === kind);
  const conditionLabel = typeof item.condition === "string" ? item.condition : item.condition?.label;
  const conditionCodes = item.used?.conditions?.map((condition) => condition.code) ?? (typeof item.condition === "object" && item.condition?.code ? [item.condition.code] : []);
  const conditions = conditionCodes.map((code) => conditionMap[code]).filter((value): value is Product["conditions"][number] => Boolean(value));
  const images = item.images?.map((image) => ({ fileUrl: image.url, description: image.alt })) ?? [];
  const media = item.media ?? (images.length ? images : item.thumbnailUrl ? [{ fileUrl: item.thumbnailUrl }] : []);
  const specifications = (item.specifications ?? demo?.specifications ?? []) as { parameter: string; value: string; unit?: string | null; sortOrder?: number }[];
  const brand = typeof item.brand === "string" ? item.brand : item.brand?.name;
  const category = typeof item.category === "string" ? item.category : item.category?.name;
  return {
    ...demo, id, kind,
    name: item.name ?? demo?.name ?? "Sản phẩm",
    model: item.model ?? demo?.model ?? "",
    brand: brand ?? item.brands?.[0]?.name ?? demo?.brand ?? "FixPro",
    category: category ?? demo?.category ?? "Sản phẩm",
    deviceType: item.deviceType ?? demo?.deviceType ?? "Thiết bị điện tử",
    sellingPrice: Number(item.price ?? item.sellingPrice ?? demo?.sellingPrice ?? 0),
    warrantyMonths: Number(item.warrantyMonths ?? demo?.warrantyMonths ?? 0),
    manufactureYear: Number(item.manufactureYear ?? demo?.manufactureYear ?? 0),
    condition: [conditionLabel, ...(item.used?.conditions?.map((condition) => condition.label) ?? [])].filter(Boolean).join(" · ") || demo?.condition || (kind === "used" ? "Đã qua sử dụng" : "Mới"),
    conditions: item.conditions ?? (conditions.length ? conditions : demo?.conditions ?? []),
    description: [item.description, kind === "used" ? item.used?.description : undefined].filter(Boolean).join("\n\n") || demo?.description || "",
    shortDescription: item.shortDescription ?? demo?.shortDescription ?? item.description ?? "",
    features: item.highlights ?? item.features ?? demo?.features ?? [],
    specifications: specifications.map((spec) => ({ ...spec, unit: spec.unit ?? undefined })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    status: item.availability === "sold" || item.status === "sold" ? "sold" : item.status ?? "available",
    quantity: Number(item.quantity ?? (item.availability === "sold" ? 0 : 1)),
    bookable: item.bookable ?? (kind === "used" && item.availability !== "sold"),
    thumbnailUrl: item.thumbnailUrl,
    media,
    relatedProducts: item.relatedProducts ?? [],
    compatibleParts: item.compatibleParts ?? [],
    relatedServices: item.relatedServices ?? [],
  };
}

export function ProductDetailClient({ id, kind }: Props) {
  const productId = Number(id);
  const demoProduct = DEMO_PRODUCTS.find((product) => product.id === productId && product.kind === kind);
  const endpoint = kind === "used" ? `/product/old/${productId}` : `/product/${productId}`;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["client-product", kind, productId],
    enabled: Number.isInteger(productId) && productId > 0,
    queryFn: async () => {
      try {
        const { data: response } = await api.get<ApiProduct>(endpoint);
        if (!response) return { product: demoProduct ? withEmptyRelations(demoProduct) : null, demo: Boolean(demoProduct) };
        return { product: mapProduct(response, kind, productId), demo: false };
      } catch (error) {
        if (demoProduct) return { product: withEmptyRelations(demoProduct), demo: true };
        throw error;
      }
    },
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const mousePanStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentWindow, setAppointmentWindow] = useState<{ min: string; max: string } | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);
  const { toggleFavorite, isFavorite } = useFavorites();
  const product = data?.product;
  const demo = data?.demo ?? false;
  const favoriteKey = product ? productFavoriteKey(kind, product.id) : "";
  const media = product?.media ?? [];
  const imageCount = media.length || 3;
  const sections = useMemo(() => [
    { id: "overview", label: "Tổng quan", show: true },
    { id: "specifications", label: "Thông số kỹ thuật", show: Boolean(product?.specifications.length) },
    { id: "features", label: "Đặc điểm nổi bật", show: Boolean(product?.features.length) },
    { id: "description", label: "Mô tả chi tiết", show: Boolean(product?.description) },
    { id: "related", label: "Sản phẩm liên quan", show: true },
    { id: "related-services", label: "Dịch vụ & linh kiện", show: Boolean(product?.relatedServices?.length || product?.compatibleParts?.length) },
  ].filter((section) => section.show), [product]);

  useEffect(() => {
    const onScroll = () => {
      setShowQuickActions(window.scrollY > 520);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!showImageViewer) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowImageViewer(false);
      if (event.key === "ArrowLeft") { setSelectedImage((current) => (current + imageCount - 1) % imageCount); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }
      if (event.key === "ArrowRight") { setSelectedImage((current) => (current + 1) % imageCount); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [showImageViewer, imageCount]);

  const changeImage = (direction: number) => {
    setSelectedImage((current) => (current + direction + imageCount) % imageCount);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const clampImagePan = (x: number, y: number, zoom: number) => {
    const frame = imageFrameRef.current;
    if (!frame || zoom <= 1) return { x: 0, y: 0 };
    const bounds = frame.getBoundingClientRect();
    return {
      x: Math.max(-bounds.width * (zoom - 1) / 2, Math.min(bounds.width * (zoom - 1) / 2, x)),
      y: Math.max(-bounds.height * (zoom - 1) / 2, Math.min(bounds.height * (zoom - 1) / 2, y)),
    };
  };

  const finishSwipe = (direction: number) => {
    const distance = window.innerWidth;
    setIsAnimatingSwipe(true);
    setSwipeOffset(-direction * distance);
    window.setTimeout(() => {
      setSelectedImage((current) => (current + direction + imageCount) % imageCount);
      setSwipeOffset(direction * distance);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setSwipeOffset(0)));
      window.setTimeout(() => setIsAnimatingSwipe(false), 260);
    }, 180);
  };

  const getTouchDistance = (touches: { length: number; [index: number]: { clientX: number; clientY: number } }) => {
    const first = touches[0];
    const second = touches[1];
    if (!first || !second) return null;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const submitAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scheduledAt = new Date(String(form.get("scheduledAt") ?? ""));
    const now = new Date();
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= now || scheduledAt.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
      setAppointmentError("Chọn giờ xem trong 24 giờ tới.");
      return;
    }
    setAppointmentLoading(true);
    setAppointmentError("");
    setAppointmentStatus("");
    try {
      if (!isAuthenticated) { setAppointmentError("Đăng nhập để đặt lịch xem sản phẩm đã qua sử dụng."); return; }
      const payload: { oldProductId: number; scheduledAt: string; customerName: string; customerPhone: string } = {
        oldProductId: productId,
        scheduledAt: scheduledAt.toISOString(),
        customerName: currentUser?.name || String(form.get("name") ?? ""),
        customerPhone: currentUser?.phone || String(form.get("phone") ?? ""),
      };
      await api.post("/appointments", payload);
      setAppointmentStatus("Đã gửi yêu cầu. Cửa hàng sẽ liên hệ xác nhận lịch xem.");
    } catch {
      setAppointmentError("Chưa gửi được lịch xem. Vui lòng thử lại hoặc gọi trực tiếp đến cửa hàng.");
    } finally {
      setAppointmentLoading(false);
    }
  };

  if (isLoading) return <Container className="py-10"><div className="mb-6 h-5 w-64 animate-pulse rounded bg-muted" /><div className="grid gap-8 lg:grid-cols-2"><div className="aspect-square animate-pulse rounded-2xl bg-muted" /><div className="space-y-4"><div className="h-10 animate-pulse rounded bg-muted" /><div className="h-7 w-1/2 animate-pulse rounded bg-muted" /><div className="h-32 animate-pulse rounded bg-muted" /></div></div></Container>;
  if (isError || !product) return <Container className="py-20 text-center"><h1 className="text-2xl font-semibold">Không tìm thấy sản phẩm</h1><p className="mt-3 text-muted-foreground">Sản phẩm có thể đã bị gỡ hoặc hiện không thể tải.</p><div className="mt-6 flex justify-center gap-3"><Button variant="outline" onClick={() => refetch()}>{isFetching ? "Đang tải…" : "Thử lại"}</Button><Button render={<Link href="/products" />} nativeButton={false}>Về danh sách sản phẩm</Button></div></Container>;

  const related = data?.demo
    ? DEMO_PRODUCTS.filter((item) => item.kind === product.kind && item.category === product.category && item.id !== product.id).slice(0, 4)
    : (product.relatedProducts ?? []).filter((item) => item.id !== product.id).slice(0, 4);
  const available = product.status !== "sold" && product.quantity > 0 && (kind !== "used" || product.bookable !== false);
  const contactHref = "tel:0912345678";
  const favorite = isFavorite(favoriteKey);
  const openAppointment = () => {
    const now = new Date();
    const toInputValue = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    setAppointmentWindow({ min: toInputValue(now), max: toInputValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)) });
    setAppointmentStatus("");
    setAppointmentError("");
    setShowAppointment(true);
  };

  return <>
    <main className="pb-20">
      {demo && <Container className="pt-5"><div className="rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm" role="status"><strong>Dữ liệu sản phẩm mô phỏng.</strong> Giá, tình trạng, ảnh và thông số trên trang này chỉ để bạn xem trước giao diện.</div></Container>}
      <Container className="py-4"><nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Link href="/" className="min-h-11 inline-flex items-center hover:text-foreground">Trang chủ</Link><ChevronRight className="size-4" /><Link href="/products" className="min-h-11 inline-flex items-center hover:text-foreground">Danh sách sản phẩm</Link><ChevronRight className="size-4" /><span aria-current="page" className="max-w-72 truncate font-medium text-foreground">{product.name}</span></nav></Container>

      <Container>
        <section id="overview" className="grid scroll-mt-28 gap-8 py-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-12">
          <div>
            <div className="relative">
              <button type="button" onClick={() => { setImageZoom(1); setImagePan({ x: 0, y: 0 }); setShowImageViewer(true); }} aria-label="Mở ảnh sản phẩm toàn màn hình" className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-muted text-left">
                {media[selectedImage]?.fileUrl ? <Image src={media[selectedImage].fileUrl} alt={media[selectedImage].description || product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized className="object-contain" /> : <ProductArtwork product={product} variant={selectedImage} className="size-full rounded-none" />}
                <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground opacity-80 shadow transition group-hover:opacity-100"><Maximize2 className="size-5" /></span>
              </button>
              <Badge className="absolute left-4 top-4" variant={kind === "used" ? "secondary" : "outline"}>{kind === "used" ? "Máy cũ" : "Linh kiện"}</Badge>
              {kind === "used" && <Badge className="absolute right-4 top-4" variant={available ? "secondary" : "destructive"}>{available ? product.condition : "Đã bán"}</Badge>}
            </div>
            {imageCount > 1 && <div className="mt-3 grid grid-cols-3 gap-3">{Array.from({ length: imageCount }, (_, index) => <button key={index} type="button" onClick={() => setSelectedImage(index)} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={selectedImage === index} className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 ${selectedImage === index ? "border-primary" : "border-transparent"}`}>{media[index]?.fileUrl ? <Image src={media[index].fileUrl} alt="" fill sizes="120px" unoptimized className="object-cover" /> : <ProductArtwork product={product} variant={index} className="size-full" />}</button>)}</div>}
          </div>

          <div className="lg:py-3">
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{product.category}</Badge>{kind === "used" && <Badge variant="outline">Năm {product.manufactureYear || "—"}</Badge>}</div>
            <p className="mt-4 text-sm text-muted-foreground">{product.brand}{product.model ? ` · Mã ${product.model}` : ""}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{product.name}</h1>
            <p className="mt-4 leading-7 text-muted-foreground">{product.shortDescription || product.description}</p>
            <div className="mt-6 border-y border-border py-5"><p className="text-3xl font-semibold text-primary-600">{product.sellingPrice > 0 ? formatProductPrice(product.sellingPrice) : "Liên hệ cửa hàng để hỏi giá"}</p><p className="mt-2 text-sm text-muted-foreground">{kind === "used" ? (available ? "Còn khả dụng · Có thể đặt lịch xem" : "Sản phẩm đã bán · Không nhận lịch xem") : product.quantity > 0 ? "Còn hàng" : "Vui lòng liên hệ để kiểm tra hàng"}{product.warrantyMonths > 0 ? ` · Bảo hành ${product.warrantyMonths} tháng` : ""}</p></div>
            {product.features.length > 0 && <ul className="mt-5 space-y-2">{product.features.slice(0, 4).map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span>{feature}</span></li>)}</ul>}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant={favorite ? "secondary" : "outline"} className="min-h-12 flex-1" aria-pressed={favorite} onClick={() => toggleFavorite(favoriteKey)}><Heart className={`size-4 ${favorite ? "fill-danger text-danger" : ""}`} />{favorite ? "Đã quan tâm" : "Thêm vào quan tâm"}</Button>
              {kind === "used" ? <Button type="button" className="min-h-12 flex-1" disabled={!available} onClick={openAppointment}>Đặt lịch xem máy</Button> : <Button render={<a href={contactHref} />} nativeButton={false} className="min-h-12 flex-1"><Phone className="size-4" />Liên hệ cửa hàng</Button>}
            </div>
            {kind === "used" && available && <a href={contactHref} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary-600 hover:underline"><Phone className="mr-2 size-4" />Gọi cửa hàng</a>}
          </div>
        </section>

        <nav className="sticky top-16 z-30 -mx-4 flex gap-1 overflow-x-auto border-y border-border bg-background/95 px-4 py-2 backdrop-blur md:mx-0 md:rounded-lg md:border" aria-label="Điều hướng thông tin sản phẩm">{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{section.label}</a>)}</nav>

        {(product.specifications.length > 0 || product.features.length > 0 || product.description) && <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-10">
            {product.specifications.length > 0 && <section id="specifications" className="scroll-mt-32"><h2 className="text-2xl font-semibold">Thông số kỹ thuật</h2><div className="mt-4 overflow-hidden rounded-xl border border-border">{product.specifications.map((spec, index) => <div key={spec.parameter} className={`grid grid-cols-[1fr_1.2fr] gap-4 px-4 py-3 text-sm ${index % 2 ? "bg-muted/50" : "bg-card"}`}><span className="text-muted-foreground">{spec.parameter}</span><span className="font-medium">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</span></div>)}</div></section>}
            {product.features.length > 0 && <section id="features" className="scroll-mt-32"><h2 className="text-2xl font-semibold">Đặc điểm nổi bật</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{product.features.map((feature) => <li key={feature} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span className="text-sm leading-6">{feature}</span></li>)}</ul></section>}
            {product.description && <section id="description" className="scroll-mt-32"><h2 className="text-2xl font-semibold">Mô tả chi tiết</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{product.description}</p></section>}
          </div>
          <aside className="h-fit rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Thông tin sản phẩm</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Phân loại</dt><dd className="text-right">{kind === "used" ? "Máy cũ" : "Linh kiện"}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Hãng</dt><dd className="text-right">{product.brand || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Tình trạng</dt><dd className="text-right">{product.condition || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Bảo hành</dt><dd className="text-right">{product.warrantyMonths ? `${product.warrantyMonths} tháng` : "Liên hệ"}</dd></div></dl><p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Thông tin chưa có dữ liệu xác thực sẽ không được tự suy diễn.</p></aside>
        </div>}

        {related.length > 0 && <section id="related" className="scroll-mt-32 border-t border-border py-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Khám phá thêm</p><h2 className="mt-1 text-2xl font-semibold">Sản phẩm tương tự</h2></div><Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600">Tất cả sản phẩm<ChevronRight className="size-4" /></Link></div><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((item) => <Link key={`${item.kind}-${item.id}`} href={item.kind === "used" ? `/products/old/${item.id}` : `/products/${item.id}`}><Card className="h-full overflow-hidden transition-shadow hover:shadow-md"><ProductArtwork product={item} className="m-3 aspect-square" /><CardContent><p className="line-clamp-2 min-h-10 text-sm font-medium">{item.name}</p><p className="mt-2 text-sm font-semibold text-primary-600">{item.sellingPrice ? formatProductPrice(item.sellingPrice) : "Liên hệ"}</p></CardContent></Card></Link>)}</div></section>}
        {((product.relatedServices?.length ?? 0) > 0 || (product.compatibleParts?.length ?? 0) > 0) && <section id="related-services" className="scroll-mt-32 border-t border-border py-10"><h2 className="text-2xl font-semibold">Dịch vụ và linh kiện liên quan</h2>{product.relatedServices && product.relatedServices.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{product.relatedServices.map((service) => <article key={service.id} className="rounded-xl border border-border bg-card p-4"><h3 className="font-medium">{service.name}</h3>{service.description && <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>}<a href={contactHref} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary-600">Liên hệ tư vấn</a></article>)}</div>}{product.compatibleParts && product.compatibleParts.length > 0 && <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{product.compatibleParts.map((part) => <Link key={part.id} href={`/products/${part.id}`} className="rounded-xl border border-border bg-card p-4"><ProductArtwork product={part} className="aspect-square" /><h3 className="mt-3 line-clamp-2 text-sm font-medium">{part.name}</h3><p className="mt-2 text-sm font-semibold text-primary-600">{part.sellingPrice ? formatProductPrice(part.sellingPrice) : "Liên hệ"}</p></Link>)}</div>}</section>}
      </Container>
    </main>

    {showQuickActions && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur md:bottom-auto md:top-16 md:border-b md:border-t-0"><Container className="flex items-center gap-3"><div className="min-w-0 flex-1 md:flex-none md:min-w-56"><p className="line-clamp-1 text-xs font-medium sm:text-sm">{product.name}</p><p className="truncate text-sm font-semibold text-primary-600">{product.sellingPrice ? formatProductPrice(product.sellingPrice) : "Liên hệ để hỏi giá"}</p><p className="line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">{kind === "used" ? (available ? product.condition : "Đã bán") : product.quantity > 0 ? "Còn hàng" : "Liên hệ kiểm tra hàng"}{product.warrantyMonths > 0 ? ` · Bảo hành ${product.warrantyMonths} tháng` : ""}</p></div><div className="ml-auto flex shrink-0 gap-2"><Button type="button" variant="outline" size="icon" aria-label={favorite ? "Bỏ quan tâm" : "Thêm vào quan tâm"} aria-pressed={favorite} onClick={() => toggleFavorite(favoriteKey)}><Heart className={`size-4 ${favorite ? "fill-danger text-danger" : ""}`} /></Button><Button render={<a href={contactHref} />} nativeButton={false} variant="outline" className="min-h-11 px-3"><Phone className="size-4" /><span className="hidden sm:inline">Liên hệ</span></Button>{kind === "used" && <Button className="min-h-11 px-3" disabled={!available} onClick={openAppointment}>Đặt lịch xem</Button>}</div></Container></div>}


    {showImageViewer && <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Xem ảnh sản phẩm" onClick={(event) => { if (event.target === event.currentTarget) setShowImageViewer(false); }}>
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4"><p className="min-w-0 truncate text-sm">{product.name} <span className="text-white/60">· {selectedImage + 1}/{imageCount}</span></p><div className="flex shrink-0 gap-2"><Button type="button" variant="outline" size="icon" aria-label="Thu nhỏ" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setImageZoom((zoom) => { const nextZoom = Math.max(1, zoom - 0.5); setImagePan((pan) => clampImagePan(pan.x, pan.y, nextZoom)); return nextZoom; })}><ZoomOut /></Button><Button type="button" variant="outline" size="icon" aria-label="Phóng to" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setImageZoom((zoom) => Math.min(3, zoom + 0.5))}><ZoomIn /></Button><Button type="button" variant="outline" size="icon" aria-label="Đóng ảnh" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setShowImageViewer(false)}><X /></Button></div></div>
      <div
        ref={imageFrameRef}
        className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden px-12 pb-6"
        onTouchStart={(event) => {
          setSwipeOffset(0);
          const distance = getTouchDistance(event.touches);
          if (distance !== null) {
            pinchStartDistance.current = distance;
            pinchStartZoom.current = imageZoom;
            const first = event.touches[0];
            panStart.current = first ? { x: first.clientX, y: first.clientY, panX: imagePan.x, panY: imagePan.y } : null;
            setTouchStartX(null);
            return;
          }
          pinchStartDistance.current = null;
          const touch = event.touches[0];
          if (imageZoom > 1 && touch) {
            panStart.current = { x: touch.clientX, y: touch.clientY, panX: imagePan.x, panY: imagePan.y };
            setTouchStartX(null);
          } else {
            panStart.current = null;
            setTouchStartX(touch?.clientX ?? null);
          }
        }}
        onTouchMove={(event) => {
          const distance = getTouchDistance(event.touches);
          if (distance !== null && pinchStartDistance.current !== null) {
            const nextZoom = Math.min(3, Math.max(1, pinchStartZoom.current * distance / pinchStartDistance.current));
            setImageZoom(nextZoom);
            setImagePan((pan) => clampImagePan(pan.x, pan.y, nextZoom));
            return;
          }
          if (imageZoom > 1 && panStart.current && event.touches[0]) {
            const touch = event.touches[0];
            setImagePan(clampImagePan(panStart.current.panX + touch.clientX - panStart.current.x, panStart.current.panY + touch.clientY - panStart.current.y, imageZoom));
            return;
          }
          if (touchStartX !== null && imageZoom === 1) setSwipeOffset((event.touches[0]?.clientX ?? touchStartX) - touchStartX);
        }}
        onTouchEnd={(event) => {
          if (pinchStartDistance.current !== null) {
            pinchStartDistance.current = null;
            panStart.current = null;
            setTouchStartX(null);
            return;
          }
          if (panStart.current) { panStart.current = null; return; }
          if (touchStartX === null || imageZoom !== 1) { setTouchStartX(null); return; }
          const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
          const threshold = Math.max(100, window.innerWidth * 0.22);
          setTouchStartX(null);
          if (Math.abs(delta) >= threshold) finishSwipe(delta < 0 ? 1 : -1);
          else { setIsAnimatingSwipe(true); setSwipeOffset(0); window.setTimeout(() => setIsAnimatingSwipe(false), 260); }
        }}
        onTouchCancel={() => {
          pinchStartDistance.current = null;
          panStart.current = null;
          setTouchStartX(null);
          setIsAnimatingSwipe(true);
          setSwipeOffset(0);
          window.setTimeout(() => setIsAnimatingSwipe(false), 260);
        }}
        onMouseDown={(event) => {
          if (imageZoom <= 1) return;
          mousePanStart.current = { x: event.clientX, y: event.clientY, panX: imagePan.x, panY: imagePan.y };
          event.preventDefault();
        }}
        onMouseMove={(event) => {
          if (!mousePanStart.current) return;
          setImagePan(clampImagePan(mousePanStart.current.panX + event.clientX - mousePanStart.current.x, mousePanStart.current.panY + event.clientY - mousePanStart.current.y, imageZoom));
        }}
        onMouseUp={() => { mousePanStart.current = null; }}
        onMouseLeave={() => { mousePanStart.current = null; }}
      >
        <div className={`relative h-full w-full ${imageZoom > 1 ? "cursor-grab active:cursor-grabbing" : ""} ${isAnimatingSwipe ? "transition-transform duration-200 ease-out" : ""}`} style={{ transform: `translate(${swipeOffset + imagePan.x}px, ${imagePan.y}px) scale(${imageZoom})` }}>
          {media[selectedImage]?.fileUrl ? <Image src={media[selectedImage].fileUrl} alt={media[selectedImage].description || product.name} fill sizes="100vw" unoptimized className="object-contain" /> : <ProductArtwork product={product} variant={selectedImage} className="h-full w-full bg-transparent" />}
        </div>
      </div>
      {imageCount > 1 && <><Button type="button" variant="outline" size="icon" aria-label="Ảnh trước" className="absolute left-2 top-1/2 -translate-y-1/2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:left-5" onClick={() => changeImage(-1)}><ArrowLeft /></Button><Button type="button" variant="outline" size="icon" aria-label="Ảnh tiếp theo" className="absolute right-2 top-1/2 -translate-y-1/2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:right-5" onClick={() => changeImage(1)}><ArrowRight /></Button></>}
    </div>}

    {showAppointment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAppointment(false); }}><section role="dialog" aria-modal="true" aria-labelledby="appointment-title" className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-primary-600">Lịch xem máy cũ</p><h2 id="appointment-title" className="mt-1 text-xl font-semibold">{product.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Đặt lịch chỉ gửi yêu cầu xem máy, không tạo đơn hàng hoặc giữ sản phẩm.</p></div><button type="button" onClick={() => setShowAppointment(false)} aria-label="Đóng" className="flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-muted"><X className="size-5" /></button></div>
      {appointmentStatus ? <div className="mt-5 rounded-lg bg-success-bg p-4 text-sm text-foreground" role="status">{appointmentStatus}</div> : <form className="mt-5 space-y-4" onSubmit={submitAppointment}><label className="block text-sm font-medium">Họ tên<input name="name" required defaultValue={isAuthenticated ? currentUser?.name : ""} className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3" /></label><label className="block text-sm font-medium">Số điện thoại<input name="phone" required type="tel" pattern="[0-9+ ]{9,15}" defaultValue={isAuthenticated ? currentUser?.phone : ""} className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3" /></label><label className="block text-sm font-medium">Giờ xem (trong 24 giờ tới)<input name="scheduledAt" required type="datetime-local" min={appointmentWindow?.min} max={appointmentWindow?.max} className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3" /></label><p className="text-xs leading-5 text-muted-foreground">Cửa hàng sẽ xác nhận giờ mở cửa và khả năng còn hàng trước khi hẹn được xác nhận.</p>{appointmentError && <p className="text-sm text-danger" role="alert">{appointmentError}</p>}<div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setShowAppointment(false)}>Để sau</Button><Button type="submit" disabled={appointmentLoading}>{appointmentLoading ? "Đang gửi…" : "Gửi yêu cầu"}</Button></div></form>}</section></div>}
  </>;
}
