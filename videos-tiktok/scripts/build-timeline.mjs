// Builds src/<video>/timeline.json from the voice clips in public/<video>/voice.
// Each line gets its start frame, length, and an estimated start frame per word,
// so scenes and captions can be keyed to what is being said.
//
// Word timing: exact when the TTS provided a character alignment (line-XX.json,
// scaled by the tempo in src/<video>/voice.json). Otherwise pauses in the clip
// (silencedetect) are matched to the punctuation in the line, then words are
// spread inside each spoken chunk by length.
//
// Usage: node scripts/build-timeline.mjs halloween

import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';

const FPS = 30;
const video = process.argv[2];
const lines = JSON.parse(readFileSync(`src/${video}/lines.json`, 'utf8'));
const config = JSON.parse(readFileSync(`src/${video}/timing.json`, 'utf8'));

const probeDuration = (file) =>
	Number(
		execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
			.toString()
			.trim(),
	);

const silencesOf = (file) => {
	// silencedetect reports on stderr.
	const {stderr} = spawnSync(
		'ffmpeg',
		['-nostdin', '-i', file, '-af', 'silencedetect=n=-38dB:d=0.11', '-f', 'null', '-'],
		{encoding: 'utf8'},
	);
	const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
	const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
	return starts.map((s, i) => [s, ends[i] ?? Infinity]);
};

const MAJOR = /[….?!:]$/;
const MINOR = /[,;]$/;

const wordTimes = (text, duration, silences) => {
	// French puts a space before ? : ! — keep those marks on the previous word.
	const words = [];
	for (const token of text.split(/\s+/).filter(Boolean)) {
		if (words.length && !/[\p{L}\p{N}]/u.test(token)) words[words.length - 1] += `\u00a0${token}`;
		else words.push(token);
	}
	// Spoken region: trim leading and trailing silence.
	let speechStart = 0;
	let speechEnd = duration;
	const inner = [];
	for (const [s, e] of silences) {
		if (s <= 0.02) speechStart = Math.min(e, duration);
		else if (e >= duration - 0.02) speechEnd = s;
		else inner.push([s, e]);
	}

	// Candidate break points after words, strongest first when we must choose.
	const breaks = words
		.map((w, i) => ({i, weight: MAJOR.test(w) ? 2 : MINOR.test(w) ? 1 : 0}))
		.filter((b) => b.weight > 0 && b.i < words.length - 1);

	let chosen = [];
	if (inner.length > 0) {
		if (inner.length === breaks.length) chosen = breaks;
		else {
			const majors = breaks.filter((b) => b.weight === 2);
			if (inner.length === majors.length) chosen = majors;
		}
	}

	// Chunks of words with their spoken interval.
	const chunks = [];
	if (chosen.length) {
		let first = 0;
		let t0 = speechStart;
		chosen.forEach((b, k) => {
			chunks.push({from: first, to: b.i, t0, t1: inner[k][0]});
			first = b.i + 1;
			t0 = inner[k][1];
		});
		chunks.push({from: first, to: words.length - 1, t0, t1: speechEnd});
	} else {
		chunks.push({from: 0, to: words.length - 1, t0: speechStart, t1: speechEnd, pauses: true});
	}

	const times = [];
	for (const c of chunks) {
		const span = words.slice(c.from, c.to + 1);
		// Weight = letters + a pause bonus after punctuation (only when pauses weren't detected).
		const weights = span.map((w) => {
			let x = w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.5;
			if (c.pauses && MAJOR.test(w)) x += 5;
			else if (c.pauses && MINOR.test(w)) x += 2;
			return x;
		});
		const total = weights.reduce((a, b) => a + b, 0);
		let acc = 0;
		span.forEach((w, k) => {
			times.push(c.t0 + ((c.t1 - c.t0) * acc) / total);
			acc += weights[k];
		});
	}
	return {words, times, speechStart, speechEnd};
};

/** Word start times from a per-character alignment (ElevenLabs `with-timestamps`). */
const alignedWordTimes = (text, alignment, tempo) => {
	const {words} = wordTimes(text, 1, []);
	const chars = alignment.characters.join('');
	const times = [];
	let pos = 0;
	for (const w of words) {
		const first = w.replace(/\u00a0.*/, '');
		const at = chars.indexOf(first, pos);
		const idx = at >= 0 ? at : pos;
		times.push(alignment.character_start_times_seconds[Math.min(idx, chars.length - 1)] / tempo);
		pos = idx + first.length;
	}
	return {words, times};
};

const voiceConfigFile = `src/${video}/voice.json`;
const tempo = existsSync(voiceConfigFile) ? JSON.parse(readFileSync(voiceConfigFile, 'utf8')).tempo ?? 1 : 1;

let cursor = config.leadIn ?? 0;
const out = {fps: FPS, lines: []};
lines.forEach((text, i) => {
	const n = String(i).padStart(2, '0');
	const file = `public/${video}/voice/line-${n}.wav`;
	const duration = probeDuration(file);
	const alignmentFile = `public/${video}/voice/line-${n}.json`;
	const {words, times} = existsSync(alignmentFile)
		? alignedWordTimes(text, JSON.parse(readFileSync(alignmentFile, 'utf8')), tempo)
		: wordTimes(text, duration, silencesOf(file));
	const gap = config.gapAfter?.[i] ?? config.gap ?? 0.25;
	const voiceFrames = Math.ceil(duration * FPS);
	const durationInFrames = voiceFrames + Math.round(gap * FPS);
	out.lines.push({
		text,
		voice: `${video}/voice/line-${n}.wav`,
		from: cursor,
		durationInFrames,
		voiceFrames,
		words: words.map((w, k) => ({text: w, frame: Math.round(times[k] * FPS)})),
	});
	cursor += durationInFrames;
});
out.durationInFrames = cursor + Math.round((config.tail ?? 1) * FPS);

writeFileSync(`src/${video}/timeline.json`, JSON.stringify(out, null, '\t') + '\n');
console.log(`${out.lines.length} lines, ${(out.durationInFrames / FPS).toFixed(1)} s`);
