import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';

// === Fonction utilitaire pour créer des chauves-souris dynamiques ===
const createBats = () => {
  const bats = [];
  const count = 4; // Nombre de chauves-souris
  for (let i = 0; i < count; i++) {
    bats.push(
      <div
        key={`bat-${i}`}
        className="bat"
        style={{
          top: `${10 + i * 20}%`,
          animationDelay: `${i * 2 + Math.random() * 3}s`,
          left: '-100px',
        }}
      >
        🦇
      </div>
    );
  }
  return bats;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🎃 Polices Halloween */}
    <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

    {/* 👻 Styles globaux Halloween */}
    <style>
      {`
        body {
          margin: 0;
          background-color: #0a0310;
          color: #f0e6d2;
          font-family: 'Roboto', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }
        :root {
          --halloween-bg: #0a0310;
          --halloween-paper: #1a0a2e;
          --halloween-primary: #ff6b00;
          --halloween-secondary: #8a2be2;
          --halloween-error: #ff0a0a;
          --halloween-success: #01b68a;
          --halloween-warning: #ffaa00;
        }

        /* 🔥 Texte en flamme (réutilisable via .flame-text) */
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

        /* 🦇 Chauves-souris volantes */
        @keyframes bats-fly {
          0% { transform: translateX(-100px) translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 100px)) translateY(-50px) rotate(360deg); opacity: 0; }
        }
        .bat {
          position: fixed;
          font-size: 2rem;
          opacity: 0;
          z-index: 0;
          pointer-events: none;
          animation: bats-fly 8s linear forwards;
        }

        /* 📺 Effet glitch numérique (réutilisable) */
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

        /* 🥇 Effet médaille (optionnel) */
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px gold); }
          100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px orange); }
        }

        /* 💚 Pulse vert (pour succès) */
        @keyframes pulse-halloween {
          0%, 100% { box-shadow: 0 0 0 0 rgba(1, 182, 138, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(1, 182, 138, 0); }
        }

        /* 🔥 Barres qui montent comme des flammes */
        @keyframes bar-flame-rise {
          0% { opacity: 0.7; transform: scaleY(0); }
          100% { opacity: 1; transform: scaleY(1); }
        }
      `}
    </style>

    {/* 🌫️ SUPPRESSION DU FOG OVERLAY — plus de brume sombre */}
    {/* <div className="fog-overlay" aria-hidden="true" /> */}

    {/* 🦇 Chauves-souris volantes (au niveau racine pour couvrir tout) */}
    {createBats()}

    {/* 🧱 Réinitialisation MUI + App */}
    <CssBaseline />
    <App />
  </React.StrictMode>
);