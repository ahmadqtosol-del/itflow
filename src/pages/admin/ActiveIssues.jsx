import AllIssues from './AllIssues';

export default function ActiveIssues() {
  return (
    <AllIssues
      title="Active Issues"
      subtitle="Issues currently open, assigned, or in progress."
      statusFilter={['NEW', 'QUEUED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING']}
    />
  );
}
