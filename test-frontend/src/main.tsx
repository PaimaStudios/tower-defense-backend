import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './Router';

const appRoot = document.getElementById('root');

if (!appRoot) {
  throw new Error('Test app root not found');
}

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
