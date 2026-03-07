import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react-oxc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    basicSsl(),
  ],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
