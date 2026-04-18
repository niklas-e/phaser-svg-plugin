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
//#region node_modules/fast-xml-parser/src/util.js
var r = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
r + "";
var i = "[" + r + "][:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*", a = RegExp("^" + i + "$");
function o(e, t) {
	let n = [], r = t.exec(e);
	for (; r;) {
		let i = [];
		i.startIndex = t.lastIndex - r[0].length;
		let a = r.length;
		for (let e = 0; e < a; e++) i.push(r[e]);
		n.push(i), r = t.exec(e);
	}
	return n;
}
var s = function(e) {
	return a.exec(e) != null;
};
function c(e) {
	return e !== void 0;
}
var l = [
	"hasOwnProperty",
	"toString",
	"valueOf",
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__"
], u = [
	"__proto__",
	"constructor",
	"prototype"
], d = {
	allowBooleanAttributes: !1,
	unpairedTags: []
};
function f(e, t) {
	t = Object.assign({}, d, t);
	let n = [], r = !1, i = !1;
	e[0] === "﻿" && (e = e.substr(1));
	for (let a = 0; a < e.length; a++) if (e[a] === "<" && e[a + 1] === "?") {
		if (a += 2, a = m(e, a), a.err) return a;
	} else if (e[a] === "<") {
		let o = a;
		if (a++, e[a] === "!") {
			a = h(e, a);
			continue;
		} else {
			let s = !1;
			e[a] === "/" && (s = !0, a++);
			let c = "";
			for (; a < e.length && e[a] !== ">" && e[a] !== " " && e[a] !== "	" && e[a] !== "\n" && e[a] !== "\r"; a++) c += e[a];
			if (c = c.trim(), c[c.length - 1] === "/" && (c = c.substring(0, c.length - 1), a--), !oe(c)) {
				let t;
				return t = c.trim().length === 0 ? "Invalid space after '<'." : "Tag '" + c + "' is an invalid name.", v("InvalidTag", t, y(e, a));
			}
			let l = ee(e, a);
			if (l === !1) return v("InvalidAttr", "Attributes for '" + c + "' have open quote.", y(e, a));
			let u = l.value;
			if (a = l.index, u[u.length - 1] === "/") {
				let n = a - u.length;
				u = u.substring(0, u.length - 1);
				let i = ne(u, t);
				if (i === !0) r = !0;
				else return v(i.err.code, i.err.msg, y(e, n + i.err.line));
			} else if (s) {
				if (!l.tagClosed) return v("InvalidTag", "Closing tag '" + c + "' doesn't have proper closing.", y(e, a));
				if (u.trim().length > 0) return v("InvalidTag", "Closing tag '" + c + "' can't have attributes or invalid starting.", y(e, o));
				if (n.length === 0) return v("InvalidTag", "Closing tag '" + c + "' has not been opened.", y(e, o));
				{
					let t = n.pop();
					if (c !== t.tagName) {
						let n = y(e, t.tagStartPos);
						return v("InvalidTag", "Expected closing tag '" + t.tagName + "' (opened in line " + n.line + ", col " + n.col + ") instead of closing tag '" + c + "'.", y(e, o));
					}
					n.length == 0 && (i = !0);
				}
			} else {
				let s = ne(u, t);
				if (s !== !0) return v(s.err.code, s.err.msg, y(e, a - u.length + s.err.line));
				if (i === !0) return v("InvalidXml", "Multiple possible root nodes found.", y(e, a));
				t.unpairedTags.indexOf(c) !== -1 || n.push({
					tagName: c,
					tagStartPos: o
				}), r = !0;
			}
			for (a++; a < e.length; a++) if (e[a] === "<") if (e[a + 1] === "!") {
				a++, a = h(e, a);
				continue;
			} else if (e[a + 1] === "?") {
				if (a = m(e, ++a), a.err) return a;
			} else break;
			else if (e[a] === "&") {
				let t = ie(e, a);
				if (t == -1) return v("InvalidChar", "char '&' is not expected.", y(e, a));
				a = t;
			} else if (i === !0 && !p(e[a])) return v("InvalidXml", "Extra text at the end", y(e, a));
			e[a] === "<" && a--;
		}
	} else {
		if (p(e[a])) continue;
		return v("InvalidChar", "char '" + e[a] + "' is not expected.", y(e, a));
	}
	return r ? n.length == 1 ? v("InvalidTag", "Unclosed tag '" + n[0].tagName + "'.", y(e, n[0].tagStartPos)) : n.length > 0 ? v("InvalidXml", "Invalid '" + JSON.stringify(n.map((e) => e.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", {
		line: 1,
		col: 1
	}) : !0 : v("InvalidXml", "Start tag expected.", 1);
}
function p(e) {
	return e === " " || e === "	" || e === "\n" || e === "\r";
}
function m(e, t) {
	let n = t;
	for (; t < e.length; t++) if (e[t] == "?" || e[t] == " ") {
		let r = e.substr(n, t - n);
		if (t > 5 && r === "xml") return v("InvalidXml", "XML declaration allowed only at the start of the document.", y(e, t));
		if (e[t] == "?" && e[t + 1] == ">") {
			t++;
			break;
		} else continue;
	}
	return t;
}
function h(e, t) {
	if (e.length > t + 5 && e[t + 1] === "-" && e[t + 2] === "-") {
		for (t += 3; t < e.length; t++) if (e[t] === "-" && e[t + 1] === "-" && e[t + 2] === ">") {
			t += 2;
			break;
		}
	} else if (e.length > t + 8 && e[t + 1] === "D" && e[t + 2] === "O" && e[t + 3] === "C" && e[t + 4] === "T" && e[t + 5] === "Y" && e[t + 6] === "P" && e[t + 7] === "E") {
		let n = 1;
		for (t += 8; t < e.length; t++) if (e[t] === "<") n++;
		else if (e[t] === ">" && (n--, n === 0)) break;
	} else if (e.length > t + 9 && e[t + 1] === "[" && e[t + 2] === "C" && e[t + 3] === "D" && e[t + 4] === "A" && e[t + 5] === "T" && e[t + 6] === "A" && e[t + 7] === "[") {
		for (t += 8; t < e.length; t++) if (e[t] === "]" && e[t + 1] === "]" && e[t + 2] === ">") {
			t += 2;
			break;
		}
	}
	return t;
}
var g = "\"", _ = "'";
function ee(e, t) {
	let n = "", r = "", i = !1;
	for (; t < e.length; t++) {
		if (e[t] === g || e[t] === _) r === "" ? r = e[t] : r !== e[t] || (r = "");
		else if (e[t] === ">" && r === "") {
			i = !0;
			break;
		}
		n += e[t];
	}
	return r === "" ? {
		value: n,
		index: t,
		tagClosed: i
	} : !1;
}
var te = /* @__PURE__ */ RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?", "g");
function ne(e, t) {
	let n = o(e, te), r = {};
	for (let e = 0; e < n.length; e++) {
		if (n[e][1].length === 0) return v("InvalidAttr", "Attribute '" + n[e][2] + "' has no space in starting.", b(n[e]));
		if (n[e][3] !== void 0 && n[e][4] === void 0) return v("InvalidAttr", "Attribute '" + n[e][2] + "' is without value.", b(n[e]));
		if (n[e][3] === void 0 && !t.allowBooleanAttributes) return v("InvalidAttr", "boolean attribute '" + n[e][2] + "' is not allowed.", b(n[e]));
		let i = n[e][2];
		if (!ae(i)) return v("InvalidAttr", "Attribute '" + i + "' is an invalid name.", b(n[e]));
		if (!Object.prototype.hasOwnProperty.call(r, i)) r[i] = 1;
		else return v("InvalidAttr", "Attribute '" + i + "' is repeated.", b(n[e]));
	}
	return !0;
}
function re(e, t) {
	let n = /\d/;
	for (e[t] === "x" && (t++, n = /[\da-fA-F]/); t < e.length; t++) {
		if (e[t] === ";") return t;
		if (!e[t].match(n)) break;
	}
	return -1;
}
function ie(e, t) {
	if (t++, e[t] === ";") return -1;
	if (e[t] === "#") return t++, re(e, t);
	let n = 0;
	for (; t < e.length; t++, n++) if (!(e[t].match(/\w/) && n < 20)) {
		if (e[t] === ";") break;
		return -1;
	}
	return t;
}
function v(e, t, n) {
	return { err: {
		code: e,
		msg: t,
		line: n.line || n,
		col: n.col
	} };
}
function ae(e) {
	return s(e);
}
function oe(e) {
	return s(e);
}
function y(e, t) {
	let n = e.substring(0, t).split(/\r?\n/);
	return {
		line: n.length,
		col: n[n.length - 1].length + 1
	};
}
function b(e) {
	return e.startIndex + e[1].length;
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var se = (e) => l.includes(e) ? "__" + e : e, ce = {
	preserveOrder: !1,
	attributeNamePrefix: "@_",
	attributesGroupName: !1,
	textNodeName: "#text",
	ignoreAttributes: !0,
	removeNSPrefix: !1,
	allowBooleanAttributes: !1,
	parseTagValue: !0,
	parseAttributeValue: !1,
	trimValues: !0,
	cdataPropName: !1,
	numberParseOptions: {
		hex: !0,
		leadingZeros: !0,
		eNotation: !0
	},
	tagValueProcessor: function(e, t) {
		return t;
	},
	attributeValueProcessor: function(e, t) {
		return t;
	},
	stopNodes: [],
	alwaysCreateTextNode: !1,
	isArray: () => !1,
	commentPropName: !1,
	unpairedTags: [],
	processEntities: !0,
	htmlEntities: !1,
	ignoreDeclaration: !1,
	ignorePiTags: !1,
	transformTagName: !1,
	transformAttributeName: !1,
	updateTag: function(e, t, n) {
		return e;
	},
	captureMetaData: !1,
	maxNestedTags: 100,
	strictReservedNames: !0,
	jPath: !0,
	onDangerousProperty: se
};
function le(e, t) {
	if (typeof e != "string") return;
	let n = e.toLowerCase();
	if (l.some((e) => n === e.toLowerCase()) || u.some((e) => n === e.toLowerCase())) throw Error(`[SECURITY] Invalid ${t}: "${e}" is a reserved JavaScript keyword that could cause prototype pollution`);
}
function ue(e) {
	return typeof e == "boolean" ? {
		enabled: e,
		maxEntitySize: 1e4,
		maxExpansionDepth: 10,
		maxTotalExpansions: 1e3,
		maxExpandedLength: 1e5,
		maxEntityCount: 100,
		allowedTags: null,
		tagFilter: null
	} : typeof e == "object" && e ? {
		enabled: e.enabled !== !1,
		maxEntitySize: Math.max(1, e.maxEntitySize ?? 1e4),
		maxExpansionDepth: Math.max(1, e.maxExpansionDepth ?? 1e4),
		maxTotalExpansions: Math.max(1, e.maxTotalExpansions ?? Infinity),
		maxExpandedLength: Math.max(1, e.maxExpandedLength ?? 1e5),
		maxEntityCount: Math.max(1, e.maxEntityCount ?? 1e3),
		allowedTags: e.allowedTags ?? null,
		tagFilter: e.tagFilter ?? null
	} : ue(!0);
}
var de = function(e) {
	let t = Object.assign({}, ce, e), n = [
		{
			value: t.attributeNamePrefix,
			name: "attributeNamePrefix"
		},
		{
			value: t.attributesGroupName,
			name: "attributesGroupName"
		},
		{
			value: t.textNodeName,
			name: "textNodeName"
		},
		{
			value: t.cdataPropName,
			name: "cdataPropName"
		},
		{
			value: t.commentPropName,
			name: "commentPropName"
		}
	];
	for (let { value: e, name: t } of n) e && le(e, t);
	return t.onDangerousProperty === null && (t.onDangerousProperty = se), t.processEntities = ue(t.processEntities), t.unpairedTagsSet = new Set(t.unpairedTags), t.stopNodes && Array.isArray(t.stopNodes) && (t.stopNodes = t.stopNodes.map((e) => typeof e == "string" && e.startsWith("*.") ? ".." + e.substring(2) : e)), t;
}, x = typeof Symbol == "function" ? Symbol("XML Node Metadata") : "@@xmlMetadata", S = class {
	constructor(e) {
		this.tagname = e, this.child = [], this[":@"] = Object.create(null);
	}
	add(e, t) {
		e === "__proto__" && (e = "#__proto__"), this.child.push({ [e]: t });
	}
	addChild(e, t) {
		e.tagname === "__proto__" && (e.tagname = "#__proto__"), e[":@"] && Object.keys(e[":@"]).length > 0 ? this.child.push({
			[e.tagname]: e.child,
			":@": e[":@"]
		}) : this.child.push({ [e.tagname]: e.child }), t !== void 0 && (this.child[this.child.length - 1][x] = { startIndex: t });
	}
	static getMetaDataSymbol() {
		return x;
	}
}, fe = class {
	constructor(e) {
		this.suppressValidationErr = !e, this.options = e;
	}
	readDocType(e, t) {
		let n = Object.create(null), r = 0;
		if (e[t + 3] === "O" && e[t + 4] === "C" && e[t + 5] === "T" && e[t + 6] === "Y" && e[t + 7] === "P" && e[t + 8] === "E") {
			t += 9;
			let i = 1, a = !1, o = !1, s = "";
			for (; t < e.length; t++) if (e[t] === "<" && !o) {
				if (a && w(e, "!ENTITY", t)) {
					t += 7;
					let i, a;
					if ([i, a, t] = this.readEntityExp(e, t + 1, this.suppressValidationErr), a.indexOf("&") === -1) {
						if (this.options.enabled !== !1 && this.options.maxEntityCount != null && r >= this.options.maxEntityCount) throw Error(`Entity count (${r + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`);
						let e = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
						n[i] = {
							regx: RegExp(`&${e};`, "g"),
							val: a
						}, r++;
					}
				} else if (a && w(e, "!ELEMENT", t)) {
					t += 8;
					let { index: n } = this.readElementExp(e, t + 1);
					t = n;
				} else if (a && w(e, "!ATTLIST", t)) t += 8;
				else if (a && w(e, "!NOTATION", t)) {
					t += 9;
					let { index: n } = this.readNotationExp(e, t + 1, this.suppressValidationErr);
					t = n;
				} else if (w(e, "!--", t)) o = !0;
				else throw Error("Invalid DOCTYPE");
				i++, s = "";
			} else if (e[t] === ">") {
				if (o ? e[t - 1] === "-" && e[t - 2] === "-" && (o = !1, i--) : i--, i === 0) break;
			} else e[t] === "[" ? a = !0 : s += e[t];
			if (i !== 0) throw Error("Unclosed DOCTYPE");
		} else throw Error("Invalid Tag instead of DOCTYPE");
		return {
			entities: n,
			i: t
		};
	}
	readEntityExp(e, t) {
		t = C(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]) && e[t] !== "\"" && e[t] !== "'";) t++;
		let r = e.substring(n, t);
		if (T(r), t = C(e, t), !this.suppressValidationErr) {
			if (e.substring(t, t + 6).toUpperCase() === "SYSTEM") throw Error("External entities are not supported");
			if (e[t] === "%") throw Error("Parameter entities are not supported");
		}
		let i = "";
		if ([t, i] = this.readIdentifierVal(e, t, "entity"), this.options.enabled !== !1 && this.options.maxEntitySize != null && i.length > this.options.maxEntitySize) throw Error(`Entity "${r}" size (${i.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`);
		return t--, [
			r,
			i,
			t
		];
	}
	readNotationExp(e, t) {
		t = C(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		!this.suppressValidationErr && T(r), t = C(e, t);
		let i = e.substring(t, t + 6).toUpperCase();
		if (!this.suppressValidationErr && i !== "SYSTEM" && i !== "PUBLIC") throw Error(`Expected SYSTEM or PUBLIC, found "${i}"`);
		t += i.length, t = C(e, t);
		let a = null, o = null;
		if (i === "PUBLIC") [t, a] = this.readIdentifierVal(e, t, "publicIdentifier"), t = C(e, t), (e[t] === "\"" || e[t] === "'") && ([t, o] = this.readIdentifierVal(e, t, "systemIdentifier"));
		else if (i === "SYSTEM" && ([t, o] = this.readIdentifierVal(e, t, "systemIdentifier"), !this.suppressValidationErr && !o)) throw Error("Missing mandatory system identifier for SYSTEM notation");
		return {
			notationName: r,
			publicIdentifier: a,
			systemIdentifier: o,
			index: --t
		};
	}
	readIdentifierVal(e, t, n) {
		let r = "", i = e[t];
		if (i !== "\"" && i !== "'") throw Error(`Expected quoted string, found "${i}"`);
		t++;
		let a = t;
		for (; t < e.length && e[t] !== i;) t++;
		if (r = e.substring(a, t), e[t] !== i) throw Error(`Unterminated ${n} value`);
		return t++, [t, r];
	}
	readElementExp(e, t) {
		t = C(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		if (!this.suppressValidationErr && !s(r)) throw Error(`Invalid element name: "${r}"`);
		t = C(e, t);
		let i = "";
		if (e[t] === "E" && w(e, "MPTY", t)) t += 4;
		else if (e[t] === "A" && w(e, "NY", t)) t += 2;
		else if (e[t] === "(") {
			t++;
			let n = t;
			for (; t < e.length && e[t] !== ")";) t++;
			if (i = e.substring(n, t), e[t] !== ")") throw Error("Unterminated content model");
		} else if (!this.suppressValidationErr) throw Error(`Invalid Element Expression, found "${e[t]}"`);
		return {
			elementName: r,
			contentModel: i.trim(),
			index: t
		};
	}
	readAttlistExp(e, t) {
		t = C(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		for (T(r), t = C(e, t), n = t; t < e.length && !/\s/.test(e[t]);) t++;
		let i = e.substring(n, t);
		if (!T(i)) throw Error(`Invalid attribute name: "${i}"`);
		t = C(e, t);
		let a = "";
		if (e.substring(t, t + 8).toUpperCase() === "NOTATION") {
			if (a = "NOTATION", t += 8, t = C(e, t), e[t] !== "(") throw Error(`Expected '(', found "${e[t]}"`);
			t++;
			let n = [];
			for (; t < e.length && e[t] !== ")";) {
				let r = t;
				for (; t < e.length && e[t] !== "|" && e[t] !== ")";) t++;
				let i = e.substring(r, t);
				if (i = i.trim(), !T(i)) throw Error(`Invalid notation name: "${i}"`);
				n.push(i), e[t] === "|" && (t++, t = C(e, t));
			}
			if (e[t] !== ")") throw Error("Unterminated list of notations");
			t++, a += " (" + n.join("|") + ")";
		} else {
			let n = t;
			for (; t < e.length && !/\s/.test(e[t]);) t++;
			if (a += e.substring(n, t), !this.suppressValidationErr && ![
				"CDATA",
				"ID",
				"IDREF",
				"IDREFS",
				"ENTITY",
				"ENTITIES",
				"NMTOKEN",
				"NMTOKENS"
			].includes(a.toUpperCase())) throw Error(`Invalid attribute type: "${a}"`);
		}
		t = C(e, t);
		let o = "";
		return e.substring(t, t + 8).toUpperCase() === "#REQUIRED" ? (o = "#REQUIRED", t += 8) : e.substring(t, t + 7).toUpperCase() === "#IMPLIED" ? (o = "#IMPLIED", t += 7) : [t, o] = this.readIdentifierVal(e, t, "ATTLIST"), {
			elementName: r,
			attributeName: i,
			attributeType: a,
			defaultValue: o,
			index: t
		};
	}
}, C = (e, t) => {
	for (; t < e.length && /\s/.test(e[t]);) t++;
	return t;
};
function w(e, t, n) {
	for (let r = 0; r < t.length; r++) if (t[r] !== e[n + r + 1]) return !1;
	return !0;
}
function T(e) {
	if (s(e)) return e;
	throw Error(`Invalid entity name ${e}`);
}
//#endregion
//#region node_modules/strnum/strnum.js
var pe = /^[-+]?0x[a-fA-F0-9]+$/, me = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/, he = {
	hex: !0,
	leadingZeros: !0,
	decimalPoint: ".",
	eNotation: !0,
	infinity: "original"
};
function ge(e, t = {}) {
	if (t = Object.assign({}, he, t), !e || typeof e != "string") return e;
	let n = e.trim();
	if (n.length === 0 || t.skipLike !== void 0 && t.skipLike.test(n)) return e;
	if (n === "0") return 0;
	if (t.hex && pe.test(n)) return be(n, 16);
	if (!isFinite(n)) return xe(e, Number(n), t);
	if (n.includes("e") || n.includes("E")) return ve(e, n, t);
	{
		let r = me.exec(n);
		if (r) {
			let i = r[1] || "", a = r[2], o = ye(r[3]), s = i ? e[a.length + 1] === "." : e[a.length] === ".";
			if (!t.leadingZeros && (a.length > 1 || a.length === 1 && !s)) return e;
			{
				let r = Number(n), s = String(r);
				if (r === 0) return r;
				if (s.search(/[eE]/) !== -1) return t.eNotation ? r : e;
				if (n.indexOf(".") !== -1) return s === "0" || s === o || s === `${i}${o}` ? r : e;
				let c = a ? o : n;
				return a ? c === s || i + c === s ? r : e : c === s || c === i + s ? r : e;
			}
		} else return e;
	}
}
var _e = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function ve(e, t, n) {
	if (!n.eNotation) return e;
	let r = t.match(_e);
	if (r) {
		let i = r[1] || "", a = r[3].indexOf("e") === -1 ? "E" : "e", o = r[2], s = i ? e[o.length + 1] === a : e[o.length] === a;
		return o.length > 1 && s ? e : o.length === 1 && (r[3].startsWith(`.${a}`) || r[3][0] === a) ? Number(t) : o.length > 0 ? n.leadingZeros && !s ? (t = (r[1] || "") + r[3], Number(t)) : e : Number(t);
	} else return e;
}
function ye(e) {
	return e && e.indexOf(".") !== -1 ? (e = e.replace(/0+$/, ""), e === "." ? e = "0" : e[0] === "." ? e = "0" + e : e[e.length - 1] === "." && (e = e.substring(0, e.length - 1)), e) : e;
}
function be(e, t) {
	if (parseInt) return parseInt(e, t);
	if (Number.parseInt) return Number.parseInt(e, t);
	if (window && window.parseInt) return window.parseInt(e, t);
	throw Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function xe(e, t, n) {
	let r = t === Infinity;
	switch (n.infinity.toLowerCase()) {
		case "null": return null;
		case "infinity": return t;
		case "string": return r ? "Infinity" : "-Infinity";
		default: return e;
	}
}
//#endregion
//#region node_modules/fast-xml-parser/src/ignoreAttributes.js
function Se(e) {
	return typeof e == "function" ? e : Array.isArray(e) ? (t) => {
		for (let n of e) if (typeof n == "string" && t === n || n instanceof RegExp && n.test(t)) return !0;
	} : () => !1;
}
//#endregion
//#region node_modules/path-expression-matcher/src/Expression.js
var E = class {
	constructor(e, t = {}, n) {
		this.pattern = e, this.separator = t.separator || ".", this.segments = this._parse(e), this.data = n, this._hasDeepWildcard = this.segments.some((e) => e.type === "deep-wildcard"), this._hasAttributeCondition = this.segments.some((e) => e.attrName !== void 0), this._hasPositionSelector = this.segments.some((e) => e.position !== void 0);
	}
	_parse(e) {
		let t = [], n = 0, r = "";
		for (; n < e.length;) e[n] === this.separator ? n + 1 < e.length && e[n + 1] === this.separator ? (r.trim() && (t.push(this._parseSegment(r.trim())), r = ""), t.push({ type: "deep-wildcard" }), n += 2) : (r.trim() && t.push(this._parseSegment(r.trim())), r = "", n++) : (r += e[n], n++);
		return r.trim() && t.push(this._parseSegment(r.trim())), t;
	}
	_parseSegment(e) {
		let t = { type: "tag" }, n = null, r = e, i = e.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
		if (i && (r = i[1] + i[3], i[2])) {
			let e = i[2].slice(1, -1);
			e && (n = e);
		}
		let a, o = r;
		if (r.includes("::")) {
			let t = r.indexOf("::");
			if (a = r.substring(0, t).trim(), o = r.substring(t + 2).trim(), !a) throw Error(`Invalid namespace in pattern: ${e}`);
		}
		let s, c = null;
		if (o.includes(":")) {
			let e = o.lastIndexOf(":"), t = o.substring(0, e).trim(), n = o.substring(e + 1).trim();
			[
				"first",
				"last",
				"odd",
				"even"
			].includes(n) || /^nth\(\d+\)$/.test(n) ? (s = t, c = n) : s = o;
		} else s = o;
		if (!s) throw Error(`Invalid segment pattern: ${e}`);
		if (t.tag = s, a && (t.namespace = a), n) if (n.includes("=")) {
			let e = n.indexOf("=");
			t.attrName = n.substring(0, e).trim(), t.attrValue = n.substring(e + 1).trim();
		} else t.attrName = n.trim();
		if (c) {
			let e = c.match(/^nth\((\d+)\)$/);
			e ? (t.position = "nth", t.positionValue = parseInt(e[1], 10)) : t.position = c;
		}
		return t;
	}
	get length() {
		return this.segments.length;
	}
	hasDeepWildcard() {
		return this._hasDeepWildcard;
	}
	hasAttributeCondition() {
		return this._hasAttributeCondition;
	}
	hasPositionSelector() {
		return this._hasPositionSelector;
	}
	toString() {
		return this.pattern;
	}
}, Ce = class {
	constructor() {
		this._byDepthAndTag = /* @__PURE__ */ new Map(), this._wildcardByDepth = /* @__PURE__ */ new Map(), this._deepWildcards = [], this._patterns = /* @__PURE__ */ new Set(), this._sealed = !1;
	}
	add(e) {
		if (this._sealed) throw TypeError("ExpressionSet is sealed. Create a new ExpressionSet to add more expressions.");
		if (this._patterns.has(e.pattern)) return this;
		if (this._patterns.add(e.pattern), e.hasDeepWildcard()) return this._deepWildcards.push(e), this;
		let t = e.length, n = e.segments[e.segments.length - 1]?.tag;
		if (!n || n === "*") this._wildcardByDepth.has(t) || this._wildcardByDepth.set(t, []), this._wildcardByDepth.get(t).push(e);
		else {
			let r = `${t}:${n}`;
			this._byDepthAndTag.has(r) || this._byDepthAndTag.set(r, []), this._byDepthAndTag.get(r).push(e);
		}
		return this;
	}
	addAll(e) {
		for (let t of e) this.add(t);
		return this;
	}
	has(e) {
		return this._patterns.has(e.pattern);
	}
	get size() {
		return this._patterns.size;
	}
	seal() {
		return this._sealed = !0, this;
	}
	get isSealed() {
		return this._sealed;
	}
	matchesAny(e) {
		return this.findMatch(e) !== null;
	}
	findMatch(e) {
		let t = e.getDepth(), n = `${t}:${e.getCurrentTag()}`, r = this._byDepthAndTag.get(n);
		if (r) {
			for (let t = 0; t < r.length; t++) if (e.matches(r[t])) return r[t];
		}
		let i = this._wildcardByDepth.get(t);
		if (i) {
			for (let t = 0; t < i.length; t++) if (e.matches(i[t])) return i[t];
		}
		for (let t = 0; t < this._deepWildcards.length; t++) if (e.matches(this._deepWildcards[t])) return this._deepWildcards[t];
		return null;
	}
}, we = class {
	constructor(e) {
		this._matcher = e;
	}
	get separator() {
		return this._matcher.separator;
	}
	getCurrentTag() {
		let e = this._matcher.path;
		return e.length > 0 ? e[e.length - 1].tag : void 0;
	}
	getCurrentNamespace() {
		let e = this._matcher.path;
		return e.length > 0 ? e[e.length - 1].namespace : void 0;
	}
	getAttrValue(e) {
		let t = this._matcher.path;
		if (t.length !== 0) return t[t.length - 1].values?.[e];
	}
	hasAttr(e) {
		let t = this._matcher.path;
		if (t.length === 0) return !1;
		let n = t[t.length - 1];
		return n.values !== void 0 && e in n.values;
	}
	getPosition() {
		let e = this._matcher.path;
		return e.length === 0 ? -1 : e[e.length - 1].position ?? 0;
	}
	getCounter() {
		let e = this._matcher.path;
		return e.length === 0 ? -1 : e[e.length - 1].counter ?? 0;
	}
	getIndex() {
		return this.getPosition();
	}
	getDepth() {
		return this._matcher.path.length;
	}
	toString(e, t = !0) {
		return this._matcher.toString(e, t);
	}
	toArray() {
		return this._matcher.path.map((e) => e.tag);
	}
	matches(e) {
		return this._matcher.matches(e);
	}
	matchesAny(e) {
		return e.matchesAny(this._matcher);
	}
}, Te = class {
	constructor(e = {}) {
		this.separator = e.separator || ".", this.path = [], this.siblingStacks = [], this._pathStringCache = null, this._view = new we(this);
	}
	push(e, t = null, n = null) {
		this._pathStringCache = null, this.path.length > 0 && (this.path[this.path.length - 1].values = void 0);
		let r = this.path.length;
		this.siblingStacks[r] || (this.siblingStacks[r] = /* @__PURE__ */ new Map());
		let i = this.siblingStacks[r], a = n ? `${n}:${e}` : e, o = i.get(a) || 0, s = 0;
		for (let e of i.values()) s += e;
		i.set(a, o + 1);
		let c = {
			tag: e,
			position: s,
			counter: o
		};
		n != null && (c.namespace = n), t != null && (c.values = t), this.path.push(c);
	}
	pop() {
		if (this.path.length === 0) return;
		this._pathStringCache = null;
		let e = this.path.pop();
		return this.siblingStacks.length > this.path.length + 1 && (this.siblingStacks.length = this.path.length + 1), e;
	}
	updateCurrent(e) {
		if (this.path.length > 0) {
			let t = this.path[this.path.length - 1];
			e != null && (t.values = e);
		}
	}
	getCurrentTag() {
		return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
	}
	getCurrentNamespace() {
		return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
	}
	getAttrValue(e) {
		if (this.path.length !== 0) return this.path[this.path.length - 1].values?.[e];
	}
	hasAttr(e) {
		if (this.path.length === 0) return !1;
		let t = this.path[this.path.length - 1];
		return t.values !== void 0 && e in t.values;
	}
	getPosition() {
		return this.path.length === 0 ? -1 : this.path[this.path.length - 1].position ?? 0;
	}
	getCounter() {
		return this.path.length === 0 ? -1 : this.path[this.path.length - 1].counter ?? 0;
	}
	getIndex() {
		return this.getPosition();
	}
	getDepth() {
		return this.path.length;
	}
	toString(e, t = !0) {
		let n = e || this.separator;
		if (n === this.separator && t === !0) {
			if (this._pathStringCache !== null) return this._pathStringCache;
			let e = this.path.map((e) => e.namespace ? `${e.namespace}:${e.tag}` : e.tag).join(n);
			return this._pathStringCache = e, e;
		}
		return this.path.map((e) => t && e.namespace ? `${e.namespace}:${e.tag}` : e.tag).join(n);
	}
	toArray() {
		return this.path.map((e) => e.tag);
	}
	reset() {
		this._pathStringCache = null, this.path = [], this.siblingStacks = [];
	}
	matches(e) {
		let t = e.segments;
		return t.length === 0 ? !1 : e.hasDeepWildcard() ? this._matchWithDeepWildcard(t) : this._matchSimple(t);
	}
	_matchSimple(e) {
		if (this.path.length !== e.length) return !1;
		for (let t = 0; t < e.length; t++) if (!this._matchSegment(e[t], this.path[t], t === this.path.length - 1)) return !1;
		return !0;
	}
	_matchWithDeepWildcard(e) {
		let t = this.path.length - 1, n = e.length - 1;
		for (; n >= 0 && t >= 0;) {
			let r = e[n];
			if (r.type === "deep-wildcard") {
				if (n--, n < 0) return !0;
				let r = e[n], i = !1;
				for (let e = t; e >= 0; e--) if (this._matchSegment(r, this.path[e], e === this.path.length - 1)) {
					t = e - 1, n--, i = !0;
					break;
				}
				if (!i) return !1;
			} else {
				if (!this._matchSegment(r, this.path[t], t === this.path.length - 1)) return !1;
				t--, n--;
			}
		}
		return n < 0;
	}
	_matchSegment(e, t, n) {
		if (e.tag !== "*" && e.tag !== t.tag || e.namespace !== void 0 && e.namespace !== "*" && e.namespace !== t.namespace || e.attrName !== void 0 && (!n || !t.values || !(e.attrName in t.values) || e.attrValue !== void 0 && String(t.values[e.attrName]) !== String(e.attrValue))) return !1;
		if (e.position !== void 0) {
			if (!n) return !1;
			let r = t.counter ?? 0;
			if (e.position === "first" && r !== 0 || e.position === "odd" && r % 2 != 1 || e.position === "even" && r % 2 != 0 || e.position === "nth" && r !== e.positionValue) return !1;
		}
		return !0;
	}
	matchesAny(e) {
		return e.matchesAny(this);
	}
	snapshot() {
		return {
			path: this.path.map((e) => ({ ...e })),
			siblingStacks: this.siblingStacks.map((e) => new Map(e))
		};
	}
	restore(e) {
		this._pathStringCache = null, this.path = e.path.map((e) => ({ ...e })), this.siblingStacks = e.siblingStacks.map((e) => new Map(e));
	}
	readOnly() {
		return this._view;
	}
}, Ee = {
	apos: {
		regex: /&(apos|#0*39|#x0*27);/g,
		val: "'"
	},
	gt: {
		regex: /&(gt|#0*62|#x0*3[Ee]);/g,
		val: ">"
	},
	lt: {
		regex: /&(lt|#0*60|#x0*3[Cc]);/g,
		val: "<"
	},
	quot: {
		regex: /&(quot|#0*34|#x0*22);/g,
		val: "\""
	}
}, D = {
	regex: /&(amp|#0*38|#x0*26);/g,
	val: "&"
}, De = /* @__PURE__ */ new Set("!?\\\\/[]$%{}^&*()<>|+");
function O(e) {
	for (let t of e) if (De.has(t)) throw Error(`[EntityReplacer] Invalid character '${t}' in entity name: "${e}"`);
	return e;
}
function k(e) {
	return e.replace(/[.\-+*:]/g, "\\$&");
}
function A(e, t, n = !1) {
	return e === !1 || e === null ? null : e === !0 ? t : e === void 0 ? n ? t : null : typeof e == "object" ? e : null;
}
function Oe(e) {
	return e === "all" ? "all" : typeof e == "string" ? new Set([e]) : Array.isArray(e) ? new Set(e) : new Set(["external"]);
}
function j(e) {
	let t = [];
	for (let n of Object.keys(e)) {
		let r = e[n];
		if (typeof r == "object" && r && r.val !== void 0) t.push([n, {
			regex: r.regex ?? r.regx,
			val: r.val
		}]);
		else if (typeof r == "string") {
			if (r.indexOf("&") !== -1) continue;
			O(n), t.push([n, {
				regex: RegExp("&" + k(n) + ";", "g"),
				val: r
			}]);
		}
	}
	return t;
}
var ke = class {
	constructor(e = {}) {
		this._defaultTable = A(e.default, Ee, !0), this._systemTable = A(e.system, null, !1), this._ampEnabled = e.amp !== !1 && e.amp !== null, this._maxTotalExpansions = e.maxTotalExpansions || 0, this._maxExpandedLength = e.maxExpandedLength || 0, this._applyLimitsTo = Oe(e.applyLimitsTo ?? "external"), this._postCheck = typeof e.postCheck == "function" ? e.postCheck : (e) => e, this._limitExternal = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("external"), this._limitSystem = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("system"), this._limitDefault = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("default"), this._defaultEntries = this._defaultTable ? Object.entries(this._defaultTable) : [], this._systemEntries = this._systemTable ? Object.entries(this._systemTable) : [], this._persistentEntries = [], this._inputEntries = [], this._totalExpansions = 0, this._expandedLength = 0;
	}
	setExternalEntities(e) {
		this._persistentEntries = j(e);
	}
	addExternalEntity(e, t) {
		O(e), typeof t == "string" && t.indexOf("&") === -1 && this._persistentEntries.push([e, {
			regex: RegExp("&" + k(e) + ";", "g"),
			val: t
		}]);
	}
	addInputEntities(e) {
		this._totalExpansions = 0, this._expandedLength = 0, this._inputEntries = j(e);
	}
	reset() {
		this._inputEntries = [], this._totalExpansions = 0, this._expandedLength = 0;
	}
	replace(e) {
		if (typeof e != "string" || e.length === 0 || e.indexOf("&") === -1) return e;
		let t = e;
		return this._persistentEntries.length > 0 && (e = this._applyEntries(e, this._persistentEntries, this._limitExternal)), this._inputEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._inputEntries, this._limitExternal)), this._defaultEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._defaultEntries, this._limitDefault)), this._systemEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._systemEntries, this._limitSystem)), this._ampEnabled && e.indexOf("&") !== -1 && (e = e.replace(D.regex, D.val)), e = this._postCheck(e, t), e;
	}
	parse(e) {
		return this.replace(e);
	}
	_applyEntries(e, t, n) {
		let r = n && this._maxTotalExpansions > 0, i = n && this._maxExpandedLength > 0, a = r || i;
		for (let n = 0; n < t.length && e.indexOf("&") !== -1; n++) {
			let o = t[n][1];
			if (!a) {
				e = e.replace(o.regex, o.val);
				continue;
			}
			if (r && !i) {
				let t = 0;
				if (e = e.replace(o.regex, (...e) => (t++, typeof o.val == "function" ? o.val(...e) : o.val)), t > 0 && (this._totalExpansions += t, this._totalExpansions > this._maxTotalExpansions)) throw Error(`[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`);
			} else if (i && !r) {
				let t = e.length;
				e = e.replace(o.regex, o.val);
				let n = e.length - t;
				if (n > 0 && (this._expandedLength += n, this._expandedLength > this._maxExpandedLength)) throw Error(`[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`);
			} else {
				let t = e.length, n = 0;
				if (e = e.replace(o.regex, (...e) => (n++, typeof o.val == "function" ? o.val(...e) : o.val)), n > 0 && (this._totalExpansions += n, this._totalExpansions > this._maxTotalExpansions)) throw Error(`[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`);
				let r = e.length - t;
				if (r > 0 && (this._expandedLength += r, this._expandedLength > this._maxExpandedLength)) throw Error(`[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`);
			}
		}
		return e;
	}
}, Ae = {
	nbsp: {
		regex: /&(nbsp|#0*160|#x0*[Aa]0);/g,
		val: "\xA0"
	},
	copy: {
		regex: /&(copy|#0*169|#x0*[Aa]9);/g,
		val: "©"
	},
	reg: {
		regex: /&(reg|#0*174|#x0*[Aa][Ee]);/g,
		val: "®"
	},
	trade: {
		regex: /&(trade|#0*8482|#x0*2122);/g,
		val: "™"
	},
	mdash: {
		regex: /&(mdash|#0*8212|#x0*2014);/g,
		val: "—"
	},
	ndash: {
		regex: /&(ndash|#0*8211|#x0*2013);/g,
		val: "–"
	},
	hellip: {
		regex: /&(hellip|#0*8230|#x0*2026);/g,
		val: "…"
	},
	laquo: {
		regex: /&(laquo|#0*171|#x0*[Aa][Bb]);/g,
		val: "«"
	},
	raquo: {
		regex: /&(raquo|#0*187|#x0*[Bb][Bb]);/g,
		val: "»"
	},
	lsquo: {
		regex: /&(lsquo|#0*8216|#x0*2018);/g,
		val: "‘"
	},
	rsquo: {
		regex: /&(rsquo|#0*8217|#x0*2019);/g,
		val: "’"
	},
	ldquo: {
		regex: /&(ldquo|#0*8220|#x0*201[Cc]);/g,
		val: "“"
	},
	rdquo: {
		regex: /&(rdquo|#0*8221|#x0*201[Dd]);/g,
		val: "”"
	},
	bull: {
		regex: /&(bull|#0*8226|#x0*2022);/g,
		val: "•"
	},
	para: {
		regex: /&(para|#0*182|#x0*[Bb]6);/g,
		val: "¶"
	},
	sect: {
		regex: /&(sect|#0*167|#x0*[Aa]7);/g,
		val: "§"
	},
	deg: {
		regex: /&(deg|#0*176|#x0*[Bb]0);/g,
		val: "°"
	},
	frac12: {
		regex: /&(frac12|#0*189|#x0*[Bb][Dd]);/g,
		val: "½"
	},
	frac14: {
		regex: /&(frac14|#0*188|#x0*[Bb][Cc]);/g,
		val: "¼"
	},
	frac34: {
		regex: /&(frac34|#0*190|#x0*[Bb][Ee]);/g,
		val: "¾"
	},
	inr: {
		regex: /&(inr|#0*8377);/g,
		val: "₹"
	}
}, je = {
	cent: {
		regex: /&(cent|#0*162|#x0*[Aa]2);/g,
		val: "¢"
	},
	pound: {
		regex: /&(pound|#0*163|#x0*[Aa]3);/g,
		val: "£"
	},
	yen: {
		regex: /&(yen|#0*165|#x0*[Aa]5);/g,
		val: "¥"
	},
	euro: {
		regex: /&(euro|#0*8364|#x0*20[Aa][Cc]);/g,
		val: "€"
	},
	inr: {
		regex: /&(inr|#0*8377|#x0*20[Bb]9);/g,
		val: "₹"
	},
	curren: {
		regex: /&(curren|#0*164|#x0*[Aa]4);/g,
		val: "¤"
	},
	fnof: {
		regex: /&(fnof|#0*402|#x0*192);/g,
		val: "ƒ"
	}
}, Me = {
	num_dec: {
		regex: /&#0*([0-9]{1,7});/g,
		val: (e, t) => M(t, 10, "&#")
	},
	num_hex: {
		regex: /&#x0*([0-9a-fA-F]{1,6});/g,
		val: (e, t) => M(t, 16, "&#x")
	}
};
function M(e, t, n) {
	let r = Number.parseInt(e, t);
	return r >= 0 && r <= 1114111 ? String.fromCodePoint(r) : n + e + ";";
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function Ne(e, t) {
	if (!e) return {};
	let n = t.attributesGroupName ? e[t.attributesGroupName] : e;
	if (!n) return {};
	let r = {};
	for (let e in n) if (e.startsWith(t.attributeNamePrefix)) {
		let i = e.substring(t.attributeNamePrefix.length);
		r[i] = n[e];
	} else r[e] = n[e];
	return r;
}
function Pe(e) {
	if (!e || typeof e != "string") return;
	let t = e.indexOf(":");
	if (t !== -1 && t > 0) {
		let n = e.substring(0, t);
		if (n !== "xmlns") return n;
	}
}
var Fe = class {
	constructor(e) {
		this.options = e, this.currentNode = null, this.tagsNodeStack = [], this.parseXml = Be, this.parseTextData = Ie, this.resolveNameSpace = Le, this.buildAttributesMap = ze, this.isItStopNode = We, this.replaceEntitiesValue = He, this.readStopNodeData = qe, this.saveTextToParentTag = Ue, this.addChild = Ve, this.ignoreAttributesFn = Se(this.options.ignoreAttributes), this.entityExpansionCount = 0, this.currentExpandedLength = 0, this.entityReplacer = new ke({
			default: !0,
			system: this.options.htmlEntities ? {
				...Ae,
				...Me,
				...je
			} : {},
			maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
			maxExpandedLength: this.options.processEntities.maxExpandedLength,
			applyLimitsTo: "all"
		}), this.matcher = new Te(), this.readonlyMatcher = this.matcher.readOnly(), this.isCurrentNodeStopNode = !1, this.stopNodeExpressionsSet = new Ce();
		let t = this.options.stopNodes;
		if (t && t.length > 0) {
			for (let e = 0; e < t.length; e++) {
				let n = t[e];
				typeof n == "string" ? this.stopNodeExpressionsSet.add(new E(n)) : n instanceof E && this.stopNodeExpressionsSet.add(n);
			}
			this.stopNodeExpressionsSet.seal();
		}
	}
};
function Ie(e, t, n, r, i, a, o) {
	let s = this.options;
	if (e !== void 0 && (s.trimValues && !r && (e = e.trim()), e.length > 0)) {
		o || (e = this.replaceEntitiesValue(e, t, n));
		let r = s.jPath ? n.toString() : n, c = s.tagValueProcessor(t, e, r, i, a);
		return c == null ? e : typeof c != typeof e || c !== e ? c : s.trimValues || e.trim() === e ? Je(e, s.parseTagValue, s.numberParseOptions) : e;
	}
}
function Le(e) {
	if (this.options.removeNSPrefix) {
		let t = e.split(":"), n = e.charAt(0) === "/" ? "/" : "";
		if (t[0] === "xmlns") return "";
		t.length === 2 && (e = n + t[1]);
	}
	return e;
}
var Re = /* @__PURE__ */ RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?", "gm");
function ze(e, t, n) {
	let r = this.options;
	if (r.ignoreAttributes !== !0 && typeof e == "string") {
		let i = o(e, Re), a = i.length, s = {}, c = Array(a), l = !1, u = {};
		for (let e = 0; e < a; e++) {
			let t = this.resolveNameSpace(i[e][1]), a = i[e][4];
			if (t.length && a !== void 0) {
				let i = a;
				r.trimValues && (i = i.trim()), i = this.replaceEntitiesValue(i, n, this.readonlyMatcher), c[e] = i, u[t] = i, l = !0;
			}
		}
		l && typeof t == "object" && t.updateCurrent && t.updateCurrent(u);
		let d = r.jPath ? t.toString() : this.readonlyMatcher, f = !1;
		for (let e = 0; e < a; e++) {
			let t = this.resolveNameSpace(i[e][1]);
			if (this.ignoreAttributesFn(t, d)) continue;
			let n = r.attributeNamePrefix + t;
			if (t.length) if (r.transformAttributeName && (n = r.transformAttributeName(n)), n = Ye(n, r), i[e][4] !== void 0) {
				let i = c[e], a = r.attributeValueProcessor(t, i, d);
				a == null ? s[n] = i : typeof a != typeof i || a !== i ? s[n] = a : s[n] = Je(i, r.parseAttributeValue, r.numberParseOptions), f = !0;
			} else r.allowBooleanAttributes && (s[n] = !0, f = !0);
		}
		if (!f) return;
		if (r.attributesGroupName) {
			let e = {};
			return e[r.attributesGroupName] = s, e;
		}
		return s;
	}
}
var Be = function(e) {
	e = e.replace(/\r\n?/g, "\n");
	let t = new S("!xml"), n = t, r = "";
	this.matcher.reset(), this.entityExpansionCount = 0, this.currentExpandedLength = 0;
	let i = this.options, a = new fe(i.processEntities), o = e.length;
	for (let s = 0; s < o; s++) if (e[s] === "<") {
		let c = e.charCodeAt(s + 1);
		if (c === 47) {
			let t = N(e, ">", s, "Closing Tag is not closed."), a = e.substring(s + 2, t).trim();
			if (i.removeNSPrefix) {
				let e = a.indexOf(":");
				e !== -1 && (a = a.substr(e + 1));
			}
			a = F(i.transformTagName, a, "", i).tagName, n && (r = this.saveTextToParentTag(r, n, this.readonlyMatcher));
			let o = this.matcher.getCurrentTag();
			if (a && i.unpairedTagsSet.has(a)) throw Error(`Unpaired tag can not be used as closing tag: </${a}>`);
			o && i.unpairedTagsSet.has(o) && (this.matcher.pop(), this.tagsNodeStack.pop()), this.matcher.pop(), this.isCurrentNodeStopNode = !1, n = this.tagsNodeStack.pop(), r = "", s = t;
		} else if (c === 63) {
			let t = P(e, s, !1, "?>");
			if (!t) throw Error("Pi Tag is not closed.");
			if (r = this.saveTextToParentTag(r, n, this.readonlyMatcher), !(i.ignoreDeclaration && t.tagName === "?xml" || i.ignorePiTags)) {
				let e = new S(t.tagName);
				e.add(i.textNodeName, ""), t.tagName !== t.tagExp && t.attrExpPresent && (e[":@"] = this.buildAttributesMap(t.tagExp, this.matcher, t.tagName)), this.addChild(n, e, this.readonlyMatcher, s);
			}
			s = t.closeIndex + 1;
		} else if (c === 33 && e.charCodeAt(s + 2) === 45 && e.charCodeAt(s + 3) === 45) {
			let t = N(e, "-->", s + 4, "Comment is not closed.");
			if (i.commentPropName) {
				let a = e.substring(s + 4, t - 2);
				r = this.saveTextToParentTag(r, n, this.readonlyMatcher), n.add(i.commentPropName, [{ [i.textNodeName]: a }]);
			}
			s = t;
		} else if (c === 33 && e.charCodeAt(s + 2) === 68) {
			let t = a.readDocType(e, s);
			this.entityReplacer.addInputEntities(t.entities), s = t.i;
		} else if (c === 33 && e.charCodeAt(s + 2) === 91) {
			let t = N(e, "]]>", s, "CDATA is not closed.") - 2, a = e.substring(s + 9, t);
			r = this.saveTextToParentTag(r, n, this.readonlyMatcher);
			let o = this.parseTextData(a, n.tagname, this.readonlyMatcher, !0, !1, !0, !0);
			o ??= "", i.cdataPropName ? n.add(i.cdataPropName, [{ [i.textNodeName]: a }]) : n.add(i.textNodeName, o), s = t + 2;
		} else {
			let a = P(e, s, i.removeNSPrefix);
			if (!a) {
				let t = e.substring(Math.max(0, s - 50), Math.min(o, s + 50));
				throw Error(`readTagExp returned undefined at position ${s}. Context: "${t}"`);
			}
			let c = a.tagName, l = a.rawTagName, u = a.tagExp, d = a.attrExpPresent, f = a.closeIndex;
			if ({tagName: c, tagExp: u} = F(i.transformTagName, c, u, i), i.strictReservedNames && (c === i.commentPropName || c === i.cdataPropName || c === i.textNodeName || c === i.attributesGroupName)) throw Error(`Invalid tag name: ${c}`);
			n && r && n.tagname !== "!xml" && (r = this.saveTextToParentTag(r, n, this.readonlyMatcher, !1));
			let p = n;
			p && i.unpairedTagsSet.has(p.tagname) && (n = this.tagsNodeStack.pop(), this.matcher.pop());
			let m = !1;
			u.length > 0 && u.lastIndexOf("/") === u.length - 1 && (m = !0, c[c.length - 1] === "/" ? (c = c.substr(0, c.length - 1), u = c) : u = u.substr(0, u.length - 1), d = c !== u);
			let h = null, g;
			g = Pe(l), c !== t.tagname && this.matcher.push(c, {}, g), c !== u && d && (h = this.buildAttributesMap(u, this.matcher, c), h && Ne(h, i)), c !== t.tagname && (this.isCurrentNodeStopNode = this.isItStopNode());
			let _ = s;
			if (this.isCurrentNodeStopNode) {
				let t = "";
				if (m) s = a.closeIndex;
				else if (i.unpairedTagsSet.has(c)) s = a.closeIndex;
				else {
					let n = this.readStopNodeData(e, l, f + 1);
					if (!n) throw Error(`Unexpected end of ${l}`);
					s = n.i, t = n.tagContent;
				}
				let r = new S(c);
				h && (r[":@"] = h), r.add(i.textNodeName, t), this.matcher.pop(), this.isCurrentNodeStopNode = !1, this.addChild(n, r, this.readonlyMatcher, _);
			} else {
				if (m) {
					({tagName: c, tagExp: u} = F(i.transformTagName, c, u, i));
					let e = new S(c);
					h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), this.matcher.pop(), this.isCurrentNodeStopNode = !1;
				} else if (i.unpairedTagsSet.has(c)) {
					let e = new S(c);
					h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), this.matcher.pop(), this.isCurrentNodeStopNode = !1, s = a.closeIndex;
					continue;
				} else {
					let e = new S(c);
					if (this.tagsNodeStack.length > i.maxNestedTags) throw Error("Maximum nested tags exceeded");
					this.tagsNodeStack.push(n), h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), n = e;
				}
				r = "", s = f;
			}
		}
	} else r += e[s];
	return t.child;
};
function Ve(e, t, n, r) {
	this.options.captureMetaData || (r = void 0);
	let i = this.options.jPath ? n.toString() : n, a = this.options.updateTag(t.tagname, i, t[":@"]);
	a === !1 || (typeof a == "string" && (t.tagname = a), e.addChild(t, r));
}
function He(e, t, n) {
	let r = this.options.processEntities;
	if (!r || !r.enabled) return e;
	if (r.allowedTags) {
		let i = this.options.jPath ? n.toString() : n;
		if (!(Array.isArray(r.allowedTags) ? r.allowedTags.includes(t) : r.allowedTags(t, i))) return e;
	}
	if (r.tagFilter) {
		let i = this.options.jPath ? n.toString() : n;
		if (!r.tagFilter(t, i)) return e;
	}
	return this.entityReplacer.replace(e);
}
function Ue(e, t, n, r) {
	return e &&= (r === void 0 && (r = t.child.length === 0), e = this.parseTextData(e, t.tagname, n, !1, t[":@"] ? Object.keys(t[":@"]).length !== 0 : !1, r), e !== void 0 && e !== "" && t.add(this.options.textNodeName, e), ""), e;
}
function We() {
	return this.stopNodeExpressionsSet.size === 0 ? !1 : this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function Ge(e, t, n = ">") {
	let r = 0, i = [], a = e.length, o = n.charCodeAt(0), s = n.length > 1 ? n.charCodeAt(1) : -1;
	for (let n = t; n < a; n++) {
		let t = e.charCodeAt(n);
		if (r) t === r && (r = 0);
		else if (t === 34 || t === 39) r = t;
		else if (t === o) if (s !== -1) {
			if (e.charCodeAt(n + 1) === s) return {
				data: String.fromCharCode(...i),
				index: n
			};
		} else return {
			data: String.fromCharCode(...i),
			index: n
		};
		else if (t === 9) {
			i.push(32);
			continue;
		}
		i.push(t);
	}
}
function N(e, t, n, r) {
	let i = e.indexOf(t, n);
	if (i === -1) throw Error(r);
	return i + t.length - 1;
}
function Ke(e, t, n, r) {
	let i = e.indexOf(t, n);
	if (i === -1) throw Error(r);
	return i;
}
function P(e, t, n, r = ">") {
	let i = Ge(e, t + 1, r);
	if (!i) return;
	let a = i.data, o = i.index, s = a.search(/\s/), c = a, l = !0;
	s !== -1 && (c = a.substring(0, s), a = a.substring(s + 1).trimStart());
	let u = c;
	if (n) {
		let e = c.indexOf(":");
		e !== -1 && (c = c.substr(e + 1), l = c !== i.data.substr(e + 1));
	}
	return {
		tagName: c,
		tagExp: a,
		closeIndex: o,
		attrExpPresent: l,
		rawTagName: u
	};
}
function qe(e, t, n) {
	let r = n, i = 1, a = e.length;
	for (; n < a; n++) if (e[n] === "<") {
		let a = e.charCodeAt(n + 1);
		if (a === 47) {
			let a = Ke(e, ">", n, `${t} is not closed`);
			if (e.substring(n + 2, a).trim() === t && (i--, i === 0)) return {
				tagContent: e.substring(r, n),
				i: a
			};
			n = a;
		} else if (a === 63) n = N(e, "?>", n + 1, "StopNode is not closed.");
		else if (a === 33 && e.charCodeAt(n + 2) === 45 && e.charCodeAt(n + 3) === 45) n = N(e, "-->", n + 3, "StopNode is not closed.");
		else if (a === 33 && e.charCodeAt(n + 2) === 91) n = N(e, "]]>", n, "StopNode is not closed.") - 2;
		else {
			let r = P(e, n, ">");
			r && ((r && r.tagName) === t && r.tagExp[r.tagExp.length - 1] !== "/" && i++, n = r.closeIndex);
		}
	}
}
function Je(e, t, n) {
	if (t && typeof e == "string") {
		let t = e.trim();
		return t === "true" ? !0 : t === "false" ? !1 : ge(e, n);
	} else if (c(e)) return e;
	else return "";
}
function F(e, t, n, r) {
	if (e) {
		let r = e(t);
		n === t && (n = r), t = r;
	}
	return t = Ye(t, r), {
		tagName: t,
		tagExp: n
	};
}
function Ye(e, t) {
	if (u.includes(e)) throw Error(`[SECURITY] Invalid name: "${e}" is a reserved JavaScript keyword that could cause prototype pollution`);
	return l.includes(e) ? t.onDangerousProperty(e) : e;
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/node2json.js
var I = S.getMetaDataSymbol();
function Xe(e, t) {
	if (!e || typeof e != "object") return {};
	if (!t) return e;
	let n = {};
	for (let r in e) if (r.startsWith(t)) {
		let i = r.substring(t.length);
		n[i] = e[r];
	} else n[r] = e[r];
	return n;
}
function Ze(e, t, n, r) {
	return L(e, t, n, r);
}
function L(e, t, n, r) {
	let i, a = {};
	for (let o = 0; o < e.length; o++) {
		let s = e[o], c = Qe(s);
		if (c !== void 0 && c !== t.textNodeName) {
			let e = Xe(s[":@"] || {}, t.attributeNamePrefix);
			n.push(c, e);
		}
		if (c === t.textNodeName) i === void 0 ? i = s[c] : i += "" + s[c];
		else if (c === void 0) continue;
		else if (s[c]) {
			let e = L(s[c], t, n, r), i = et(e, t);
			if (s[":@"] ? $e(e, s[":@"], r, t) : Object.keys(e).length === 1 && e[t.textNodeName] !== void 0 && !t.alwaysCreateTextNode ? e = e[t.textNodeName] : Object.keys(e).length === 0 && (t.alwaysCreateTextNode ? e[t.textNodeName] = "" : e = ""), s[I] !== void 0 && typeof e == "object" && e && (e[I] = s[I]), a[c] !== void 0 && Object.prototype.hasOwnProperty.call(a, c)) Array.isArray(a[c]) || (a[c] = [a[c]]), a[c].push(e);
			else {
				let n = t.jPath ? r.toString() : r;
				t.isArray(c, n, i) ? a[c] = [e] : a[c] = e;
			}
			c !== void 0 && c !== t.textNodeName && n.pop();
		}
	}
	return typeof i == "string" ? i.length > 0 && (a[t.textNodeName] = i) : i !== void 0 && (a[t.textNodeName] = i), a;
}
function Qe(e) {
	let t = Object.keys(e);
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (n !== ":@") return n;
	}
}
function $e(e, t, n, r) {
	if (t) {
		let i = Object.keys(t), a = i.length;
		for (let o = 0; o < a; o++) {
			let a = i[o], s = a.startsWith(r.attributeNamePrefix) ? a.substring(r.attributeNamePrefix.length) : a, c = r.jPath ? n.toString() + "." + s : n;
			r.isArray(a, c, !0, !0) ? e[a] = [t[a]] : e[a] = t[a];
		}
	}
}
function et(e, t) {
	let { textNodeName: n } = t, r = Object.keys(e).length;
	return !!(r === 0 || r === 1 && (e[n] || typeof e[n] == "boolean" || e[n] === 0));
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var tt = class {
	constructor(e) {
		this.externalEntities = {}, this.options = de(e);
	}
	parse(e, t) {
		if (typeof e != "string" && e.toString) e = e.toString();
		else if (typeof e != "string") throw Error("XML data is accepted in String or Bytes[] form.");
		if (t) {
			t === !0 && (t = {});
			let n = f(e, t);
			if (n !== !0) throw Error(`${n.err.msg}:${n.err.line}:${n.err.col}`);
		}
		let n = new Fe(this.options);
		n.entityReplacer.setExternalEntities(this.externalEntities);
		let r = n.parseXml(e);
		return this.options.preserveOrder || r === void 0 ? r : Ze(r, this.options, n.matcher, n.readonlyMatcher);
	}
	addEntity(e, t) {
		if (t.indexOf("&") !== -1) throw Error("Entity value can't have '&'");
		if (e.indexOf("&") !== -1 || e.indexOf(";") !== -1) throw Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
		if (t === "&") throw Error("An entity with value '&' is not permitted");
		this.externalEntities[e] = t;
	}
	static getMetaDataSymbol() {
		return S.getMetaDataSymbol();
	}
}, R = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	e: 0,
	f: 0
};
function z(e) {
	if (!e) return;
	let t = /([a-zA-Z]+)\s*\(([^)]*)\)/g, n = R, r = !1;
	for (let i of e.matchAll(t)) {
		let e = i[1], t = i[2];
		if (!e || !t) continue;
		let a = it(e.toLowerCase(), at(t));
		a && (r = !0, n = V(a, n));
	}
	if (r) return n;
}
function nt(e, t) {
	let n = [], { sx: r, sy: i, isSkewed: a, det: o, rotationDeg: s } = H(t);
	for (let c of e) switch (c.type) {
		case "M": {
			let e = B(t, c.x, c.y);
			n.push({
				type: "M",
				x: e.x,
				y: e.y
			});
			break;
		}
		case "L": {
			let e = B(t, c.x, c.y);
			n.push({
				type: "L",
				x: e.x,
				y: e.y
			});
			break;
		}
		case "C": {
			let e = B(t, c.x1, c.y1), r = B(t, c.x2, c.y2), i = B(t, c.x, c.y);
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
			let e = B(t, c.x1, c.y1), r = B(t, c.x, c.y);
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
			let e = B(t, c.x, c.y), l = c.xAxisRotation, u = c.sweep, d = c.rx * r, f = c.ry * i;
			a || (l += s, o < 0 && (u = !u)), n.push({
				type: "A",
				rx: d,
				ry: f,
				xAxisRotation: l,
				largeArc: c.largeArc,
				sweep: u,
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
function rt(e) {
	let { sx: t, sy: n } = H(e);
	return (t + n) / 2;
}
function it(e, t) {
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
				...R,
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
			let n = e * Math.PI / 180, r = Math.cos(n), i = Math.sin(n);
			if (t.length >= 3) {
				let e = t[1], n = t[2];
				return e === void 0 || n === void 0 ? null : V({
					...R,
					e,
					f: n
				}, V({
					a: r,
					b: i,
					c: -i,
					d: r,
					e: 0,
					f: 0
				}, {
					...R,
					e: -e,
					f: -n
				}));
			}
			return {
				a: r,
				b: i,
				c: -i,
				d: r,
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
function at(e) {
	return Array.from(e.matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g), (e) => Number(e[0])).filter((e) => Number.isFinite(e));
}
function B(e, t, n) {
	return {
		x: e.a * t + e.c * n + e.e,
		y: e.b * t + e.d * n + e.f
	};
}
function V(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		e: e.a * t.e + e.c * t.f + e.e,
		f: e.b * t.e + e.d * t.f + e.f
	};
}
function H(e) {
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
//#region src/quality.ts
var ot = .125;
function st(e) {
	return e?.curveTolerance ?? .125;
}
function ct(e) {
	return e?.curveResolution;
}
function lt(e) {
	if (!e) return !1;
	let t = e.pathDetailThreshold;
	return !Number.isFinite(t) || t === void 0 || t <= 0 ? !1 : (e.pathDetailThreshold = 0, !0);
}
//#endregion
//#region src/native-shape.ts
var ut = 512, U = /* @__PURE__ */ new Map();
function dt(e, t) {
	let n = e.toLowerCase();
	if (n === "circle") {
		let e = X(t.cx, 0), n = X(t.cy, 0), r = Y(t.r);
		return r === void 0 || r <= 0 ? void 0 : J({
			kind: "circle",
			cx: e,
			cy: n,
			r
		}, t.transform);
	}
	if (n === "ellipse") {
		let e = X(t.cx, 0), n = X(t.cy, 0), r = Y(t.rx), i = Y(t.ry);
		return r === void 0 || i === void 0 || r <= 0 || i <= 0 ? void 0 : J({
			kind: "ellipse",
			cx: e,
			cy: n,
			rx: r,
			ry: i
		}, t.transform);
	}
}
function ft(e, t, n, r) {
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
function pt(e, t, n, r) {
	let { cx: i, cy: a, rx: o, ry: s } = W(t), c = n.fill === null ? 0 : n.fillAlpha * n.opacity, l = n.stroke === null ? 0 : n.strokeAlpha * n.opacity;
	if (n.fill !== null && c > 0) {
		e.fillStyle(n.fill, c);
		let t = K(o, s, r?.curveTolerance);
		e.fillEllipse(i, a, o * 2, s * 2, t);
	}
	n.stroke !== null && n.strokeWidth > 0 && l > 0 && mt(e, t, n.stroke, l, n.strokeWidth, r?.curveTolerance);
}
function W(e) {
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
function mt(e, t, n, r, i, a) {
	let { cx: o, cy: s, rx: c, ry: l } = W(t), u = i / 2, d = c + u, f = l + u, p = c - u, m = l - u;
	if (e.fillStyle(n, r), p <= 0 || m <= 0) {
		let t = K(d, f, a);
		e.fillEllipse(o, s, d * 2, f * 2, t);
		return;
	}
	let h = K(d, f, a), g = G(d, f, h), _ = G(p, m, h);
	for (let t = 0; t < h; t++) {
		let n = (t + 1) % h, r = g[t], i = g[n], a = _[t], c = _[n];
		!r || !i || !a || !c || (e.fillTriangle(r.x + o, r.y + s, i.x + o, i.y + s, c.x + o, c.y + s), e.fillTriangle(r.x + o, r.y + s, c.x + o, c.y + s, a.x + o, a.y + s));
	}
}
function G(e, t, n) {
	let r = `${n}|${e}|${t}`, i = U.get(r);
	if (i) return i;
	let a = [], o = Math.PI * 2 / n;
	for (let r = 0; r < n; r++) {
		let n = r * o;
		a.push({
			x: e * Math.cos(n),
			y: t * Math.sin(n)
		});
	}
	if (U.size >= ut) {
		let e = U.keys().next().value;
		e !== void 0 && U.delete(e);
	}
	return U.set(r, a), a;
}
function K(e, t, n = ot) {
	let r = Math.max(Math.abs(e), Math.abs(t));
	if (r <= 0) return 24;
	let i = q(1 - q(n, 1e-4, r) / r, -1, 1), a = 2 * Math.acos(i), o = Number.isFinite(a) && a > 0 ? a : Math.PI / 16;
	return q(Math.ceil(Math.PI * 2 / o), 24, 512);
}
function q(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function J(e, t) {
	let n = ht(t);
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
function ht(e) {
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
function Y(e, t) {
	if (e === void 0) return t;
	let n = Number.parseFloat(e);
	return Number.isFinite(n) ? n : t;
}
function X(e, t) {
	let n = Y(e);
	return n === void 0 ? t : n;
}
//#endregion
//#region src/path-parser.ts
function gt(e) {
	return bt(yt(e));
}
var _t = /^[MmLlHhVvCcSsQqTtAaZz]/, vt = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
function yt(t) {
	let n = [], r = 0;
	for (; r < t.length;) {
		for (; r < t.length && (t[r] === " " || t[r] === "	" || t[r] === "\n" || t[r] === "\r" || t[r] === ",");) r++;
		if (r >= t.length) break;
		let i = e(t[r], `Expected character at index ${r}`);
		if (_t.test(i)) {
			n.push({
				type: "command",
				value: i
			}), r++;
			continue;
		}
		let a = t.slice(r), o = vt.exec(a);
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
function bt(t) {
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
var xt = new Set([
	"fill",
	"fill-opacity",
	"stroke",
	"stroke-opacity",
	"stroke-width",
	"stroke-linejoin",
	"stroke-linecap",
	"stroke-miterlimit"
]);
function St(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) xt.has(n) && (t[n] = r);
	return t;
}
//#endregion
//#region src/types.ts
var Ct = {
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
function wt(e) {
	let t = { ...Ct }, r = e.fill;
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
function Tt(e, t) {
	let n = e.toLowerCase(), r;
	if (n === "path" ? r = t.d : n === "rect" ? r = Et(t) : n === "circle" ? r = Dt(t) : n === "ellipse" ? r = Ot(t) : n === "line" ? r = kt(t) : n === "polyline" ? r = Z(t) : n === "polygon" && (r = At(t)), r) return {
		d: r,
		style: wt(t)
	};
}
function Et(e) {
	let t = $(e.x, 0), n = $(e.y, 0), r = Q(e.width), i = Q(e.height);
	if (r === void 0 || i === void 0 || r <= 0 || i <= 0) return;
	let { rx: a, ry: o } = Mt(e, r, i), s = t + r, c = n + i;
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
function Dt(e) {
	let t = $(e.cx, 0), n = $(e.cy, 0), r = Q(e.r);
	if (r === void 0 || r <= 0) return;
	let i = t - r, a = t + r;
	return [
		`M ${a} ${n}`,
		`A ${r} ${r} 0 1 0 ${i} ${n}`,
		`A ${r} ${r} 0 1 0 ${a} ${n}`,
		"Z"
	].join(" ");
}
function Ot(e) {
	let t = $(e.cx, 0), n = $(e.cy, 0), r = Q(e.rx), i = Q(e.ry);
	if (r === void 0 || i === void 0 || r <= 0 || i <= 0) return;
	let a = t - r, o = t + r;
	return [
		`M ${o} ${n}`,
		`A ${r} ${i} 0 1 0 ${a} ${n}`,
		`A ${r} ${i} 0 1 0 ${o} ${n}`,
		"Z"
	].join(" ");
}
function kt(e) {
	return `M ${$(e.x1, 0)} ${$(e.y1, 0)} L ${$(e.x2, 0)} ${$(e.y2, 0)}`;
}
function Z(e) {
	let t = jt(e.points);
	if (!t || t.length < 2) return;
	let n = t[0];
	if (n) return [`M ${n.x} ${n.y}`, ...t.slice(1).map((e) => `L ${e.x} ${e.y}`)].join(" ");
}
function At(e) {
	let t = Z(e);
	if (t) return `${t} Z`;
}
function jt(e) {
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
function Mt(e, t, n) {
	let r = Q(e.rx), i = Q(e.ry);
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
function Q(e, t) {
	if (e === void 0) return t;
	let n = Number.parseFloat(e);
	return Number.isFinite(n) ? n : t;
}
function $(e, t) {
	let n = Q(e);
	return n === void 0 ? t : n;
}
//#endregion
//#region src/svg-structure.ts
var Nt = [
	"defs",
	"clipPath",
	"mask",
	"pattern",
	"symbol",
	"marker",
	"linearGradient",
	"radialGradient"
];
Nt.join(",");
function Pt(e) {
	return Nt.includes(e);
}
//#endregion
//#region src/compiler.ts
var Ft = new Set([
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polyline",
	"polygon"
]), It = new tt({
	preserveOrder: !0,
	ignoreAttributes: !1,
	attributeNamePrefix: "",
	textNodeName: "#text",
	trimValues: !1
});
function Lt(e, t) {
	let n = Bt(e);
	if (!n) return {
		viewBox: null,
		msaaSamples: t?.msaaSamples,
		items: []
	};
	let r = qt(n.attrs) ?? null, i = [], a = {
		inheritedStyleAttrs: St(n.attrs),
		opacityMultiplier: Kt(n.attrs.opacity),
		transform: z(n.attrs.transform)
	};
	for (let e of n.children) Rt(e, a, i);
	return {
		viewBox: r,
		msaaSamples: t?.msaaSamples,
		items: i
	};
}
function Rt(e, t, n) {
	let r = Yt(e.tagName);
	if (Pt(r)) return;
	let i = {
		inheritedStyleAttrs: Ut(t.inheritedStyleAttrs, e.attrs),
		opacityMultiplier: t.opacityMultiplier * Kt(e.attrs.opacity),
		transform: Wt(t.transform, z(e.attrs.transform))
	};
	if (Ft.has(r)) {
		let t = zt(r, e.attrs, i);
		t && n.push(t);
		return;
	}
	for (let t of e.children) Rt(t, i, n);
}
function zt(e, t, n) {
	let r = {
		...n.inheritedStyleAttrs,
		...t
	};
	delete r.transform, delete r.opacity;
	let i = { ...t };
	delete i.transform, delete i.opacity;
	let a = dt(e, i), o = Tt(e, r);
	if (!o) return;
	let s = o.style;
	if (s.opacity *= n.opacityMultiplier, a && n.transform === void 0) return {
		kind: "native",
		shape: a,
		style: s
	};
	let c = gt(o.d);
	return n.transform && (c = nt(c, n.transform), s.strokeWidth *= rt(n.transform)), {
		kind: "path",
		commands: c,
		style: s
	};
}
function Bt(e) {
	let t = It.parse(e);
	if (Array.isArray(t)) for (let e of t) {
		let t = Vt(e);
		if (t && Yt(t.tagName) === "svg") return t;
	}
}
function Vt(e) {
	let t = Ht(e);
	for (let [n, r] of Object.entries(e)) {
		if (n === ":@" || n.startsWith("#") || !Array.isArray(r)) continue;
		let e = [];
		for (let t of r) {
			let n = Vt(t);
			n && e.push(n);
		}
		return {
			tagName: n,
			attrs: t,
			children: e
		};
	}
}
function Ht(e) {
	let t = e[":@"];
	return t ? { ...t } : {};
}
function Ut(e, t) {
	let n = St(t);
	return Object.keys(n).length === 0 ? e : {
		...e,
		...n
	};
}
function Wt(e, t) {
	let n = e && t ? V(e, t) : e ?? t;
	if (!(!n || Gt(n))) return n;
}
function Gt(e) {
	return Math.abs(e.a - 1) < 1e-12 && Math.abs(e.b) < 1e-12 && Math.abs(e.c) < 1e-12 && Math.abs(e.d - 1) < 1e-12 && Math.abs(e.e) < 1e-12 && Math.abs(e.f) < 1e-12;
}
function Kt(e) {
	if (e === void 0) return 1;
	let t = Number(e);
	return Number.isFinite(t) ? Jt(t, 0, 1) : 1;
}
function qt(e) {
	let t = e.viewBox;
	if (!t) return;
	let n = t.trim().split(/[\s,]+/);
	if (n.length !== 4) return;
	let r = Number(n[0]), i = Number(n[1]), a = Number(n[2]), o = Number(n[3]);
	if (!(!Number.isFinite(r) || !Number.isFinite(i) || !Number.isFinite(a) || !Number.isFinite(o) || a <= 0 || o <= 0)) return {
		minX: r,
		minY: i,
		width: a,
		height: o
	};
}
function Jt(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Yt(e) {
	let t = e.indexOf(":");
	return (t >= 0 ? e.slice(t + 1) : e).toLowerCase();
}
//#endregion
export { gt as a, lt as c, n as d, e as f, Ct as i, ct as l, Tt as n, pt as o, wt as r, ft as s, Lt as t, st as u };
