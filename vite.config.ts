import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite configuration for TAKUMI.
// Dev server runs on port 5173 by default; the app talks to the Canopy
// node RPC ports (50002 primary / 50003 secondary) configured via .env.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  // .env.example uses RPC_PRIMARY / RPC_SECONDARY (no VITE_ prefix) per the
  // Canopy network configuration spec, so widen Vite's default env exposure.
  envPrefix: ['VITE_', 'RPC_'],
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
});
