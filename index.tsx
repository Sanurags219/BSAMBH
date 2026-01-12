
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const bootstrap = () => {
  try {
    const container = document.getElementById('root');
    if (!container) throw new Error("Root container missing");

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Hide splash screen once React starts rendering
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('fade-out');
    }, 500);

    console.log("Bsambh - Production Build Initialized");
  } catch (error) {
    console.error("Bsambh - Critical Boot Failure:", error);
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h1 style="color: #ff4444; font-weight: 900; font-style: italic;">BOOT ERROR</h1>
          <p style="color: #666; font-size: 12px; margin: 10px 0;">The application failed to initialize on Mainnet.</p>
          <button onclick="window.location.reload()" style="background: #0052ff; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer;">Retry Boot</button>
        </div>
      `;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
