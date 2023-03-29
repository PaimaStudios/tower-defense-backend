import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const appRoot = document.getElementById('root');

if (!appRoot) {
  throw new Error('Test app root not found');
}

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
