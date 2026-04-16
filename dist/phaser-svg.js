import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, s as p, t as m, u as h } from "./compiler-2DWgYub9.js";
import { Plugins as g } from "phaser";
//#region src/dirty-state.ts
var _ = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new WeakSet();
function y(e, t) {
	return v.has(e) ? !0 : _.get(e) !== t;
}
function b(e) {
	return _.has(e);
}
function x(e, t) {
	_.set(e, t), v.delete(e);
}
function S(e) {
	v.add(e);
}
function C(e) {
	_.delete(e), v.delete(e);
}
//#endregion
//#region src/quality.ts
function w(e) {
	return e?.curveResolution ?? 32;
}
function T(e) {
	if (!e) return !1;
	let t = e.pathDetailThreshold;
	return !Number.isFinite(t) || t === void 0 || t <= 0 ? !1 : (e.pathDetailThreshold = 0, !0);
}
//#endregion
//#region src/line-cap.ts
function E(e, t, n) {
	let r = e.x - t.x, i = e.y - t.y, a = Math.sqrt(r * r + i * i);
	if (a < 1e-10) return null;
	let o = r / a, s = i / a, c = s * n, l = -o * n, u = o * n, d = s * n;
	return [
		{
			x: e.x + c,
			y: e.y + l
		},
		{
			x: e.x - c,
			y: e.y - l
		},
		{
			x: e.x - c + u,
			y: e.y - l + d
		},
		{
			x: e.x + c + u,
			y: e.y + l + d
		}
	];
}
//#endregion
//#region src/line-join.ts
function D(e, t, n, r) {
	let i = k(e, t, n, r);
	return i === null ? null : i.bevel;
}
function O(e, t, n, r, i) {
	let a = k(e, t, n, r);
	if (a === null) return null;
	let { bevel: o, dInX: s, dInY: c, dOutX: l, dOutY: u, lenIn: d, lenOut: f } = a, p = 1 - -(s * l + c * u) / (d * f);
	if (p < 1e-10) return null;
	if (2 / p > i * i) return {
		bevel: o,
		miter: null
	};
	let m = s / d, h = c / d, g = l / f, _ = u / f, v = -(m * _ - h * g);
	if (Math.abs(v) < 1e-10) return null;
	let y = o[1].x - o[0].x, b = o[1].y - o[0].y, x = (-y * _ + b * g) / v;
	return {
		bevel: o,
		miter: {
			x: o[0].x + x * m,
			y: o[0].y + x * h
		}
	};
}
function k(e, t, n, r) {
	let i = t.x - e.x, a = t.y - e.y, o = n.x - t.x, s = n.y - t.y, c = Math.sqrt(i * i + a * a), l = Math.sqrt(o * o + s * s);
	if (c < 1e-10 || l < 1e-10) return null;
	let u = i * s - a * o;
	if (Math.abs(u) < 1e-10) return null;
	let d = u > 0 ? 1 : -1;
	return {
		bevel: [{
			x: t.x + d * a * r / c,
			y: t.y - d * i * r / c
		}, {
			x: t.x + d * s * r / l,
			y: t.y - d * o * r / l
		}],
		dInX: i,
		dInY: a,
		dOutX: o,
		dOutY: s,
		lenIn: c,
		lenOut: l
	};
}
//#endregion
//#region src/renderer.ts
var A = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap(), N = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap();
function ee(e) {
	let t = A.get(e);
	if (t !== void 0) return t;
	let n = e.every((e) => e.type === "M" || e.type === "L" || e.type === "Z");
	return A.set(e, n), n;
}
function F(e, t, n, r) {
	let i = n.fill === null ? 0 : n.fillAlpha * n.opacity, a = n.stroke === null ? 0 : n.strokeAlpha * n.opacity, o = n.fill !== null && i > 0, s = n.stroke !== null && n.strokeWidth > 0 && a > 0;
	!o && !s || (ee(t) ? te(e, t, n, i, a, o, s) : ne(e, t, n, i, a, o, s, r));
}
function te(e, t, n, r, a, o, s) {
	let c = re(t);
	if (c.length !== 0) {
		if (o && c.some((e) => e.closed) && I(e, c, n, r), s) {
			let t = i(n.stroke);
			e.lineStyle(n.strokeWidth, t, a);
			for (let { points: t, closed: n } of c) {
				e.beginPath();
				let r = i(t[0]);
				e.moveTo(r.x, r.y);
				for (let n = 1; n < t.length; n++) {
					let r = i(t[n]);
					e.lineTo(r.x, r.y);
				}
				n && e.closePath(), e.strokePath();
			}
		}
		if (s) for (let { points: t, closed: r } of c) B(e, t, r, n, a);
	}
}
function ne(e, t, n, r, a, o, s, c) {
	let l = ie(t, w(c));
	if (l.length !== 0) {
		if (o && l.some((e) => e.closed) && I(e, l, n, r), s) {
			let t = i(n.stroke);
			e.lineStyle(n.strokeWidth, t, a);
			for (let { points: t, closed: n } of l) {
				e.beginPath();
				let r = i(t[0]);
				e.moveTo(r.x, r.y);
				for (let n = 1; n < t.length; n++) {
					let r = i(t[n]);
					e.lineTo(r.x, r.y);
				}
				n && e.closePath(), e.strokePath();
			}
		}
		if (s) for (let { points: t, closed: r } of l) B(e, t, r, n, a);
	}
}
function re(e) {
	let t = j.get(e);
	if (t) return t;
	let n = z(e), r = [];
	for (let e of n) {
		let t = [], n = !1;
		for (let r of e) r.type === "Z" ? n = !0 : "x" in r && "y" in r && t.push(r);
		t.length > 0 && r.push({
			points: t,
			closed: n
		});
	}
	return j.set(e, r), r;
}
function ie(e, t) {
	let n = M.get(e);
	n || (n = /* @__PURE__ */ new Map(), M.set(e, n));
	let r = n.get(t);
	if (r) return r;
	let a = z(e), o = [];
	for (let e of a) {
		if (e.length === 0) continue;
		let n = i(e[0], "Subpath must start with a command");
		if (n.type !== "M") continue;
		let r = [{
			x: n.x,
			y: n.y
		}], a = n.x, s = n.y, c = !1;
		for (let n = 1; n < e.length; n++) {
			let o = i(e[n], `Expected command at index ${n}`);
			switch (o.type) {
				case "M":
					a = o.x, s = o.y, r.push({
						x: a,
						y: s
					});
					break;
				case "L":
					a = o.x, s = o.y, r.push({
						x: a,
						y: s
					});
					break;
				case "C":
					ae(a, s, o.x1, o.y1, o.x2, o.y2, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "Q":
					oe(a, s, o.x1, o.y1, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "A":
					se(a, s, o, t, r), a = o.x, s = o.y;
					break;
				case "Z":
					c = !0;
					break;
			}
		}
		let l = he(r);
		l.length > 1 && o.push({
			points: l,
			closed: c
		});
	}
	return n.set(t, o), o;
}
function ae(e, t, n, r, i, a, o, s, c, l) {
	for (let u = 1; u <= c; u++) {
		let d = u / c, f = 1 - d, p = f * f, m = d * d, h = p * f * e + 3 * p * d * n + 3 * f * m * i + m * d * o, g = p * f * t + 3 * p * d * r + 3 * f * m * a + m * d * s;
		l.push({
			x: h,
			y: g
		});
	}
}
function oe(e, t, n, r, i, a, o, s) {
	for (let c = 1; c <= o; c++) {
		let l = c / o, u = 1 - l, d = u * u * e + 2 * u * l * n + l * l * i, f = u * u * t + 2 * u * l * r + l * l * a;
		s.push({
			x: d,
			y: f
		});
	}
}
function se(e, t, n, r, i) {
	let { startAngle: a, endAngle: o, rx: s, ry: c, cx: l, cy: u } = me(e, t, n.rx, n.ry, n.xAxisRotation, n.largeArc, n.sweep, n.x, n.y), d = n.xAxisRotation * Math.PI / 180, f = Math.cos(d), p = Math.sin(d), m = o - a;
	for (let e = 1; e <= r; e++) {
		let t = a + e / r * m, n = Math.cos(t), o = Math.sin(t), d = f * s * n - p * c * o + l, h = p * s * n + f * c * o + u;
		i.push({
			x: d,
			y: h
		});
	}
}
function I(e, t, n, r) {
	let a = ce(t);
	if (a.length !== 0) {
		e.fillStyle(i(n.fill), r);
		for (let t of a) {
			e.beginPath();
			let a = i(t.ring[0]);
			e.moveTo(a.x, a.y);
			for (let n = 1; n < t.ring.length; n++) {
				let r = i(t.ring[n]);
				e.lineTo(r.x, r.y);
			}
			if (e.closePath(), e.fillPath(), !t.bridges || t.bridges.length === 0) continue;
			let o = i(n.fill);
			e.lineStyle(1, o, r);
			for (let n of t.bridges) e.beginPath(), e.moveTo(n.a.x, n.a.y), e.lineTo(n.b.x, n.b.y), e.strokePath();
		}
	}
}
function ce(e) {
	let t = N.get(e);
	if (t) return t;
	let n = e.filter((e) => e.closed);
	if (n.length === 0) return N.set(e, []), [];
	let r = ue(n).map((e) => {
		if (e.holes.length === 0) return { ring: e.outer };
		let t = le(e.outer, e.holes);
		return {
			ring: t.ring,
			bridges: t.bridges
		};
	});
	return N.set(e, r), r;
}
function le(e, t) {
	let n = Array.from(e), r = [];
	for (let e of t) {
		let t = Infinity, a = 0, o = 0;
		for (let r = 0; r < n.length; r++) {
			let s = i(n[r]);
			for (let n = 0; n < e.length; n++) {
				let c = i(e[n]), l = s.x - c.x, u = s.y - c.y, d = l * l + u * u;
				d < t && (t = d, a = r, o = n);
			}
		}
		let s = i(n[a]), c = i(e[o]), l = e.length;
		r.push({
			a: s,
			b: c
		});
		let u = [];
		for (let e = 0; e <= a; e++) u.push(i(n[e]));
		for (let t = 0; t <= l; t++) u.push(i(e[(o + t) % l]));
		u.push(s);
		for (let e = a + 1; e < n.length; e++) u.push(i(n[e]));
		n = u;
	}
	return {
		ring: n,
		bridges: r
	};
}
function ue(e) {
	let t = e.length;
	if (t === 1) return [{
		outer: i(e[0]).points,
		holes: []
	}];
	let n = [];
	for (let r = 0; r < t; r++) {
		let t = i(e[r]).points;
		n.push({
			points: t,
			area: pe(t),
			bbox: de(t)
		});
	}
	let r = 0, a = 0;
	for (let e of n) e.area > 0 ? r += e.area : a -= e.area;
	let o = r >= a, s = [], c = [];
	for (let e of n) e.area > 0 === o ? s.push(e) : c.push(e);
	if (s.length === 0) return n.map((e) => ({
		outer: e.points,
		holes: []
	}));
	let l = s.map((e) => ({
		outer: e.points,
		holes: []
	}));
	for (let e of c) {
		let t = -1, n = Infinity;
		for (let r = 0; r < s.length; r++) {
			let a = i(s[r]);
			fe(a.bbox, e.bbox) && Math.abs(a.area) < n && (n = Math.abs(a.area), t = r);
		}
		t >= 0 && i(l[t]).holes.push(e.points);
	}
	return l;
}
function de(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) a.x < t && (t = a.x), a.y < n && (n = a.y), a.x > r && (r = a.x), a.y > i && (i = a.y);
	return {
		minX: t,
		minY: n,
		maxX: r,
		maxY: i
	};
}
function fe(e, t) {
	return t.minX >= e.minX && t.minY >= e.minY && t.maxX <= e.maxX && t.maxY <= e.maxY;
}
function pe(e) {
	let t = 0;
	for (let n = 0, r = e.length; n < r; n++) {
		let a = i(e[n]), o = i(e[(n + 1) % r]);
		t += (o.x - a.x) * (o.y + a.y);
	}
	return t;
}
function me(e, t, n, r, i, a, o, s, c) {
	let l = i * Math.PI / 180, u = Math.cos(l), d = Math.sin(l), f = (e - s) / 2, p = (t - c) / 2, m = u * f + d * p, h = -d * f + u * p, g = Math.abs(n), _ = Math.abs(r), v = m * m, y = h * h, b = g * g, x = _ * _, S = v / b + y / x;
	if (S > 1) {
		let e = Math.sqrt(S);
		g *= e, _ *= e, b = g * g, x = _ * _;
	}
	let C = Math.max(0, b * x - b * y - x * v), w = b * y + x * v, T = Math.sqrt(C / w), E = a === o ? -1 : 1, D = E * T * (g * h / _), O = E * T * (-(_ * m) / g), k = u * D - d * O + (e + s) / 2, A = d * D + u * O + (t + c) / 2, j = L(1, 0, (m - D) / g, (h - O) / _), M = L((m - D) / g, (h - O) / _, (-m - D) / g, (-h - O) / _);
	return !o && M > 0 && (M -= 2 * Math.PI), o && M < 0 && (M += 2 * Math.PI), {
		cx: k,
		cy: A,
		rx: g,
		ry: _,
		startAngle: j,
		endAngle: j + M
	};
}
function L(e, t, n, r) {
	let i = e * n + t * r, a = Math.sqrt((e * e + t * t) * (n * n + r * r)), o = Math.acos(Math.max(-1, Math.min(1, i / a)));
	return e * r - t * n < 0 && (o = -o), o;
}
var R = .01;
function he(e) {
	if (e.length < 2) return e;
	let t = [i(e[0])];
	for (let n = 1; n < e.length; n++) {
		let r = i(t[t.length - 1]), a = i(e[n]), o = a.x - r.x, s = a.y - r.y;
		o * o + s * s > R && t.push(a);
	}
	if (t.length > 2) {
		let e = i(t[0]), n = i(t[t.length - 1]), r = n.x - e.x, a = n.y - e.y;
		r * r + a * a <= R && t.pop();
	}
	return t;
}
function z(e) {
	let t = [], n = [];
	for (let r of e) r.type === "M" && n.length > 0 && (t.push(n), n = []), n.push(r);
	return n.length > 0 && t.push(n), t;
}
function B(e, t, n, r, i) {
	if (r.stroke === null || r.strokeWidth < 2) return;
	let a = ge(t, n, r);
	if (a.length !== 0) {
		e.fillStyle(r.stroke, i);
		for (let t of a) {
			if (t.kind === "circle") {
				e.fillCircle(t.x, t.y, t.radius);
				continue;
			}
			ve(e, t.points);
		}
	}
}
function ge(e, t, n) {
	let r = P.get(e);
	r || (r = /* @__PURE__ */ new Map(), P.set(e, r));
	let a = _e(t, n), o = r.get(a);
	if (o) return o;
	let s = e.length, c = n.strokeWidth / 2, l = [];
	if (s >= 3) {
		let r = t ? 0 : 1, a = t ? s : s - 1;
		for (let t = r; t < a; t++) {
			let r = i(e[(t - 1 + s) % s]), a = i(e[t]), o = i(e[(t + 1) % s]);
			if (n.lineJoin === "round") l.push({
				kind: "circle",
				x: a.x,
				y: a.y,
				radius: c
			});
			else if (n.lineJoin === "bevel") {
				let e = D(r, a, o, c);
				e && l.push({
					kind: "polygon",
					points: [
						a,
						e[0],
						e[1]
					]
				});
			} else {
				let e = O(r, a, o, c, n.miterLimit);
				if (e) {
					let t = e.miter ? [
						a,
						e.bevel[0],
						e.miter,
						e.bevel[1]
					] : [
						a,
						e.bevel[0],
						e.bevel[1]
					];
					l.push({
						kind: "polygon",
						points: t
					});
				}
			}
		}
	}
	if (!t && s >= 2) {
		if (n.lineCap === "round") {
			let t = i(e[0]), n = i(e[s - 1]);
			l.push({
				kind: "circle",
				x: t.x,
				y: t.y,
				radius: c
			}), l.push({
				kind: "circle",
				x: n.x,
				y: n.y,
				radius: c
			});
		} else if (n.lineCap === "square") {
			let t = E(i(e[0]), i(e[1]), c);
			t && l.push({
				kind: "polygon",
				points: t
			});
			let n = E(i(e[s - 1]), i(e[s - 2]), c);
			n && l.push({
				kind: "polygon",
				points: n
			});
		}
	}
	return r.set(a, l), l;
}
function _e(e, t) {
	return [
		e ? 1 : 0,
		t.strokeWidth,
		t.lineJoin,
		t.lineCap,
		t.miterLimit
	].join("|");
}
function ve(e, t) {
	if (t.length < 3) return;
	e.beginPath();
	let n = i(t[0]);
	e.moveTo(n.x, n.y);
	for (let n = 1; n < t.length; n++) {
		let r = i(t[n]);
		e.lineTo(r.x, r.y);
	}
	e.closePath(), e.fillPath();
}
//#endregion
//#region src/render-node/capabilities.ts
var V = 96 * 1024 * 1024, H = /* @__PURE__ */ new WeakMap();
function ye(e) {
	let t = H.get(e);
	if (t !== void 0) return t;
	let n = e.gl;
	if (typeof WebGL2RenderingContext < "u" && n instanceof WebGL2RenderingContext) {
		let t = {
			backend: "webgl2",
			maxSamples: n.getParameter(n.MAX_SAMPLES)
		};
		return H.set(e, t), t;
	}
	return null;
}
function be(e, t, n, r) {
	if (e === 8) {
		let e = t.maxSamples >= 8, i = U(n, r, 8);
		if (e && i <= V) return 8;
	}
	if (!(t.maxSamples >= 4)) throw Error(`phaser-svg MSAA: device maximum sample count is ${t.maxSamples}, which is less than the minimum required 4. To fix: run with a WebGL2 renderer on hardware that supports at least x4 multisampling.`);
	let i = U(n, r, 4);
	if (i > V) {
		let e = (i / (1024 * 1024)).toFixed(0);
		throw Error(`phaser-svg MSAA: the MSAA render target for ${n}x${r} at x4 samples would require ${e} MiB (budget is 96 MiB). To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`);
	}
	return 4;
}
function U(e, t, n) {
	return e * t * 4 * n;
}
//#endregion
//#region src/render-node/resources.ts
var xe = class {
	backend;
	msaaFBO = null;
	_msaaFBOWrapper = null;
	_resolvedTexture = null;
	resolveFBO = null;
	colorRB = null;
	_width = 0;
	_height = 0;
	_samples = 0;
	constructor(e) {
		this.backend = e;
	}
	get width() {
		return this._width;
	}
	get height() {
		return this._height;
	}
	get samples() {
		return this._samples;
	}
	get msaaFBOWrapper() {
		if (!this._msaaFBOWrapper) throw Error("phaser-svg MSAA: resources not initialised");
		return this._msaaFBOWrapper;
	}
	get resolvedTexture() {
		if (!this._resolvedTexture) throw Error("phaser-svg MSAA: resources not initialised");
		return this._resolvedTexture;
	}
	ensureResources(e, t, n, r, i) {
		(this._width !== n || this._height !== r || this._samples !== i || this.msaaFBO === null || this._resolvedTexture?.webGLTexture === null) && (this.destroyGL(e), this.allocate(e, t, n, r, i));
	}
	destroy(e) {
		this.destroyGL(e);
	}
	blitResolve(e) {
		!this.msaaFBO || !this.resolveFBO || (e.bindFramebuffer(e.READ_FRAMEBUFFER, this.msaaFBO), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, this.resolveFBO), e.blitFramebuffer(0, 0, this._width, this._height, 0, 0, this._width, this._height, e.COLOR_BUFFER_BIT, e.NEAREST));
	}
	allocate(e, t, n, r, a) {
		let o = e.gl, s = i(e.createTextureFromSource(null, n, r, 0), `phaser-svg MSAA: could not allocate ${n}x${r} resolved texture`);
		this._resolvedTexture = s;
		let c = i(s.webGLTexture, "phaser-svg MSAA: resolved texture has no webGLTexture"), l = i(o.createFramebuffer(), "phaser-svg MSAA: failed to create MSAA framebuffer");
		o.bindFramebuffer(o.FRAMEBUFFER, l);
		let u = o;
		Se(u, a, n, r), this.colorRB = u.getParameter(u.RENDERBUFFER_BINDING), this.resolveFBO = i(o.createFramebuffer(), "phaser-svg MSAA: failed to create resolve framebuffer"), o.bindFramebuffer(o.FRAMEBUFFER, this.resolveFBO), u.framebufferTexture2D(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, c, 0), o.bindFramebuffer(o.FRAMEBUFFER, null), this.msaaFBO = l, this._msaaFBOWrapper = { webGLFramebuffer: l }, this._width = n, this._height = r, this._samples = a;
	}
	destroyGL(e) {
		let t = e.gl;
		this.msaaFBO && (t.deleteFramebuffer(this.msaaFBO), this.msaaFBO = null, this._msaaFBOWrapper = null), this.resolveFBO &&= (t.deleteFramebuffer(this.resolveFBO), null), this.colorRB &&= (t.deleteRenderbuffer(this.colorRB), null), this._resolvedTexture &&= (e.deleteTexture(this._resolvedTexture), null), this._width = 0, this._height = 0, this._samples = 0;
	}
};
function Se(e, t, n, r) {
	let a = i(e.createRenderbuffer(), "phaser-svg MSAA: failed to create MSAA renderbuffer");
	e.bindRenderbuffer(e.RENDERBUFFER, a), e.renderbufferStorageMultisample(e.RENDERBUFFER, t, e.RGBA8, n, r), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, a);
}
//#endregion
//#region src/render-node/svg-render-node.ts
var W = /* @__PURE__ */ new WeakMap();
function Ce(e, t, n) {
	let r = ye(t);
	if (!r) throw Error("phaser-svg MSAA: WebGL2 is required but not available on this renderer. Create the game with a WebGL2-backed canvas (and explicit WEBGL render type), or remove the msaaSamples option.");
	let i = be(n, r, t.width, t.height), a = W.get(e);
	if (a) {
		a.samples = i;
		return;
	}
	let o = {
		resources: new xe(r.backend),
		caps: r,
		samples: i,
		detachContextLost: null
	};
	W.set(e, o), e.addRenderStep(we(o), 0), e.once("destroy", () => {
		let n = W.get(e);
		n && (n.resources.destroy(t), n.detachContextLost?.(), W.delete(e));
	});
	let s = t;
	if (typeof s.on == "function") {
		let e = () => {
			o.resources.destroy(t);
		};
		s.on("contextlost", e), o.detachContextLost = typeof s.off == "function" ? () => {
			s.off?.("contextlost", e);
		} : null;
	}
}
function we(e) {
	return function(t, n, r) {
		let i = t, a = n, o = r;
		e.resources.ensureResources(i, e.caps, i.width, i.height, e.samples);
		let s = i.renderNodes, { msaaFBOWrapper: c, resolvedTexture: l } = e.resources;
		s.finishBatch();
		let u = o.getClone(!1);
		u.framebuffer = c, u.texture = l, u.state.bindings.framebuffer = c, u.beginDraw();
		let d = i.gl;
		d.clearColor(0, 0, 0, 0), d.clear(d.COLOR_BUFFER_BIT);
		let f = a._renderSteps[1];
		f && f(i, n, u), s.finishBatch(), e.resources.blitResolve(d), o.beginDraw();
		let p = o.width, m = o.height;
		s.getNode("BatchHandlerQuadSingle").batch(o, l, 0, 0, 0, m, p, 0, p, m, 0, 1, 1, -1, !1, 4294967295, 4294967295, 4294967295, 4294967295, {});
	};
}
//#endregion
//#region src/transform.ts
function Te(e, t, n) {
	let r = t / e.width, i = n / e.height, a = Math.min(r, i);
	return {
		scale: a,
		tx: (t - e.width * a) / 2 - e.minX * a,
		ty: (n - e.height * a) / 2 - e.minY * a
	};
}
function G(e, t, n, r) {
	let i = [];
	for (let a of e) switch (a.type) {
		case "M":
			i.push({
				type: "M",
				x: a.x * t + n,
				y: a.y * t + r
			});
			break;
		case "L":
			i.push({
				type: "L",
				x: a.x * t + n,
				y: a.y * t + r
			});
			break;
		case "C":
			i.push({
				type: "C",
				x1: a.x1 * t + n,
				y1: a.y1 * t + r,
				x2: a.x2 * t + n,
				y2: a.y2 * t + r,
				x: a.x * t + n,
				y: a.y * t + r
			});
			break;
		case "Q":
			i.push({
				type: "Q",
				x1: a.x1 * t + n,
				y1: a.y1 * t + r,
				x: a.x * t + n,
				y: a.y * t + r
			});
			break;
		case "A":
			i.push({
				type: "A",
				rx: a.rx * t,
				ry: a.ry * t,
				xAxisRotation: a.xAxisRotation,
				largeArc: a.largeArc,
				sweep: a.sweep,
				x: a.x * t + n,
				y: a.y * t + r
			});
			break;
		case "Z":
			i.push(a);
			break;
	}
	return i;
}
//#endregion
//#region src/draw.ts
var K = /* @__PURE__ */ new WeakMap(), q = /* @__PURE__ */ new WeakMap(), J = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), Ee = 1;
function De(e, t, n, r) {
	ke(e, t, n, r);
}
function Oe(e, t, n, r) {
	return ke(e, t, n, r);
}
function ke(e, n, r, i) {
	let a = `path|${n}|${Ye(r)}|${Je(i)}`;
	return y(e, a) ? (b(e) && e.clear(), Z(e), F(e, t(n), He(r), i), Q(e, i?.msaaSamples), x(e, a), !0) : !1;
}
function Ae(e, t, n) {
	Me(e, t, n);
}
function je(e, t, n) {
	return Me(e, t, n);
}
function Me(e, i, a) {
	let m = `svg|${i}|${Ge(a)}`;
	if (!y(e, m)) return !1;
	b(e) && e.clear(), Z(e);
	let g = new DOMParser().parseFromString(i, "image/svg+xml"), _ = g.documentElement, v = p(u(_)), S = $(Ue(_.getAttribute("viewBox")), a), C = g.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon");
	for (let i of C) {
		if (l(i)) continue;
		let p = u(i), m = r(p.transform), g = {
			...v,
			...p
		}, _ = h(i.tagName, p);
		if (_ && !m) {
			let t = o(g);
			a?.overrideFill !== void 0 && (t.fill = a.overrideFill), a?.overrideStroke !== void 0 && (t.stroke = a.overrideStroke);
			let r = S === void 0 ? _ : n(_, S.scale, S.tx, S.ty);
			S && (t.strokeWidth *= S.scale), s(e, r, t);
			continue;
		}
		let y = f(i.tagName, g);
		if (!y) continue;
		let { d: b, style: x } = y;
		a?.overrideFill !== void 0 && (x.fill = a.overrideFill), a?.overrideStroke !== void 0 && (x.stroke = a.overrideStroke);
		let C = t(b);
		m && (C = c(C, m), x.strokeWidth *= d(m)), S && (C = G(C, S.scale, S.tx, S.ty), x.strokeWidth *= S.scale), F(e, C, x, a);
	}
	return Q(e, a?.msaaSamples), x(e, m), !0;
}
function Ne(e, t, n) {
	Fe(e, t, n);
}
function Pe(e, t, n) {
	return Fe(e, t, n);
}
function Fe(e, t, n) {
	let r = qe(t, n), i = `compiled|${We(t)}|${Ke(n, r)}`;
	if (!y(e, i)) return !1;
	b(e) && e.clear(), Z(e);
	let a = $(t.viewBox, n), o = n?.overrideFill, c = n?.overrideStroke, l = o !== void 0 || c !== void 0, u = t.items;
	if (Array.isArray(u) && u.length > 0) {
		let d = a ? ze(t, a) : u;
		for (let t of d) {
			let r = l ? Re(t.style, o, c) : t.style;
			t.kind === "native" ? s(e, t.shape, r) : F(e, t.commands, r, n);
		}
		return Q(e, r), x(e, i), !0;
	}
	let d = a ? Be(t, a) : t.paths;
	for (let t of d) {
		let r = l ? Re(t.style, o, c) : t.style;
		F(e, t.commands, r, n);
	}
	return Q(e, r), x(e, i), !0;
}
function Ie(e) {
	S(e);
}
function Le(e) {
	C(e);
}
function Re(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = J.get(e);
	r || (r = /* @__PURE__ */ new Map(), J.set(e, r));
	let i = `${t ?? "_"}|${n ?? "_"}`, a = r.get(i);
	if (a) return a;
	let o = { ...e };
	return t !== void 0 && (o.fill = t), n !== void 0 && (o.stroke = n), r.set(i, o), o;
}
function ze(e, t) {
	let r = K.get(e);
	r || (r = /* @__PURE__ */ new Map(), K.set(e, r));
	let i = Ve(t), a = r.get(i);
	if (a) return a;
	let o = e.items.map((e) => e.kind === "native" ? {
		kind: "native",
		shape: n(e.shape, t.scale, t.tx, t.ty),
		style: X(e.style, t.scale)
	} : {
		kind: "path",
		commands: G(e.commands, t.scale, t.tx, t.ty),
		style: X(e.style, t.scale)
	});
	return r.set(i, o), o;
}
function Be(e, t) {
	let n = q.get(e);
	n || (n = /* @__PURE__ */ new Map(), q.set(e, n));
	let r = Ve(t), i = n.get(r);
	if (i) return i;
	let a = e.paths.map((e) => ({
		commands: G(e.commands, t.scale, t.tx, t.ty),
		style: X(e.style, t.scale)
	}));
	return n.set(r, a), a;
}
function X(e, t) {
	return t === 1 ? e : {
		...e,
		strokeWidth: e.strokeWidth * t
	};
}
function Ve(e) {
	return `${e.scale}|${e.tx}|${e.ty}`;
}
function Z(e) {
	let t = e.scene?.sys?.game?.renderer;
	T(t?.config);
}
function Q(e, t) {
	let n = t ?? 4, r = e.scene?.sys?.game?.renderer;
	if (!r?.gl) throw Error("phaser-svg MSAA: a WebGL renderer is required. Create the game with WebGL + WebGL2 context, or do not use this plugin in non-WebGL environments.");
	Ce(e, r, n);
}
function He(e) {
	return {
		fill: e?.fill ?? 0,
		fillAlpha: e?.fillAlpha ?? 1,
		stroke: e?.stroke ?? null,
		strokeAlpha: e?.strokeAlpha ?? 1,
		strokeWidth: e?.strokeWidth ?? 1,
		lineJoin: e?.lineJoin ?? "miter",
		lineCap: e?.lineCap ?? "butt",
		miterLimit: e?.miterLimit ?? 4,
		opacity: e?.opacity ?? 1
	};
}
function Ue(e) {
	if (!e) return;
	let t = e.trim().split(/[\s,]+/);
	if (t.length !== 4) return;
	let n = Number(t[0]), r = Number(t[1]), i = Number(t[2]), a = Number(t[3]);
	if (!(!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(i) || !Number.isFinite(a) || i <= 0 || a <= 0)) return {
		minX: n,
		minY: r,
		width: i,
		height: a
	};
}
function $(e, t) {
	if (e && !(t?.width === void 0 && t?.height === void 0)) return Te(e, t.width ?? t.height ?? e.width, t.height ?? t.width ?? e.height);
}
function We(e) {
	let t = Y.get(e);
	if (t !== void 0) return t;
	let n = Ee;
	return Ee += 1, Y.set(e, n), n;
}
function Ge(e) {
	return [
		e?.curveResolution,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height,
		e?.msaaSamples ?? 4
	].join("|");
}
function Ke(e, t) {
	return [
		e?.curveResolution,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height,
		t
	].join("|");
}
function qe(e, t) {
	return t?.msaaSamples ?? e.msaaSamples ?? 4;
}
function Je(e) {
	return [e?.curveResolution, e?.msaaSamples ?? 4].join("|");
}
function Ye(e) {
	return e ? [
		e.fill,
		e.fillAlpha,
		e.stroke,
		e.strokeAlpha,
		e.strokeWidth,
		e.lineJoin,
		e.lineCap,
		e.miterLimit,
		e.opacity
	].join("|") : "";
}
//#endregion
//#region src/plugin.ts
var Xe = class extends g.ScenePlugin {
	defaultOptions = { msaaSamples: 4 };
	boot() {
		i(this.systems, "Scene systems not available").events.once("destroy", this.destroy, this);
	}
	setDefaults(e) {
		return this.defaultOptions = { ...e }, this;
	}
	draw(e, t, n) {
		Ae(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawIfDirty(e, t, n) {
		return je(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawPath(e, t, n, r) {
		De(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawPathIfDirty(e, t, n, r) {
		return Oe(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawCompiled(e, t, n) {
		Ne(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawCompiledIfDirty(e, t, n) {
		return Pe(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	markDirty(e) {
		return Ie(e), this;
	}
	clearDirtyState(e) {
		return Le(e), this;
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
export { e as DEFAULT_STYLE, Xe as SVGPlugin, Le as clearSVGDirtyState, m as compileSVG, f as convertShape, Ne as drawCompiledSVG, Pe as drawCompiledSVGIfDirty, Ae as drawSVG, je as drawSVGIfDirty, De as drawSVGPath, Oe as drawSVGPathIfDirty, Ie as markSVGDirty, a as parseColor, t as parsePath, F as renderPath, o as resolveStyle };
