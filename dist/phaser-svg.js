import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, s as p, t as m, u as h } from "./compiler-DU-tbQRI.js";
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
//#region node_modules/earcut/src/earcut.js
function E(e, t, n = 2) {
	let r = t && t.length, i = r ? t[0] * n : e.length, a = D(e, 0, i, n, !0), o = [];
	if (!a || a.next === a.prev) return o;
	let s, c, l;
	if (r && (a = ne(e, t, a, n)), e.length > 80 * n) {
		s = e[0], c = e[1];
		let t = s, r = c;
		for (let a = n; a < i; a += n) {
			let n = e[a], i = e[a + 1];
			n < s && (s = n), i < c && (c = i), n > t && (t = n), i > r && (r = i);
		}
		l = Math.max(t - s, r - c), l = l === 0 ? 0 : 32767 / l;
	}
	return k(a, o, n, s, c, l, 0), o;
}
function D(e, t, n, r, i) {
	let a;
	if (i === ge(e, t, n, r) > 0) for (let i = t; i < n; i += r) a = he(i / r | 0, e[i], e[i + 1], a);
	else for (let i = n - r; i >= t; i -= r) a = he(i / r | 0, e[i], e[i + 1], a);
	return a && F(a, a.next) && (B(a), a = a.next), a;
}
function O(e, t) {
	if (!e) return e;
	t ||= e;
	let n = e, r;
	do
		if (r = !1, !n.steiner && (F(n, n.next) || P(n.prev, n, n.next) === 0)) {
			if (B(n), n = t = n.prev, n === n.next) break;
			r = !0;
		} else n = n.next;
	while (r || n !== t);
	return t;
}
function k(e, t, n, r, i, a, o) {
	if (!e) return;
	!o && a && se(e, r, i, a);
	let s = e;
	for (; e.prev !== e.next;) {
		let c = e.prev, l = e.next;
		if (a ? A(e, r, i, a) : ee(e)) {
			t.push(c.i, e.i, l.i), B(e), e = l.next, s = l.next;
			continue;
		}
		if (e = l, e === s) {
			o ? o === 1 ? (e = j(O(e), t), k(e, t, n, r, i, a, 2)) : o === 2 && te(e, t, n, r, i, a) : k(O(e), t, n, r, i, a, 1);
			break;
		}
	}
}
function ee(e) {
	let t = e.prev, n = e, r = e.next;
	if (P(t, n, r) >= 0) return !1;
	let i = t.x, a = n.x, o = r.x, s = t.y, c = n.y, l = r.y, u = Math.min(i, a, o), d = Math.min(s, c, l), f = Math.max(i, a, o), p = Math.max(s, c, l), m = r.next;
	for (; m !== t;) {
		if (m.x >= u && m.x <= f && m.y >= d && m.y <= p && N(i, s, a, c, o, l, m.x, m.y) && P(m.prev, m, m.next) >= 0) return !1;
		m = m.next;
	}
	return !0;
}
function A(e, t, n, r) {
	let i = e.prev, a = e, o = e.next;
	if (P(i, a, o) >= 0) return !1;
	let s = i.x, c = a.x, l = o.x, u = i.y, d = a.y, f = o.y, p = Math.min(s, c, l), m = Math.min(u, d, f), h = Math.max(s, c, l), g = Math.max(u, d, f), _ = M(p, m, t, n, r), v = M(h, g, t, n, r), y = e.prevZ, b = e.nextZ;
	for (; y && y.z >= _ && b && b.z <= v;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && N(s, u, c, d, l, f, y.x, y.y) && P(y.prev, y, y.next) >= 0 || (y = y.prevZ, b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && N(s, u, c, d, l, f, b.x, b.y) && P(b.prev, b, b.next) >= 0)) return !1;
		b = b.nextZ;
	}
	for (; y && y.z >= _;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && N(s, u, c, d, l, f, y.x, y.y) && P(y.prev, y, y.next) >= 0) return !1;
		y = y.prevZ;
	}
	for (; b && b.z <= v;) {
		if (b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && N(s, u, c, d, l, f, b.x, b.y) && P(b.prev, b, b.next) >= 0) return !1;
		b = b.nextZ;
	}
	return !0;
}
function j(e, t) {
	let n = e;
	do {
		let r = n.prev, i = n.next.next;
		!F(r, i) && I(r, n, n.next, i) && z(r, i) && z(i, r) && (t.push(r.i, n.i, i.i), B(n), B(n.next), n = e = i), n = n.next;
	} while (n !== e);
	return O(n);
}
function te(e, t, n, r, i, a) {
	let o = e;
	do {
		let e = o.next.next;
		for (; e !== o.prev;) {
			if (o.i !== e.i && de(o, e)) {
				let s = me(o, e);
				o = O(o, o.next), s = O(s, s.next), k(o, t, n, r, i, a, 0), k(s, t, n, r, i, a, 0);
				return;
			}
			e = e.next;
		}
		o = o.next;
	} while (o !== e);
}
function ne(e, t, n, r) {
	let i = [];
	for (let n = 0, a = t.length; n < a; n++) {
		let o = D(e, t[n] * r, n < a - 1 ? t[n + 1] * r : e.length, r, !1);
		o === o.next && (o.steiner = !0), i.push(le(o));
	}
	i.sort(re);
	for (let e = 0; e < i.length; e++) n = ie(i[e], n);
	return n;
}
function re(e, t) {
	let n = e.x - t.x;
	return n === 0 && (n = e.y - t.y, n === 0 && (n = (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x))), n;
}
function ie(e, t) {
	let n = ae(e, t);
	if (!n) return t;
	let r = me(n, e);
	return O(r, r.next), O(n, n.next);
}
function ae(e, t) {
	let n = t, r = e.x, i = e.y, a = -Infinity, o;
	if (F(e, n)) return n;
	do {
		if (F(e, n.next)) return n.next;
		if (i <= n.y && i >= n.next.y && n.next.y !== n.y) {
			let e = n.x + (i - n.y) * (n.next.x - n.x) / (n.next.y - n.y);
			if (e <= r && e > a && (a = e, o = n.x < n.next.x ? n : n.next, e === r)) return o;
		}
		n = n.next;
	} while (n !== t);
	if (!o) return null;
	let s = o, c = o.x, l = o.y, u = Infinity;
	n = o;
	do {
		if (r >= n.x && n.x >= c && r !== n.x && ue(i < l ? r : a, i, c, l, i < l ? a : r, i, n.x, n.y)) {
			let t = Math.abs(i - n.y) / (r - n.x);
			z(n, e) && (t < u || t === u && (n.x > o.x || n.x === o.x && oe(o, n))) && (o = n, u = t);
		}
		n = n.next;
	} while (n !== s);
	return o;
}
function oe(e, t) {
	return P(e.prev, e, t.prev) < 0 && P(t.next, e, e.next) < 0;
}
function se(e, t, n, r) {
	let i = e;
	do
		i.z === 0 && (i.z = M(i.x, i.y, t, n, r)), i.prevZ = i.prev, i.nextZ = i.next, i = i.next;
	while (i !== e);
	i.prevZ.nextZ = null, i.prevZ = null, ce(i);
}
function ce(e) {
	let t, n = 1;
	do {
		let r = e, i;
		e = null;
		let a = null;
		for (t = 0; r;) {
			t++;
			let o = r, s = 0;
			for (let e = 0; e < n && (s++, o = o.nextZ, o); e++);
			let c = n;
			for (; s > 0 || c > 0 && o;) s !== 0 && (c === 0 || !o || r.z <= o.z) ? (i = r, r = r.nextZ, s--) : (i = o, o = o.nextZ, c--), a ? a.nextZ = i : e = i, i.prevZ = a, a = i;
			r = o;
		}
		a.nextZ = null, n *= 2;
	} while (t > 1);
	return e;
}
function M(e, t, n, r, i) {
	return e = (e - n) * i | 0, t = (t - r) * i | 0, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, e | t << 1;
}
function le(e) {
	let t = e, n = e;
	do
		(t.x < n.x || t.x === n.x && t.y < n.y) && (n = t), t = t.next;
	while (t !== e);
	return n;
}
function ue(e, t, n, r, i, a, o, s) {
	return (i - o) * (t - s) >= (e - o) * (a - s) && (e - o) * (r - s) >= (n - o) * (t - s) && (n - o) * (a - s) >= (i - o) * (r - s);
}
function N(e, t, n, r, i, a, o, s) {
	return !(e === o && t === s) && ue(e, t, n, r, i, a, o, s);
}
function de(e, t) {
	return e.next.i !== t.i && e.prev.i !== t.i && !fe(e, t) && (z(e, t) && z(t, e) && pe(e, t) && (P(e.prev, e, t.prev) || P(e, t.prev, t)) || F(e, t) && P(e.prev, e, e.next) > 0 && P(t.prev, t, t.next) > 0);
}
function P(e, t, n) {
	return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function F(e, t) {
	return e.x === t.x && e.y === t.y;
}
function I(e, t, n, r) {
	let i = R(P(e, t, n)), a = R(P(e, t, r)), o = R(P(n, r, e)), s = R(P(n, r, t));
	return !!(i !== a && o !== s || i === 0 && L(e, n, t) || a === 0 && L(e, r, t) || o === 0 && L(n, e, r) || s === 0 && L(n, t, r));
}
function L(e, t, n) {
	return t.x <= Math.max(e.x, n.x) && t.x >= Math.min(e.x, n.x) && t.y <= Math.max(e.y, n.y) && t.y >= Math.min(e.y, n.y);
}
function R(e) {
	return e > 0 ? 1 : e < 0 ? -1 : 0;
}
function fe(e, t) {
	let n = e;
	do {
		if (n.i !== e.i && n.next.i !== e.i && n.i !== t.i && n.next.i !== t.i && I(n, n.next, e, t)) return !0;
		n = n.next;
	} while (n !== e);
	return !1;
}
function z(e, t) {
	return P(e.prev, e, e.next) < 0 ? P(e, t, e.next) >= 0 && P(e, e.prev, t) >= 0 : P(e, t, e.prev) < 0 || P(e, e.next, t) < 0;
}
function pe(e, t) {
	let n = e, r = !1, i = (e.x + t.x) / 2, a = (e.y + t.y) / 2;
	do
		n.y > a != n.next.y > a && n.next.y !== n.y && i < (n.next.x - n.x) * (a - n.y) / (n.next.y - n.y) + n.x && (r = !r), n = n.next;
	while (n !== e);
	return r;
}
function me(e, t) {
	let n = V(e.i, e.x, e.y), r = V(t.i, t.x, t.y), i = e.next, a = t.prev;
	return e.next = t, t.prev = e, n.next = i, i.prev = n, r.next = n, n.prev = r, a.next = r, r.prev = a, r;
}
function he(e, t, n, r) {
	let i = V(e, t, n);
	return r ? (i.next = r.next, i.prev = r, r.next.prev = i, r.next = i) : (i.prev = i, i.next = i), i;
}
function B(e) {
	e.next.prev = e.prev, e.prev.next = e.next, e.prevZ && (e.prevZ.nextZ = e.nextZ), e.nextZ && (e.nextZ.prevZ = e.prevZ);
}
function V(e, t, n) {
	return {
		i: e,
		x: t,
		y: n,
		prev: null,
		next: null,
		z: 0,
		prevZ: null,
		nextZ: null,
		steiner: !1
	};
}
function ge(e, t, n, r) {
	let i = 0;
	for (let a = t, o = n - r; a < n; a += r) i += (e[o] - e[a]) * (e[a + 1] + e[o + 1]), o = a;
	return i;
}
//#endregion
//#region src/line-cap.ts
function _e(e, t, n) {
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
function ve(e, t, n, r) {
	let i = be(e, t, n, r);
	return i === null ? null : i.bevel;
}
function ye(e, t, n, r, i) {
	let a = be(e, t, n, r);
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
function be(e, t, n, r) {
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
var H = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ new WeakMap();
function xe(e) {
	let t = H.get(e);
	if (t !== void 0) return t;
	let n = e.every((e) => e.type === "M" || e.type === "L" || e.type === "Z");
	return H.set(e, n), n;
}
function q(e, t, n, r) {
	let i = n.fill === null ? 0 : n.fillAlpha * n.opacity, a = n.stroke === null ? 0 : n.strokeAlpha * n.opacity, o = n.fill !== null && i > 0, s = n.stroke !== null && n.strokeWidth > 0 && a > 0;
	!o && !s || (xe(t) ? Se(e, t, n, i, a, o, s) : Ce(e, t, n, i, a, o, s, r));
}
function Se(e, t, n, r, a, o, s) {
	let c = we(t);
	if (c.length !== 0) {
		if (o && c.some((e) => e.closed) && J(e, c, n, r), s) {
			let t = i(n.stroke);
			e.fillStyle(t, a);
			for (let { points: t, closed: r } of c) Ue(e, t, r, n.strokeWidth / 2);
		}
		if (s) for (let { points: t, closed: r } of c) Be(e, t, r, n, a);
	}
}
function Ce(e, t, n, r, a, o, s, c) {
	let l = Te(t, w(c));
	if (l.length !== 0) {
		if (o && l.some((e) => e.closed) && J(e, l, n, r), s) {
			let t = i(n.stroke);
			e.fillStyle(t, a);
			for (let { points: t, closed: r } of l) Ue(e, t, r, n.strokeWidth / 2);
		}
		if (s) for (let { points: t, closed: r } of l) Be(e, t, r, n, a);
	}
}
function we(e) {
	let t = U.get(e);
	if (t) return t;
	let n = ze(e), r = [];
	for (let e of n) {
		let t = [], n = !1;
		for (let r of e) r.type === "Z" ? n = !0 : "x" in r && "y" in r && t.push(r);
		t.length > 0 && r.push({
			points: t,
			closed: n
		});
	}
	return U.set(e, r), r;
}
function Te(e, t) {
	let n = W.get(e);
	n || (n = /* @__PURE__ */ new Map(), W.set(e, n));
	let r = n.get(t);
	if (r) return r;
	let a = ze(e), o = [];
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
					Ee(a, s, o.x1, o.y1, o.x2, o.y2, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "Q":
					De(a, s, o.x1, o.y1, o.x, o.y, t, r), a = o.x, s = o.y;
					break;
				case "A":
					Oe(a, s, o, t, r), a = o.x, s = o.y;
					break;
				case "Z":
					c = !0;
					break;
			}
		}
		let l = Re(r);
		l.length > 1 && o.push({
			points: l,
			closed: c
		});
	}
	return n.set(t, o), o;
}
function Ee(e, t, n, r, i, a, o, s, c, l) {
	for (let u = 1; u <= c; u++) {
		let d = u / c, f = 1 - d, p = f * f, m = d * d, h = p * f * e + 3 * p * d * n + 3 * f * m * i + m * d * o, g = p * f * t + 3 * p * d * r + 3 * f * m * a + m * d * s;
		l.push({
			x: h,
			y: g
		});
	}
}
function De(e, t, n, r, i, a, o, s) {
	for (let c = 1; c <= o; c++) {
		let l = c / o, u = 1 - l, d = u * u * e + 2 * u * l * n + l * l * i, f = u * u * t + 2 * u * l * r + l * l * a;
		s.push({
			x: d,
			y: f
		});
	}
}
function Oe(e, t, n, r, i) {
	let { startAngle: a, endAngle: o, rx: s, ry: c, cx: l, cy: u } = Fe(e, t, n.rx, n.ry, n.xAxisRotation, n.largeArc, n.sweep, n.x, n.y), d = n.xAxisRotation * Math.PI / 180, f = Math.cos(d), p = Math.sin(d), m = o - a;
	for (let e = 1; e <= r; e++) {
		let t = a + e / r * m, n = Math.cos(t), o = Math.sin(t), d = f * s * n - p * c * o + l, h = p * s * n + f * c * o + u;
		i.push({
			x: d,
			y: h
		});
	}
}
function J(e, t, n, r) {
	let a = ke(t);
	if (a.length !== 0) {
		e.fillStyle(i(n.fill), r);
		for (let t of a) for (let n = 0; n + 2 < t.indices.length; n += 3) {
			let r = i(t.indices[n]), a = i(t.indices[n + 1]), o = i(t.indices[n + 2]), s = i(t.points[r]), c = i(t.points[a]), l = i(t.points[o]);
			e.fillTriangle(s.x, s.y, c.x, c.y, l.x, l.y);
		}
	}
}
function ke(e) {
	let t = G.get(e);
	if (t) return t;
	let n = e.filter((e) => e.closed);
	if (n.length === 0) return G.set(e, []), [];
	let r = je(n), i = [];
	for (let e of r) {
		let t = Ae(e);
		t && i.push(t);
	}
	return G.set(e, i), i;
}
function Ae(e) {
	if (e.outer.length < 3) return null;
	let t = [], n = [], r = (e) => {
		for (let n of e) t.push(n.x, n.y);
	};
	r(e.outer);
	for (let i of e.holes) i.length < 3 || (n.push(t.length / 2), r(i));
	let a = E(t, n, 2);
	if (a.length === 0) return null;
	let o = [];
	for (let e = 0; e < t.length; e += 2) o.push({
		x: i(t[e]),
		y: i(t[e + 1])
	});
	return {
		points: o,
		indices: a
	};
}
function je(e) {
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
			area: Pe(t),
			bbox: Me(t)
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
			Ne(a.bbox, e.bbox) && Math.abs(a.area) < n && (n = Math.abs(a.area), t = r);
		}
		t >= 0 && i(l[t]).holes.push(e.points);
	}
	return l;
}
function Me(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) a.x < t && (t = a.x), a.y < n && (n = a.y), a.x > r && (r = a.x), a.y > i && (i = a.y);
	return {
		minX: t,
		minY: n,
		maxX: r,
		maxY: i
	};
}
function Ne(e, t) {
	return t.minX >= e.minX && t.minY >= e.minY && t.maxX <= e.maxX && t.maxY <= e.maxY;
}
function Pe(e) {
	let t = 0;
	for (let n = 0, r = e.length; n < r; n++) {
		let a = i(e[n]), o = i(e[(n + 1) % r]);
		t += (o.x - a.x) * (o.y + a.y);
	}
	return t;
}
function Fe(e, t, n, r, i, a, o, s, c) {
	let l = i * Math.PI / 180, u = Math.cos(l), d = Math.sin(l), f = (e - s) / 2, p = (t - c) / 2, m = u * f + d * p, h = -d * f + u * p, g = Math.abs(n), _ = Math.abs(r), v = m * m, y = h * h, b = g * g, x = _ * _, S = v / b + y / x;
	if (S > 1) {
		let e = Math.sqrt(S);
		g *= e, _ *= e, b = g * g, x = _ * _;
	}
	let C = Math.max(0, b * x - b * y - x * v), w = b * y + x * v, T = Math.sqrt(C / w), E = a === o ? -1 : 1, D = E * T * (g * h / _), O = E * T * (-(_ * m) / g), k = u * D - d * O + (e + s) / 2, ee = d * D + u * O + (t + c) / 2, A = Ie(1, 0, (m - D) / g, (h - O) / _), j = Ie((m - D) / g, (h - O) / _, (-m - D) / g, (-h - O) / _);
	return !o && j > 0 && (j -= 2 * Math.PI), o && j < 0 && (j += 2 * Math.PI), {
		cx: k,
		cy: ee,
		rx: g,
		ry: _,
		startAngle: A,
		endAngle: A + j
	};
}
function Ie(e, t, n, r) {
	let i = e * n + t * r, a = Math.sqrt((e * e + t * t) * (n * n + r * r)), o = Math.acos(Math.max(-1, Math.min(1, i / a)));
	return e * r - t * n < 0 && (o = -o), o;
}
var Le = .01;
function Re(e) {
	if (e.length < 2) return e;
	let t = [i(e[0])];
	for (let n = 1; n < e.length; n++) {
		let r = i(t[t.length - 1]), a = i(e[n]), o = a.x - r.x, s = a.y - r.y;
		o * o + s * s > Le && t.push(a);
	}
	if (t.length > 2) {
		let e = i(t[0]), n = i(t[t.length - 1]), r = n.x - e.x, a = n.y - e.y;
		r * r + a * a <= Le && t.pop();
	}
	return t;
}
function ze(e) {
	let t = [], n = [];
	for (let r of e) r.type === "M" && n.length > 0 && (t.push(n), n = []), n.push(r);
	return n.length > 0 && t.push(n), t;
}
function Be(e, t, n, r, i) {
	if (r.stroke === null || r.strokeWidth < 2) return;
	let a = Ve(t, n, r);
	if (a.length !== 0) {
		e.fillStyle(r.stroke, i);
		for (let t of a) Ke(e, t.points);
	}
}
function Ve(e, t, n) {
	let r = K.get(e);
	r || (r = /* @__PURE__ */ new Map(), K.set(e, r));
	let a = He(t, n), o = r.get(a);
	if (o) return o;
	let s = e.length, c = n.strokeWidth / 2, l = [];
	if (s >= 3) {
		let r = t ? 0 : 1, a = t ? s : s - 1;
		for (let t = r; t < a; t++) {
			let r = i(e[(t - 1 + s) % s]), a = i(e[t]), o = i(e[(t + 1) % s]);
			if (n.lineJoin === "round") {
				let e = ve(r, a, o, c);
				if (!e) continue;
				l.push({
					kind: "polygon",
					points: qe(a, e[0], e[1], c)
				});
			} else if (n.lineJoin === "bevel") {
				let e = ve(r, a, o, c);
				e && l.push({
					kind: "polygon",
					points: [
						a,
						e[0],
						e[1]
					]
				});
			} else {
				let e = ye(r, a, o, c, n.miterLimit);
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
			let t = i(e[0]), n = i(e[1]), r = i(e[s - 1]), a = i(e[s - 2]);
			l.push({
				kind: "polygon",
				points: Je(t, n, c, !0)
			}), l.push({
				kind: "polygon",
				points: Je(r, a, c, !1)
			});
		} else if (n.lineCap === "square") {
			let t = _e(i(e[0]), i(e[1]), c);
			t && l.push({
				kind: "polygon",
				points: t
			});
			let n = _e(i(e[s - 1]), i(e[s - 2]), c);
			n && l.push({
				kind: "polygon",
				points: n
			});
		}
	}
	return r.set(a, l), l;
}
function He(e, t) {
	return [
		e ? 1 : 0,
		t.strokeWidth,
		t.lineJoin,
		t.lineCap,
		t.miterLimit
	].join("|");
}
function Ue(e, t, n, r) {
	let a = t.length;
	if (a < 2) return;
	let o = n ? a : a - 1;
	for (let n = 0; n < o; n++) {
		let o = We(i(t[n]), i(t[(n + 1) % a]), r);
		o && Ge(e, o);
	}
}
function We(e, t, n) {
	let r = t.x - e.x, i = t.y - e.y, a = Math.hypot(r, i);
	if (a === 0) return null;
	let o = -i / a * n, s = r / a * n;
	return [
		{
			x: e.x + o,
			y: e.y + s
		},
		{
			x: e.x - o,
			y: e.y - s
		},
		{
			x: t.x - o,
			y: t.y - s
		},
		{
			x: t.x + o,
			y: t.y + s
		}
	];
}
function Ge(e, [t, n, r, i]) {
	e.fillTriangle(t.x, t.y, n.x, n.y, r.x, r.y), e.fillTriangle(t.x, t.y, r.x, r.y, i.x, i.y);
}
function Ke(e, t) {
	if (t.length < 3) return;
	let n = [];
	for (let e of t) n.push(e.x, e.y);
	let r = E(n, [], 2);
	for (let n = 0; n + 2 < r.length; n += 3) {
		let a = i(t[i(r[n])]), o = i(t[i(r[n + 1])]), s = i(t[i(r[n + 2])]);
		e.fillTriangle(a.x, a.y, o.x, o.y, s.x, s.y);
	}
}
function qe(e, t, n, r) {
	let i = Math.atan2(t.y - e.y, t.x - e.x);
	return [e, ...Ye(e, r, i, i + Xe(i, Math.atan2(n.y - e.y, n.x - e.x)))];
}
function Je(e, t, n, r) {
	let i = t.x - e.x, a = t.y - e.y, o = Math.hypot(i, a);
	if (o === 0) return [];
	let s = i / o, c = a / o, l = r ? -s : s, u = r ? -c : c, d = Math.atan2(u, l);
	return Ye(e, n, d - Math.PI / 2, d + Math.PI / 2);
}
function Ye(e, t, n, r) {
	let i = r - n, a = Math.max(1, Math.abs(i) * t), o = Ze(Math.ceil(a / 2), 6, 48), s = [];
	for (let r = 0; r <= o; r++) {
		let a = n + r / o * i;
		s.push({
			x: e.x + Math.cos(a) * t,
			y: e.y + Math.sin(a) * t
		});
	}
	return s;
}
function Xe(e, t) {
	let n = t - e;
	for (; n > Math.PI;) n -= Math.PI * 2;
	for (; n < -Math.PI;) n += Math.PI * 2;
	return n;
}
function Ze(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/render-node/capabilities.ts
var Qe = 96 * 1024 * 1024, $e = /* @__PURE__ */ new WeakMap();
function et(e) {
	let t = $e.get(e);
	if (t !== void 0) return t;
	let n = e.gl;
	if (typeof WebGL2RenderingContext < "u" && n instanceof WebGL2RenderingContext) {
		let t = {
			backend: "webgl2",
			maxSamples: n.getParameter(n.MAX_SAMPLES)
		};
		return $e.set(e, t), t;
	}
	return null;
}
function tt(e, t, n, r) {
	if (e === 8) {
		let e = t.maxSamples >= 8, i = Y(n, r, 8);
		if (e && i <= Qe) return 8;
	}
	if (!(t.maxSamples >= 4)) throw Error(`phaser-svg MSAA: device maximum sample count is ${t.maxSamples}, which is less than the minimum required 4. To fix: run with a WebGL2 renderer on hardware that supports at least x4 multisampling.`);
	let i = Y(n, r, 4);
	if (i > Qe) {
		let e = (i / (1024 * 1024)).toFixed(0);
		throw Error(`phaser-svg MSAA: the MSAA render target for ${n}x${r} at x4 samples would require ${e} MiB (budget is 96 MiB). To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`);
	}
	return 4;
}
function Y(e, t, n) {
	return e * t * 4 * n;
}
//#endregion
//#region src/render-node/resources.ts
var nt = class {
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
		rt(u, a, n, r), this.colorRB = u.getParameter(u.RENDERBUFFER_BINDING), this.resolveFBO = i(o.createFramebuffer(), "phaser-svg MSAA: failed to create resolve framebuffer"), o.bindFramebuffer(o.FRAMEBUFFER, this.resolveFBO), u.framebufferTexture2D(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, c, 0), o.bindFramebuffer(o.FRAMEBUFFER, null), this.msaaFBO = l, this._msaaFBOWrapper = { webGLFramebuffer: l }, this._width = n, this._height = r, this._samples = a;
	}
	destroyGL(e) {
		let t = e.gl;
		this.msaaFBO && (t.deleteFramebuffer(this.msaaFBO), this.msaaFBO = null, this._msaaFBOWrapper = null), this.resolveFBO &&= (t.deleteFramebuffer(this.resolveFBO), null), this.colorRB &&= (t.deleteRenderbuffer(this.colorRB), null), this._resolvedTexture &&= (e.deleteTexture(this._resolvedTexture), null), this._width = 0, this._height = 0, this._samples = 0;
	}
};
function rt(e, t, n, r) {
	let a = i(e.createRenderbuffer(), "phaser-svg MSAA: failed to create MSAA renderbuffer");
	e.bindRenderbuffer(e.RENDERBUFFER, a), e.renderbufferStorageMultisample(e.RENDERBUFFER, t, e.RGBA8, n, r), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, a);
}
//#endregion
//#region src/render-node/svg-render-node.ts
var X = /* @__PURE__ */ new WeakMap();
function it(e, t, n) {
	let r = X.get(e);
	if (r) {
		(r.requestedSamples !== n || r.negotiatedWidth !== t.width || r.negotiatedHeight !== t.height) && (r.samples = tt(n, r.caps, t.width, t.height), r.requestedSamples = n, r.negotiatedWidth = t.width, r.negotiatedHeight = t.height);
		return;
	}
	let i = et(t);
	if (!i) throw Error("phaser-svg MSAA: WebGL2 is required but not available on this renderer. Create the game with a WebGL2-backed canvas (and explicit WEBGL render type), or remove the msaaSamples option.");
	let a = tt(n, i, t.width, t.height), o = {
		resources: new nt(i.backend),
		caps: i,
		samples: a,
		requestedSamples: n,
		negotiatedWidth: t.width,
		negotiatedHeight: t.height,
		quadNodeRenderer: null,
		quadBatchNode: null,
		detachContextLost: null
	};
	X.set(e, o), e.addRenderStep(at(o), 0), e.once("destroy", () => {
		let n = X.get(e);
		n && (n.resources.destroy(t), n.detachContextLost?.(), X.delete(e));
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
function at(e) {
	return function(t, n, r, i, a, o, s) {
		let c = t, l = n, u = r;
		e.resources.ensureResources(c, e.caps, c.width, c.height, e.samples);
		let d = c.renderNodes, { msaaFBOWrapper: f, resolvedTexture: p } = e.resources;
		d.finishBatch();
		let m = u.getClone(!1);
		m.framebuffer = f, m.texture = p, m.state.bindings.framebuffer = f, m.beginDraw();
		let h = c.gl;
		h.clearColor(0, 0, 0, 0), h.clear(h.COLOR_BUFFER_BIT), l.renderWebGLStep(c, n, m, i, (typeof a == "number" ? a : 0) + 1, o, s), d.finishBatch(), e.resources.blitResolve(h), u.beginDraw();
		let g = u.width, _ = u.height;
		(!e.quadBatchNode || e.quadNodeRenderer !== c) && (e.quadBatchNode = d.getNode("BatchHandlerQuadSingle"), e.quadNodeRenderer = c), e.quadBatchNode.batch(u, p, 0, 0, 0, _, g, 0, g, _, 0, 1, 1, -1, !1, 4294967295, 4294967295, 4294967295, 4294967295, {});
	};
}
//#endregion
//#region src/transform.ts
function ot(e, t, n) {
	let r = t / e.width, i = n / e.height, a = Math.min(r, i);
	return {
		scale: a,
		tx: (t - e.width * a) / 2 - e.minX * a,
		ty: (n - e.height * a) / 2 - e.minY * a
	};
}
function Z(e, t, n, r) {
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
var st = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), ut = 1;
function dt(e, t, n, r) {
	pt(e, t, n, r);
}
function ft(e, t, n, r) {
	return pt(e, t, n, r);
}
function pt(e, n, r, i) {
	let a = `path|${n}|${Pt(r)}|${Nt(i)}`;
	return y(e, a) ? (b(e) && e.clear(), Q(e), q(e, t(n), Et(r), i), $(e, i?.msaaSamples), x(e, a), !0) : !1;
}
function mt(e, t, n) {
	gt(e, t, n);
}
function ht(e, t, n) {
	return gt(e, t, n);
}
function gt(e, i, a) {
	let m = `svg|${i}|${At(a)}`;
	if (!y(e, m)) return !1;
	b(e) && e.clear(), Q(e);
	let g = new DOMParser().parseFromString(i, "image/svg+xml"), _ = g.documentElement, v = p(u(_)), S = Ot(Dt(_.getAttribute("viewBox")), a), C = g.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon");
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
		m && (C = c(C, m), x.strokeWidth *= d(m)), S && (C = Z(C, S.scale, S.tx, S.ty), x.strokeWidth *= S.scale), q(e, C, x, a);
	}
	return $(e, a?.msaaSamples), x(e, m), !0;
}
function _t(e, t, n) {
	yt(e, t, n);
}
function vt(e, t, n) {
	return yt(e, t, n);
}
function yt(e, t, n) {
	let r = Mt(t, n), i = `compiled|${kt(t)}|${jt(n, r)}`;
	if (!y(e, i)) return !1;
	b(e) && e.clear(), Q(e);
	let a = Ot(t.viewBox, n), o = n?.overrideFill, c = n?.overrideStroke, l = o !== void 0 || c !== void 0, u = t.items, d = a ? Ct(t, a) : u;
	for (let t of d) {
		let r = l ? St(t.style, o, c) : t.style;
		t.kind === "native" ? s(e, t.shape, r) : q(e, t.commands, r, n);
	}
	return $(e, r), x(e, i), !0;
}
function bt(e) {
	S(e);
}
function xt(e) {
	C(e);
}
function St(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = ct.get(e);
	r || (r = /* @__PURE__ */ new Map(), ct.set(e, r));
	let i = `${t ?? "_"}|${n ?? "_"}`, a = r.get(i);
	if (a) return a;
	let o = { ...e };
	return t !== void 0 && (o.fill = t), n !== void 0 && (o.stroke = n), r.set(i, o), o;
}
function Ct(e, t) {
	let r = st.get(e);
	r || (r = /* @__PURE__ */ new Map(), st.set(e, r));
	let i = Tt(t), a = r.get(i);
	if (a) return a;
	let o = e.items.map((e) => e.kind === "native" ? {
		kind: "native",
		shape: n(e.shape, t.scale, t.tx, t.ty),
		style: wt(e.style, t.scale)
	} : {
		kind: "path",
		commands: Z(e.commands, t.scale, t.tx, t.ty),
		style: wt(e.style, t.scale)
	});
	return r.set(i, o), o;
}
function wt(e, t) {
	return t === 1 ? e : {
		...e,
		strokeWidth: e.strokeWidth * t
	};
}
function Tt(e) {
	return `${e.scale}|${e.tx}|${e.ty}`;
}
function Q(e) {
	let t = e.scene?.sys?.game?.renderer;
	T(t?.config);
}
function $(e, t) {
	let n = t ?? 4, r = e.scene?.sys?.game?.renderer;
	if (!r?.gl) throw Error("phaser-svg MSAA: a WebGL renderer is required. Create the game with WebGL + WebGL2 context, or do not use this plugin in non-WebGL environments.");
	it(e, r, n);
}
function Et(e) {
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
function Dt(e) {
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
function Ot(e, t) {
	if (e && !(t?.width === void 0 && t?.height === void 0)) return ot(e, t.width ?? t.height ?? e.width, t.height ?? t.width ?? e.height);
}
function kt(e) {
	let t = lt.get(e);
	if (t !== void 0) return t;
	let n = ut;
	return ut += 1, lt.set(e, n), n;
}
function At(e) {
	return [
		e?.curveResolution,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height,
		e?.msaaSamples ?? 4
	].join("|");
}
function jt(e, t) {
	return [
		e?.curveResolution,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height,
		t
	].join("|");
}
function Mt(e, t) {
	return t?.msaaSamples ?? e.msaaSamples ?? 4;
}
function Nt(e) {
	return [e?.curveResolution, e?.msaaSamples ?? 4].join("|");
}
function Pt(e) {
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
//#region src/scene-batch.ts
var Ft = class {
	scene;
	graphics;
	autoFlush;
	queue = [];
	constructor(e, t) {
		this.scene = e, this.graphics = t?.graphics ?? this.scene.add.graphics(), this.autoFlush = t?.autoFlush ?? !0, this.autoFlush && this.scene.sys.events.on("postupdate", this.flush), this.scene.sys.events.once("destroy", this.destroy);
	}
	get targetGraphics() {
		return this.graphics;
	}
	queueCompiled(e, t) {
		return this.queue.push({
			kind: "compiled",
			compiled: e,
			options: t
		}), this;
	}
	queueSVG(e, t) {
		return this.queueCompiled(m(e), t);
	}
	queuePath(e, n, r) {
		return this.queue.push({
			kind: "path",
			commands: t(e),
			style: Lt(n),
			options: r
		}), this;
	}
	flush = () => {
		if (this.queue.length === 0) return !1;
		this.graphics.clear();
		let e = this.scene.sys.game.renderer;
		T(e.config);
		let t = 4;
		for (let e of this.queue) {
			if (e.kind === "path") {
				let n = e.options?.x ?? 0, r = e.options?.y ?? 0, i = n === 0 && r === 0 ? e.commands : Z(e.commands, 1, n, r);
				q(this.graphics, i, e.style, e.options);
				let a = e.options?.msaaSamples ?? 4;
				t = Math.max(t, a);
				continue;
			}
			let r = e.options, i = zt(e.compiled.viewBox, r), a = (r?.x ?? 0) + (i?.tx ?? 0), o = (r?.y ?? 0) + (i?.ty ?? 0), c = i?.scale ?? 1, l = r?.overrideFill !== void 0 || r?.overrideStroke !== void 0;
			for (let t of e.compiled.items) {
				let e = c === 1 ? t.style : {
					...t.style,
					strokeWidth: t.style.strokeWidth * c
				}, i = l ? Rt(e, r?.overrideFill, r?.overrideStroke) : e;
				if (t.kind === "native") {
					let e = c === 1 && a === 0 && o === 0 ? t.shape : n(t.shape, c, a, o);
					s(this.graphics, e, i);
				} else {
					let e = c === 1 && a === 0 && o === 0 ? t.commands : Z(t.commands, c, a, o);
					q(this.graphics, e, i, r);
				}
			}
			let u = It(e.compiled, r);
			t = Math.max(t, u);
		}
		this.queue.length = 0;
		let r = e;
		if (!r?.gl) throw Error("phaser-svg scene batch: a WebGL renderer is required. Create the game with WebGL + WebGL2 context.");
		return it(this.graphics, r, t), !0;
	};
	destroy = () => {
		this.autoFlush && this.scene.sys.events.off("postupdate", this.flush), this.queue.length = 0;
	};
};
function It(e, t) {
	return t?.msaaSamples === void 0 ? e.msaaSamples ?? 4 : t.msaaSamples;
}
function Lt(e) {
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
function Rt(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = { ...e };
	return t !== void 0 && (r.fill = t), n !== void 0 && (r.stroke = n), r;
}
function zt(e, t) {
	if (!(!e || t?.width === void 0 || t?.height === void 0)) return ot(e, t.width, t.height);
}
//#endregion
//#region src/plugin.ts
var Bt = class extends g.ScenePlugin {
	defaultOptions = { msaaSamples: 4 };
	sceneBatch = null;
	boot() {
		i(this.systems, "Scene systems not available").events.once("destroy", this.destroy, this);
	}
	setDefaults(e) {
		return this.defaultOptions = { ...e }, this;
	}
	draw(e, t, n) {
		mt(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawIfDirty(e, t, n) {
		return ht(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawPath(e, t, n, r) {
		dt(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawPathIfDirty(e, t, n, r) {
		return ft(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawCompiled(e, t, n) {
		_t(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawCompiledIfDirty(e, t, n) {
		return vt(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	markDirty(e) {
		return bt(e), this;
	}
	clearDirtyState(e) {
		return xt(e), this;
	}
	queue(e, t) {
		return this.ensureSceneBatch().queueSVG(e, {
			...this.defaultOptions,
			...t
		}), this;
	}
	queueCompiled(e, t) {
		return this.ensureSceneBatch().queueCompiled(e, {
			...this.defaultOptions,
			...t
		}), this;
	}
	queuePath(e, t, n) {
		let r = {
			curveResolution: this.defaultOptions.curveResolution,
			msaaSamples: this.defaultOptions.msaaSamples
		};
		return this.ensureSceneBatch().queuePath(e, t, {
			...r,
			...n
		}), this;
	}
	flushQueue() {
		return this.ensureSceneBatch().flush();
	}
	getSceneBatch() {
		return this.ensureSceneBatch();
	}
	ensureSceneBatch() {
		return this.sceneBatch ||= new Ft(i(this.scene)), this.sceneBatch;
	}
	destroy() {
		this.sceneBatch?.destroy(), this.sceneBatch = null, super.destroy();
	}
};
//#endregion
export { e as DEFAULT_STYLE, Bt as SVGPlugin, Ft as SVGSceneBatch, xt as clearSVGDirtyState, m as compileSVG, f as convertShape, _t as drawCompiledSVG, vt as drawCompiledSVGIfDirty, mt as drawSVG, ht as drawSVGIfDirty, dt as drawSVGPath, ft as drawSVGPathIfDirty, bt as markSVGDirty, a as parseColor, t as parsePath, q as renderPath, o as resolveStyle };
