import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import shaka from 'shaka-player';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Install built-in polyfills to patch any browser quirks (MSE, EME, etc.)
if (typeof window !== 'undefined') {
  try {
    shaka.polyfill.installAll();
  } catch {}
}

// Global uncaught error & unhandled promise rejection safety guard
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('Prevented uncaught error crash:', event.error || event.message);
    event.preventDefault();
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Prevented unhandled promise rejection crash:', event.reason);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

