import React from 'react';
import ReactDOM from 'react-dom/client';
import ConfigCreator from './ConfigCreator';

const appRoot = document.getElementById('root');

if (!appRoot) {
  throw new Error('Test app root not found');
}

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <ConfigCreator />
  </React.StrictMode>
);
