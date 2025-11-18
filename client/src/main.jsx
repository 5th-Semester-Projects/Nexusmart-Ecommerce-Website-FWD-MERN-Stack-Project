import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import './utils/reactReconcilerFix';
import App from './App.jsx';
// import { initSentry } from './utils/sentry';
import { initGA } from './utils/analytics';

// Initialize error tracking and analytics
// initSentry(); // Temporarily disabled - JSX in .js file issue
try {
  initGA(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
} catch (error) {
  console.log('Analytics initialization skipped:', error.message);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
);
