import { ProductDetailClient } from "../components/ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient id={id} kind="part" />;
}
