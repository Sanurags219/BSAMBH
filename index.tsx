
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Bsambh - Base Hub Booting...");

const bootstrap = () => {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error("Root container not found in DOM.");
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Bsambh - React Render Initiated.");
  } catch (error) {
    console.error("Bsambh - Critical Startup Failure:", error);
    // Display a basic error message on screen if the React app fails to mount
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="height:100vh; display:flex; flex-direction:column; items:center; justify-content:center; text-align:center; background:#000; color:#fff; font-family:sans-serif; padding:20px;">
          <h1 style="color:#0052ff; font-style:italic;">BOOT FAILURE</h1>
          <p style="color:#666; max-width:400px; margin:20px auto;">The application failed to initialize. Please check your network connection or the developer console for details.</p>
          <button onclick="window.location.reload()" style="background:#fff; color:#000; border:none; padding:12px 24px; border-radius:12px; font-weight:bold; cursor:pointer;">Retry Load</button>
        </div>
      `;
    }
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
