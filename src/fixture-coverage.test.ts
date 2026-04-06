import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, it } from "node:test"
import { compileSVG } from "./compiler.ts"

const FIXTURE_DIR = join(process.cwd(), "example", "svg")

describe("svg fixture coverage", () => {
  it("compiles all example SVG fixtures", async () => {
    const entries = await readdir(FIXTURE_DIR)
    const files = entries.filter((entry) => entry.endsWith(".svg")).sort()

    assert.ok(files.length > 0, "Expected at least one SVG fixture")

    for (const file of files) {
      const raw = await readFile(join(FIXTURE_DIR, file), "utf8")
      const compiled = compileSVG(raw)

      assert.ok(
        compiled.items.length > 0 || compiled.paths.length > 0,
        `Expected at least one compiled shape in fixture ${file}`,
      )
    }
  })
})
