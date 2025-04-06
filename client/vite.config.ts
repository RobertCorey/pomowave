import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: isProduction ? "https://pomowave.onrender.com" : "http://localhost:3000",
          changeOrigin: true,
        },
      },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/playwright-report/**',
          '**/test-results/**'
        ]
      },
    },
  };
});
