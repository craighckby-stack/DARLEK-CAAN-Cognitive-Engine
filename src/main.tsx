import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Initializes and mounts the root React application with strict safety assertions.
 */
const mountApplication = (): void => {
  const rootElement = document.getElementById('root');

  if (!(rootElement instanceof HTMLElement)) {
    throw new Error('Critical Error: Root container element with id "root" was not found or is not a valid HTMLElement.');
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

mountApplication();