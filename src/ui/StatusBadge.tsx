import type { ProjectStatus } from '../data/types';

/** Only unfinished work gets a label — shipped projects don't need one. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status !== 'In Development') return null;
  return <span className="badge badge--dev">In Development</span>;
}
