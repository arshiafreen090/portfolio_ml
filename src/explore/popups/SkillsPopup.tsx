import { skillCategoryById, skillTerminalById } from '../../data/skills';
import { Modal } from '../../ui/Modal';

export function SkillsPopup({ refId, onClose }: { refId: string | null; onClose: () => void }) {
  const terminal = refId ? skillTerminalById[refId] : null;
  return (
    <Modal open={!!terminal} onClose={onClose} bar="Skills Database · Terminal" labelledBy="skills-title" size="md">
      {terminal && (
        <div className="popup">
          <p className="popup__eyebrow">Skills Database</p>
          <h2 id="skills-title" className="popup__title">{terminal.title}</h2>
          {terminal.categories.map((id) => {
            const cat = skillCategoryById[id];
            return (
              <section key={id} className="skill-group">
                <h3>{cat.title}</h3>
                <ul className="chips">{cat.items.map((s) => <li key={s}>{s}</li>)}</ul>
              </section>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
