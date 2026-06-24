import { ChangeOrderDetail } from "@/components/field/change-order-detail";

export default async function ChangeOrderDetailPage({
  params,
}: {
  params: Promise<{ bidId: string; coId: string }>;
}) {
  const { bidId, coId } = await params;
  return <ChangeOrderDetail bidId={bidId} coId={coId} />;
}
