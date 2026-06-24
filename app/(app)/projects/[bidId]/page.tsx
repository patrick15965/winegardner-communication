import { ProjectWorkspace } from "@/components/projects/project-workspace";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ bidId: string }>;
}) {
  const { bidId } = await params;
  return <ProjectWorkspace bidId={bidId} />;
}
