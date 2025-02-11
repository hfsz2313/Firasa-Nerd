import { CliProc, Ot } from "ot-builder";

import { dropCharacters, dropFeature, dropHints } from "../helpers/drop.mjs";
import { readFont, writeFont } from "../helpers/font-io.mjs";
import { isFEMisc, isLongDash, isWS, isWestern } from "../helpers/unicode-kind.mjs";

import { transferMonoGeometry } from "./lgc-helpers.mjs";
import { sanitizeSymbols, toPWID } from "./sanitize-symbols.mjs";

export default pass;
async function pass(argv) {
	const main = await readFont(argv.main);
	const lgc = await readFont(argv.lgc);

	dropHints(main);
	dropCharacters(main, c => isWestern(c) || isLongDash(c, argv.term) || !isWS(c) || isFEMisc(c));
	if (argv.pwid) toPWID(main);
	if (argv.mono) transferMonoGeometry(main, lgc);
	if (!argv.pwid) sanitizeSymbols(main, argv.goth, !argv.pwid && !argv.term);

	dropFeature(main.gsub, ["ccmp", "aalt", "pwid", "fwid", "hwid", "twid", "qwid"]);
	if (argv.mono) {
		dropFeature(main.gsub, ["locl"]);
		dropFeature(main.gpos, ["kern", "vkrn", "palt", "vpal"]);
	}

	CliProc.gcFont(main, Ot.ListGlyphStoreFactory);
	await writeFont(argv.o, main);
}
