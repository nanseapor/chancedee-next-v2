import { JobListPage } from "./_components/JobListPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobsPage({ params }: PageProps) {
  const { id } = await params;

  return <JobListPage companyId={id} canCreateJobs={true} />;
}
