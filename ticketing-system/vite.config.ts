import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        // Optional: make sure all methods and paths are forwarded correctly
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(`[VITE PROXY] ${req.method} ${req.url} → ${proxyReq.path}`);
          });
        },
      },
    },
  },
});
