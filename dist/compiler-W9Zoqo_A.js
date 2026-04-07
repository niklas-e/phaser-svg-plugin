//#region src/assert.ts
function e(e, t = "Expected value to be defined") {
	if (e == null) throw Error(t);
	return e;
}
//#endregion
//#region src/color.ts
var t = {
	black: 0,
	white: 16777215,
	red: 16711680,
	green: 32768,
	blue: 255,
	yellow: 16776960,
	cyan: 65535,
	magenta: 16711935,
	orange: 16753920,
	purple: 8388736,
	lime: 65280,
	pink: 16761035,
	gray: 8421504,
	grey: 8421504,
	silver: 12632256,
	maroon: 8388608,
	olive: 8421376,
	navy: 128,
	teal: 32896,
	aqua: 65535,
	fuchsia: 16711935,
	transparent: 0
};
function n(n) {
	let r = n.trim().toLowerCase();
	if (r === "none" || r === "") return null;
	if (r === "transparent") return {
		color: 0,
		alpha: 0
	};
	if (r.length === 7 && r[0] === "#") {
		let e = Number.parseInt(r.slice(1), 16);
		if (!Number.isNaN(e)) return {
			color: e,
			alpha: 1
		};
	}
	if (r.length === 4 && r[0] === "#") {
		let t = Number.parseInt(e(r[1]) + e(r[1]), 16), n = Number.parseInt(e(r[2]) + e(r[2]), 16), i = Number.parseInt(e(r[3]) + e(r[3]), 16);
		if (!Number.isNaN(t) && !Number.isNaN(n) && !Number.isNaN(i)) return {
			color: t << 16 | n << 8 | i,
			alpha: 1
		};
	}
	let i = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(r);
	if (i) {
		let e = Math.min(255, Number(i[1])), t = Math.min(255, Number(i[2])), n = Math.min(255, Number(i[3])), r = i[4] === void 0 ? 1 : Number(i[4]);
		return {
			color: e << 16 | t << 8 | n,
			alpha: r
		};
	}
	let a = t[r];
	return a === void 0 ? null : {
		color: a,
		alpha: 1
	};
}
//#endregion
//#region src/affine-transform.ts
var r = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	e: 0,
	f: 0
};
function i(e) {
	if (!e) return;
	let t = /([a-zA-Z]+)\s*\(([^)]*)\)/g, n = r, i = !1;
	for (let r of e.matchAll(t)) {
		let e = r[1], t = r[2];
		if (!e || !t) continue;
		let a = s(e.toLowerCase(), c(t));
		a && (i = !0, n = u(a, n));
	}
	if (i) return n;
}
function a(e, t) {
	let n = [], { sx: r, sy: i, isSkewed: a, det: o, rotationDeg: s } = d(t);
	for (let c of e) switch (c.type) {
		case "M": {
			let e = l(t, c.x, c.y);
			n.push({
				type: "M",
				x: e.x,
				y: e.y
			});
			break;
		}
		case "L": {
			let e = l(t, c.x, c.y);
			n.push({
				type: "L",
				x: e.x,
				y: e.y
			});
			break;
		}
		case "C": {
			let e = l(t, c.x1, c.y1), r = l(t, c.x2, c.y2), i = l(t, c.x, c.y);
			n.push({
				type: "C",
				x1: e.x,
				y1: e.y,
				x2: r.x,
				y2: r.y,
				x: i.x,
				y: i.y
			});
			break;
		}
		case "Q": {
			let e = l(t, c.x1, c.y1), r = l(t, c.x, c.y);
			n.push({
				type: "Q",
				x1: e.x,
				y1: e.y,
				x: r.x,
				y: r.y
			});
			break;
		}
		case "A": {
			let e = l(t, c.x, c.y), u = c.xAxisRotation, d = c.sweep, f = c.rx * r, p = c.ry * i;
			a || (u += s, o < 0 && (d = !d)), n.push({
				type: "A",
				rx: f,
				ry: p,
				xAxisRotation: u,
				largeArc: c.largeArc,
				sweep: d,
				x: e.x,
				y: e.y
			});
			break;
		}
		case "Z":
			n.push(c);
			break;
	}
	return n;
}
function o(e) {
	let { sx: t, sy: n } = d(e);
	return (t + n) / 2;
}
function s(e, t) {
	switch (e) {
		case "matrix": {
			if (t.length !== 6) return null;
			let [e, n, r, i, a, o] = t;
			return e === void 0 || n === void 0 || r === void 0 || i === void 0 || a === void 0 || o === void 0 ? null : {
				a: e,
				b: n,
				c: r,
				d: i,
				e: a,
				f: o
			};
		}
		case "translate": {
			if (t.length < 1) return null;
			let e = t[0], n = t[1] ?? 0;
			return e === void 0 ? null : {
				...r,
				e,
				f: n
			};
		}
		case "scale": {
			if (t.length < 1) return null;
			let e = t[0], n = t[1] ?? e;
			return e === void 0 || n === void 0 ? null : {
				a: e,
				b: 0,
				c: 0,
				d: n,
				e: 0,
				f: 0
			};
		}
		case "rotate": {
			if (t.length < 1) return null;
			let e = t[0];
			if (e === void 0) return null;
			let n = e * Math.PI / 180, i = Math.cos(n), a = Math.sin(n);
			if (t.length >= 3) {
				let e = t[1], n = t[2];
				return e === void 0 || n === void 0 ? null : u({
					...r,
					e,
					f: n
				}, u({
					a: i,
					b: a,
					c: -a,
					d: i,
					e: 0,
					f: 0
				}, {
					...r,
					e: -e,
					f: -n
				}));
			}
			return {
				a: i,
				b: a,
				c: -a,
				d: i,
				e: 0,
				f: 0
			};
		}
		case "skewx": {
			if (t.length < 1) return null;
			let e = t[0];
			return e === void 0 ? null : {
				a: 1,
				b: 0,
				c: Math.tan(e * Math.PI / 180),
				d: 1,
				e: 0,
				f: 0
			};
		}
		case "skewy": {
			if (t.length < 1) return null;
			let e = t[0];
			return e === void 0 ? null : {
				a: 1,
				b: Math.tan(e * Math.PI / 180),
				c: 0,
				d: 1,
				e: 0,
				f: 0
			};
		}
		default: return null;
	}
}
function c(e) {
	return Array.from(e.matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g), (e) => Number(e[0])).filter((e) => Number.isFinite(e));
}
function l(e, t, n) {
	return {
		x: e.a * t + e.c * n + e.e,
		y: e.b * t + e.d * n + e.f
	};
}
function u(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		e: e.a * t.e + e.c * t.f + e.e,
		f: e.b * t.e + e.d * t.f + e.f
	};
}
function d(e) {
	let t = Math.hypot(e.a, e.b), n = Math.hypot(e.c, e.d), r = e.a * e.d - e.b * e.c, i = e.a * e.c + e.b * e.d;
	return {
		sx: t,
		sy: n,
		det: r,
		isSkewed: Math.abs(i) > 1e-6,
		rotationDeg: Math.atan2(e.b, e.a) * 180 / Math.PI
	};
}
//#endregion
//#region src/native-shape.ts
function f(e, t) {
	let n = e.toLowerCase();
	if (n === "circle") {
		let e = C(t.cx, 0), n = C(t.cy, 0), r = S(t.r);
		return r === void 0 || r <= 0 ? void 0 : b({
			kind: "circle",
			cx: e,
			cy: n,
			r
		}, t.transform);
	}
	if (n === "ellipse") {
		let e = C(t.cx, 0), n = C(t.cy, 0), r = S(t.rx), i = S(t.ry);
		return r === void 0 || i === void 0 || r <= 0 || i <= 0 ? void 0 : b({
			kind: "ellipse",
			cx: e,
			cy: n,
			rx: r,
			ry: i
		}, t.transform);
	}
}
function p(e, t, n, r) {
	return e.kind === "circle" ? {
		kind: "circle",
		cx: e.cx * t + n,
		cy: e.cy * t + r,
		r: e.r * t
	} : {
		kind: "ellipse",
		cx: e.cx * t + n,
		cy: e.cy * t + r,
		rx: e.rx * t,
		ry: e.ry * t
	};
}
function m(e, t, n) {
	let { cx: r, cy: i, rx: a, ry: o } = h(t), s = n.fill === null ? 0 : n.fillAlpha * n.opacity, c = n.stroke === null ? 0 : n.strokeAlpha * n.opacity;
	if (n.fill !== null && s > 0) {
		e.fillStyle(n.fill, s);
		let t = v(a, o);
		e.fillEllipse(r, i, a * 2, o * 2, t);
	}
	n.stroke !== null && n.strokeWidth > 0 && c > 0 && g(e, t, n.stroke, c, n.strokeWidth);
}
function h(e) {
	return e.kind === "circle" ? {
		cx: e.cx,
		cy: e.cy,
		rx: e.r,
		ry: e.r
	} : {
		cx: e.cx,
		cy: e.cy,
		rx: e.rx,
		ry: e.ry
	};
}
function g(e, t, n, r, i) {
	let { cx: a, cy: o, rx: s, ry: c } = h(t), l = i / 2, u = s + l, d = c + l, f = s - l, p = c - l;
	if (e.fillStyle(n, r), f <= 0 || p <= 0) {
		let t = v(u, d);
		e.fillEllipse(a, o, u * 2, d * 2, t);
		return;
	}
	let m = v(u, d), g = _(a, o, u, d, m), y = _(a, o, f, p, m);
	for (let t = 0; t < m; t++) {
		let n = (t + 1) % m, r = g[t], i = g[n], a = y[t], o = y[n];
		!r || !i || !a || !o || (e.fillTriangle(r.x, r.y, i.x, i.y, o.x, o.y), e.fillTriangle(r.x, r.y, o.x, o.y, a.x, a.y));
	}
}
function _(e, t, n, r, i) {
	let a = [], o = Math.PI * 2 / i;
	for (let s = 0; s < i; s++) {
		let i = s * o;
		a.push({
			x: e + n * Math.cos(i),
			y: t + r * Math.sin(i)
		});
	}
	return a;
}
function v(e, t) {
	let n = Math.PI * (3 * (e + t) - Math.sqrt((3 * e + t) * (e + 3 * t)));
	return y(Math.ceil(n / 2), 24, 256);
}
function y(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function b(e, t) {
	let n = x(t);
	if (!n) return e;
	let r = n.a * e.cx + n.c * e.cy + n.e, i = n.b * e.cx + n.d * e.cy + n.f, a = Math.hypot(n.a, n.b), o = Math.hypot(n.c, n.d);
	if (e.kind === "circle") {
		let t = e.r * a, n = e.r * o;
		return Math.abs(t - n) < 1e-9 ? {
			kind: "circle",
			cx: r,
			cy: i,
			r: (t + n) / 2
		} : {
			kind: "ellipse",
			cx: r,
			cy: i,
			rx: t,
			ry: n
		};
	}
	return {
		kind: "ellipse",
		cx: r,
		cy: i,
		rx: e.rx * a,
		ry: e.ry * o
	};
}
function x(e) {
	if (!e) return;
	let t = e.match(/matrix\s*\(([^)]*)\)/i);
	if (!t?.[1]) return;
	let n = Array.from(t[1].matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g), (e) => Number(e[0]));
	if (n.length !== 6) return;
	let [r, i, a, o, s, c] = n;
	if (!(r === void 0 || i === void 0 || a === void 0 || o === void 0 || s === void 0 || c === void 0)) return {
		a: r,
		b: i,
		c: a,
		d: o,
		e: s,
		f: c
	};
}
function S(e, t) {
	if (e === void 0) return t;
	let n = Number.parseFloat(e);
	return Number.isFinite(n) ? n : t;
}
function C(e, t) {
	let n = S(e);
	return n === void 0 ? t : n;
}
//#endregion
//#region src/path-parser.ts
function w(e) {
	return O(D(e));
}
var T = /^[MmLlHhVvCcSsQqTtAaZz]/, E = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
function D(t) {
	let n = [], r = 0;
	for (; r < t.length;) {
		for (; r < t.length && (t[r] === " " || t[r] === "	" || t[r] === "\n" || t[r] === "\r" || t[r] === ",");) r++;
		if (r >= t.length) break;
		let i = e(t[r], `Expected character at index ${r}`);
		if (T.test(i)) {
			n.push({
				type: "command",
				value: i
			}), r++;
			continue;
		}
		let a = t.slice(r), o = E.exec(a);
		if (o) {
			n.push({
				type: "number",
				value: Number(o[0])
			}), r += o[0].length;
			continue;
		}
		r++;
	}
	return n;
}
function O(t) {
	let n = [], r = 0, i = 0, a = 0, o = 0, s = 0, c = 0, l = 0, u = 0, d = 0, f = "";
	function p() {
		let e = t[r];
		if (!e || e.type !== "number") throw Error(`Expected number at token ${r}, got ${e ? e.type : "EOF"}`);
		return r++, e.value;
	}
	function m() {
		let e = t[r];
		if (!e || e.type !== "number") throw Error(`Expected flag at token ${r}`);
		return r++, e.value;
	}
	for (; r < t.length;) {
		let h = e(t[r], `Expected token at position ${r}`), g;
		h.type === "command" ? (g = h.value, r++) : g = f === "M" ? "L" : f === "m" ? "l" : f;
		do {
			let e = g.toUpperCase(), t = g !== e;
			switch (e) {
				case "M": {
					let e = p() + (t ? i : 0), r = p() + (t ? a : 0);
					n.push({
						type: "M",
						x: e,
						y: r
					}), i = e, a = r, o = e, s = r, c = i, l = a, u = i, d = a, g = t ? "l" : "L", f = g;
					break;
				}
				case "L": {
					let e = p() + (t ? i : 0), r = p() + (t ? a : 0);
					n.push({
						type: "L",
						x: e,
						y: r
					}), i = e, a = r, c = i, l = a, u = i, d = a;
					break;
				}
				case "H": {
					let e = p() + (t ? i : 0);
					n.push({
						type: "L",
						x: e,
						y: a
					}), i = e, c = i, l = a, u = i, d = a;
					break;
				}
				case "V": {
					let e = p() + (t ? a : 0);
					n.push({
						type: "L",
						x: i,
						y: e
					}), a = e, c = i, l = a, u = i, d = a;
					break;
				}
				case "C": {
					let e = p() + (t ? i : 0), r = p() + (t ? a : 0), o = p() + (t ? i : 0), s = p() + (t ? a : 0), f = p() + (t ? i : 0), m = p() + (t ? a : 0);
					n.push({
						type: "C",
						x1: e,
						y1: r,
						x2: o,
						y2: s,
						x: f,
						y: m
					}), c = o, l = s, i = f, a = m, u = i, d = a;
					break;
				}
				case "S": {
					let e = f === "C" || f === "c" || f === "S" || f === "s" ? 2 * i - c : i, r = f === "C" || f === "c" || f === "S" || f === "s" ? 2 * a - l : a, o = p() + (t ? i : 0), s = p() + (t ? a : 0), m = p() + (t ? i : 0), h = p() + (t ? a : 0);
					n.push({
						type: "C",
						x1: e,
						y1: r,
						x2: o,
						y2: s,
						x: m,
						y: h
					}), c = o, l = s, i = m, a = h, u = i, d = a;
					break;
				}
				case "Q": {
					let e = p() + (t ? i : 0), r = p() + (t ? a : 0), o = p() + (t ? i : 0), s = p() + (t ? a : 0);
					n.push({
						type: "Q",
						x1: e,
						y1: r,
						x: o,
						y: s
					}), u = e, d = r, i = o, a = s, c = i, l = a;
					break;
				}
				case "T": {
					let e = f === "Q" || f === "q" || f === "T" || f === "t" ? 2 * i - u : i, r = f === "Q" || f === "q" || f === "T" || f === "t" ? 2 * a - d : a, o = p() + (t ? i : 0), s = p() + (t ? a : 0);
					n.push({
						type: "Q",
						x1: e,
						y1: r,
						x: o,
						y: s
					}), u = e, d = r, i = o, a = s, c = i, l = a;
					break;
				}
				case "A": {
					let e = Math.abs(p()), r = Math.abs(p()), o = p(), s = m() !== 0, f = m() !== 0, h = p() + (t ? i : 0), g = p() + (t ? a : 0);
					e === 0 || r === 0 ? n.push({
						type: "L",
						x: h,
						y: g
					}) : n.push({
						type: "A",
						rx: e,
						ry: r,
						xAxisRotation: o,
						largeArc: s,
						sweep: f,
						x: h,
						y: g
					}), i = h, a = g, c = i, l = a, u = i, d = a;
					break;
				}
				case "Z":
					n.push({ type: "Z" }), i = o, a = s, c = i, l = a, u = i, d = a;
					break;
				default: throw Error(`Unknown path command: ${g}`);
			}
			f = g;
		} while (g.toUpperCase() !== "Z" && r < t.length && e(t[r]).type === "number");
	}
	return n;
}
//#endregion
//#region src/presentation-attrs.ts
var k = new Set([
	"fill",
	"fill-opacity",
	"stroke",
	"stroke-opacity",
	"stroke-width",
	"stroke-linejoin",
	"stroke-linecap",
	"stroke-miterlimit",
	"opacity"
]);
function A(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) k.has(n) && (t[n] = r);
	return t;
}
function j(e) {
	let t = {};
	for (let n of e.attributes) t[n.name] = n.value;
	return t;
}
function M(e) {
	let t = {};
	for (let n of e.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
		let e = n[1], r = n[2] ?? n[3];
		e !== void 0 && r !== void 0 && (t[e] = r);
	}
	return t;
}
//#endregion
//#region src/types.ts
var N = {
	fill: 0,
	fillAlpha: 1,
	stroke: null,
	strokeAlpha: 1,
	strokeWidth: 1,
	lineJoin: "miter",
	lineCap: "butt",
	miterLimit: 4,
	opacity: 1
};
//#endregion
//#region src/style.ts
function P(e) {
	let t = { ...N }, r = e.fill;
	if (r !== void 0) {
		let e = n(r);
		e === null ? t.fill = null : (t.fill = e.color, t.fillAlpha = e.alpha);
	}
	let i = e["fill-opacity"];
	i !== void 0 && (t.fillAlpha = Number(i));
	let a = e.stroke;
	if (a !== void 0) {
		let e = n(a);
		e === null ? t.stroke = null : (t.stroke = e.color, t.strokeAlpha = e.alpha);
	}
	let o = e["stroke-opacity"];
	o !== void 0 && (t.strokeAlpha = Number(o));
	let s = e["stroke-width"];
	s !== void 0 && (t.strokeWidth = Number(s));
	let c = e["stroke-linejoin"];
	(c === "round" || c === "bevel" || c === "miter") && (t.lineJoin = c);
	let l = e["stroke-linecap"];
	(l === "round" || l === "square" || l === "butt") && (t.lineCap = l);
	let u = e["stroke-miterlimit"];
	if (u !== void 0) {
		let e = Number(u);
		e >= 1 && (t.miterLimit = e);
	}
	let d = e.opacity;
	return d !== void 0 && (t.opacity = Number(d)), t;
}
//#endregion
//#region src/shape.ts
function F(e, t) {
	let n = e.toLowerCase(), r;
	if (n === "path" ? r = t.d : n === "rect" ? r = I(t) : n === "circle" ? r = L(t) : n === "ellipse" ? r = R(t) : n === "line" ? r = z(t) : n === "polyline" ? r = B(t) : n === "polygon" && (r = V(t)), r) return {
		d: r,
		style: P(t)
	};
}
function I(e) {
	let t = G(e.x, 0), n = G(e.y, 0), r = W(e.width), i = W(e.height);
	if (r === void 0 || i === void 0 || r <= 0 || i <= 0) return;
	let { rx: a, ry: o } = U(e, r, i), s = t + r, c = n + i;
	return a <= 0 || o <= 0 ? `M ${t} ${n} H ${s} V ${c} H ${t} Z` : [
		`M ${t + a} ${n}`,
		`H ${s - a}`,
		`A ${a} ${o} 0 0 1 ${s} ${n + o}`,
		`V ${c - o}`,
		`A ${a} ${o} 0 0 1 ${s - a} ${c}`,
		`H ${t + a}`,
		`A ${a} ${o} 0 0 1 ${t} ${c - o}`,
		`V ${n + o}`,
		`A ${a} ${o} 0 0 1 ${t + a} ${n}`,
		"Z"
	].join(" ");
}
function L(e) {
	let t = G(e.cx, 0), n = G(e.cy, 0), r = W(e.r);
	if (r === void 0 || r <= 0) return;
	let i = t - r, a = t + r;
	return [
		`M ${a} ${n}`,
		`A ${r} ${r} 0 1 0 ${i} ${n}`,
		`A ${r} ${r} 0 1 0 ${a} ${n}`,
		"Z"
	].join(" ");
}
function R(e) {
	let t = G(e.cx, 0), n = G(e.cy, 0), r = W(e.rx), i = W(e.ry);
	if (r === void 0 || i === void 0 || r <= 0 || i <= 0) return;
	let a = t - r, o = t + r;
	return [
		`M ${o} ${n}`,
		`A ${r} ${i} 0 1 0 ${a} ${n}`,
		`A ${r} ${i} 0 1 0 ${o} ${n}`,
		"Z"
	].join(" ");
}
function z(e) {
	return `M ${G(e.x1, 0)} ${G(e.y1, 0)} L ${G(e.x2, 0)} ${G(e.y2, 0)}`;
}
function B(e) {
	let t = H(e.points);
	if (!t || t.length < 2) return;
	let n = t[0];
	if (n) return [`M ${n.x} ${n.y}`, ...t.slice(1).map((e) => `L ${e.x} ${e.y}`)].join(" ");
}
function V(e) {
	let t = B(e);
	if (t) return `${t} Z`;
}
function H(e) {
	if (!e) return;
	let t = Array.from(e.matchAll(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g), (e) => Number.parseFloat(e[0])).filter((e) => Number.isFinite(e));
	if (t.length < 4) return;
	let n = [];
	for (let e = 0; e + 1 < t.length; e += 2) {
		let r = t[e], i = t[e + 1];
		r === void 0 || i === void 0 || n.push({
			x: r,
			y: i
		});
	}
	return n.length > 0 ? n : void 0;
}
function U(e, t, n) {
	let r = W(e.rx), i = W(e.ry);
	if (r === void 0 && i === void 0) return {
		rx: 0,
		ry: 0
	};
	let a = r, o = i;
	return a === void 0 && (a = o), o === void 0 && (o = a), {
		rx: Math.min(Math.max(a ?? 0, 0), t / 2),
		ry: Math.min(Math.max(o ?? 0, 0), n / 2)
	};
}
function W(e, t) {
	if (e === void 0) return t;
	let n = Number.parseFloat(e);
	return Number.isFinite(n) ? n : t;
}
function G(e, t) {
	let n = W(e);
	return n === void 0 ? t : n;
}
//#endregion
//#region src/svg-structure.ts
var K = [
	"defs",
	"clipPath",
	"mask",
	"pattern",
	"symbol",
	"marker",
	"linearGradient",
	"radialGradient"
], q = K.join(",");
function J(e) {
	return e.closest(q) !== null;
}
function Y(e) {
	let t = e;
	for (let e of K) {
		let n = RegExp(`<${e}\\b[\\s\\S]*?<\\/${e}>`, "gi"), r = "";
		for (; r !== t;) r = t, t = t.replace(n, "");
	}
	return t;
}
//#endregion
//#region src/compiler.ts
function X(e) {
	let t = $(e) ?? null, n = Q(e), r = Z(Y(e)), s = [], c = [];
	for (let { tagName: e, attrs: t } of r) {
		let r = {
			...n,
			...t
		}, l = i(t.transform), u = f(e, t), d = F(e, r);
		if (!d) continue;
		let { d: p, style: m } = d, h = w(p);
		l && (h = a(h, l), m.strokeWidth *= o(l)), s.push({
			commands: h,
			style: m
		}), u && !l ? c.push({
			kind: "native",
			shape: u,
			style: m
		}) : c.push({
			kind: "path",
			commands: h,
			style: m
		});
	}
	return {
		viewBox: t,
		items: c,
		paths: s
	};
}
function Z(e) {
	let t = [];
	for (let n of e.matchAll(/<(path|rect|circle|ellipse|line|polyline|polygon)\s+([^>]*?)\s*\/?>/gi)) {
		let e = n[1], r = n[2];
		if (!e || !r) continue;
		let i = M(r);
		t.push({
			tagName: e,
			attrs: i
		});
	}
	return t;
}
function Q(e) {
	let t = e.match(/<svg\s+([^>]*?)>/i);
	return t?.[1] ? A(M(t[1])) : {};
}
function $(e) {
	let t = e.match(/<svg\s[^>]*viewBox\s*=\s*["']([^"']*)["']/i);
	if (!t?.[1]) return;
	let n = t[1].trim().split(/[\s,]+/);
	if (n.length !== 4) return;
	let r = Number(n[0]), i = Number(n[1]), a = Number(n[2]), o = Number(n[3]);
	if (!(!Number.isFinite(r) || !Number.isFinite(i) || !Number.isFinite(a) || !Number.isFinite(o) || a <= 0 || o <= 0)) return {
		minX: r,
		minY: i,
		width: a,
		height: o
	};
}
//#endregion
export { N as a, w as c, p as d, i as f, e as g, n as h, P as i, m as l, a as m, J as n, j as o, o as p, F as r, A as s, X as t, f as u };
