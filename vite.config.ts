import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import tailwindcss from "@tailwindcss/postcss";
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [react()],
  base: isDev ? "/" : "./", // <-- THIS is the important part
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
