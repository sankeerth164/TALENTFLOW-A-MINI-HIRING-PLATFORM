import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Start MSW worker in development or when explicitly enabled via env var
const shouldEnableMocks =
  process.env.NODE_ENV === 'development' ||
  String(process.env.REACT_APP_ENABLE_MOCK).toLowerCase() === 'true';

if (shouldEnableMocks) {
  const startMSW = async () => {
    try {
      const { worker, startOptions } = require('./mock/browser');
      await worker.start(startOptions);
      console.log('[MSW] Mock Service Worker started');
    } catch (error) {
      console.error('[MSW] Failed to start Mock Service Worker:', error);
    }
  };
  startMSW();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
