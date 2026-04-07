import { t as e } from "./compiler-W9Zoqo_A.js";
import { readFile as t } from "node:fs/promises";
//#region src/vite-plugin.ts
function n() {
	return {
		name: "phaser-svg",
		enforce: "pre",
		async load(n) {
			if (!n.endsWith(".svg")) return null;
			let r = e(await t(n, "utf-8"));
			return `export default ${JSON.stringify(r)};`;
		}
	};
}
//#endregion
export { n as phaserSVG };
