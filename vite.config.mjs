import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import postcssNormalize from "postcss-normalize";

export default defineConfig({
  plugins: [react()],
  base: "/TaskPlanner_javareact/",
  css: {
    postcss: {
      plugins: [postcssNormalize()],
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "build",
  },
});
