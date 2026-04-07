import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, s as p, t as m, u as h } from "./compiler-W9Zoqo_A.js";
import g from "phaser";
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
function ee(e) {
	return e?.curveResolution ?? 32;
}
function w(e) {
	if (!e) return !1;
	let t = e.pathDetailThreshold;
	return !Number.isFinite(t) || t === void 0 || t <= 0 ? !1 : (e.pathDetailThreshold = 0, !0);
}
//#endregion
//#region src/line-cap.ts
function T(e, t, n) {
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
function E(e, t, n, r) {
	let i = O(e, t, n, r);
	return i === null ? null : i.bevel;
}
function D(e, t, n, r, i) {
	let a = O(e, t, n, r);
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
function O(e, t, n, r) {
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
var k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap();
function te(e) {
	let t = k.get(e);
	if (t !== void 0) return t;
	let n = e.every((e) => e.type === "M" || e.type === "L" || e.type === "Z");
	return k.set(e, n), n;
}
function N(e, t, n, r) {
	let i = n.fill === null ? 0 : n.fillAlpha * n.opacity, a = n.stroke === null ? 0 : n.strokeAlpha * n.opacity;
	te(t) ? ne(e, t, n, i, a) : re(e, t, n, i, a, r);
}
function ne(e, t, n, r, a) {
	let o = ie(t);
	if (o.length !== 0) {
		if (n.fill !== null && o.some((e) => e.closed) && P(e, o, n, r), n.stroke !== null) {
			e.lineStyle(n.strokeWidth, n.stroke, a);
			for (let { points: t, closed: n } of o) {
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
		for (let { points: t, closed: r } of o) R(e, t, r, n, a);
	}
}
function re(e, t, n, r, a, o) {
	let s = ae(t, ee(o));
	if (s.length !== 0) {
		if (n.fill !== null && s.some((e) => e.closed) && P(e, s, n, r), n.stroke !== null) {
			e.lineStyle(n.strokeWidth, n.stroke, a);
			for (let { points: t, closed: n } of s) {
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
		for (let { points: t, closed: r } of s) R(e, t, r, n, a);
	}
}
function ie(e) {
	let t = A.get(e);
	if (t) return t;
	let n = L(e), r = [];
	for (let e of n) {
		let t = [], n = !1;
		for (let r of e) r.type === "Z" ? n = !0 : "x" in r && "y" in r && t.push(r);
		t.length > 0 && r.push({
			points: t,
			closed: n
		});
	}
	return A.set(e, r), r;
}
function ae(e, t) {
	let n = j.get(e);
	n || (n = /* @__PURE__ */ new Map(), j.set(e, n));
	let r = n.get(t);
	if (r) return r;
	let a = L(e), o = [];
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
					oe(a, s, o.x1, o.y1, o.x2, o.y2, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "Q":
					se(a, s, o.x1, o.y1, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "A":
					ce(a, s, o, t, r), a = o.x, s = o.y;
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
function oe(e, t, n, r, i, a, o, s, c, l) {
	for (let u = 1; u <= c; u++) {
		let d = u / c, f = 1 - d, p = f * f, m = d * d, h = p * f * e + 3 * p * d * n + 3 * f * m * i + m * d * o, g = p * f * t + 3 * p * d * r + 3 * f * m * a + m * d * s;
		l.push({
			x: h,
			y: g
		});
	}
}
function se(e, t, n, r, i, a, o, s) {
	for (let c = 1; c <= o; c++) {
		let l = c / o, u = 1 - l, d = u * u * e + 2 * u * l * n + l * l * i, f = u * u * t + 2 * u * l * r + l * l * a;
		s.push({
			x: d,
			y: f
		});
	}
}
function ce(e, t, n, r, i) {
	let { startAngle: a, endAngle: o, rx: s, ry: c, cx: l, cy: u } = me(e, t, n.rx, n.ry, n.xAxisRotation, n.largeArc, n.sweep, n.x, n.y), d = n.xAxisRotation * Math.PI / 180, f = Math.cos(d), p = Math.sin(d), m = o - a;
	for (let e = 1; e <= r; e++) {
		let t = a + e / r * m, n = Math.cos(t), o = Math.sin(t), d = f * s * n - p * c * o + l, h = p * s * n + f * c * o + u;
		i.push({
			x: d,
			y: h
		});
	}
}
function P(e, t, n, r) {
	let a = t.filter((e) => e.closed);
	if (a.length === 0) return;
	let o = ue(a);
	e.fillStyle(i(n.fill), r);
	for (let t of o) {
		if (t.holes.length === 0) {
			e.beginPath();
			let n = i(t.outer[0]);
			e.moveTo(n.x, n.y);
			for (let n = 1; n < t.outer.length; n++) {
				let r = i(t.outer[n]);
				e.lineTo(r.x, r.y);
			}
			e.closePath(), e.fillPath();
			continue;
		}
		let a = le(t.outer, t.holes);
		e.beginPath();
		let o = i(a.ring[0]);
		e.moveTo(o.x, o.y);
		for (let t = 1; t < a.ring.length; t++) {
			let n = i(a.ring[t]);
			e.lineTo(n.x, n.y);
		}
		e.closePath(), e.fillPath();
		let s = i(n.fill);
		e.lineStyle(1, s, r);
		for (let t of a.bridges) e.beginPath(), e.moveTo(t.a.x, t.a.y), e.lineTo(t.b.x, t.b.y), e.strokePath();
	}
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
	let C = Math.max(0, b * x - b * y - x * v), ee = b * y + x * v, w = Math.sqrt(C / ee), T = a === o ? -1 : 1, E = T * w * (g * h / _), D = T * w * (-(_ * m) / g), O = u * E - d * D + (e + s) / 2, k = d * E + u * D + (t + c) / 2, A = F(1, 0, (m - E) / g, (h - D) / _), j = F((m - E) / g, (h - D) / _, (-m - E) / g, (-h - D) / _);
	return !o && j > 0 && (j -= 2 * Math.PI), o && j < 0 && (j += 2 * Math.PI), {
		cx: O,
		cy: k,
		rx: g,
		ry: _,
		startAngle: A,
		endAngle: A + j
	};
}
function F(e, t, n, r) {
	let i = e * n + t * r, a = Math.sqrt((e * e + t * t) * (n * n + r * r)), o = Math.acos(Math.max(-1, Math.min(1, i / a)));
	return e * r - t * n < 0 && (o = -o), o;
}
var I = .01;
function he(e) {
	if (e.length < 2) return e;
	let t = [i(e[0])];
	for (let n = 1; n < e.length; n++) {
		let r = i(t[t.length - 1]), a = i(e[n]), o = a.x - r.x, s = a.y - r.y;
		o * o + s * s > I && t.push(a);
	}
	if (t.length > 2) {
		let e = i(t[0]), n = i(t[t.length - 1]), r = n.x - e.x, a = n.y - e.y;
		r * r + a * a <= I && t.pop();
	}
	return t;
}
function L(e) {
	let t = [], n = [];
	for (let r of e) r.type === "M" && n.length > 0 && (t.push(n), n = []), n.push(r);
	return n.length > 0 && t.push(n), t;
}
function R(e, t, n, r, i) {
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
	let r = M.get(e);
	r || (r = /* @__PURE__ */ new Map(), M.set(e, r));
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
				let e = E(r, a, o, c);
				e && l.push({
					kind: "polygon",
					points: [
						a,
						e[0],
						e[1]
					]
				});
			} else {
				let e = D(r, a, o, c, n.miterLimit);
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
			let t = T(i(e[0]), i(e[1]), c);
			t && l.push({
				kind: "polygon",
				points: t
			});
			let n = T(i(e[s - 1]), i(e[s - 2]), c);
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
//#region src/transform.ts
function ye(e, t, n) {
	let r = t / e.width, i = n / e.height, a = Math.min(r, i);
	return {
		scale: a,
		tx: (t - e.width * a) / 2 - e.minX * a,
		ty: (n - e.height * a) / 2 - e.minY * a
	};
}
function z(e, t, n, r) {
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
var B = /* @__PURE__ */ new WeakMap(), V = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), W = 1;
function G(e, t, n, r) {
	q(e, t, n, r);
}
function K(e, t, n, r) {
	return q(e, t, n, r);
}
function q(e, n, r, i) {
	let a = `path|${n}|${Pe(r)}|${Ne(i)}`;
	return y(e, a) ? (b(e) && e.clear(), Z(e), N(e, t(n), Ae(r), i), x(e, a), !0) : !1;
}
function J(e, t, n) {
	be(e, t, n);
}
function Y(e, t, n) {
	return be(e, t, n);
}
function be(e, i, a) {
	let m = `svg|${i}|${$(a)}`;
	if (!y(e, m)) return !1;
	b(e) && e.clear(), Z(e);
	let g = new DOMParser().parseFromString(i, "image/svg+xml"), _ = g.documentElement, v = p(u(_)), S = Q(je(_.getAttribute("viewBox")), a), C = g.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon");
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
		m && (C = c(C, m), x.strokeWidth *= d(m)), S && (C = z(C, S.scale, S.tx, S.ty), x.strokeWidth *= S.scale), N(e, C, x, a);
	}
	return x(e, m), !0;
}
function xe(e, t, n) {
	Ce(e, t, n);
}
function Se(e, t, n) {
	return Ce(e, t, n);
}
function Ce(e, t, n) {
	let r = `compiled|${Me(t)}|${$(n)}`;
	if (!y(e, r)) return !1;
	b(e) && e.clear(), Z(e);
	let i = Q(t.viewBox, n), a = n?.overrideFill, o = n?.overrideStroke, c = a !== void 0 || o !== void 0, l = t.items;
	if (Array.isArray(l) && l.length > 0) {
		let u = i ? De(t, i) : l;
		for (let t of u) {
			let r = c ? Ee(t.style, a, o) : t.style;
			t.kind === "native" ? s(e, t.shape, r) : N(e, t.commands, r, n);
		}
		return x(e, r), !0;
	}
	let u = i ? Oe(t, i) : t.paths;
	for (let t of u) {
		let r = c ? Ee(t.style, a, o) : t.style;
		N(e, t.commands, r, n);
	}
	return x(e, r), !0;
}
function we(e) {
	S(e);
}
function Te(e) {
	C(e);
}
function Ee(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = H.get(e);
	r || (r = /* @__PURE__ */ new Map(), H.set(e, r));
	let i = `${t ?? "_"}|${n ?? "_"}`, a = r.get(i);
	if (a) return a;
	let o = { ...e };
	return t !== void 0 && (o.fill = t), n !== void 0 && (o.stroke = n), r.set(i, o), o;
}
function De(e, t) {
	let r = B.get(e);
	r || (r = /* @__PURE__ */ new Map(), B.set(e, r));
	let i = ke(t), a = r.get(i);
	if (a) return a;
	let o = e.items.map((e) => e.kind === "native" ? {
		kind: "native",
		shape: n(e.shape, t.scale, t.tx, t.ty),
		style: X(e.style, t.scale)
	} : {
		kind: "path",
		commands: z(e.commands, t.scale, t.tx, t.ty),
		style: X(e.style, t.scale)
	});
	return r.set(i, o), o;
}
function Oe(e, t) {
	let n = V.get(e);
	n || (n = /* @__PURE__ */ new Map(), V.set(e, n));
	let r = ke(t), i = n.get(r);
	if (i) return i;
	let a = e.paths.map((e) => ({
		commands: z(e.commands, t.scale, t.tx, t.ty),
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
function ke(e) {
	return `${e.scale}|${e.tx}|${e.ty}`;
}
function Z(e) {
	let t = e.scene?.sys?.game?.renderer;
	w(t?.config);
}
function Ae(e) {
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
function je(e) {
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
function Q(e, t) {
	if (e && !(t?.width === void 0 && t?.height === void 0)) return ye(e, t.width ?? t.height ?? e.width, t.height ?? t.width ?? e.height);
}
function Me(e) {
	let t = U.get(e);
	if (t !== void 0) return t;
	let n = W;
	return W += 1, U.set(e, n), n;
}
function $(e) {
	return [
		e?.curveResolution,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height
	].join("|");
}
function Ne(e) {
	return String(e?.curveResolution);
}
function Pe(e) {
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
var Fe = class extends g.Plugins.ScenePlugin {
	defaultOptions = {};
	boot() {
		i(this.systems, "Scene systems not available").events.once("destroy", this.destroy, this);
	}
	setDefaults(e) {
		return this.defaultOptions = { ...e }, this;
	}
	draw(e, t, n) {
		J(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawIfDirty(e, t, n) {
		return Y(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawPath(e, t, n, r) {
		G(e, t, n, {
			...this.defaultOptions,
			...r
		});
	}
	drawPathIfDirty(e, t, n, r) {
		return K(e, t, n, {
			...this.defaultOptions,
			...r
		});
	}
	drawCompiled(e, t, n) {
		xe(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawCompiledIfDirty(e, t, n) {
		return Se(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	markDirty(e) {
		return we(e), this;
	}
	clearDirtyState(e) {
		return Te(e), this;
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
export { e as DEFAULT_STYLE, Fe as SVGPlugin, Te as clearSVGDirtyState, m as compileSVG, f as convertShape, xe as drawCompiledSVG, Se as drawCompiledSVGIfDirty, J as drawSVG, Y as drawSVGIfDirty, G as drawSVGPath, K as drawSVGPathIfDirty, we as markSVGDirty, a as parseColor, t as parsePath, N as renderPath, o as resolveStyle };
