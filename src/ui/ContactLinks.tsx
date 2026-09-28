import { profile } from '../data/profile';

export function ContactLinks() {
  return (
    <ul className="contact-links">
      <li>
        <span className="contact-links__label">Email</span>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </li>
      <li>
        <span className="contact-links__label">GitHub</span>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer">github.com/arshiafreen090</a>
      </li>
      <li>
        <span className="contact-links__label">LinkedIn</span>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/afreen-aurshi</a>
      </li>
      <li>
        <span className="contact-links__label">Portfolio</span>
        <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer">afreen.tech</a>
      </li>
    </ul>
  );
}
