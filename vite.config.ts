import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: {
        "phaser-svg": resolve(__dirname, "src/index.ts"),
        "vite-plugin": resolve(__dirname, "src/vite-plugin.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rolldownOptions: {
      external: ["phaser", /^node:/],
      output: {
        globals: {
          phaser: "Phaser",
        },
      },
    },
  },
})
