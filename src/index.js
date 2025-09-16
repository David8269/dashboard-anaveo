import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',                   // Mode sombre global
    background: {
      default: '#0B192F',           // Couleur de fond principale
      paper: '#1A2740',             // Couleur de fond des cartes (surfaces)
    },
    primary: { main: '#01B68A' },   // Couleur primaire (vert vif)
    secondary: { main: '#FFA000' }, // Couleur secondaire (orange)
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
