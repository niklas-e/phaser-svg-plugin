import { readFileSync } from "node:fs"

const raw = readFileSync(0, "utf8").trim()
if (!raw) {
  console.error("pack-check: expected npm pack --json input on stdin")
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(raw)
} catch (error) {
  console.error("pack-check: failed to parse npm pack json")
  console.error(String(error))
  process.exit(1)
}

const result = Array.isArray(payload) ? payload[0] : payload
if (!result || !Array.isArray(result.files)) {
  console.error("pack-check: unexpected npm pack json shape")
  process.exit(1)
}

const filePaths = result.files.map((entry) => entry.path)

const mustInclude = ["dist/phaser-svg.js", "dist/phaser-svg.cjs", "svg.d.ts"]
for (const required of mustInclude) {
  if (!filePaths.includes(required)) {
    console.error(`pack-check: missing required packaged file: ${required}`)
    process.exit(1)
  }
}

const forbiddenPrefixes = ["src/", "example/", "docs/", ".github/"]
for (const path of filePaths) {
  if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) {
    console.error(`pack-check: forbidden path in package: ${path}`)
    process.exit(1)
  }
}

console.log(`pack-check: ok (${filePaths.length} files)`)
