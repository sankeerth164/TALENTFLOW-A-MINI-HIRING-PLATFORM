import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Create the worker instance with all handlers
const worker = setupWorker(...handlers);

// Configure worker options
const startOptions = {
  serviceWorker: {
    url: '/mockServiceWorker.js'
  },
  onUnhandledRequest: 'bypass'
};

// Export the configured worker
export { worker, startOptions };
