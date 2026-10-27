// Renders a composition, then normalises loudness for TikTok (-14 LUFS).
// Usage: node scripts/render.mjs <CompositionId> <out.mp4> [extra remotion args]
import {execFileSync} from 'node:child_process';
import {existsSync, renameSync, rmSync} from 'node:fs';

const [id, out, ...extra] = process.argv.slice(2);
const browser = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const raw = out.replace(/\.mp4$/, '.raw.mp4');
const args = ['remotion', 'render', 'src/index.ts', id, raw, '--crf=21', ...extra];
if (existsSync(browser)) args.push(`--browser-executable=${browser}`);
execFileSync('npx', args, {stdio: 'inherit'});
execFileSync('ffmpeg', ['-nostdin', '-loglevel', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', out], {stdio: 'inherit'});
rmSync(raw);
console.log(`Done: ${out}`);
