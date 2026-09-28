import type { ProjectStatus } from '../data/types';

const VARIANT: Record<ProjectStatus, string> = {
  Completed: 'badge--completed',
  'Learning / Collection': 'badge--learning',
  'In Development': 'badge--dev',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`badge ${VARIANT[status]}`}>{status}</span>;
}
