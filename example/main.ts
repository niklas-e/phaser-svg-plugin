/// <reference types="vite/client" />

import Phaser from "phaser"
import { drawSVG } from "../src/index.ts"

import triangleSvg from "./svg/triangle.svg?raw"
import cubicBezierSvg from "./svg/cubic-bezier.svg?raw"
import quadraticBezierSvg from "./svg/quadratic-bezier.svg?raw"
import heartSvg from "./svg/heart.svg?raw"
import starSvg from "./svg/star.svg?raw"
import smoothCubicSvg from "./svg/smooth-cubic.svg?raw"
import smoothQuadraticSvg from "./svg/smooth-quadratic.svg?raw"
import relativeSvg from "./svg/relative.svg?raw"
import hvRectSvg from "./svg/hv-rect.svg?raw"
import rectPrimitivesSvg from "./svg/rect-primitives.svg?raw"
import trufflecoreLogo from "./svg/trufflecore-logo.svg?raw"

function assertDefined<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error("Expected value to be defined")
  }
  return value
}

interface TestCase {
  title: string
  svg: string
  width: number
  height: number
}

const testCases: TestCase[] = [
  { title: "Complex shape", svg: trufflecoreLogo, width: 200, height: 100 },
  { title: "Triangle (M / L / Z)", svg: triangleSvg, width: 120, height: 100 },
  { title: "Cubic Bézier (C)", svg: cubicBezierSvg, width: 120, height: 100 },
  {
    title: "Quadratic Bézier (Q)",
    svg: quadraticBezierSvg,
    width: 120,
    height: 100,
  },
  { title: "Heart — Arcs + Q", svg: heartSvg, width: 100, height: 100 },
  { title: "Star (complex polygon)", svg: starSvg, width: 100, height: 100 },
  { title: "Smooth Cubic (S)", svg: smoothCubicSvg, width: 140, height: 100 },
  {
    title: "Smooth Quadratic (T)",
    svg: smoothQuadraticSvg,
    width: 140,
    height: 100,
  },
  { title: "Relative cmds (m/l/z)", svg: relativeSvg, width: 120, height: 100 },
  { title: "H / V commands", svg: hvRectSvg, width: 120, height: 100 },
  {
    title: "Rect primitive (&lt;rect&gt;)",
    svg: rectPrimitivesSvg,
    width: 150,
    height: 100,
  },
]

const container = assertDefined(document.getElementById("comparisons"))

for (const tc of testCases) {
  // Row wrapper
  const row = document.createElement("div")
  row.className = "comparison"

  // Title
  const heading = document.createElement("div")
  heading.style.width = "140px"
  heading.style.flexShrink = "0"
  heading.style.paddingTop = "12px"
  heading.innerHTML = `<h2>${tc.title}</h2>`
  row.appendChild(heading)

  // Browser-native SVG panel
  const browserPanel = document.createElement("div")
  browserPanel.className = "panel"
  browserPanel.innerHTML = tc.svg
  const svgEl = assertDefined(browserPanel.querySelector("svg"))
  svgEl.setAttribute("width", String(tc.width))
  svgEl.setAttribute("height", String(tc.height))
  browserPanel.innerHTML += `<div class="label">Browser SVG</div>`
  row.appendChild(browserPanel)

  // Phaser panel
  const phaserPanel = document.createElement("div")
  phaserPanel.className = "panel"
  const phaserTarget = document.createElement("div")
  phaserTarget.id = `phaser-${tc.title.replace(/\W+/g, "-").toLowerCase()}`
  phaserPanel.appendChild(phaserTarget)
  phaserPanel.innerHTML += `<div class="label">Phaser (phaser-svg)</div>`
  row.appendChild(phaserPanel)

  container.appendChild(row)

  const parentId = phaserTarget.id
  const svg = tc.svg
  const logicalW = tc.width
  const logicalH = tc.height

  let game: Phaser.Game | null = null

  function createGame() {
    const dpr = window.devicePixelRatio || 1

    if (game) {
      game.destroy(true)
    }

    class CompareScene extends Phaser.Scene {
      create() {
        const g = this.add.graphics()
        g.setScale(dpr)
        drawSVG(g, svg, { width: logicalW, height: logicalH })
      }
    }

    game = new Phaser.Game({
      width: logicalW * dpr,
      height: logicalH * dpr,
      backgroundColor: "#16213e",
      scene: CompareScene,
      parent: parentId,
      banner: false,
    })

    // CSS size stays at logical pixels so the extra resolution = crispness
    requestAnimationFrame(() => {
      const canvas = document.querySelector(`#${CSS.escape(parentId)} canvas`)
      if (canvas instanceof HTMLCanvasElement) {
        canvas.style.width = `${logicalW}px`
        canvas.style.height = `${logicalH}px`
      }
    })
  }

  createGame()

  // Re-create when browser zoom changes (devicePixelRatio changes)
  function watchDpr() {
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      "change",
      () => {
        createGame()
        watchDpr()
      },
      { once: true },
    )
  }
  watchDpr()
}
