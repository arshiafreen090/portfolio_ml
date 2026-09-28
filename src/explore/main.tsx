import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/base.css';
import '../styles/popups.css';
import './explore.css';
import { ExploreApp } from './ExploreApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExploreApp />
  </StrictMode>,
);
