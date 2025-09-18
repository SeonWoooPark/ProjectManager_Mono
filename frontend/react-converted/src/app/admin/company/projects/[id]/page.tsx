import { ProjectDetailView } from "@/components/admin/project-detail-view"

interface ProjectDetailPageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return <ProjectDetailView projectId={params.id} />
}
