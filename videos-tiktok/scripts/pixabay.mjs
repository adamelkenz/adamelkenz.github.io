// Searches Pixabay and downloads royalty-free photos or videos into public/<video>/stock.
// Needs PIXABAY_API_KEY in the environment (never commit it).
//
// Usage:
//   node scripts/pixabay.mjs search videos "haunted house"     # list results
//   node scripts/pixabay.mjs get videos <id> halloween manoir  # save public/halloween/stock/manoir.mp4
//   node scripts/pixabay.mjs get photos <id> halloween manoir  # save public/halloween/stock/manoir.jpg

import {mkdirSync, writeFileSync} from 'node:fs';

const KEY = process.env.PIXABAY_API_KEY;
if (!KEY) {
	console.error('PIXABAY_API_KEY is not set');
	process.exit(1);
}

const [cmd, kind, arg, video, name] = process.argv.slice(2);
const base = kind === 'videos' ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/';

const api = async (params) => {
	const url = `${base}?${new URLSearchParams({key: KEY, safesearch: 'true', ...params})}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Pixabay ${res.status}: ${await res.text()}`);
	return res.json();
};

if (cmd === 'search') {
	const params = {q: arg, per_page: '20'};
	if (kind === 'photos') params.orientation = 'vertical';
	const {hits} = await api(params);
	for (const h of hits) {
		const size = kind === 'videos' ? `${h.videos.large.width}x${h.videos.large.height} ${h.duration}s` : `${h.imageWidth}x${h.imageHeight}`;
		console.log(`${h.id}\t${size}\t${h.tags}`);
	}
} else if (cmd === 'get') {
	const {hits} = await api({id: arg});
	const h = hits[0];
	if (!h) throw new Error(`No ${kind} with id ${arg}`);
	const src = kind === 'videos' ? (h.videos.large.url || h.videos.medium.url) : h.largeImageURL;
	const ext = kind === 'videos' ? 'mp4' : 'jpg';
	const dir = `public/${video}/stock`;
	mkdirSync(dir, {recursive: true});
	const file = `${dir}/${name}.${ext}`;
	writeFileSync(file, Buffer.from(await (await fetch(src)).arrayBuffer()));
	console.log(`${file}  (Pixabay #${h.id} by ${h.user})`);
} else {
	console.error('Usage: node scripts/pixabay.mjs search|get photos|videos …');
	process.exit(1);
}
