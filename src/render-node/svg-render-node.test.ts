import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { attachMsaaRenderStep } from "./svg-render-node.ts"

type RenderStepFn = (...args: unknown[]) => void

class FakeWebGL2Context {
  readonly MAX_SAMPLES = 0x8d57
  readonly FRAMEBUFFER = 0x8d40
  readonly RENDERBUFFER = 0x8d41
  readonly RENDERBUFFER_BINDING = 0x8ca7
  readonly COLOR_ATTACHMENT0 = 0x8ce0
  readonly TEXTURE_2D = 0x0de1
  readonly RGBA8 = 0x8058
  readonly READ_FRAMEBUFFER = 0x8ca8
  readonly DRAW_FRAMEBUFFER = 0x8ca9
  readonly COLOR_BUFFER_BIT = 0x4000
  readonly NEAREST = 0x2600

  private boundRenderbuffer: WebGLRenderbuffer | null = null

  getParameter(param: number): unknown {
    if (param === this.MAX_SAMPLES) {
      return 8
    }
    if (param === this.RENDERBUFFER_BINDING) {
      return this.boundRenderbuffer
    }
    return 0
  }

  createFramebuffer(): WebGLFramebuffer {
    return {} as WebGLFramebuffer
  }

  bindFramebuffer(_target: number, _fb: WebGLFramebuffer | null): void {}

  deleteFramebuffer(_fb: WebGLFramebuffer): void {}

  createRenderbuffer(): WebGLRenderbuffer {
    return {} as WebGLRenderbuffer
  }

  bindRenderbuffer(_target: number, rb: WebGLRenderbuffer | null): void {
    this.boundRenderbuffer = rb
  }

  deleteRenderbuffer(_rb: WebGLRenderbuffer): void {}

  renderbufferStorageMultisample(
    _target: number,
    _samples: number,
    _internalFormat: number,
    _width: number,
    _height: number,
  ): void {}

  framebufferRenderbuffer(
    _target: number,
    _attachment: number,
    _renderbufferTarget: number,
    _rb: WebGLRenderbuffer | null,
  ): void {}

  framebufferTexture2D(
    _target: number,
    _attachment: number,
    _textureTarget: number,
    _texture: WebGLTexture | null,
    _level: number,
  ): void {}

  clearColor(_r: number, _g: number, _b: number, _a: number): void {}

  clear(_mask: number): void {}

  blitFramebuffer(
    _srcX0: number,
    _srcY0: number,
    _srcX1: number,
    _srcY1: number,
    _dstX0: number,
    _dstY0: number,
    _dstX1: number,
    _dstY1: number,
    _mask: number,
    _filter: number,
  ): void {}
}

class FakeDrawingContext {
  width: number
  height: number
  texture: unknown = null
  framebuffer: unknown = null
  state: { bindings: { framebuffer: unknown } } = {
    bindings: { framebuffer: null },
  }

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  beginDraw(): void {}

  getClone(_preserveAutoClear?: boolean): FakeDrawingContext {
    return new FakeDrawingContext(this.width, this.height)
  }
}

class FakeGraphics {
  _renderSteps: RenderStepFn[] = []
  dispatchCalls: unknown[][] = []
  projectedPoint: { x: number; y: number } | null = null

  addRenderStep(fn: RenderStepFn, index = 0): void {
    this._renderSteps.splice(index, 0, fn)
  }

  once(_event: string, _fn: (...args: unknown[]) => void): void {}

  renderWebGLStep(
    renderer: unknown,
    gameObject: unknown,
    drawingContext: unknown,
    parentMatrix: unknown,
    renderStep: number,
    displayList: unknown,
    displayListIndex: unknown,
  ): void {
    this.projectedPoint = projectPoint(parentMatrix, 10, 20)
    this.dispatchCalls.push([
      renderer,
      gameObject,
      drawingContext,
      parentMatrix,
      renderStep,
      displayList,
      displayListIndex,
    ])
  }
}

function projectPoint(
  parentMatrix: unknown,
  x: number,
  y: number,
): { x: number; y: number } | null {
  if (!parentMatrix || typeof parentMatrix !== "object") {
    return null
  }

  const matrix = parentMatrix as {
    a?: number
    b?: number
    c?: number
    d?: number
    tx?: number
    ty?: number
  }

  if (
    typeof matrix.a !== "number" ||
    typeof matrix.b !== "number" ||
    typeof matrix.c !== "number" ||
    typeof matrix.d !== "number" ||
    typeof matrix.tx !== "number" ||
    typeof matrix.ty !== "number"
  ) {
    return null
  }

  return {
    x: matrix.a * x + matrix.c * y + matrix.tx,
    y: matrix.b * x + matrix.d * y + matrix.ty,
  }
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

function createRenderer(gl: FakeWebGL2Context): {
  gl: FakeWebGL2Context
  width: number
  height: number
  renderNodes: {
    finishBatch(): void
    getNode(name: string): { batch(...args: unknown[]): void }
  }
  createTextureFromSource(
    source: null,
    width: number,
    height: number,
    scaleMode: number,
  ): { webGLTexture: WebGLTexture | null }
  deleteTexture(texture: { webGLTexture: WebGLTexture | null }): void
} {
  return {
    gl,
    width: 320,
    height: 180,
    renderNodes: {
      finishBatch: () => {},
      getNode: (_name: string) => ({
        batch: (..._args: unknown[]) => {},
      }),
    },
    createTextureFromSource: (
      _source: null,
      _width: number,
      _height: number,
      _scaleMode: number,
    ) => ({ webGLTexture: {} as WebGLTexture }),
    deleteTexture: (_texture: { webGLTexture: WebGLTexture | null }) => {},
  }
}

describe("attachMsaaRenderStep render-step forwarding", () => {
  it("still dispatches a top-level Graphics render through Phaser's dispatcher", () => {
    withFakeWebGL2Context(() => {
      const gl = new FakeWebGL2Context()
      const renderer = createRenderer(gl)
      const graphics = new FakeGraphics()

      // If the wrapper incorrectly calls _renderSteps[1] directly, this throws.
      graphics._renderSteps[1] = () => {
        throw new Error("should not call _renderSteps[1] directly")
      }

      attachMsaaRenderStep(
        graphics as unknown as Phaser.GameObjects.Graphics,
        renderer as unknown as Parameters<typeof attachMsaaRenderStep>[1],
        4,
      )

      const step = graphics._renderSteps[0]
      assert.ok(step)

      const drawingContext = new FakeDrawingContext(320, 180)
      step(
        renderer,
        graphics,
        drawingContext,
        undefined,
        undefined,
        undefined,
        undefined,
      )

      assert.equal(graphics.dispatchCalls.length, 1)
      const [
        passedRenderer,
        passedGameObject,
        passedContext,
        passedParentMatrix,
        passedRenderStep,
      ] = graphics.dispatchCalls[0] ?? []

      assert.equal(passedRenderer, renderer)
      assert.equal(passedGameObject, graphics)
      assert.notEqual(passedContext, drawingContext)
      assert.equal(passedParentMatrix, undefined)
      assert.equal(passedRenderStep, 1)
    })
  })

  it("forwards parentMatrix for container-transformed Graphics", () => {
    withFakeWebGL2Context(() => {
      const gl = new FakeWebGL2Context()
      const renderer = createRenderer(gl)
      const graphics = new FakeGraphics()

      attachMsaaRenderStep(
        graphics as unknown as Phaser.GameObjects.Graphics,
        renderer as unknown as Parameters<typeof attachMsaaRenderStep>[1],
        4,
      )

      const step = graphics._renderSteps[0]
      assert.ok(step)

      const parentMatrix = { a: 1, b: 0, c: 0, d: 1, tx: 128, ty: 72 }
      const displayList = { name: "container-display-list" }
      const displayListIndex = 9

      step(
        renderer,
        graphics,
        new FakeDrawingContext(320, 180),
        parentMatrix,
        0,
        displayList,
        displayListIndex,
      )

      const forwarded = graphics.dispatchCalls[0]
      assert.equal(forwarded?.[3], parentMatrix)
      assert.equal(forwarded?.[5], displayList)
      assert.equal(forwarded?.[6], displayListIndex)
      assert.deepEqual(graphics.projectedPoint, { x: 138, y: 92 })
    })
  })

  it("advances from step N to N+1 and keeps display-list arguments", () => {
    withFakeWebGL2Context(() => {
      const gl = new FakeWebGL2Context()
      const renderer = createRenderer(gl)
      const graphics = new FakeGraphics()

      attachMsaaRenderStep(
        graphics as unknown as Phaser.GameObjects.Graphics,
        renderer as unknown as Parameters<typeof attachMsaaRenderStep>[1],
        4,
      )

      const step = graphics._renderSteps[0]
      assert.ok(step)

      const displayList = { id: "scene-list" }
      const displayListIndex = 42

      step(
        renderer,
        graphics,
        new FakeDrawingContext(320, 180),
        { tx: 5, ty: 10 },
        2,
        displayList,
        displayListIndex,
      )

      assert.equal(graphics.dispatchCalls.length, 1)
      const forwarded = graphics.dispatchCalls[0]
      assert.equal(forwarded?.[4], 3)
      assert.equal(forwarded?.[5], displayList)
      assert.equal(forwarded?.[6], displayListIndex)
    })
  })
})
