import { RfiDetail } from "@/components/field/rfi-detail";

export default async function RfiDetailPage({
  params,
}: {
  params: Promise<{ bidId: string; rfiId: string }>;
}) {
  const { bidId, rfiId } = await params;
  return <RfiDetail bidId={bidId} rfiId={rfiId} />;
}
