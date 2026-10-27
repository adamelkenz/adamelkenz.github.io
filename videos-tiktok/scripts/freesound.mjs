// Searches Freesound (CC0 only by default) and downloads HQ previews into public/sfx-real.
// Needs FREESOUND_API_KEY in the environment (never commit it).
//
// Usage:
//   node scripts/freesound.mjs search "door creak"        # list CC0 results
//   node scripts/freesound.mjs search "crowd party" all   # any licence (check attribution!)
//   node scripts/freesound.mjs get <id> door-creak        # save public/sfx-real/door-creak.mp3

import {appendFileSync, mkdirSync, writeFileSync} from 'node:fs';

const KEY = process.env.FREESOUND_API_KEY;
if (!KEY) {
	console.error('FREESOUND_API_KEY is not set');
	process.exit(1);
}

const API = 'https://freesound.org/apiv2';
const api = async (path, params = {}) => {
	const res = await fetch(`${API}${path}?${new URLSearchParams({token: KEY, ...params})}`);
	if (!res.ok) throw new Error(`Freesound ${res.status}: ${await res.text()}`);
	return res.json();
};

const [cmd, arg, extra] = process.argv.slice(2);

if (cmd === 'search') {
	const params = {query: arg, fields: 'id,name,duration,license,username,avg_rating', page_size: '20', sort: 'rating_desc'};
	if (extra !== 'all') params.filter = 'license:"Creative Commons 0"';
	const {count, results} = await api('/search/text/', params);
	console.log(`${count} results`);
	for (const r of results) console.log(`${r.id}\t${r.duration.toFixed(1)}s\t★${r.avg_rating.toFixed(1)}\t${r.name}\t(${r.username})`);
} else if (cmd === 'get') {
	const s = await api(`/sounds/${arg}/`, {fields: 'id,name,license,username,url,previews'});
	const dir = 'public/sfx-real';
	mkdirSync(dir, {recursive: true});
	const file = `${dir}/${extra}.mp3`;
	writeFileSync(file, Buffer.from(await (await fetch(s.previews['preview-hq-mp3'])).arrayBuffer()));
	// Keep a credit line per sound, needed for non-CC0 licences.
	appendFileSync(`${dir}/CREDITS.txt`, `${extra}.mp3 — "${s.name}" by ${s.username} (${s.license}) ${s.url}\n`);
	console.log(`${file}  (${s.license})`);
} else {
	console.error('Usage: node scripts/freesound.mjs search|get …');
	process.exit(1);
}
