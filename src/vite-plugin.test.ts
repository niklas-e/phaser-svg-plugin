import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it } from "node:test"
import { phaserSVG } from "./vite-plugin.ts"

type LoadHook = (id: string) => Promise<string | null> | string | null

function getLoadHook(plugin: ReturnType<typeof phaserSVG>): LoadHook {
  const load = plugin.load
  if (!load) {
    throw new Error("Vite plugin load hook is missing")
  }
  if (typeof load === "function") {
    return (id) => load.call({} as never, id) as string | null
  }
  return (id) =>
    load.handler.call({} as never, id) as Promise<string | null> | string | null
}

describe("phaserSVG vite plugin", () => {
  it("embeds global msaaSamples default into compiled module output", async () => {
    const dir = await mkdtemp(join(tmpdir(), "phaser-svg-vite-plugin-"))
    const svgPath = join(dir, "icon.svg")

    try {
      await writeFile(svgPath, `<svg><path d="M 0 0 L 1 1" /></svg>`, "utf-8")

      const plugin = phaserSVG({ msaaSamples: 8 })
      const load = getLoadHook(plugin)

      const code = await load(svgPath)

      assert.equal(typeof code, "string")
      assert.match(code ?? "", /export default/)
      assert.match(code ?? "", /"msaaSamples":8/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it("omits msaaSamples when global option is not provided", async () => {
    const dir = await mkdtemp(join(tmpdir(), "phaser-svg-vite-plugin-"))
    const svgPath = join(dir, "icon.svg")

    try {
      await writeFile(svgPath, `<svg><path d="M 0 0 L 1 1" /></svg>`, "utf-8")

      const plugin = phaserSVG()
      const load = getLoadHook(plugin)

      const code = await load(svgPath)

      assert.equal(typeof code, "string")
      assert.doesNotMatch(code ?? "", /"msaaSamples"/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
