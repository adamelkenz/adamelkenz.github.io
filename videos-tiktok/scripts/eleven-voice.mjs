// Generates the voice-over with ElevenLabs, one clip per line of src/<video>/lines.json,
// plus the per-character timing ElevenLabs returns (used for word-exact captions).
// Needs ELEVENLABS_API_KEY in the environment (never commit it).
//
// Usage: node scripts/eleven-voice.mjs <video> [voiceId] [onlyLineIndex]

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
	console.error('ELEVENLABS_API_KEY is not set');
	process.exit(1);
}

const [video, voiceArg, only] = process.argv.slice(2);
const configFile = `src/${video}/voice.json`;
const config = existsSync(configFile) ? JSON.parse(readFileSync(configFile, 'utf8')) : {};
const voiceId = voiceArg || config.voiceId || 'nPczCjzI2devNBz1zQrb';
const settings = config.settings ?? {stability: 0.5, similarity_boost: 0.8, style: 0.2, speed: 0.95};
const lines = JSON.parse(readFileSync(`src/${video}/lines.json`, 'utf8'));
const out = `public/${video}/voice`;
mkdirSync(out, {recursive: true});

let used = 0;
for (let i = 0; i < lines.length; i++) {
	if (only !== undefined && Number(only) !== i) continue;
	const n = String(i).padStart(2, '0');
	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
		body: JSON.stringify({
			text: lines[i],
			model_id: config.model ?? 'eleven_multilingual_v2',
			voice_settings: settings,
			// Neighbouring lines keep the intonation continuous across clips.
			previous_text: lines[i - 1],
			next_text: lines[i + 1],
		}),
	});
	if (!res.ok) throw new Error(`Line ${i}: ElevenLabs ${res.status} ${await res.text()}`);
	const data = await res.json();
	writeFileSync(`${out}/line-${n}.mp3`, Buffer.from(data.audio_base64, 'base64'));
	writeFileSync(`${out}/line-${n}.json`, JSON.stringify(data.alignment));
	used += lines[i].length;
	console.log(`line ${n} ok`);
}
console.log(`~${used} characters used`);
