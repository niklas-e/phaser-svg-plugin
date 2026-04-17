/// <reference types="vite/client" />

import { Game, Scene, WEBGL } from "phaser"
import { drawSVG } from "../src/index.ts"
import { installBenchmarkPanel, type BenchmarkFixture } from "./benchmark.ts"

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
import circlePrimitivesSvg from "./svg/circle-primitives.svg?raw"
import ellipsePrimitivesSvg from "./svg/ellipse-primitives.svg?raw"
import linePolyPrimitivesSvg from "./svg/line-poly-primitives.svg?raw"
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
  {
    title: "Circle primitive (&lt;circle&gt;)",
    svg: circlePrimitivesSvg,
    width: 150,
    height: 100,
  },
  {
    title: "Ellipse primitive (&lt;ellipse&gt;)",
    svg: ellipsePrimitivesSvg,
    width: 160,
    height: 100,
  },
  {
    title: "Line / Polyline / Polygon",
    svg: linePolyPrimitivesSvg,
    width: 180,
    height: 100,
  },
]

const container = assertDefined(document.getElementById("comparisons"))
const benchmarkFixtures: BenchmarkFixture[] = []

for (const tc of testCases) {
  const slug = tc.title.replace(/\W+/g, "-").toLowerCase()

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
  const browserLabel = document.createElement("div")
  browserLabel.className = "label"
  browserLabel.textContent = "Browser SVG"
  browserPanel.appendChild(browserLabel)
  row.appendChild(browserPanel)

  // Phaser panel
  const phaserPanel = document.createElement("div")
  phaserPanel.className = "panel"
  const phaserTarget = document.createElement("div")
  phaserTarget.id = `phaser-${slug}`
  phaserPanel.appendChild(phaserTarget)
  const phaserLabel = document.createElement("div")
  phaserLabel.className = "label"
  phaserLabel.textContent = "Phaser (phaser-svg)"
  phaserPanel.appendChild(phaserLabel)
  row.appendChild(phaserPanel)

  // Vanilla Phaser panel — render SVG as a regular texture-backed image
  const vanillaPhaserPanel = document.createElement("div")
  vanillaPhaserPanel.className = "panel"
  const vanillaPhaserTarget = document.createElement("div")
  vanillaPhaserTarget.id = `phaser-vanilla-${slug}`
  vanillaPhaserPanel.appendChild(vanillaPhaserTarget)
  const vanillaPhaserLabel = document.createElement("div")
  vanillaPhaserLabel.className = "label"
  vanillaPhaserLabel.textContent = "Phaser (vanilla)"
  vanillaPhaserPanel.appendChild(vanillaPhaserLabel)
  row.appendChild(vanillaPhaserPanel)

  // Canvas 2D panel — rasterizes the SVG via Image then draws to a 2D canvas
  const canvas2dPanel = document.createElement("div")
  canvas2dPanel.className = "panel"
  const canvas2d = document.createElement("canvas")
  canvas2d.style.width = `${tc.width}px`
  canvas2d.style.height = `${tc.height}px`
  canvas2d.style.background = "#16213e"
  canvas2dPanel.appendChild(canvas2d)
  const canvas2dLabel = document.createElement("div")
  canvas2dLabel.className = "label"
  canvas2dLabel.textContent = "Canvas 2D"
  canvas2dPanel.appendChild(canvas2dLabel)
  row.appendChild(canvas2dPanel)

  // WebGL panel — draws the rasterized SVG as a textured quad
  const webglPanel = document.createElement("div")
  webglPanel.className = "panel"
  const webglCanvas = document.createElement("canvas")
  webglCanvas.style.width = `${tc.width}px`
  webglCanvas.style.height = `${tc.height}px`
  webglCanvas.style.background = "#16213e"
  webglPanel.appendChild(webglCanvas)
  const webglLabel = document.createElement("div")
  webglLabel.className = "label"
  webglLabel.textContent = "WebGL"
  webglPanel.appendChild(webglLabel)
  row.appendChild(webglPanel)

  container.appendChild(row)

  const phaserParentId = phaserTarget.id
  const vanillaPhaserParentId = vanillaPhaserTarget.id
  const svg = tc.svg
  const logicalW = tc.width
  const logicalH = tc.height

  benchmarkFixtures.push({
    title: tc.title,
    slug,
    svg,
    width: logicalW,
    height: logicalH,
    pluginParentId: phaserParentId,
    vanillaParentId: vanillaPhaserParentId,
  })

  // -- Shared: rasterize SVG string to an Image at DPR resolution -----------
  function rasterizeSVG(
    callback: (img: HTMLImageElement, dpr: number) => void,
  ) {
    const dpr = window.devicePixelRatio || 1
    const pixelW = logicalW * dpr
    const pixelH = logicalH * dpr
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, "image/svg+xml")
    const root = doc.documentElement
    if (root.tagName.toLowerCase() !== "svg") {
      console.error("SVG root element missing", tc.title)
      return
    }

    root.setAttribute("width", String(pixelW))
    root.setAttribute("height", String(pixelH))
    if (!root.hasAttribute("xmlns")) {
      root.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    }

    const sized = new XMLSerializer().serializeToString(root)
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`
    const img = new Image()
    img.onload = () => {
      callback(img, dpr)
    }
    img.onerror = () => {
      console.error("Failed to rasterize SVG", tc.title)
    }
    img.src = url
  }

  // -- Canvas 2D -------------------------------------------------------------
  function drawCanvas2d() {
    rasterizeSVG((img, dpr) => {
      canvas2d.width = logicalW * dpr
      canvas2d.height = logicalH * dpr
      const ctx = canvas2d.getContext("2d")
      if (!ctx) return
      ctx.clearRect(0, 0, canvas2d.width, canvas2d.height)
      ctx.drawImage(img, 0, 0, canvas2d.width, canvas2d.height)
    })
  }
  drawCanvas2d()

  // -- WebGL -----------------------------------------------------------------
  function drawWebGL() {
    rasterizeSVG((img, dpr) => {
      webglCanvas.width = logicalW * dpr
      webglCanvas.height = logicalH * dpr
      const gl = webglCanvas.getContext("webgl", { premultipliedAlpha: false })
      if (!gl) return

      // Shaders
      const vs = assertDefined(gl.createShader(gl.VERTEX_SHADER))
      gl.shaderSource(
        vs,
        `attribute vec2 a_pos;
         attribute vec2 a_uv;
         varying vec2 v_uv;
         void main() {
           v_uv = a_uv;
           gl_Position = vec4(a_pos, 0.0, 1.0);
         }`,
      )
      gl.compileShader(vs)

      const fs = assertDefined(gl.createShader(gl.FRAGMENT_SHADER))
      gl.shaderSource(
        fs,
        `precision mediump float;
         varying vec2 v_uv;
         uniform sampler2D u_tex;
         void main() {
           gl_FragColor = texture2D(u_tex, v_uv);
         }`,
      )
      gl.compileShader(fs)

      const prog = assertDefined(gl.createProgram())
      gl.attachShader(prog, vs)
      gl.attachShader(prog, fs)
      gl.linkProgram(prog)
      gl.useProgram(prog)

      // Full-screen quad: position + UV interleaved
      const verts = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
      ])
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

      const aPos = gl.getAttribLocation(prog, "a_pos")
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
      const aUV = gl.getAttribLocation(prog, "a_uv")
      gl.enableVertexAttribArray(aUV)
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8)

      // Texture from the rasterized SVG image
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      // Draw
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.clearColor(22 / 255, 33 / 255, 62 / 255, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    })
  }
  drawWebGL()

  // -- Phaser ----------------------------------------------------------------
  let pluginGame: Game | null = null
  let vanillaPhaserGame: Game | null = null

  function resizePhaserCanvas(parentId: string): void {
    requestAnimationFrame(() => {
      const canvas = document.querySelector(`#${CSS.escape(parentId)} canvas`)
      if (canvas instanceof HTMLCanvasElement) {
        canvas.style.width = `${logicalW}px`
        canvas.style.height = `${logicalH}px`
      }
    })
  }

  function createPluginGame() {
    const dpr = window.devicePixelRatio || 1

    if (pluginGame) {
      pluginGame.destroy(true)
    }

    class CompareScene extends Scene {
      create() {
        const renderer = this.sys.game
          .renderer as Phaser.Renderer.WebGL.WebGLRenderer
        if (!(renderer.gl instanceof WebGL2RenderingContext)) {
          throw new Error(
            "phaser-svg example: expected WebGL2 renderer context for MSAA",
          )
        }

        const g = this.add.graphics()
        drawSVG(g, svg, {
          width: logicalW * dpr,
          height: logicalH * dpr,
          msaaSamples: 8,
        })
      }
    }

    // MSAA requires a WebGL2 context.
    const msaaCanvas = document.createElement("canvas")
    const gl2 = msaaCanvas.getContext("webgl2") as WebGL2RenderingContext | null
    if (!gl2) {
      throw new Error(
        "WebGL2 is required for MSAA but is not available in this browser.",
      )
    }

    pluginGame = new Game({
      width: logicalW * dpr,
      height: logicalH * dpr,
      type: WEBGL,
      backgroundColor: "#16213e",
      scene: CompareScene,
      parent: phaserParentId,
      canvas: msaaCanvas,
      // @ts-expect-error Phaser v4 typings currently restrict GameConfig.context
      // to CanvasRenderingContext2D, but WebGLRenderer accepts a provided GL context.
      // We intentionally pass WebGL2 to force MSAA-capable rendering.
      context: gl2,
      banner: false,
    })

    // CSS size stays at logical pixels so the extra resolution = crispness
    resizePhaserCanvas(phaserParentId)
  }

  function createVanillaPhaserGame() {
    const dpr = window.devicePixelRatio || 1

    if (vanillaPhaserGame) {
      vanillaPhaserGame.destroy(true)
    }

    const key = `vanilla-svg-${slug}`
    const svgBlobUrl = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    )
    let blobUrlRevoked = false
    function revokeBlobUrl() {
      if (blobUrlRevoked) return
      URL.revokeObjectURL(svgBlobUrl)
      blobUrlRevoked = true
    }

    class VanillaCompareScene extends Scene {
      preload() {
        this.load.svg(key, svgBlobUrl, {
          width: logicalW * dpr,
          height: logicalH * dpr,
        })
      }

      create() {
        revokeBlobUrl()
        if (!this.textures.exists(key)) {
          console.error("Phaser vanilla SVG failed to load", tc.title)
          return
        }

        const sprite = this.add.image(
          (logicalW * dpr) / 2,
          (logicalH * dpr) / 2,
          key,
        )
        sprite.setDisplaySize(logicalW * dpr, logicalH * dpr)
      }

      shutdown() {
        revokeBlobUrl()
      }
    }

    vanillaPhaserGame = new Game({
      width: logicalW * dpr,
      height: logicalH * dpr,
      backgroundColor: "#16213e",
      scene: VanillaCompareScene,
      parent: vanillaPhaserParentId,
      banner: false,
    })

    resizePhaserCanvas(vanillaPhaserParentId)
  }

  createPluginGame()
  createVanillaPhaserGame()

  // Re-create all panels when browser zoom changes (devicePixelRatio changes)
  function watchDpr() {
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      "change",
      () => {
        createPluginGame()
        createVanillaPhaserGame()
        drawCanvas2d()
        drawWebGL()
        watchDpr()
      },
      { once: true },
    )
  }
  watchDpr()
}

installBenchmarkPanel(benchmarkFixtures)
