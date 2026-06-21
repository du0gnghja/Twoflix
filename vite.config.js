import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/ophim": {
        target: "https://ophim1.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ophim/, ""),
        secure: false,
      },
      "/api/kkphim": {
        target: "https://phimapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kkphim/, ""),
        secure: false,
      },
    },
  },
});
