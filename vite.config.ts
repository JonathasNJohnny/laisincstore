import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/Ranking": {
        target: "https://laisinc.com.br",
        changeOrigin: true,
      },
    },
  },
});
