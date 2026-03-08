import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react-oxc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/lightningWalletSimulator/" : "/",
  plugins: [
    react(),
    nodePolyfills(),
    ...(mode === "production" ? [] : [basicSsl()]),
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
}));
