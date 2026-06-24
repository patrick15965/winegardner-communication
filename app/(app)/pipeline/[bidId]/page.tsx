import { BidDetail } from "@/components/bid/bid-detail";

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ bidId: string }>;
}) {
  const { bidId } = await params;
  return <BidDetail bidId={bidId} />;
}
