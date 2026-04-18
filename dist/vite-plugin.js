import { t as e } from "./compiler-Bf50Ib84.js";
import { readFile as t } from "node:fs/promises";
//#region src/vite-plugin.ts
function n(n = {}) {
	return {
		name: "phaser-svg",
		enforce: "pre",
		async load(r) {
			if (!r.endsWith(".svg")) return null;
			let i = e(await t(r, "utf-8"), { msaaSamples: n.msaaSamples });
			return `export default ${JSON.stringify(i)};`;
		}
	};
}
//#endregion
export { n as phaserSVG };
