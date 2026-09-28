import { assetUrl } from '../data/assets';
import type { Design } from '../data/types';

export function PosterView({ design }: { design: Design }) {
  if (!design.image) {
    return <div className="poster-placeholder">Poster artwork coming soon</div>;
  }
  return <img className="poster-image" src={assetUrl(design.image)} alt={design.alt} loading="lazy" decoding="async" />;
}
