import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },  

  build: {
    chunkSizeWarningLimit: 1500,

    // NEW API for Vite 6 (Rolldown)
    splitChunks: {
      strategy: "default", // or "unbundle"
      // You can customize groups:
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: "react-vendor",
          priority: 10,
        },
        router: {
          test: /[\\/]node_modules[\\/](react-router-dom)[\\/]/,
          name: "router-vendor",
          priority: 9,
        },
        investigation: {
          test: /src\/pages\/Investigation/,
          name: "investigation-module",
          priority: 8,
        },
        caseMgmt: {
          test: /src\/pages\/Cases|src\/pages\/CaseManagement/,
          name: "case-management-module",
          priority: 7,
        },
        fieldExec: {
          test: /src\/pages\/FieldExecutive/,
          name: "field-executive-module",
          priority: 6,
        },
      },
    },
  },
});
