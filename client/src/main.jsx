import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  // A clear message beats a blank screen when the .env file is missing.
  document.getElementById('root').innerHTML = `
    <div style="font-family:system-ui;padding:48px;max-width:640px;margin:0 auto;color:#161b26">
      <h1 style="font-size:24px;font-weight:700">Clerk key missing</h1>
      <p style="margin-top:12px;line-height:1.6;color:#5b6478">
        Create <code>client/.env</code> from <code>client/.env.example</code> and set
        <code>VITE_CLERK_PUBLISHABLE_KEY</code> with the publishable key from your Clerk dashboard,
        then restart <code>npm run dev</code>.
      </p>
    </div>`;
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <BrowserRouter>
        <AppProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
        </AppProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
