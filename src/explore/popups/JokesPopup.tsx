import { Modal } from '../../ui/Modal';

const JOKES = [
  'Why did the data scientist bring a ladder? To reach the higher-order features.',
  'I asked the bookshelf for advice. It said, "I’ve got a few volumes on the matter."',
  'Why was the spreadsheet invited to every party? It knew how to keep things in cells.',
  'I told my model a joke about overfitting. It remembered it forever.',
  'The cat joined the analytics team because it already had strong purr-spective.',
];

export function JokesPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} bar="Skills Database · Joke Shelf" labelledBy="jokes-title" size="md">
      <div className="popup jokes-popup">
        <p className="popup__eyebrow">Quietly silly shelf</p>
        <h2 id="jokes-title" className="popup__title">Five tiny jokes</h2>
        <ul className="jokes-list">
          {JOKES.map((joke, index) => <li key={joke}><span>{index + 1}.</span> {joke}</li>)}
        </ul>
      </div>
    </Modal>
  );
}