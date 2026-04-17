import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { SVGSceneBatch } from "./scene-batch.ts"

class FakeWebGL2Context {
  readonly MAX_SAMPLES = 0x8d57

  getParameter(param: number): unknown {
    if (param === this.MAX_SAMPLES) {
      return 8
    }
    return 0
  }
}

class FakeEvents {
  private listeners = new Map<string, Set<() => void>>()

  on(event: string, fn: () => void): void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(fn)
  }

  off(event: string, fn: () => void): void {
    this.listeners.get(event)?.delete(fn)
  }

  once(event: string, fn: () => void): void {
    const wrapped = () => {
      this.off(event, wrapped)
      fn()
    }
    this.on(event, wrapped)
  }

  emit(event: string): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks) {
      return
    }
    for (const callback of callbacks) {
      callback()
    }
  }
}

class FakeGraphics {
  _renderSteps: ((...args: unknown[]) => void)[] = []
  clearCalls = 0
  fillTriangleCalls = 0
  minTriangleX = Infinity

  clear(): this {
    this.clearCalls += 1
    return this
  }

  fillStyle(): this {
    return this
  }

  lineStyle(): this {
    return this
  }

  fillTriangle(
    x0: number,
    _y0: number,
    x1: number,
    _y1: number,
    x2: number,
    _y2: number,
  ): this {
    this.fillTriangleCalls += 1
    this.minTriangleX = Math.min(this.minTriangleX, x0, x1, x2)
    return this
  }

  fillEllipse(): this {
    return this
  }

  addRenderStep(fn: (...args: unknown[]) => void, index = 0): void {
    this._renderSteps.splice(index, 0, fn)
  }

  once(_event: string, _fn: (...args: unknown[]) => void): void {}

  renderWebGLStep(): void {}
}

function withFakeWebGL2Context(testFn: () => void): void {
  const globals = globalThis as {
    WebGL2RenderingContext?: unknown
  }
  const previous = globals.WebGL2RenderingContext

  globals.WebGL2RenderingContext =
    FakeWebGL2Context as unknown as typeof WebGL2RenderingContext

  try {
    testFn()
  } finally {
    if (previous === undefined) {
      delete globals.WebGL2RenderingContext
    } else {
      globals.WebGL2RenderingContext = previous
    }
  }
}

function createScene(
  graphics: FakeGraphics,
  options?: { withConfig?: boolean },
): Phaser.Scene {
  const events = new FakeEvents()
  const renderer: {
    gl: WebGLRenderingContext
    width: number
    height: number
    config?: { pathDetailThreshold: number } | undefined
    pathDetailThreshold?: number | undefined
    renderNodes: {
      finishBatch: () => void
      getNode: () => { batch: () => void }
    }
    createTextureFromSource: () => { webGLTexture: WebGLTexture }
    deleteTexture: () => void
  } = {
    gl: new FakeWebGL2Context() as unknown as WebGLRenderingContext,
    width: 320,
    height: 180,
    renderNodes: {
      finishBatch: () => {},
      getNode: () => ({ batch: () => {} }),
    },
    createTextureFromSource: () => ({ webGLTexture: {} as WebGLTexture }),
    deleteTexture: () => {},
  }

  if (options?.withConfig === false) {
    renderer.pathDetailThreshold = 1
  } else {
    renderer.config = { pathDetailThreshold: 1 }
  }

  return {
    sys: {
      game: {
        renderer,
      },
      events,
    },
    add: {
      graphics: () => graphics as unknown as Phaser.GameObjects.Graphics,
    },
  } as unknown as Phaser.Scene
}

describe("SVGSceneBatch", () => {
  it("flushes queued compiled draws in one pass", () => {
    withFakeWebGL2Context(() => {
      const graphics = new FakeGraphics()
      const scene = createScene(graphics)
      const batch = new SVGSceneBatch(scene, {
        graphics: graphics as unknown as Phaser.GameObjects.Graphics,
        autoFlush: false,
      })

      batch.queuePath("M 0 0 L 20 0 L 20 20 L 0 20 Z", { fill: 0xffffff })
      batch.queuePath(
        "M 0 0 L 10 0 L 10 10 L 0 10 Z",
        { fill: 0xff0000 },
        {
          x: 40,
          y: 0,
        },
      )

      const flushed = batch.flush()
      assert.equal(flushed, true)
      assert.equal(graphics.clearCalls, 1)
      assert.ok(graphics.fillTriangleCalls > 0)
      assert.equal(graphics._renderSteps.length, 1)

      const flushedAgain = batch.flush()
      assert.equal(flushedAgain, false)
    })
  })

  it("auto-flushes on postupdate event when enabled", () => {
    withFakeWebGL2Context(() => {
      const graphics = new FakeGraphics()
      const scene = createScene(graphics)
      const batch = new SVGSceneBatch(scene)

      batch.queuePath("M 0 0 L 10 0 L 10 10 Z", { fill: 0x00ff00 }, { x: 8 })

      const events = (
        scene as unknown as {
          sys: { events: FakeEvents }
        }
      ).sys.events
      events.emit("postupdate")

      assert.equal(graphics.clearCalls, 1)
      assert.ok(graphics.fillTriangleCalls > 0)
      assert.ok(graphics.minTriangleX >= 8)
    })
  })

  it("disables simplification when threshold lives on renderer root", () => {
    withFakeWebGL2Context(() => {
      const graphics = new FakeGraphics()
      const scene = createScene(graphics, { withConfig: false })
      const batch = new SVGSceneBatch(scene, {
        graphics: graphics as unknown as Phaser.GameObjects.Graphics,
        autoFlush: false,
      })

      batch.queuePath("M 0 0 L 10 0 L 10 10 Z", { fill: 0x00ff00 })
      batch.flush()

      const renderer = (
        scene as unknown as {
          sys: { game: { renderer: { pathDetailThreshold?: number } } }
        }
      ).sys.game.renderer
      assert.equal(renderer.pathDetailThreshold, 0)
    })
  })
})
