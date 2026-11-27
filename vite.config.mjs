import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import postcssNormalize from "postcss-normalize";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset({ compilationMode: "annotation" })],
    }),
  ],
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
