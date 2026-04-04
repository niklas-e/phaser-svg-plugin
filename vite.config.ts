import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PhaserSVG",
      formats: ["es", "cjs"],
      fileName: "phaser-svg",
    },
    rolldownOptions: {
      external: ["phaser"],
      output: {
        globals: {
          phaser: "Phaser",
        },
      },
    },
  },
})
