import { Cpu, Headphones, PlugZap, Smartphone } from "lucide-react";
import Image from "next/image";
import type { Product } from "../products.data";

const icons = [Smartphone, PlugZap, Cpu, Headphones];
const palettes = [
  "from-amber-100 via-orange-50 to-white text-amber-700",
  "from-sky-100 via-blue-50 to-white text-sky-700",
  "from-violet-100 via-purple-50 to-white text-violet-700",
  "from-emerald-100 via-teal-50 to-white text-emerald-700",
];

export function ProductArtwork({ product, className = "", variant = 0 }: { product: Product; className?: string; variant?: number }) {
  const index = (product.id + variant) % icons.length;
  const Icon = icons[index];

  return (
    <div role="img" aria-label={`Hình minh họa ${product.name}`} className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${palettes[index]} ${className}`}>
      {product.thumbnailUrl ? <Image src={product.thumbnailUrl} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized className="object-contain" /> : <><div className="absolute size-40 rounded-full border border-current/10" /><div className="absolute size-28 rounded-full border border-current/10" /><Icon className="relative size-20 stroke-[1.15] drop-shadow-sm md:size-24" /><span className="absolute bottom-4 text-xs font-medium uppercase tracking-[0.22em] opacity-60">{product.brand}</span></>}
    </div>
  );
}
