import { ProjectFieldWorkspace } from "@/components/field/project-field-workspace";

export default async function FieldProjectPage({
  params,
}: {
  params: Promise<{ bidId: string }>;
}) {
  const { bidId } = await params;
  return <ProjectFieldWorkspace bidId={bidId} />;
}
