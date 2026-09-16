import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/ranking": {
        target: "http://vps9769.integrator.host:9090",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/ranking/, "/Ranking/getMonthlyRanking"),
      },
    },
  },
});
