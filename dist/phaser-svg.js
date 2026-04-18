import { a as e, c as t, d as n, f as r, i, l as a, n as o, o as s, r as c, s as l, t as u, u as d } from "./compiler-Bf50Ib84.js";
import { Plugins as f } from "phaser";
//#region src/dirty-state.ts
var p = /* @__PURE__ */ new WeakMap(), m = /* @__PURE__ */ new WeakSet();
function h(e, t) {
	return m.has(e) ? !0 : p.get(e) !== t;
}
function g(e) {
	return p.has(e);
}
function _(e, t) {
	p.set(e, t), m.delete(e);
}
function v(e) {
	m.add(e);
}
function y(e) {
	p.delete(e), m.delete(e);
}
//#endregion
//#region node_modules/earcut/src/earcut.js
function b(e, t, n = 2) {
	let r = t && t.length, i = r ? t[0] * n : e.length, a = x(e, 0, i, n, !0), o = [];
	if (!a || a.next === a.prev) return o;
	let s, c, l;
	if (r && (a = E(e, t, a, n)), e.length > 80 * n) {
		s = e[0], c = e[1];
		let t = s, r = c;
		for (let a = n; a < i; a += n) {
			let n = e[a], i = e[a + 1];
			n < s && (s = n), i < c && (c = i), n > t && (t = n), i > r && (r = i);
		}
		l = Math.max(t - s, r - c), l = l === 0 ? 0 : 32767 / l;
	}
	return C(a, o, n, s, c, l, 0), o;
}
function x(e, t, n, r, i) {
	let a;
	if (i === ye(e, t, n, r) > 0) for (let i = t; i < n; i += r) a = _e(i / r | 0, e[i], e[i + 1], a);
	else for (let i = n - r; i >= t; i -= r) a = _e(i / r | 0, e[i], e[i + 1], a);
	return a && A(a, a.next) && (M(a), a = a.next), a;
}
function S(e, t) {
	if (!e) return e;
	t ||= e;
	let n = e, r;
	do
		if (r = !1, !n.steiner && (A(n, n.next) || k(n.prev, n, n.next) === 0)) {
			if (M(n), n = t = n.prev, n === n.next) break;
			r = !0;
		} else n = n.next;
	while (r || n !== t);
	return t;
}
function C(e, t, n, r, i, a, o) {
	if (!e) return;
	!o && a && ae(e, r, i, a);
	let s = e;
	for (; e.prev !== e.next;) {
		let c = e.prev, l = e.next;
		if (a ? ee(e, r, i, a) : w(e)) {
			t.push(c.i, e.i, l.i), M(e), e = l.next, s = l.next;
			continue;
		}
		if (e = l, e === s) {
			o ? o === 1 ? (e = te(S(e), t), C(e, t, n, r, i, a, 2)) : o === 2 && T(e, t, n, r, i, a) : C(S(e), t, n, r, i, a, 1);
			break;
		}
	}
}
function w(e) {
	let t = e.prev, n = e, r = e.next;
	if (k(t, n, r) >= 0) return !1;
	let i = t.x, a = n.x, o = r.x, s = t.y, c = n.y, l = r.y, u = Math.min(i, a, o), d = Math.min(s, c, l), f = Math.max(i, a, o), p = Math.max(s, c, l), m = r.next;
	for (; m !== t;) {
		if (m.x >= u && m.x <= f && m.y >= d && m.y <= p && O(i, s, a, c, o, l, m.x, m.y) && k(m.prev, m, m.next) >= 0) return !1;
		m = m.next;
	}
	return !0;
}
function ee(e, t, n, r) {
	let i = e.prev, a = e, o = e.next;
	if (k(i, a, o) >= 0) return !1;
	let s = i.x, c = a.x, l = o.x, u = i.y, d = a.y, f = o.y, p = Math.min(s, c, l), m = Math.min(u, d, f), h = Math.max(s, c, l), g = Math.max(u, d, f), _ = se(p, m, t, n, r), v = se(h, g, t, n, r), y = e.prevZ, b = e.nextZ;
	for (; y && y.z >= _ && b && b.z <= v;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && O(s, u, c, d, l, f, y.x, y.y) && k(y.prev, y, y.next) >= 0 || (y = y.prevZ, b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && O(s, u, c, d, l, f, b.x, b.y) && k(b.prev, b, b.next) >= 0)) return !1;
		b = b.nextZ;
	}
	for (; y && y.z >= _;) {
		if (y.x >= p && y.x <= h && y.y >= m && y.y <= g && y !== i && y !== o && O(s, u, c, d, l, f, y.x, y.y) && k(y.prev, y, y.next) >= 0) return !1;
		y = y.prevZ;
	}
	for (; b && b.z <= v;) {
		if (b.x >= p && b.x <= h && b.y >= m && b.y <= g && b !== i && b !== o && O(s, u, c, d, l, f, b.x, b.y) && k(b.prev, b, b.next) >= 0) return !1;
		b = b.nextZ;
	}
	return !0;
}
function te(e, t) {
	let n = e;
	do {
		let r = n.prev, i = n.next.next;
		!A(r, i) && de(r, n, n.next, i) && j(r, i) && j(i, r) && (t.push(r.i, n.i, i.i), M(n), M(n.next), n = e = i), n = n.next;
	} while (n !== e);
	return S(n);
}
function T(e, t, n, r, i, a) {
	let o = e;
	do {
		let e = o.next.next;
		for (; e !== o.prev;) {
			if (o.i !== e.i && ue(o, e)) {
				let s = ge(o, e);
				o = S(o, o.next), s = S(s, s.next), C(o, t, n, r, i, a, 0), C(s, t, n, r, i, a, 0);
				return;
			}
			e = e.next;
		}
		o = o.next;
	} while (o !== e);
}
function E(e, t, n, r) {
	let i = [];
	for (let n = 0, a = t.length; n < a; n++) {
		let o = x(e, t[n] * r, n < a - 1 ? t[n + 1] * r : e.length, r, !1);
		o === o.next && (o.steiner = !0), i.push(ce(o));
	}
	i.sort(ne);
	for (let e = 0; e < i.length; e++) n = re(i[e], n);
	return n;
}
function ne(e, t) {
	let n = e.x - t.x;
	return n === 0 && (n = e.y - t.y, n === 0 && (n = (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x))), n;
}
function re(e, t) {
	let n = ie(e, t);
	if (!n) return t;
	let r = ge(n, e);
	return S(r, r.next), S(n, n.next);
}
function ie(e, t) {
	let n = t, r = e.x, i = e.y, a = -Infinity, o;
	if (A(e, n)) return n;
	do {
		if (A(e, n.next)) return n.next;
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
		if (r >= n.x && n.x >= c && r !== n.x && le(i < l ? r : a, i, c, l, i < l ? a : r, i, n.x, n.y)) {
			let t = Math.abs(i - n.y) / (r - n.x);
			j(n, e) && (t < u || t === u && (n.x > o.x || n.x === o.x && D(o, n))) && (o = n, u = t);
		}
		n = n.next;
	} while (n !== s);
	return o;
}
function D(e, t) {
	return k(e.prev, e, t.prev) < 0 && k(t.next, e, e.next) < 0;
}
function ae(e, t, n, r) {
	let i = e;
	do
		i.z === 0 && (i.z = se(i.x, i.y, t, n, r)), i.prevZ = i.prev, i.nextZ = i.next, i = i.next;
	while (i !== e);
	i.prevZ.nextZ = null, i.prevZ = null, oe(i);
}
function oe(e) {
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
function se(e, t, n, r, i) {
	return e = (e - n) * i | 0, t = (t - r) * i | 0, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, e | t << 1;
}
function ce(e) {
	let t = e, n = e;
	do
		(t.x < n.x || t.x === n.x && t.y < n.y) && (n = t), t = t.next;
	while (t !== e);
	return n;
}
function le(e, t, n, r, i, a, o, s) {
	return (i - o) * (t - s) >= (e - o) * (a - s) && (e - o) * (r - s) >= (n - o) * (t - s) && (n - o) * (a - s) >= (i - o) * (r - s);
}
function O(e, t, n, r, i, a, o, s) {
	return !(e === o && t === s) && le(e, t, n, r, i, a, o, s);
}
function ue(e, t) {
	return e.next.i !== t.i && e.prev.i !== t.i && !me(e, t) && (j(e, t) && j(t, e) && he(e, t) && (k(e.prev, e, t.prev) || k(e, t.prev, t)) || A(e, t) && k(e.prev, e, e.next) > 0 && k(t.prev, t, t.next) > 0);
}
function k(e, t, n) {
	return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function A(e, t) {
	return e.x === t.x && e.y === t.y;
}
function de(e, t, n, r) {
	let i = pe(k(e, t, n)), a = pe(k(e, t, r)), o = pe(k(n, r, e)), s = pe(k(n, r, t));
	return !!(i !== a && o !== s || i === 0 && fe(e, n, t) || a === 0 && fe(e, r, t) || o === 0 && fe(n, e, r) || s === 0 && fe(n, t, r));
}
function fe(e, t, n) {
	return t.x <= Math.max(e.x, n.x) && t.x >= Math.min(e.x, n.x) && t.y <= Math.max(e.y, n.y) && t.y >= Math.min(e.y, n.y);
}
function pe(e) {
	return e > 0 ? 1 : e < 0 ? -1 : 0;
}
function me(e, t) {
	let n = e;
	do {
		if (n.i !== e.i && n.next.i !== e.i && n.i !== t.i && n.next.i !== t.i && de(n, n.next, e, t)) return !0;
		n = n.next;
	} while (n !== e);
	return !1;
}
function j(e, t) {
	return k(e.prev, e, e.next) < 0 ? k(e, t, e.next) >= 0 && k(e, e.prev, t) >= 0 : k(e, t, e.prev) < 0 || k(e, e.next, t) < 0;
}
function he(e, t) {
	let n = e, r = !1, i = (e.x + t.x) / 2, a = (e.y + t.y) / 2;
	do
		n.y > a != n.next.y > a && n.next.y !== n.y && i < (n.next.x - n.x) * (a - n.y) / (n.next.y - n.y) + n.x && (r = !r), n = n.next;
	while (n !== e);
	return r;
}
function ge(e, t) {
	let n = ve(e.i, e.x, e.y), r = ve(t.i, t.x, t.y), i = e.next, a = t.prev;
	return e.next = t, t.prev = e, n.next = i, i.prev = n, r.next = n, n.prev = r, a.next = r, r.prev = a, r;
}
function _e(e, t, n, r) {
	let i = ve(e, t, n);
	return r ? (i.next = r.next, i.prev = r, r.next.prev = i, r.next = i) : (i.prev = i, i.next = i), i;
}
function M(e) {
	e.next.prev = e.prev, e.prev.next = e.next, e.prevZ && (e.prevZ.nextZ = e.nextZ), e.nextZ && (e.nextZ.prevZ = e.prevZ);
}
function ve(e, t, n) {
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
function ye(e, t, n, r) {
	let i = 0;
	for (let a = t, o = n - r; a < n; a += r) i += (e[o] - e[a]) * (e[a + 1] + e[o + 1]), o = a;
	return i;
}
//#endregion
//#region node_modules/libtess-ts/dist/libtess.min.js
function N(e, t) {
	return e.s === t.s && e.t === t.t;
}
function P(e, t) {
	return t.s > e.s || e.s === t.s && t.t >= e.t;
}
function F(e, t) {
	return t.t > e.t || e.t === t.t && t.s >= e.s;
}
function be(e) {
	return P(e.h.i, e.i);
}
function xe(e) {
	return P(e.i, e.h.i);
}
function Se(e, t) {
	return Math.abs(e.s - t.s) + Math.abs(e.t - t.t);
}
function Ce(e, t, n) {
	let r = t.s - e.s, i = n.s - t.s;
	return r + i > 0 ? i > r ? t.t - e.t + r / (r + i) * (e.t - n.t) : t.t - n.t + i / (r + i) * (n.t - e.t) : 0;
}
function I(e, t, n) {
	let r = t.s - e.s, i = n.s - t.s;
	return r + i > 0 ? (t.t - n.t) * r + (t.t - e.t) * i : 0;
}
function we(e, t, n) {
	let r = t.t - e.t, i = n.t - t.t;
	return r + i > 0 ? i > r ? t.s - e.s + r / (r + i) * (e.s - n.s) : t.s - n.s + i / (r + i) * (n.s - e.s) : 0;
}
function Te(e, t, n) {
	let r = t.t - e.t, i = n.t - t.t;
	return r + i > 0 ? (t.s - n.s) * r + (t.s - e.s) * i : 0;
}
function Ee(e, t, n, r) {
	return (e = 0 > e ? 0 : e) > (n = 0 > n ? 0 : n) ? r + n / (e + n) * (t - r) : n === 0 ? (t + r) / 2 : t + e / (e + n) * (r - t);
}
function De(e, t, n) {
	let r = e.event, i = t.l, a = n.l;
	return i.h.i === r ? a.h.i === r ? P(i.i, a.i) ? 0 >= I(a.h.i, i.i, a.i) : I(i.h.i, a.i, i.i) >= 0 : 0 >= I(a.h.i, r, a.i) : a.h.i === r ? I(i.h.i, r, i.i) >= 0 : Ce(i.h.i, r, i.i) >= Ce(a.h.i, r, a.i);
}
function L(e) {
	return e.o;
}
function R(e) {
	return e.next;
}
function Oe(e, t) {
	e.u += t.u, e.h.u += t.h.u;
}
function z(e, t) {
	t.l.N = null, e._.delete(t);
}
function ke(e, t, n) {
	e.A.delete(t.l), t.I = 0, t.l = n, n.N = t;
}
function Ae(e, t) {
	let n, r = t.l.i;
	do
		t = R(t);
	while (t.l.i === r);
	return t.I && (n = e.A.connect(L(t).l.h, t.l.O), ke(e, t, n), t = R(t)), t;
}
function je(e) {
	let t = e.l.h.i;
	do
		e = R(e);
	while (e.l.h.i === t);
	return e;
}
function Me(e, t, n) {
	let r = new tt();
	return r.l = n, e._.insertBefore(t, r), r.I = 0, r.k = 0, r.T = 0, n.N = r, r;
}
function Ne(e, t) {
	switch (e.M) {
		case H.ODD: return !!(1 & t);
		case H.NONZERO: return t !== 0;
		case H.POSITIVE: return t > 0;
		case H.NEGATIVE: return 0 > t;
		case H.ABS_GEQ_TWO: return t >= 2 || -2 >= t;
	}
	throw Error("Invalid winding rule");
}
function Pe(e, t) {
	let n = t.l, r = n.D;
	r.p = t.p, r.L = n, z(e, t);
}
function B(e, t, n) {
	let r, i = null, a = t, o = t.l;
	for (; a !== n;) {
		if (a.I = 0, i = L(a), r = i.l, r.i != o.i) {
			if (!i.I) {
				Pe(e, a);
				break;
			}
			r = e.A.connect(o.C.h, r.h), ke(e, i, r);
		}
		o.C !== r && (e.A.splice(r.h.O, r), e.A.splice(o, r)), Pe(e, a), o = i.l, a = i;
	}
	return o;
}
function V(e, t, n, r, i, a) {
	let o, s, c, l, u = 1;
	c = n;
	do
		Me(e, t, c.h), c = c.C;
	while (c !== r);
	for (i === null && (i = L(t).l.h.C), s = t, l = i; o = L(s), c = o.l.h, c.i === l.i;) c.C !== l && (e.A.splice(c.h.O, c), e.A.splice(l.h.O, c)), o.G = s.G - c.u, o.p = Ne(e, o.G), s.T = 1, !u && Re(e, s) && (Oe(c, l), z(e, s), e.A.delete(l)), u = 0, s = o, l = c;
	s.T = 1, a && Ve(e, s);
}
function Fe(e, t, n, r, i) {
	t.data = null, e.R && (lt[0] = t.coords[0], lt[1] = t.coords[1], lt[2] = t.coords[2], t.data = e.R(lt, n, r, e.m)), t.data === null && (i ? (e.v(100156), e.U = 1) : t.data = n[0]);
}
function Ie(e, t, n) {
	e.R && (q[0] = t.i.data, q[1] = n.i.data, q[2] = null, q[3] = null, K[0] = .5, K[1] = .5, K[2] = 0, K[3] = 0, Fe(e, t.i, q, K, 0)), e.A.splice(t, n);
}
function Le(e, t, n, r, i) {
	let a = Se(t, e), o = Se(n, e), s = .5 * o / (a + o), c = .5 * a / (a + o);
	r !== void 0 && i !== void 0 && (r[i] = s, r[i + 1] = c), e.coords[0] += s * t.coords[0] + c * n.coords[0], e.coords[1] += s * t.coords[1] + c * n.coords[1], e.coords[2] += s * t.coords[2] + c * n.coords[2];
}
function Re(e, t) {
	let n = L(t), r = t.l, i = n.l;
	if (i.i.s > r.i.s || r.i.s === i.i.s && i.i.t >= r.i.t) {
		if (I(i.h.i, r.i, i.i) > 0) return 0;
		N(r.i, i.i) ? r.i !== i.i && (e.S.delete(r.i.B), Ie(e, i.h.O, r)) : (e.A.V(i.h), e.A.splice(r, i.h.O), t.T = n.T = 1);
	} else {
		if (0 > I(r.h.i, i.i, r.i)) return 0;
		R(t).T = t.T = 1, e.A.V(r.h), e.A.splice(i.h.O, r);
	}
	return 1;
}
function ze(e, t) {
	let n = L(t), r = t.l, i = n.l, a;
	if (i.h.i.s > r.h.i.s || r.h.i.s === i.h.i.s && i.h.i.t >= r.h.i.t) {
		if (0 > I(r.h.i, i.h.i, r.i)) return 0;
		R(t).T = t.T = 1, a = e.A.V(r), e.A.splice(i.h, a), a.D.p = t.p;
	} else {
		if (I(i.h.i, r.h.i, i.i) > 0) return 0;
		t.T = n.T = 1, a = e.A.V(i), e.A.splice(r.O, i.h), a.h.D.p = t.p;
	}
	return 1;
}
function Be(e, t) {
	let n = L(t), r = t.l, i = n.l, a = r.i, o = i.i, s, c, l = r.h.i, u = i.h.i, d = st ||= new W(), f, p;
	if (a === o || (s = Math.min(a.t, l.t), c = Math.max(o.t, u.t), s > c)) return 0;
	if (P(a, o)) {
		if (I(u, a, o) > 0) return 0;
	} else if (0 > I(l, o, a)) return 0;
	return ((e, t, n, r, i) => {
		let a, o, s;
		P(e, t) || (s = e, e = t, t = s), P(n, r) || (s = n, n = r, r = s), P(e, n) || (s = e, e = n, n = s, s = t, t = r, r = s), P(n, t) ? P(t, r) ? (a = Ce(e, n, t), o = Ce(n, t, r), 0 > a + o && (a = -a, o = -o), i.s = Ee(a, n.s, o, t.s)) : (a = I(e, n, t), o = -I(e, r, t), 0 > a + o && (a = -a, o = -o), i.s = Ee(a, n.s, o, r.s)) : i.s = .5 * (n.s + t.s), F(e, t) || (s = e, e = t, t = s), F(n, r) || (s = n, n = r, r = s), F(e, n) || (s = e, e = n, n = s, s = t, t = r, r = s), F(n, t) ? F(t, r) ? (a = we(e, n, t), o = we(n, t, r), 0 > a + o && (a = -a, o = -o), i.t = Ee(a, n.t, o, t.t)) : (a = Te(e, n, t), o = -Te(e, r, t), 0 > a + o && (a = -a, o = -o), i.t = Ee(a, n.t, o, r.t)) : i.t = .5 * (n.t + t.t);
	})(l, a, u, o, d), (e.event.s > d.s || d.s === e.event.s && e.event.t >= d.t) && (d.s = e.event.s, d.t = e.event.t), f = o.s > a.s || a.s === o.s && o.t >= a.t ? a : o, (d.s > f.s || f.s === d.s && d.t >= f.t) && (d.s = f.s, d.t = f.t), N(d, a) || N(d, o) ? (Re(e, t), 0) : !N(l, e.event) && I(l, e.event, d) >= 0 || !N(u, e.event) && 0 >= I(u, e.event, d) ? u === e.event ? (e.A.V(r.h), e.A.splice(i.h, r), r = L(t = Ae(e, t)).l, B(e, L(t), n), V(e, t, r.h.O, r, r, 1), 1) : l === e.event ? (e.A.V(i.h), e.A.splice(r.O, i.h.O), n = t, p = L(t = je(t)).l.h.C, n.l = i.h.O, i = B(e, n, null), V(e, t, i.C, r.h.C, p, 1), 1) : (0 > I(l, e.event, d) || (R(t).T = t.T = 1, e.A.V(r.h), r.i.s = e.event.s, r.i.t = e.event.t), I(u, e.event, d) > 0 || (t.T = n.T = 1, e.A.V(i.h), i.i.s = e.event.s, i.i.t = e.event.t), 0) : (e.A.V(r.h), e.A.V(i.h), e.A.splice(i.h.O, r), r.i.s = d.s, r.i.t = d.t, r.i.B = e.S.P(r.i), ((e, t, n, r, i, a) => {
		K[0] = 0, K[1] = 0, K[2] = 0, K[3] = 0, q[0] = n.data, q[1] = r.data, q[2] = i.data, q[3] = a.data, t.coords[0] = t.coords[1] = t.coords[2] = 0, Le(t, n, r, K, 0), Le(t, i, a, K, 2), Fe(e, t, q, K, 1);
	})(e, r.i, a, l, o, u), R(t).T = t.T = n.T = 1, 0);
}
function Ve(e, t) {
	let n, r, i = L(t);
	for (;;) {
		for (; i.T;) t = i, i = L(i);
		if (!t.T && (i = t, (t = R(t)) === null || !t.T)) return;
		if (t.T = 0, n = t.l, r = i.l, n.h.i !== r.h.i && ze(e, t) && (i.I ? (z(e, i), e.A.delete(r), i = L(t), r = i.l) : t.I && (z(e, t), e.A.delete(n), n = (t = R(i)).l)), n.i !== r.i) {
			if (n.h.i === r.h.i || t.I || i.I || n.h.i !== e.event && r.h.i !== e.event) Re(e, t);
			else if (Be(e, t)) return;
		}
		n.i === r.i && n.h.i === r.h.i && (Oe(r, n), z(e, t), e.A.delete(n), t = R(i));
	}
}
function He(e, t) {
	let n, r, i, a, o, s, c = ct ||= new tt();
	c.l = t.L.h, n = e._.search(c), r = L(n), r && (a = n.l, o = r.l, I(a.h.i, t, a.i) === 0 ? ((e, t, n) => {
		let r, i, a, o, s;
		if (r = t.l, N(r.i, n)) Ie(e, r, n.L);
		else {
			if (!N(r.h.i, n)) return e.A.V(r.h), t.I && (e.A.delete(r.C), t.I = 0), e.A.splice(n.L, r), void Ue(e, n);
			s = L(t = je(t)), a = s.l.h, i = o = a.C, s.I && (z(e, s), e.A.delete(a), a = i.h.O), e.A.splice(n.L, a), be(i) || (i = null), V(e, t, a.C, o, i, 1);
		}
	})(e, n, t) : (i = P(o.h.i, a.h.i) ? n : r, n.p || i.I ? (s = i === n ? e.A.connect(t.L.h, a.O) : e.A.connect(o.h.C.h, t.L).h, i.I ? ke(e, i, s) : ((e, t) => {
		t.G = R(t).G + t.l.u, t.p = Ne(e, t.G);
	})(e, Me(e, n, s)), Ue(e, t)) : V(e, n, t.L, t.L, null, 1)));
}
function Ue(e, t) {
	e.event = t;
	let n = t.L;
	for (; n.N === null;) if (n = n.C, n === t.L) return void He(e, t);
	let r = Ae(e, n.N), i = L(r), a = i.l, o = B(e, i, null);
	o.C === a ? ((e, t, n) => {
		let r, i = n.C, a = L(t), o = t.l, s = a.l, c = 0;
		o.h.i !== s.h.i && Be(e, t), N(o.i, e.event) && (e.A.splice(i.h.O, o), i = L(t = Ae(e, t)).l, B(e, L(t), a), c = 1), N(s.i, e.event) && (e.A.splice(n, s.h.O), n = B(e, a, null), c = 1), c ? V(e, t, n.C, i, i, 1) : (r = P(s.i, o.i) ? s.h.O : o, r = e.A.connect(n.C.h, r), V(e, t, r, r.C, r.C, 0), r.h.N.I = 1, Ve(e, t));
	})(e, r, o) : V(e, r, o.C, a, a, 1);
}
function We(e, t, n, r) {
	let i = new tt(), a = e.A.F();
	a.i.s = n, a.i.t = r, a.h.i.s = t, a.h.i.t = r, e.event = a.h.i, i.l = a, i.G = 0, i.p = 0, i.I = 0, i.k = 1, i.T = 0, e._.P(i);
}
function Ge(e, t) {
	let n = e.Y, r = n.next, i = r.coords[0], a = r.coords[1], o = r.coords[2], s = i, c = a, l = o, u = r, d = r, f = r, p = r, m = r, h = r;
	for (r = n.next; r !== n; r = r.next) {
		let e = r.coords[0], t = r.coords[1], n = r.coords[2];
		i > e && (i = e, u = r), e > s && (s = e, p = r), a > t && (a = t, d = r), t > c && (c = t, m = r), o > n && (o = n, f = r), n > l && (l = n, h = r);
	}
	let g = 0, _ = s - i, v = c - a, y, b;
	if (v > _ && (g = 1, _ = v), l - o > _ && (g = 2), g === 0) {
		if (i >= s) return t[0] = 0, t[1] = 0, void (t[2] = 1);
		y = u, b = p;
	} else if (g === 1) {
		if (a >= c) return t[0] = 0, t[1] = 0, void (t[2] = 1);
		y = d, b = m;
	} else {
		if (o >= l) return t[0] = 0, t[1] = 0, void (t[2] = 1);
		y = f, b = h;
	}
	let x = y.coords[0] - b.coords[0], S = y.coords[1] - b.coords[1], C = y.coords[2] - b.coords[2], w = 0;
	for (r = n.next; r !== n; r = r.next) {
		let e = r.coords[0] - b.coords[0], n = r.coords[1] - b.coords[1], i = r.coords[2] - b.coords[2], a = S * i - C * n, o = C * e - x * i, s = x * n - S * e, c = a * a + o * o + s * s;
		c > w && (w = c, t[0] = a, t[1] = o, t[2] = s);
	}
	w > 0 || (t[0] = t[1] = t[2] = 0, Math.abs(S) > Math.abs(x) ? t[Math.abs(C) > Math.abs(S) ? 2 : 1] = 1 : t[Math.abs(C) > Math.abs(x) ? 2 : 0] = 1);
}
function Ke(e, t) {
	let n, r, i, a = e.j, o = e.Y, s = 0;
	for (n = a.next; n !== a; n = n.next) if (i = n.L, i.u > 0) do
		s += (i.i.s - i.h.i.s) * (i.i.t + i.h.i.t), i = i.O;
	while (i !== n.L);
	if (0 > s) {
		for (r = o.next; r !== o; r = r.next) r.t = -r.t;
		t[0] = -t[0], t[1] = -t[1], t[2] = -t[2];
	}
}
function qe(e, t) {
	let n = 0;
	for (let r = t.j.next; r !== t.j; r = r.next) r.p && (n ||= (e.H(4), 1), Ye(r, e));
	n && e.q();
}
function Je(e, t, n, r) {
	0 > t.s * (n.t - r.t) + n.s * (r.t - t.t) + r.s * (t.t - n.t) ? (e.W(t.data), e.W(r.data), e.W(n.data)) : (e.W(t.data), e.W(n.data), e.W(r.data));
}
function Ye(e, t) {
	let n = 0, r = e.L;
	do
		J[n++] = r.i, r = r.O;
	while (r !== e.L);
	if (3 > n) return;
	if (n === 3) return void Je(t, J[0], J[1], J[2]);
	((e) => {
		if (e > Y.length) {
			let t = 2 * e;
			Y = new Int8Array(t), X = new Int32Array(t), Z = new Int32Array(t);
		}
	})(n);
	let i = 0, a = 0;
	for (let e = 1; n > e; e++) P(J[e], J[i]) || (i = e), P(J[e], J[a]) && (a = e);
	if (i === a) return;
	let o = 0;
	X[o] = i, Y[o] = 1, o++;
	let s = (i + 1) % n, c = (i + n - 1) % n;
	for (; s !== a || c !== a;) {
		let e;
		e = s === a ? 0 : c === a ? 1 : !P(J[s], J[c]), e ? (X[o] = s, Y[o] = 1, o++, s = (s + 1) % n) : (X[o] = c, Y[o] = 0, o++, c = (c + n - 1) % n);
	}
	X[o] = a, Y[o] = 1, o++;
	let l = 0;
	Z[l++] = 0, Z[l++] = 1;
	for (let e = 2; o - 1 > e; e++) if (Y[e] !== Y[Z[l - 1]]) {
		for (; l > 1;) {
			let n = Z[--l];
			Je(t, J[X[e]], J[X[n]], J[X[Z[l - 1]]]);
		}
		--l, Z[l++] = e - 1, Z[l++] = e;
	} else {
		let n = Z[--l];
		for (; l > 0;) {
			let r = J[X[e]], i = J[X[n]], a = J[X[Z[l - 1]]], o = r.s * (i.t - a.t) + i.s * (a.t - r.t) + a.s * (r.t - i.t);
			if (!(Y[e] === 1 ? 0 >= o : o >= 0)) break;
			Je(t, r, i, a), n = Z[--l];
		}
		Z[l++] = n, Z[l++] = e;
	}
	for (; l > 1;) {
		let e = Z[--l];
		Je(t, J[X[o - 1]], J[X[e]], J[X[Z[l - 1]]]);
	}
}
function Xe(e, t) {
	let n;
	for (let r = e.Z.next; r !== e.Z; r = n) n = r.next, r.h.D.p === r.D.p ? e.delete(r) : r.u = r.D.p ? t : -t;
}
function Ze(e, t) {
	let n = 0, r = -1;
	for (let i = t.j.o; i !== t.j; i = i.o) {
		if (!i.p) continue;
		n ||= (e.H(4), 1);
		let t = i.L;
		do {
			{
				let n = t.h && t.h.D && t.h.D.p ? 0 : 1;
				r !== n && (r = n, e.K(!!r));
			}
			e.W(t.i.data), t = t.O;
		} while (t !== i.L);
	}
	n && e.q();
}
function Qe(e, t) {
	for (let n = t.j.next; n !== t.j; n = n.next) {
		if (!n.p) continue;
		e.H(2);
		let t = n.L;
		do
			e.W(t.i.data), t = t.O;
		while (t !== n.L);
		e.q();
	}
}
var H, $e, U, et;
((e) => {
	e[e.ODD = 0] = "ODD", e[e.NONZERO = 1] = "NONZERO", e[e.POSITIVE = 2] = "POSITIVE", e[e.NEGATIVE = 3] = "NEGATIVE", e[e.ABS_GEQ_TWO = 4] = "ABS_GEQ_TWO";
})(H ||= {}), ((e) => {
	e[e.X = 0] = "POLYGONS", e[e.J = 1] = "CONNECTED_POLYGONS", e[e.$ = 2] = "BOUNDARY_CONTOURS";
})($e ||= {}), ((e) => {
	e[e.BEGIN = 100100] = "BEGIN", e[e.EDGE_FLAG = 100104] = "EDGE_FLAG", e[e.VERTEX = 100101] = "VERTEX", e[e.END = 100102] = "END", e[e.ERROR = 100103] = "ERROR", e[e.COMBINE = 100105] = "COMBINE", e[e.BEGIN_DATA = 100106] = "BEGIN_DATA", e[e.EDGE_FLAG_DATA = 100110] = "EDGE_FLAG_DATA", e[e.VERTEX_DATA = 100107] = "VERTEX_DATA", e[e.END_DATA = 100108] = "END_DATA", e[e.ERROR_DATA = 100109] = "ERROR_DATA", e[e.COMBINE_DATA = 100111] = "COMBINE_DATA", e[e.WINDING_RULE = 100140] = "WINDING_RULE", e[e.BOUNDARY_ONLY = 100141] = "BOUNDARY_ONLY", e[e.TOLERANCE = 100142] = "TOLERANCE";
})(U ||= {}), ((e) => {
	e[e.tt = 100151] = "MISSING_BEGIN_POLYGON", e[e.it = 100152] = "MISSING_BEGIN_CONTOUR", e[e.st = 100153] = "MISSING_END_POLYGON", e[e.et = 100154] = "MISSING_END_CONTOUR", e[e.nt = 100155] = "COORD_TOO_LARGE", e[e.ht = 100156] = "NEED_COMBINE_CALLBACK";
})(et ||= {});
var tt = class {
	next;
	o;
	l = null;
	G = 0;
	p = 0;
	k = 0;
	T = 0;
	I = 0;
}, nt = class {
	next;
	i;
	h;
	C;
	O;
	D;
	N = null;
	u = 0;
}, W = class {
	next;
	o;
	L;
	coords = [
		0,
		0,
		0
	];
	s = 0;
	t = 0;
	B = 0;
	data = null;
}, G = class {
	next;
	o;
	L;
	p = 0;
}, rt = class {
	Y;
	j;
	Z;
	rt;
	vertexCount = 0;
	constructor() {
		let e = new W(), t = new G(), n = new nt(), r = new nt();
		e.next = e.o = e, t.next = t.o = t, n.next = n, n.h = r, r.next = r, r.h = n, this.Y = e, this.j = t, this.Z = n, this.rt = r;
	}
	lt(e) {
		let t = new nt(), n = new nt(), r = e.h.next;
		return n.next = r, r.h.next = t, t.next = e, e.h.next = n, t.h = n, t.C = t, t.O = n, t.u = 0, t.N = null, n.h = t, n.C = n, n.O = t, n.u = 0, n.N = null, t;
	}
	ot(e, t) {
		let n = e.C, r = t.C;
		n.h.O = t, r.h.O = e, e.C = r, t.C = n;
	}
	ut(e, t, n) {
		let r = e, i = n.o;
		r.o = i, i.next = r, r.next = n, n.o = r, r.L = t, ++this.vertexCount;
		let a = t;
		do
			a.i = r, a = a.C;
		while (a !== t);
	}
	ct(e, t, n) {
		let r = e, i = n.o;
		r.o = i, i.next = r, r.next = n, n.o = r, r.L = t, r.p = n.p;
		let a = t;
		do
			a.D = r, a = a.O;
		while (a !== t);
	}
	ft(e) {
		let t = e.next, n = e.h.next;
		t.h.next = n, n.h.next = t;
	}
	dt(e, t) {
		let n = e.L, r = n;
		do
			r.i = t, r = r.C;
		while (r !== n);
		let i = e.o, a = e.next;
		a.o = i, i.next = a, --this.vertexCount;
	}
	wt(e, t) {
		let n = e.L, r = n;
		do
			r.D = t, r = r.O;
		while (r !== n);
		let i = e.o, a = e.next;
		a.o = i, i.next = a;
	}
	F() {
		let e = new W(), t = new W(), n = new G(), r = this.lt(this.Z);
		return this.ut(e, r, this.Y), this.ut(t, r.h, this.Y), this.ct(n, r, this.j), r;
	}
	splice(e, t) {
		let n = 0, r = 0;
		if (e !== t) {
			if (t.i !== e.i && (r = 1, this.dt(t.i, e.i)), t.D !== e.D && (n = 1, this.wt(t.D, e.D)), this.ot(t, e), !r) {
				let n = new W();
				this.ut(n, t, e.i), e.i.L = e;
			}
			if (!n) {
				let n = new G();
				this.ct(n, t, e.D), e.D.L = e;
			}
		}
	}
	delete(e) {
		let t = e.h, n = 0;
		if (e.D !== e.h.D && (n = 1, this.wt(e.D, e.h.D)), e.C === e) this.dt(e.i, null);
		else if (e.h.D.L = e.h.O, e.i.L = e.C, this.ot(e, e.h.O), !n) {
			let t = new G();
			this.ct(t, e, e.D);
		}
		t.C === t ? (this.dt(t.i, null), this.wt(t.D, null)) : (e.D.L = t.h.O, t.i.L = t.C, this.ot(t, t.h.O)), this.ft(e);
	}
	Et(e) {
		let t = this.lt(e), n = t.h;
		this.ot(t, e.O), t.i = e.h.i;
		let r = new W();
		return this.ut(r, n, t.i), t.D = n.D = e.D, t;
	}
	V(e) {
		let t = this.Et(e).h;
		return this.ot(e.h, e.h.h.O), this.ot(e.h, t), e.h.i = t.i, t.h.i.L = t.h, t.h.D = e.h.D, t.u = e.u, t.h.u = e.h.u, t;
	}
	connect(e, t) {
		let n = 0, r = this.lt(e), i = r.h;
		if (t.D !== e.D && (n = 1, this.wt(t.D, e.D)), this.ot(r, e.O), this.ot(i, t), r.i = e.h.i, i.i = t.i, r.D = i.D = e.D, e.D.L = i, !n) {
			let t = new G();
			this.ct(t, r, e.D);
		}
		return r;
	}
	Nt(e) {
		let t = e.L, n, r, i, a, o;
		r = t.O;
		do
			n = r, r = n.O, n.D = null, n.h.D || (n.C === n ? this.dt(n.i, null) : (n.i.L = n.C, this.ot(n, n.h.O)), i = n.h, i.C === i ? this.dt(i.i, null) : (i.i.L = i.C, this.ot(i, i.h.O)), this.ft(n));
		while (n != t);
		a = e.o, o = e.next, o.o = a, a.next = o;
	}
	_t(e) {
		let t = e.L, n = 0;
		do
			n++, t = t.O;
		while (t !== e.L);
		return n;
	}
	check() {}
}, it = class {
	max = 0;
	At;
	It;
	gt;
	Ot = 0;
	kt = 0;
	size = 0;
	constructor(e) {
		this.max = e, this.At = new Int32Array(e + 1), this.It = Array(e + 1).fill(null), this.gt = new Int32Array(e + 1), this.Ot = 0, this.At[1] = 1, this.It[1] = null;
	}
	reset(e) {
		if (e + 1 > this.max) this.max = e, this.At = new Int32Array(e + 1), this.It = Array(e + 1).fill(null), this.gt = new Int32Array(e + 1);
		else {
			let e = this.It;
			for (let t = 1; this.size >= t; t++) e[t] = null;
		}
		this.size = 0, this.kt = 0, this.Ot = 0, this.At[1] = 1, this.It[1] = null;
	}
	yt(e) {
		let t = this.At, n = this.It, r = this.gt, i = t[e];
		for (;;) {
			let a = e << 1;
			if (a > this.size) break;
			let o = a, s = t[a];
			if (this.size >= a + 1) {
				let e = t[a + 1], r = n[e], i = n[s];
				(i.s > r.s || r.s === i.s && i.t >= r.t) && (o = a + 1, s = e);
			}
			let c = n[i], l = n[s];
			if (l.s > c.s || c.s === l.s && l.t >= c.t) break;
			t[e] = s, r[s] = e, e = o;
		}
		t[e] = i, r[i] = e;
	}
	Tt(e) {
		let t = this.At, n = this.It, r = this.gt, i = t[e];
		for (;;) {
			let a = e >> 1;
			if (a === 0) break;
			let o = t[a], s = n[o], c = n[i];
			if (c.s > s.s || s.s === c.s && c.t >= s.t) break;
			t[e] = o, r[o] = e, e = a;
		}
		t[e] = i, r[i] = e;
	}
	init() {
		for (let e = this.size >> 1; e >= 1; --e) this.yt(e);
		this.Ot = 1;
	}
	bt() {
		return this.size === 0;
	}
	min() {
		return this.size === 0 ? null : this.It[this.At[1]];
	}
	P(e) {
		let t, n;
		if (t = ++this.size, 2 * t > this.max) {
			this.max *= 2;
			let e = new Int32Array(this.max + 1), t = new Int32Array(this.max + 1), n = Array(this.max + 1).fill(null);
			e.set(this.At), t.set(this.gt);
			for (let e = 0; this.It.length > e; e++) n[e] = this.It[e];
			this.At = e, this.gt = t, this.It = n;
		}
		return this.kt === 0 ? n = t : (n = this.kt, this.kt = this.gt[n]), this.At[t] = n, this.gt[n] = t, this.It[n] = e, this.Ot && this.Tt(t), n;
	}
	Mt() {
		let e = this.At, t = this.It, n = this.gt, r = e[1], i = t[r];
		return this.size > 0 && (e[1] = e[this.size], n[e[1]] = 1, t[r] = null, n[r] = this.kt, this.kt = r, --this.size, this.size > 0 && this.yt(1)), i;
	}
	delete(e) {
		let t = this.At, n = this.It, r = this.gt, i;
		if (i = r[e], t[i] = t[this.size], r[t[i]] = i, --this.size, this.size >= i) if (i > 1) {
			let e = n[t[i >> 1]], r = n[t[i]];
			r.s > e.s || e.s === r.s && r.t >= e.t ? this.yt(i) : this.Tt(i);
		} else this.yt(i);
		n[e] = null, r[e] = this.kt, this.kt = e;
	}
}, at = class {
	Dt;
	keys;
	order = null;
	size = 0;
	max = 0;
	Ot = 0;
	Lt;
	constructor(e) {
		this.max = e, this.size = 0, this.Ot = 0, this.Lt = 128 >= e, this.Dt = new it(e), this.Lt || (this.keys = Array(e).fill(null));
	}
	reset(e) {
		this.Dt.reset(e), this.Lt = 128 >= e, this.Lt || this.keys && this.max >= e || (this.keys = Array(e).fill(null)), e > this.max && (this.max = e), this.size = 0, this.Ot = 0, this.order = null;
	}
	P(e) {
		if (this.Lt || this.Ot) return this.Dt.P(e);
		let t = this.size;
		if (++this.size >= this.max) {
			let e = this.max;
			this.max *= 2;
			let t = Array(this.max).fill(null);
			for (let n = 0; e > n; n++) t[n] = this.keys[n];
			this.keys = t;
		}
		return this.keys[t] = e, -(t + 1);
	}
	init() {
		if (this.Lt) return this.Ot = 1, this.Dt.init(), 1;
		this.order = Array(this.size);
		for (let e = 0; this.size > e; e++) this.order[e] = e;
		let e = this.keys;
		return this.order.sort((t, n) => {
			let r = e[t], i = e[n];
			return i.s > r.s ? 1 : r.s > i.s || r.t > i.t ? -1 : 1;
		}), this.max = this.size, this.Ot = 1, this.Dt.init(), 1;
	}
	Mt() {
		if (this.Lt || this.size === 0) return this.Dt.Mt();
		let e = this.keys[this.order[this.size - 1]];
		if (!this.Dt.bt()) {
			let t = this.Dt.min();
			if (t && P(t, e)) return this.Dt.Mt();
		}
		do
			--this.size;
		while (this.size > 0 && this.keys[this.order[this.size - 1]] === null);
		return e;
	}
	min() {
		if (this.Lt || this.size === 0) return this.Dt.min();
		let e = this.keys[this.order[this.size - 1]];
		if (!this.Dt.bt()) {
			let t = this.Dt.min();
			if (t && P(t, e)) return t;
		}
		return e;
	}
	delete(e) {
		0 > e ? this.keys[-(e + 1)] = null : this.Dt.delete(e);
	}
	bt() {
		return (this.Lt || this.size === 0) && this.Dt.bt();
	}
}, ot = class {
	head = new tt();
	frame;
	constructor(e) {
		this.frame = e, this.head.next = this.head, this.head.o = this.head;
	}
	min() {
		return this.head.next;
	}
	max() {
		return this.head.o;
	}
	P(e) {
		return this.insertBefore(this.head, e);
	}
	search(e) {
		let t = this.head;
		do
			t = t.next;
		while (t.l !== null && !De(this.frame, e, t));
		return t;
	}
	insertBefore(e, t) {
		do
			e = e.o;
		while (e.l !== null && !De(this.frame, e, t));
		return t.next = e.next, e.next.o = t, t.o = e, e.next = t, t;
	}
	delete(e) {
		e.next.o = e.o, e.o.next = e.next;
	}
}, st = null, ct = null, K = [
	0,
	0,
	0,
	0
], q = [
	null,
	null,
	null,
	null
], lt = [
	0,
	0,
	0
], ut = class e {
	static Ct(e, t) {
		e.u += t.u, e.h.u += t.h.u;
	}
	static Gt(e, t) {
		let n, r, i;
		if (n = t.L, n.O === n || n.O.O === n) throw Error("Monotone region has degenerate topology");
		for (; P(n.h.i, n.i); n = n.C.h);
		for (; P(n.i, n.h.i); n = n.O);
		for (r = n.C.h; n.O !== r;) if (P(n.h.i, r.i)) {
			for (; r.O !== n && (be(r.O) || 0 >= I(r.i, r.h.i, r.O.h.i));) i = e.connect(r.O, r), r = i.h;
			r = r.C.h;
		} else {
			for (; r.O !== n && (xe(n.C.h) || I(n.h.i, n.i, n.C.h.i) >= 0);) i = e.connect(n, n.C.h), n = i.h;
			n = n.O;
		}
		if (r.O === n) throw Error("Monotone region has insufficient vertices");
		for (; r.O.O !== n;) i = e.connect(r.O, r), r = i.h;
		return 1;
	}
	static tessellateInterior(t) {
		let n;
		for (let r = t.j.next; r !== t.j; r = n) n = r.next, r.p && e.Gt(t, r);
		return 1;
	}
}, J = [], Y = new Int8Array(64), X = new Int32Array(64), Z = new Int32Array(64), Q;
((e) => {
	e[e.Rt = 0] = "T_DORMANT", e[e.vt = 1] = "T_IN_POLYGON", e[e.xt = 2] = "T_IN_CONTOUR";
})(Q ||= {});
var dt = class {
	state = Q.Rt;
	Ut = null;
	St = 0;
	Bt = 0;
	Vt = 1;
	Pt = 0;
	Ft = 0;
	Yt = 0;
	jt = 0;
	A;
	Ht = [
		0,
		0,
		0
	];
	zt;
	qt;
	Wt;
	Zt;
	M = H.ODD;
	Kt = H.ODD;
	_;
	S;
	event;
	Xt;
	Qt;
	Jt;
	$t;
	ti;
	ii;
	R;
	si;
	m = null;
	U = 0;
	gluTessCallback(e, t) {
		let n = t || null;
		switch (e) {
			case 100100:
			case 100106:
				this.Xt = n;
				break;
			case 100104:
			case 100110:
				this.$t = n, this.flagBoundary = 1;
				break;
			case 100101:
			case 100107:
				this.Qt = n;
				break;
			case 100102:
			case 100108:
				this.Jt = n;
				break;
			case 100103:
				this.ti = n;
				break;
			case 100109:
				this.ii = n;
				break;
			case 100105:
			case 100111:
				this.R = n;
				break;
			case 100112:
				this.si = n;
				break;
			default: throw Error("GLU_INVALID_ENUM");
		}
	}
	gluTessProperty(e, t) {
		switch (e) {
			case 100140: {
				let e = t, n = 100130 > e ? e : e - 100130;
				if (0 > n || n > 4) throw Error("GLU_INVALID_VALUE");
				this.Kt = e, this.M = n;
				break;
			}
			case 100141:
				this.ei = !!t;
				break;
			case 100142: break;
			default: throw Error("GLU_INVALID_ENUM");
		}
	}
	gluGetTessProperty(e) {
		switch (e) {
			case 100140: return this.Kt;
			case 100141: return this.ei;
			case 100142: return 0;
			default: throw Error("GLU_INVALID_ENUM");
		}
	}
	gluTessNormal(e, t, n) {
		this.Ht[0] = e, this.Ht[1] = t, this.Ht[2] = n, n === 0 || e || t || (this.Vt = n > 0 ? 1 : -1);
	}
	H(e) {
		this.Xt && this.Xt(e, this.m);
	}
	W(e) {
		this.Qt && this.Qt(e, this.m);
	}
	q() {
		this.Jt && this.Jt(this.m);
	}
	K(e) {
		this.$t && this.$t(e, this.m);
	}
	v(e) {
		this.ii ? this.ii(e, this.m) : this.ti && this.ti(e);
	}
	ni(e) {
		if (this.state !== e) for (; this.state !== e;) e > this.state ? this.state === Q.Rt ? (this.v(100151), this.gluTessBeginPolygon()) : this.state === Q.vt && (this.v(100152), this.gluTessBeginContour()) : this.state === Q.xt ? (this.v(100154), this.gluTessEndContour()) : this.state === Q.vt && (this.v(100153), this.gluTessEndPolygon());
	}
	ei = 0;
	flagBoundary = 0;
	hi() {
		let e = this.A, t = e.Y, n = this.Ht[0], r = this.Ht[1], i = this.Ht[2], a, o;
		if (this.zt ||= [
			0,
			0,
			0
		], this.qt ||= [
			0,
			0,
			0
		], this.Wt ||= [0, 0], this.Zt ||= [0, 0], a = this.zt, o = this.qt, this.Bt) {
			a[0] = 1, a[1] = 0, a[2] = 0;
			let e = i > 0 ? 1 : -1;
			o[0] = 0, o[1] = e, o[2] = 0, this.Wt[0] = this.Pt, this.Wt[1] = this.Yt, this.Zt[0] = this.Ft, this.Zt[1] = this.jt;
			return;
		}
		if (!this.St && !n && !r) {
			let n;
			a[0] = 1, a[1] = 0, a[2] = 0;
			let r = 0;
			if (i) n = i > 0 ? 1 : -1;
			else {
				let t = [
					0,
					0,
					0
				];
				Ge(e, t), n = t[2] > 0 ? 1 : -1, r = 1;
			}
			o[0] = 0, o[1] = n, o[2] = 0;
			let s = t.next, c = s.coords[0], l = s.coords[1] * n;
			s.s = c, s.t = l;
			let u = c, d = c, f = l, p = l;
			for (s = s.next; s !== t; s = s.next) c = s.coords[0], l = s.coords[1] * n, s.s = c, s.t = l, u > c ? u = c : c > d && (d = c), f > l ? f = l : l > p && (p = l);
			this.Wt[0] = u, this.Zt[0] = d, r ? (Ke(e, this.qt), o[1] === n ? (this.Wt[1] = f, this.Zt[1] = p) : (this.Wt[1] = -p, this.Zt[1] = -f)) : (this.Wt[1] = f, this.Zt[1] = p);
			return;
		}
		let s = 0, c = [
			n,
			r,
			i
		];
		n || r || i || (Ge(e, c), s = 1);
		let l = ((e) => {
			let t = 0;
			return Math.abs(e[1]) > Math.abs(e[0]) && (t = 1), Math.abs(e[2]) > Math.abs(e[t]) && (t = 2), t;
		})(c);
		a[l] = 0, a[(l + 1) % 3] = 1, a[(l + 2) % 3] = 0, o[l] = 0, o[(l + 1) % 3] = 0, o[(l + 2) % 3] = c[l] > 0 ? 1 : -1;
		let u = t.next;
		u.s = u.coords[0] * a[0] + u.coords[1] * a[1] + u.coords[2] * a[2], u.t = u.coords[0] * o[0] + u.coords[1] * o[1] + u.coords[2] * o[2];
		let d = u.s, f = u.s, p = u.t, m = u.t;
		for (u = u.next; u !== t; u = u.next) {
			let e = u.coords[0] * a[0] + u.coords[1] * a[1] + u.coords[2] * a[2], t = u.coords[0] * o[0] + u.coords[1] * o[1] + u.coords[2] * o[2];
			u.s = e, u.t = t, d > e ? d = e : e > f && (f = e), p > t ? p = t : t > m && (m = t);
		}
		s && Ke(e, this.qt), s && o[(l + 2) % 3] !== (c[l] > 0 ? 1 : -1) ? (this.Wt[0] = d, this.Zt[0] = f, this.Wt[1] = -m, this.Zt[1] = -p) : (this.Wt[0] = d, this.Zt[0] = f, this.Wt[1] = p, this.Zt[1] = m);
	}
	gluTessBeginPolygon(e) {
		this.ni(Q.Rt), this.state = Q.vt, this.U = 0, this.A = new rt(), this.St = 0, this.Bt = this.Ht[2] !== 0 && !this.Ht[0] && !this.Ht[1], this.Pt = Infinity, this.Ft = -Infinity, this.Yt = Infinity, this.jt = -Infinity, this.m = e;
	}
	gluTessBeginContour() {
		this.ni(Q.vt), this.state = Q.xt, this.Ut = null;
	}
	gluTessVertex(e, t) {
		this.ni(Q.xt);
		let n = e[0], r = e[1], i = e.length > 2 ? e[2] : 0, a = 0;
		-1e150 > n ? (n = -1e150, a = 1) : n > 1e150 && (n = 1e150, a = 1), -1e150 > r ? (r = -1e150, a = 1) : r > 1e150 && (r = 1e150, a = 1), -1e150 > i ? (i = -1e150, a = 1) : i > 1e150 && (i = 1e150, a = 1), a && this.v(100155);
		let o = this.Ut;
		if (o === null ? (o = this.A.F(), this.A.splice(o, o.h)) : (this.A.V(o), o = o.O), o.i.data = t || null, o.i.coords[0] = n, o.i.coords[1] = r, i === 0 ? o.i.coords[2] = 0 : (o.i.coords[2] = i, this.St = 1, this.Bt = 0), this.Bt) {
			o.i.s = n;
			let e = r * this.Vt;
			o.i.t = e, this.Pt > n && (this.Pt = n), n > this.Ft && (this.Ft = n), this.Yt > e && (this.Yt = e), e > this.jt && (this.jt = e);
		}
		o.u = 1, o.h.u = -1, this.Ut = o;
	}
	gluTessEndContour() {
		this.ni(Q.xt), this.state = Q.vt;
	}
	gluTessEndPolygon() {
		this.ni(Q.vt), this.state = Q.Rt, this.compute(this.M, void 0, 0);
		let e = this.A;
		this.U || (this.ei ? (Xe(e, 1), Qe(this, e)) : this.flagBoundary ? (ut.tessellateInterior(e), Ze(this, e)) : qe(this, e)), this.si && this.si(e), this.A = null, this.Ut = null, this.event = null, this.m = null, this._ = null;
	}
	gluDeleteTess() {
		this.ni(Q.Rt);
	}
	compute(e = H.ODD, t, n = 0) {
		this.state !== Q.Rt && this.state === Q.vt && (this.state = Q.Rt), this.A ||= new rt(), t && (this.Ht[0] = t[0], this.Ht[1] = t[1], this.Ht[2] = t[2]), this.M = e, this.hi(), function(e, t = 1) {
			let n, r;
			if (((e) => {
				let t, n, r, i = e.A.Z;
				for (t = i.next; t !== i; t = n) n = t.next, r = t.O, N(t.i, t.h.i) && t.O.O !== t && (Ie(e, r, t), e.A.delete(t), t = r, r = t.O), r.O === t && (r !== t && (r !== n && r !== n.h || (n = n.next), e.A.delete(r)), t !== n && t !== n.h || (n = n.next), e.A.delete(t));
			})(e), !((e) => {
				let t, n, r, i = e.A.vertexCount + 8;
				for (e.S ? (e.S.reset(i), t = e.S) : t = e.S = new at(i), r = e.A.Y, n = r.next; n !== r; n = n.next) n.B = t.P(n);
				return n === r ? (t.init(), 1) : 0;
			})(e)) return 0;
			for (((e) => {
				e._ = new ot(e);
				let t = e.Zt[0] - e.Wt[0], n = e.Zt[1] - e.Wt[1], r = e.Wt[0] - t, i = e.Zt[0] + t, a = e.Zt[1] + n;
				We(e, r, i, e.Wt[1] - n), We(e, r, i, a);
			})(e); (n = e.S.Mt()) !== null;) {
				for (; r = e.S.min(), r !== null && N(r, n);) r = e.S.Mt(), Ie(e, n.L, r.L);
				Ue(e, n);
			}
			e.event = e._.min().l.i, ((e) => {
				let t;
				for (; (t = e._.min()).l !== null;) z(e, t);
			})(e), ((e, t) => {
				let n, r, i;
				for (n = t.j.next; n !== t.j; n = r) r = n.next, i = n.L, i.O.O === i && (Oe(i.C, i), e.A.delete(i));
			})(e, e.A), t && e.A.check();
		}(this, n);
	}
	renderBoundary() {
		this.A && (Xe(this.A, 1), Qe(this, this.A));
	}
	renderTriangles(e = 0) {
		this.A && (e ? (ut.tessellateInterior(this.A), Ze(this, this.A)) : qe(this, this.A));
	}
};
//#endregion
//#region src/fill-tessellator.ts
function ft(e) {
	if (e.length === 0) return [];
	let t = [], n = 4, r = new dt();
	r.gluTessNormal(0, 0, 1), r.gluTessCallback(U.BEGIN, (e) => {
		n = e;
	}), r.gluTessCallback(U.VERTEX, (e) => {
		let r = e;
		if (n !== 4) throw Error(`phaser-svg fill tessellation emitted unsupported primitive ${n}`);
		t.push(r[0], r[1]);
	}), r.gluTessCallback(U.COMBINE, (e) => [e[0], e[1]]), r.gluTessCallback(U.ERROR, (e) => {
		throw Error(`phaser-svg fill tessellation failed with GLU error ${e}`);
	}), r.gluTessProperty(U.WINDING_RULE, H.NONZERO), r.gluTessBeginPolygon();
	for (let t of e) if (!(t.length < 3)) {
		r.gluTessBeginContour();
		for (let e of t) {
			let t = [e.x, e.y];
			r.gluTessVertex(t, t);
		}
		r.gluTessEndContour();
	}
	return r.gluTessEndPolygon(), t;
}
//#endregion
//#region src/line-cap.ts
function pt(e, t, n) {
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
function mt(e, t, n, r) {
	let i = gt(e, t, n, r);
	return i === null ? null : i.bevel;
}
function ht(e, t, n, r, i) {
	let a = gt(e, t, n, r);
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
function gt(e, t, n, r) {
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
var _t = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), xt = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap();
function Ct(e) {
	let t = _t.get(e);
	if (t !== void 0) return t;
	let n = e.every((e) => e.type === "M" || e.type === "L" || e.type === "Z");
	return _t.set(e, n), n;
}
function wt(e, t, n, r) {
	let i = n.fill === null ? 0 : n.fillAlpha * n.opacity, a = n.stroke === null ? 0 : n.strokeAlpha * n.opacity, o = n.fill !== null && i > 0, s = n.stroke !== null && n.strokeWidth > 0 && a > 0;
	!o && !s || (Ct(t) ? Tt(e, t, n, i, a, o, s) : Et(e, t, n, i, a, o, s, r));
}
function Tt(e, t, n, i, a, o, s) {
	let c = Dt(t);
	if (c.length !== 0) {
		if (o && c.some((e) => e.closed) && Bt(e, c, n, i), s) {
			let t = r(n.stroke);
			e.fillStyle(t, a);
			for (let { points: t, closed: r } of c) Xt(e, t, r, n.strokeWidth / 2);
		}
		if (s) for (let { points: t, closed: r } of c) qt(e, t, r, n, a);
	}
}
function Et(e, t, n, i, a, o, s, c) {
	let l = Ot(t, c);
	if (l.length !== 0) {
		if (o && l.some((e) => e.closed) && Bt(e, l, n, i), s) {
			let t = r(n.stroke);
			e.fillStyle(t, a);
			for (let { points: t, closed: r } of l) Xt(e, t, r, n.strokeWidth / 2);
		}
		if (s) for (let { points: t, closed: r } of l) qt(e, t, r, n, a);
	}
}
function Dt(e) {
	let t = vt.get(e);
	if (t) return t;
	let n = Kt(e), r = [];
	for (let e of n) {
		let t = [], n = !1;
		for (let r of e) r.type === "Z" ? n = !0 : "x" in r && "y" in r && t.push(r);
		t.length > 0 && r.push({
			points: t,
			closed: n
		});
	}
	return vt.set(e, r), r;
}
function Ot(e, t) {
	let n = yt.get(e);
	n || (n = /* @__PURE__ */ new Map(), yt.set(e, n));
	let i = a(t), o = d(t), s = i === void 0 ? `tolerance:${o.toFixed(4)}` : `segments:${i}`, c = n.get(s);
	if (c) return c;
	let l = Kt(e), u = [];
	for (let e of l) {
		if (e.length === 0) continue;
		let t = r(e[0], "Subpath must start with a command");
		if (t.type !== "M") continue;
		let n = [{
			x: t.x,
			y: t.y
		}], a = t.x, s = t.y, c = !1;
		for (let t = 1; t < e.length; t++) {
			let l = r(e[t], `Expected command at index ${t}`);
			switch (l.type) {
				case "M":
					a = l.x, s = l.y, n.push({
						x: a,
						y: s
					});
					break;
				case "L":
					a = l.x, s = l.y, n.push({
						x: a,
						y: s
					});
					break;
				case "C":
					i === void 0 ? Nt(a, s, l.x1, l.y1, l.x2, l.y2, l.x, l.y, o, n) : At(a, s, l.x1, l.y1, l.x2, l.y2, l.x, l.y, i, n), a = l.x, s = l.y;
					break;
				case "Q":
					i === void 0 ? Pt(a, s, l.x1, l.y1, l.x, l.y, o, n) : jt(a, s, l.x1, l.y1, l.x, l.y, i, n), a = l.x, s = l.y;
					break;
				case "A":
					i === void 0 ? Ft(a, s, l, o, n) : Mt(a, s, l, i, n), a = l.x, s = l.y;
					break;
				case "Z":
					c = !0;
					break;
			}
		}
		let l = Gt(n);
		l.length > 1 && u.push({
			points: l,
			closed: c
		});
	}
	return n.set(s, u), u;
}
var kt = 12;
function At(e, t, n, r, i, a, o, s, c, l) {
	for (let u = 1; u <= c; u++) {
		let d = u / c, f = 1 - d, p = f * f, m = d * d, h = p * f * e + 3 * p * d * n + 3 * f * m * i + m * d * o, g = p * f * t + 3 * p * d * r + 3 * f * m * a + m * d * s;
		l.push({
			x: h,
			y: g
		});
	}
}
function jt(e, t, n, r, i, a, o, s) {
	for (let c = 1; c <= o; c++) {
		let l = c / o, u = 1 - l, d = u * u * e + 2 * u * l * n + l * l * i, f = u * u * t + 2 * u * l * r + l * l * a;
		s.push({
			x: d,
			y: f
		});
	}
}
function Mt(e, t, n, r, i) {
	let { startAngle: a, endAngle: o, rx: s, ry: c, cx: l, cy: u } = Ht(e, t, n.rx, n.ry, n.xAxisRotation, n.largeArc, n.sweep, n.x, n.y), d = n.xAxisRotation * Math.PI / 180, f = Math.cos(d), p = Math.sin(d), m = o - a;
	for (let e = 1; e <= r; e++) {
		let t = a + e / r * m, n = Math.cos(t), o = Math.sin(t), d = f * s * n - p * c * o + l, h = p * s * n + f * c * o + u;
		i.push({
			x: d,
			y: h
		});
	}
}
function Nt(e, t, n, r, i, a, o, s, c, l, u = 0) {
	if (u >= kt || It(e, t, n, r, i, a, o, s, c)) {
		l.push({
			x: o,
			y: s
		});
		return;
	}
	let d = (e + n) / 2, f = (t + r) / 2, p = (n + i) / 2, m = (r + a) / 2, h = (i + o) / 2, g = (a + s) / 2, _ = (d + p) / 2, v = (f + m) / 2, y = (p + h) / 2, b = (m + g) / 2, x = (_ + y) / 2, S = (v + b) / 2;
	Nt(e, t, d, f, _, v, x, S, c, l, u + 1), Nt(x, S, y, b, h, g, o, s, c, l, u + 1);
}
function Pt(e, t, n, r, i, a, o, s, c = 0) {
	if (c >= kt || Lt(e, t, n, r, i, a, o)) {
		s.push({
			x: i,
			y: a
		});
		return;
	}
	let l = (e + n) / 2, u = (t + r) / 2, d = (n + i) / 2, f = (r + a) / 2, p = (l + d) / 2, m = (u + f) / 2;
	Pt(e, t, l, u, p, m, o, s, c + 1), Pt(p, m, d, f, i, a, o, s, c + 1);
}
function Ft(e, t, n, r, i) {
	let a = Ht(e, t, n.rx, n.ry, n.xAxisRotation, n.largeArc, n.sweep, n.x, n.y), o = Math.abs(a.endAngle - a.startAngle);
	Mt(e, t, n, zt(a.rx, a.ry, o, r), i);
}
function It(e, t, n, r, i, a, o, s, c) {
	let l = c * c;
	return Rt(n, r, e, t, o, s) <= l && Rt(i, a, e, t, o, s) <= l;
}
function Lt(e, t, n, r, i, a, o) {
	return Rt(n, r, e, t, i, a) <= o * o;
}
function Rt(e, t, n, r, i, a) {
	let o = i - n, s = a - r, c = o * o + s * s;
	if (c <= 1e-12) {
		let i = e - n, a = t - r;
		return i * i + a * a;
	}
	let l = o * (t - r) - s * (e - n);
	return l * l / c;
}
function zt(e, t, n, r) {
	let i = Math.max(Math.abs(e), Math.abs(t));
	if (i <= 0 || n <= 0) return 1;
	let a = sn(1 - sn(r, 1e-4, i) / i, -1, 1), o = 2 * Math.acos(a), s = Number.isFinite(o) && o > 0 ? o : Math.PI / 16;
	return sn(Math.ceil(n / s), 1, 2048);
}
function Bt(e, t, n, i) {
	let a = Vt(t);
	a.length !== 0 && (e.fillStyle(r(n.fill), i), rn(e, a));
}
function Vt(e) {
	let t = bt.get(e);
	if (t) return t;
	let n = e.filter((e) => e.closed).map((e) => Gt([...e.points])).filter((e) => e.length >= 3);
	if (n.length === 0) return bt.set(e, []), [];
	let r = ft(n);
	return bt.set(e, r), r;
}
function Ht(e, t, n, r, i, a, o, s, c) {
	let l = i * Math.PI / 180, u = Math.cos(l), d = Math.sin(l), f = (e - s) / 2, p = (t - c) / 2, m = u * f + d * p, h = -d * f + u * p, g = Math.abs(n), _ = Math.abs(r), v = m * m, y = h * h, b = g * g, x = _ * _, S = v / b + y / x;
	if (S > 1) {
		let e = Math.sqrt(S);
		g *= e, _ *= e, b = g * g, x = _ * _;
	}
	let C = Math.max(0, b * x - b * y - x * v), w = b * y + x * v, ee = Math.sqrt(C / w), te = a === o ? -1 : 1, T = te * ee * (g * h / _), E = te * ee * (-(_ * m) / g), ne = u * T - d * E + (e + s) / 2, re = d * T + u * E + (t + c) / 2, ie = Ut(1, 0, (m - T) / g, (h - E) / _), D = Ut((m - T) / g, (h - E) / _, (-m - T) / g, (-h - E) / _);
	return !o && D > 0 && (D -= 2 * Math.PI), o && D < 0 && (D += 2 * Math.PI), {
		cx: ne,
		cy: re,
		rx: g,
		ry: _,
		startAngle: ie,
		endAngle: ie + D
	};
}
function Ut(e, t, n, r) {
	let i = e * n + t * r, a = Math.sqrt((e * e + t * t) * (n * n + r * r)), o = Math.acos(Math.max(-1, Math.min(1, i / a)));
	return e * r - t * n < 0 && (o = -o), o;
}
var Wt = 1e-8;
function Gt(e) {
	if (e.length < 2) return e;
	let t = [r(e[0])];
	for (let n = 1; n < e.length; n++) {
		let i = r(t[t.length - 1]), a = r(e[n]), o = a.x - i.x, s = a.y - i.y;
		o * o + s * s > Wt && t.push(a);
	}
	if (t.length > 2) {
		let e = r(t[0]), n = r(t[t.length - 1]), i = n.x - e.x, a = n.y - e.y;
		i * i + a * a <= Wt && t.pop();
	}
	return t;
}
function Kt(e) {
	let t = [], n = [];
	for (let r of e) r.type === "M" && n.length > 0 && (t.push(n), n = []), n.push(r);
	return n.length > 0 && t.push(n), t;
}
function qt(e, t, n, r, i) {
	if (r.stroke === null || r.strokeWidth < 2) return;
	let a = Jt(t, n, r);
	if (a.length !== 0) {
		e.fillStyle(r.stroke, i);
		for (let t of a) Qt(e, t.points);
	}
}
function Jt(e, t, n) {
	let i = St.get(e);
	i || (i = /* @__PURE__ */ new Map(), St.set(e, i));
	let a = Yt(t, n), o = i.get(a);
	if (o) return o;
	let s = e.length, c = n.strokeWidth / 2, l = [];
	if (s >= 3) {
		let i = t ? 0 : 1, a = t ? s : s - 1;
		for (let t = i; t < a; t++) {
			let i = r(e[(t - 1 + s) % s]), a = r(e[t]), o = r(e[(t + 1) % s]);
			if (n.lineJoin === "round") {
				let e = mt(i, a, o, c);
				if (!e) continue;
				l.push({
					kind: "polygon",
					points: $t(a, e[0], e[1], c)
				});
			} else if (n.lineJoin === "bevel") {
				let e = mt(i, a, o, c);
				e && l.push({
					kind: "polygon",
					points: [
						a,
						e[0],
						e[1]
					]
				});
			} else {
				let e = ht(i, a, o, c, n.miterLimit);
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
			let t = r(e[0]), n = r(e[1]), i = r(e[s - 1]), a = r(e[s - 2]);
			l.push({
				kind: "polygon",
				points: en(t, n, c, !0)
			}), l.push({
				kind: "polygon",
				points: en(i, a, c, !1)
			});
		} else if (n.lineCap === "square") {
			let t = pt(r(e[0]), r(e[1]), c);
			t && l.push({
				kind: "polygon",
				points: t
			});
			let n = pt(r(e[s - 1]), r(e[s - 2]), c);
			n && l.push({
				kind: "polygon",
				points: n
			});
		}
	}
	return i.set(a, l), l;
}
function Yt(e, t) {
	return [
		e ? 1 : 0,
		t.strokeWidth,
		t.lineJoin,
		t.lineCap,
		t.miterLimit
	].join("|");
}
function Xt(e, t, n, i) {
	let a = t.length;
	if (a < 2) return;
	let o = n ? a : a - 1, s = [];
	for (let e = 0; e < o; e++) {
		let n = Zt(r(t[e]), r(t[(e + 1) % a]), i);
		n && s.push(n[0].x, n[0].y, n[1].x, n[1].y, n[2].x, n[2].y, n[0].x, n[0].y, n[2].x, n[2].y, n[3].x, n[3].y);
	}
	rn(e, s);
}
function Zt(e, t, n) {
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
function Qt(e, t) {
	if (t.length < 3) return;
	let n = [];
	for (let e of t) n.push(e.x, e.y);
	let i = b(n, [], 2), a = [];
	for (let e = 0; e + 2 < i.length; e += 3) {
		let n = r(t[r(i[e])]), o = r(t[r(i[e + 1])]), s = r(t[r(i[e + 2])]);
		a.push(n.x, n.y, o.x, o.y, s.x, s.y);
	}
	rn(e, a);
}
function $t(e, t, n, r) {
	let i = Math.atan2(t.y - e.y, t.x - e.x);
	return [e, ...tn(e, r, i, i + nn(i, Math.atan2(n.y - e.y, n.x - e.x)))];
}
function en(e, t, n, r) {
	let i = t.x - e.x, a = t.y - e.y, o = Math.hypot(i, a);
	if (o === 0) return [];
	let s = i / o, c = a / o, l = r ? -s : s, u = r ? -c : c, d = Math.atan2(u, l);
	return tn(e, n, d - Math.PI / 2, d + Math.PI / 2);
}
function tn(e, t, n, r) {
	let i = r - n, a = Math.max(1, Math.abs(i) * t), o = sn(Math.ceil(a / 2), 6, 48), s = [];
	for (let r = 0; r <= o; r++) {
		let a = n + r / o * i;
		s.push({
			x: e.x + Math.cos(a) * t,
			y: e.y + Math.sin(a) * t
		});
	}
	return s;
}
function nn(e, t) {
	let n = t - e;
	for (; n > Math.PI;) n -= Math.PI * 2;
	for (; n < -Math.PI;) n += Math.PI * 2;
	return n;
}
function rn(e, t) {
	if (t.length !== 0 && !an(e, t)) for (let n = 0; n + 5 < t.length; n += 6) e.fillTriangle(r(t[n]), r(t[n + 1]), r(t[n + 2]), r(t[n + 3]), r(t[n + 4]), r(t[n + 5]));
}
function an(e, t) {
	let n = e, i = n.commandBuffer;
	if (!Array.isArray(i)) return !1;
	let a = on(n);
	if (a === null) return !1;
	for (let e = 0; e + 5 < t.length; e += 6) i.push(a, r(t[e]), r(t[e + 1]), r(t[e + 2]), r(t[e + 3]), r(t[e + 4]), r(t[e + 5]));
	return !0;
}
function on(e) {
	let t = xt.get(e);
	if (t !== void 0) return t;
	let n = e.commandBuffer;
	if (!Array.isArray(n)) return xt.set(e, null), null;
	let r = n.length;
	e.fillTriangle(0, 0, 0, 0, 0, 0);
	let i = n.length >= r + 7 ? n[r] : void 0;
	n.length = r;
	let a = typeof i == "number" ? i : null;
	return xt.set(e, a), a;
}
function sn(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/render-node/capabilities.ts
var cn = 96 * 1024 * 1024, ln = /* @__PURE__ */ new WeakMap();
function un(e) {
	let t = ln.get(e);
	if (t !== void 0) return t;
	let n = e.gl;
	if (typeof WebGL2RenderingContext < "u" && n instanceof WebGL2RenderingContext) {
		let t = {
			backend: "webgl2",
			maxSamples: n.getParameter(n.MAX_SAMPLES)
		};
		return ln.set(e, t), t;
	}
	return null;
}
function dn(e, t, n, r) {
	if (e === 2) {
		if (!(t.maxSamples >= 2)) throw Error(`phaser-svg MSAA: device maximum sample count is ${t.maxSamples}, which is less than the minimum required 2. To fix: run with a WebGL2 renderer on hardware that supports at least x2 multisampling.`);
		let e = fn(n, r, 2);
		if (e > cn) {
			let t = (e / (1024 * 1024)).toFixed(0);
			throw Error(`phaser-svg MSAA: the MSAA render target for ${n}x${r} at x2 samples would require ${t} MiB (budget is 96 MiB). To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`);
		}
		return 2;
	}
	if (e === 8) {
		let e = t.maxSamples >= 8, i = fn(n, r, 8);
		if (e && i <= cn) return 8;
	}
	if (!(t.maxSamples >= 4)) throw Error(`phaser-svg MSAA: device maximum sample count is ${t.maxSamples}, which is less than the minimum required 4. To fix: run with a WebGL2 renderer on hardware that supports at least x4 multisampling.`);
	let i = fn(n, r, 4);
	if (i > cn) {
		let e = (i / (1024 * 1024)).toFixed(0);
		throw Error(`phaser-svg MSAA: the MSAA render target for ${n}x${r} at x4 samples would require ${e} MiB (budget is 96 MiB). To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`);
	}
	return 4;
}
function fn(e, t, n) {
	return e * t * 4 * n;
}
//#endregion
//#region src/render-node/resources.ts
var pn = class {
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
	allocate(e, t, n, i, a) {
		let o = e.gl, s = r(e.createTextureFromSource(null, n, i, 0), `phaser-svg MSAA: could not allocate ${n}x${i} resolved texture`);
		this._resolvedTexture = s;
		let c = r(s.webGLTexture, "phaser-svg MSAA: resolved texture has no webGLTexture"), l = r(o.createFramebuffer(), "phaser-svg MSAA: failed to create MSAA framebuffer");
		o.bindFramebuffer(o.FRAMEBUFFER, l);
		let u = o;
		mn(u, a, n, i), this.colorRB = u.getParameter(u.RENDERBUFFER_BINDING), this.resolveFBO = r(o.createFramebuffer(), "phaser-svg MSAA: failed to create resolve framebuffer"), o.bindFramebuffer(o.FRAMEBUFFER, this.resolveFBO), u.framebufferTexture2D(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, c, 0), o.bindFramebuffer(o.FRAMEBUFFER, null), this.msaaFBO = l, this._msaaFBOWrapper = { webGLFramebuffer: l }, this._width = n, this._height = i, this._samples = a;
	}
	destroyGL(e) {
		let t = e.gl;
		this.msaaFBO && (t.deleteFramebuffer(this.msaaFBO), this.msaaFBO = null, this._msaaFBOWrapper = null), this.resolveFBO &&= (t.deleteFramebuffer(this.resolveFBO), null), this.colorRB &&= (t.deleteRenderbuffer(this.colorRB), null), this._resolvedTexture &&= (e.deleteTexture(this._resolvedTexture), null), this._width = 0, this._height = 0, this._samples = 0;
	}
};
function mn(e, t, n, i) {
	let a = r(e.createRenderbuffer(), "phaser-svg MSAA: failed to create MSAA renderbuffer");
	e.bindRenderbuffer(e.RENDERBUFFER, a), e.renderbufferStorageMultisample(e.RENDERBUFFER, t, e.RGBA8, n, i), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, a);
}
//#endregion
//#region src/render-node/svg-render-node.ts
var hn = /* @__PURE__ */ new WeakMap();
function gn(e, t, n) {
	let r = hn.get(e);
	if (r) {
		(r.requestedSamples !== n || r.negotiatedWidth !== t.width || r.negotiatedHeight !== t.height) && (r.samples = dn(n, r.caps, t.width, t.height), r.requestedSamples = n, r.negotiatedWidth = t.width, r.negotiatedHeight = t.height);
		return;
	}
	let i = un(t);
	if (!i) throw Error("phaser-svg MSAA: WebGL2 is required but not available on this renderer. Create the game with a WebGL2-backed canvas (and explicit WEBGL render type), or remove the msaaSamples option.");
	let a = dn(n, i, t.width, t.height), o = {
		resources: new pn(i.backend),
		caps: i,
		samples: a,
		requestedSamples: n,
		negotiatedWidth: t.width,
		negotiatedHeight: t.height,
		quadNodeRenderer: null,
		quadBatchNode: null,
		detachContextLost: null
	};
	hn.set(e, o), e.addRenderStep(_n(o), 0), e.once("destroy", () => {
		let n = hn.get(e);
		n && (n.resources.destroy(t), n.detachContextLost?.(), hn.delete(e));
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
function _n(e) {
	return function(t, n, r, i, a, o, s) {
		let c = t, l = n, u = r, d = vn(u, c), f = d.width, p = d.height;
		(e.negotiatedWidth !== f || e.negotiatedHeight !== p) && (e.samples = dn(e.requestedSamples, e.caps, f, p), e.negotiatedWidth = f, e.negotiatedHeight = p), e.resources.ensureResources(c, e.caps, f, p, e.samples);
		let m = c.renderNodes, { msaaFBOWrapper: h, resolvedTexture: g } = e.resources;
		m.finishBatch();
		let _ = u.getClone(!1);
		_.framebuffer = h, _.texture = g, _.state.bindings.framebuffer = h, _.beginDraw();
		let v = c.gl;
		v.clearColor(0, 0, 0, 0), v.clear(v.COLOR_BUFFER_BIT), l.renderWebGLStep(c, n, _, i, (typeof a == "number" ? a : 0) + 1, o, s), m.finishBatch(), e.resources.blitResolve(v), u.beginDraw();
		let y = u.width, b = u.height;
		(!e.quadBatchNode || e.quadNodeRenderer !== c) && (e.quadBatchNode = m.getNode("BatchHandlerQuadSingle"), e.quadNodeRenderer = c), e.quadBatchNode.batch(u, g, 0, 0, 0, b, y, 0, y, b, 0, 1, 1, -1, !1, 4294967295, 4294967295, 4294967295, 4294967295, {});
	};
}
function vn(e, t) {
	let n = e.width, r = e.height;
	return {
		width: Number.isFinite(n) && n > 0 ? n : t.width,
		height: Number.isFinite(r) && r > 0 ? r : t.height
	};
}
//#endregion
//#region src/transform.ts
function yn(e, t, n) {
	let r = t / e.width, i = n / e.height, a = Math.min(r, i);
	return {
		scale: a,
		tx: (t - e.width * a) / 2 - e.minX * a,
		ty: (n - e.height * a) / 2 - e.minY * a
	};
}
function bn(e, t, n, r) {
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
var xn = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new Map(), wn = 128, Tn = 1;
function En(e, t, n, r) {
	On(e, t, n, r);
}
function Dn(e, t, n, r) {
	return On(e, t, n, r);
}
function On(t, n, r, i) {
	let a = `path|${n}|${Zn(r)}|${Xn(i)}`;
	return h(t, a) ? (g(t) && t.clear(), Un(t), wt(t, e(n), Gn(r), i), Wn(t, i?.msaaSamples), _(t, a), !0) : !1;
}
function kn(e, t, n) {
	jn(e, t, n);
}
function An(e, t, n) {
	return jn(e, t, n);
}
function jn(e, t, n) {
	let r = Hn(t), i = Yn(r, n), a = `svg|${qn(r)}|${Jn(n, i)}`;
	return h(e, a) ? (g(e) && e.clear(), Un(e), zn(e, r, n), Wn(e, i), _(e, a), !0) : !1;
}
function Mn(e, t, n) {
	Pn(e, t, n);
}
function Nn(e, t, n) {
	return Pn(e, t, n);
}
function Pn(e, t, n) {
	let r = Yn(t, n), i = `compiled|${qn(t)}|${Jn(n, r)}`;
	return h(e, i) ? (g(e) && e.clear(), Un(e), zn(e, t, n), Wn(e, r), _(e, i), !0) : !1;
}
function Fn(e) {
	v(e);
}
function In(e) {
	y(e);
}
function Ln(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = Sn.get(e);
	r || (r = /* @__PURE__ */ new Map(), Sn.set(e, r));
	let i = `${t ?? "_"}|${n ?? "_"}`, a = r.get(i);
	if (a) return a;
	let o = { ...e };
	return t !== void 0 && (o.fill = t), n !== void 0 && (o.stroke = n), r.set(i, o), o;
}
function Rn(e, t) {
	let n = xn.get(e);
	n || (n = /* @__PURE__ */ new Map(), xn.set(e, n));
	let r = Vn(t), i = n.get(r);
	if (i) return i;
	let a = e.items.map((e) => e.kind === "native" ? {
		kind: "native",
		shape: l(e.shape, t.scale, t.tx, t.ty),
		style: Bn(e.style, t.scale)
	} : {
		kind: "path",
		commands: bn(e.commands, t.scale, t.tx, t.ty),
		style: Bn(e.style, t.scale)
	});
	return n.set(r, a), a;
}
function zn(e, t, n) {
	let r = Kn(t.viewBox, n), i = n?.overrideFill, a = n?.overrideStroke, o = i !== void 0 || a !== void 0, c = r ? Rn(t, r) : t.items;
	for (let t of c) {
		let r = o ? Ln(t.style, i, a) : t.style;
		t.kind === "native" ? s(e, t.shape, r, { curveTolerance: n?.curveTolerance }) : wt(e, t.commands, r, n);
	}
}
function Bn(e, t) {
	return t === 1 ? e : {
		...e,
		strokeWidth: e.strokeWidth * t
	};
}
function Vn(e) {
	return `${e.scale}|${e.tx}|${e.ty}`;
}
function Hn(e) {
	let t = $.get(e);
	if (t) return $.delete(e), $.set(e, t), t;
	let n = u(e);
	if ($.size >= wn) {
		let e = $.keys().next().value;
		e !== void 0 && $.delete(e);
	}
	return $.set(e, n), n;
}
function Un(e) {
	let n = e.scene?.sys?.game?.renderer;
	t(n?.config) || t(n);
}
function Wn(e, t) {
	let n = t ?? 2, r = e.scene?.sys?.game?.renderer;
	if (!r?.gl) throw Error("phaser-svg MSAA: a WebGL renderer is required. Create the game with WebGL + WebGL2 context, or do not use this plugin in non-WebGL environments.");
	gn(e, r, n);
}
function Gn(e) {
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
function Kn(e, t) {
	if (e && !(t?.width === void 0 && t?.height === void 0)) return yn(e, t.width ?? t.height ?? e.width, t.height ?? t.width ?? e.height);
}
function qn(e) {
	let t = Cn.get(e);
	if (t !== void 0) return t;
	let n = Tn;
	return Tn += 1, Cn.set(e, n), n;
}
function Jn(e, t) {
	return [
		e?.curveResolution,
		e?.curveTolerance,
		e?.overrideFill,
		e?.overrideStroke,
		e?.width,
		e?.height,
		t
	].join("|");
}
function Yn(e, t) {
	return t?.msaaSamples ?? e.msaaSamples ?? 2;
}
function Xn(e) {
	return [
		e?.curveResolution,
		e?.curveTolerance,
		e?.msaaSamples ?? 2
	].join("|");
}
function Zn(e) {
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
var Qn = 128, $n = 256, er = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), nr = 1, rr = class {
	scene;
	graphics;
	autoFlush;
	retained;
	queue = [];
	compiledSvgCache = /* @__PURE__ */ new Map();
	parsedPathCache = /* @__PURE__ */ new Map();
	retainedStateKey = null;
	constructor(e, t) {
		this.scene = e, this.graphics = t?.graphics ?? this.scene.add.graphics(), this.autoFlush = t?.autoFlush ?? !0, this.retained = t?.retained ?? !1, this.autoFlush && this.scene.sys.events.on("postupdate", this.flush), this.scene.sys.events.once("destroy", this.destroy);
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
		return this.queueCompiled(this.getCachedCompiledSVG(e), t);
	}
	queuePath(e, t, n) {
		return this.queue.push({
			kind: "path",
			commands: this.getCachedPathCommands(e),
			style: lr(t),
			options: n
		}), this;
	}
	flush = () => {
		if (this.queue.length === 0) return !1;
		let e = this.retained ? this.computeQueueStateKey(this.queue) : null;
		if (this.retained && e === this.retainedStateKey) return this.queue.length = 0, !1;
		this.graphics.clear();
		let n = this.scene.sys.game.renderer;
		t(n.config) || t(n);
		let r = 2;
		for (let e of this.queue) {
			if (e.kind === "path") {
				let t = e.options?.x ?? 0, n = e.options?.y ?? 0, i = t === 0 && n === 0 ? e.commands : bn(e.commands, 1, t, n);
				wt(this.graphics, i, e.style, e.options);
				let a = e.options?.msaaSamples ?? 2;
				r = Math.max(r, a);
				continue;
			}
			let t = e.options, n = dr(e.compiled.viewBox, t), i = (t?.x ?? 0) + (n?.tx ?? 0), a = (t?.y ?? 0) + (n?.ty ?? 0), o = n?.scale ?? 1, c = t?.overrideFill !== void 0 || t?.overrideStroke !== void 0;
			for (let n of e.compiled.items) {
				let e = o === 1 ? n.style : {
					...n.style,
					strokeWidth: n.style.strokeWidth * o
				}, r = c ? ur(e, t?.overrideFill, t?.overrideStroke) : e;
				if (n.kind === "native") {
					let e = o === 1 && i === 0 && a === 0 ? n.shape : l(n.shape, o, i, a);
					s(this.graphics, e, r, { curveTolerance: t?.curveTolerance });
				} else {
					let e = o === 1 && i === 0 && a === 0 ? n.commands : bn(n.commands, o, i, a);
					wt(this.graphics, e, r, t);
				}
			}
			let u = ir(e.compiled, t);
			r = Math.max(r, u);
		}
		this.queue.length = 0;
		let i = n;
		if (!i?.gl) throw Error("phaser-svg scene batch: a WebGL renderer is required. Create the game with WebGL + WebGL2 context.");
		return gn(this.graphics, i, r), this.retained && (this.retainedStateKey = e), !0;
	};
	markDirty() {
		return this.retainedStateKey = null, this;
	}
	destroy = () => {
		this.autoFlush && this.scene.sys.events.off("postupdate", this.flush), this.queue.length = 0, this.retainedStateKey = null, this.compiledSvgCache.clear(), this.parsedPathCache.clear();
	};
	getCachedCompiledSVG(e) {
		let t = this.compiledSvgCache.get(e);
		if (t) return this.compiledSvgCache.delete(e), this.compiledSvgCache.set(e, t), t;
		let n = u(e);
		if (this.compiledSvgCache.size >= Qn) {
			let e = this.compiledSvgCache.keys().next().value;
			e !== void 0 && this.compiledSvgCache.delete(e);
		}
		return this.compiledSvgCache.set(e, n), n;
	}
	getCachedPathCommands(t) {
		let n = this.parsedPathCache.get(t);
		if (n) return this.parsedPathCache.delete(t), this.parsedPathCache.set(t, n), n;
		let r = e(t);
		if (this.parsedPathCache.size >= $n) {
			let e = this.parsedPathCache.keys().next().value;
			e !== void 0 && this.parsedPathCache.delete(e);
		}
		return this.parsedPathCache.set(t, r), r;
	}
	computeQueueStateKey(e) {
		let t = [];
		for (let n of e) n.kind === "path" ? t.push(this.pathEntryStateKey(n)) : t.push(this.compiledEntryStateKey(n));
		return t.join("||");
	}
	pathEntryStateKey(e) {
		return [
			"path",
			cr(e.commands, tr),
			sr(e.style),
			or(e.options)
		].join("|");
	}
	compiledEntryStateKey(e) {
		return [
			"compiled",
			cr(e.compiled, er),
			ar(e.compiled, e.options)
		].join("|");
	}
};
function ir(e, t) {
	return t?.msaaSamples === void 0 ? e.msaaSamples ?? 2 : t.msaaSamples;
}
function ar(e, t) {
	return [
		t?.x ?? 0,
		t?.y ?? 0,
		t?.width ?? "_",
		t?.height ?? "_",
		t?.curveResolution ?? "_",
		t?.curveTolerance ?? "_",
		ir(e, t),
		t?.overrideFill ?? "_",
		t?.overrideStroke ?? "_"
	].join("|");
}
function or(e) {
	return [
		e?.x ?? 0,
		e?.y ?? 0,
		e?.curveResolution ?? "_",
		e?.curveTolerance ?? "_",
		e?.msaaSamples ?? 2
	].join("|");
}
function sr(e) {
	return [
		e.fill ?? "_",
		e.fillAlpha,
		e.stroke ?? "_",
		e.strokeAlpha,
		e.strokeWidth,
		e.lineJoin,
		e.lineCap,
		e.miterLimit,
		e.opacity
	].join("|");
}
function cr(e, t) {
	let n = t.get(e);
	if (n !== void 0) return n;
	let r = nr;
	return nr += 1, t.set(e, r), r;
}
function lr(e) {
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
function ur(e, t, n) {
	if (t === void 0 && n === void 0) return e;
	let r = { ...e };
	return t !== void 0 && (r.fill = t), n !== void 0 && (r.stroke = n), r;
}
function dr(e, t) {
	if (!(!e || t?.width === void 0 || t?.height === void 0)) return yn(e, t.width, t.height);
}
//#endregion
//#region src/plugin.ts
var fr = class extends f.ScenePlugin {
	defaultOptions = { msaaSamples: 2 };
	sceneBatch = null;
	boot() {
		r(this.systems, "Scene systems not available").events.once("destroy", this.destroy, this);
	}
	setDefaults(e) {
		return this.defaultOptions = { ...e }, this;
	}
	draw(e, t, n) {
		kn(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawIfDirty(e, t, n) {
		return An(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawPath(e, t, n, r) {
		En(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			curveTolerance: this.defaultOptions.curveTolerance,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawPathIfDirty(e, t, n, r) {
		return Dn(e, t, n, {
			curveResolution: this.defaultOptions.curveResolution,
			curveTolerance: this.defaultOptions.curveTolerance,
			msaaSamples: this.defaultOptions.msaaSamples,
			...r
		});
	}
	drawCompiled(e, t, n) {
		Mn(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	drawCompiledIfDirty(e, t, n) {
		return Nn(e, t, {
			...this.defaultOptions,
			...n
		});
	}
	markDirty(e) {
		return Fn(e), this;
	}
	clearDirtyState(e) {
		return In(e), this;
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
			curveTolerance: this.defaultOptions.curveTolerance,
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
		return this.sceneBatch ||= new rr(r(this.scene)), this.sceneBatch;
	}
	destroy() {
		this.sceneBatch?.destroy(), this.sceneBatch = null, super.destroy();
	}
};
//#endregion
export { i as DEFAULT_STYLE, fr as SVGPlugin, rr as SVGSceneBatch, In as clearSVGDirtyState, u as compileSVG, o as convertShape, Mn as drawCompiledSVG, Nn as drawCompiledSVGIfDirty, kn as drawSVG, An as drawSVGIfDirty, En as drawSVGPath, Dn as drawSVGPathIfDirty, Fn as markSVGDirty, n as parseColor, e as parsePath, wt as renderPath, c as resolveStyle };
