import { projectById } from '../../data/projects';
import type { ProjectId } from '../../data/types';
import { Modal } from '../../ui/Modal';
import { ProjectDetails } from '../../ui/ProjectDetails';

export function ProjectPopup({ refId, onClose }: { refId: string | null; onClose: () => void }) {
  const project = refId ? projectById[refId as ProjectId] : null;
  return (
    <Modal open={!!project} onClose={onClose} labelledBy="project-title" size="lg">
      {project && <ProjectDetails project={project} titleId="project-title" />}
    </Modal>
  );
}
