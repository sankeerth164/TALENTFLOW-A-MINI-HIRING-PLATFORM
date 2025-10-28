import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Start MSW worker in development or when explicitly enabled for production
const shouldEnableMocks =
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_ENABLE_MOCK === 'true';

async function enableMocking() {
  if (!shouldEnableMocks) {
    return;
  }

  const { worker, startOptions } = await import('./mock/browser');
  
  // Start the worker
  await worker.start(startOptions);
  console.log('[MSW] Mock Service Worker started');
}

// Start MSW before rendering the app
enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}).catch((error) => {
  console.error('[MSW] Failed to start Mock Service Worker:', error);
  // Render app anyway
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
});
