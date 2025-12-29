import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';

// 🔒 Vérification de sécurité
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('❌ Élément #root introuvable. Vérifiez public/index.html.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);