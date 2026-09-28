import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/base.css';
import './pro.css';
import { ProApp } from './ProApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProApp />
  </StrictMode>,
);
