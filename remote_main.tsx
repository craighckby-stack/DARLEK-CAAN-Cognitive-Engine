import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Check if we're in a development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Get the root element with null check
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create the root
const root = createRoot(rootElement);

// Render the application with error handling
try {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render the application:', error);
  
  // In development, show more detailed error
  if (isDevelopment) {
    const errorDisplay = document.createElement('div');
    errorDisplay.style.color = 'red';
    errorDisplay.style.padding = '20px';
    errorDisplay.innerHTML = `
      <h1>Application Failed to Render</h1>
      <p>Please check the console for details.</p>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    `;
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDisplay);
  } else {
    // In production, show a user-friendly error
    const errorDisplay = document.createElement('div');
    errorDisplay.style.padding = '20px';
    errorDisplay.innerHTML = `
      <h1>Application Error</h1>
      <p>We're sorry, but the application encountered an error. Please try again later.</p>
    `;
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDisplay);
  }
}

// Initialize development tools if in development
if (isDevelopment) {
  // Example: Initialize React DevTools or other development tools
  console.log('Development mode enabled');
}
