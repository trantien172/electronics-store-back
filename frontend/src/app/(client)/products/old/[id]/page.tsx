import { ProductDetailClient } from "../../components/ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function UsedProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient id={id} kind="used" />;
}
