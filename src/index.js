import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🎃 Polices Halloween */}
    <link
      href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Orbitron:wght@700;900&display=swap"
      rel="stylesheet"
    />

    {/* 👻 Styles globaux Halloween */}
    <style>
      {`
        body {
          margin: 0;
          background-color: #0a0310;
          color: var(--halloween-text, #ffd700); /* ✅ Texte par défaut en jaune doré */
          font-family: 'Roboto', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        /* 🌫️ Brume flottante en arrière-plan */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: -50%;
          width: 200%;
          height: 100%;
          background: 
            radial-gradient(circle at 30% 20%, rgba(255,107,0,0.06) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(138,43,226,0.05) 0%, transparent 70%);
          pointerEvents: none;
          z-index: -1;
          animation: smoke-drift-body 30s linear infinite;
        }

        :root {
          --halloween-bg: #0a0310;
          --halloween-paper: #1a0a2e;
          --halloween-primary: #ff6b00;
          --halloween-secondary: #8a2be2;
          --halloween-error: #ff0a0a;
          --halloween-success: #01b68a;
          --halloween-warning: #ffaa00;
          --halloween-text: #ffd700; /* ✅ Couleur de texte par défaut */
        }

        /* 🔥 Texte en flamme */
        @keyframes flame-flicker {
          0%, 100% { 
            text-shadow: 0 0 10px #ff4500, 0 0 20px #ff0000, 0 0 30px #8a0000; 
            transform: scale(1); 
          }
          25% { 
            text-shadow: 0 0 15px #ff8c00, 0 0 25px #ff4500, 0 0 35px #ff0000; 
            transform: scale(1.02); 
          }
          50% { 
            text-shadow: 0 0 12px #ff0000, 0 0 22px #cc0000, 0 0 32px #8a0000; 
            transform: scale(0.98); 
          }
          75% { 
            text-shadow: 0 0 18px #ff6b00, 0 0 28px #ff2a00, 0 0 38px #cc0000; 
            transform: scale(1.01); 
          }
        }
        .flame-text {
          animation: flame-flicker 1.5s infinite alternate;
          font-weight: bold;
          color: #ff6b00 !important;
          font-family: 'Orbitron', sans-serif !important;
        }

        /* 📺 Effet glitch numérique */
        @keyframes glitch-digital {
          0% { clip-path: inset(0 0 0 0); transform: translate(0); }
          10% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, -2px); }
          20% { clip-path: inset(15% 0 75% 0); transform: translate(2px, 2px); }
          30% { clip-path: inset(25% 0 65% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(35% 0 55% 0); transform: translate(2px, -2px); }
          50% { clip-path: inset(45% 0 45% 0); transform: translate(-2px, -2px); }
          60% { clip-path: inset(35% 0 55% 0); transform: translate(2px, 2px); }
          70% { clip-path: inset(25% 0 65% 0); transform: translate(-2px, 2px); }
          80% { clip-path: inset(15% 0 75% 0); transform: translate(2px, -2px); }
          90% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, -2px); }
          100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }

        /* 🥇 Effet médaille */
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px gold); }
          100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px orange); }
        }

        /* 💚 Pulse vert (succès) */
        @keyframes pulse-halloween {
          0%, 100% { box-shadow: 0 0 0 0 rgba(1, 182, 138, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(1, 182, 138, 0); }
        }

        /* 🔥 Barres qui montent comme des flammes */
        @keyframes bar-flame-rise {
          0% { opacity: 0.7; transform: scaleY(0); transform-origin: bottom; }
          100% { opacity: 1; transform: scaleY(1); }
        }

        /* 🌫️ Animation de la brume du body */
        @keyframes smoke-drift-body {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-5%) translateY(-2%); }
          100% { transform: translateX(0) translateY(0); }
        }

        /* 🧙‍♂️ Scrollbar personnalisée */
        * {
          scrollbar-width: thin;
          scrollbar-color: #ff6b00 #1a0a2e;
        }
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #1a0a2e;
        }
        *::-webkit-scrollbar-thumb {
          background-color: #ff6b00;
          border-radius: 4px;
          border: 2px solid #1a0a2e;
        }
      `}
    </style>

    {/* 🧱 Réinitialisation MUI + App */}
    <CssBaseline />
    <App />
  </React.StrictMode>
);