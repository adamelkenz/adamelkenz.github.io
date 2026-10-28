import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, lerp, money} from '../components/anim';
import {ANTON} from '../components/fonts';
import {Captions, Grain, Line} from '../components/layers';
import {A} from './art';
import {SCENES} from './scenes';
import timeline from './timeline.json';

const lines = timeline.lines as Line[];
const NO_CAPTIONS = [8];

const wordFrame = (line: Line, text: string) => line.from + (line.words.find((w) => w.text.toLowerCase().startsWith(text))?.frame ?? 0);
const HUD_FROM = wordFrame(lines[0], 'et');
const FAIL = wordFrame(lines[0], "s'arrêtent");
const HUD_TO = lines[6].from;

/** Flight instruments that stay on screen through the main story. */
const Hud = () => {
	const frame = useCurrentFrame();
	if (frame < HUD_FROM || frame >= HUD_TO) return null;
	const glide = ease(frame, FAIL, HUD_TO, (x) => x);
	const alt = Math.round(lerp(glide, 11000, 2600) / 10) * 10;
	const speed = Math.round(lerp(ease(frame, FAIL, FAIL + 120), 850, 460));
	const failed = frame >= FAIL;
	const box = (label: string, value: string, color: string) => (
		<div style={{background: 'rgba(5,9,18,0.72)', border: `3px solid ${color}55`, borderRadius: 18, padding: '8px 18px', minWidth: 230}}>
			<div style={{fontFamily: ANTON, fontSize: 26, color: A.grey, letterSpacing: 2}}>{label}</div>
			<div style={{fontFamily: ANTON, fontSize: 52, color}}>{value}</div>
		</div>
	);
	return (
		<div style={{position: 'absolute', top: 40, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', opacity: ease(frame, HUD_FROM, HUD_FROM + 8)}}>
			{box('ALTITUDE', `${money(alt)} M`, failed ? A.amber : A.white)}
			{box('VITESSE', `${speed} KM/H`, A.white)}
			<div style={{background: 'rgba(5,9,18,0.72)', border: `3px solid ${failed ? A.red : A.green}55`, borderRadius: 18, padding: '8px 18px'}}>
				<div style={{fontFamily: ANTON, fontSize: 26, color: A.grey, letterSpacing: 2}}>MOTEURS</div>
				<div style={{display: 'flex', gap: 12, marginTop: 10}}>
					{[0, 1].map((i) => (
						<div key={i} style={{width: 34, height: 34, borderRadius: 99, background: failed ? A.red : A.green, opacity: failed && Math.floor(frame / 8) % 2 ? 0.4 : 1, boxShadow: `0 0 16px ${failed ? A.red : A.green}`}} />
					))}
				</div>
			</div>
		</div>
	);
};

export const Avion = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: A.ink, overflow: 'hidden'}}>
			{lines.map((line, i) => {
				const Scene = SCENES[i];
				const last = i === lines.length - 1;
				return (
					<Sequence key={i} from={line.from} durationInFrames={last ? durationInFrames - line.from : line.durationInFrames} name={`${i} ${line.text.slice(0, 24)}`}>
						<Scene line={line} />
						<Html5Audio src={staticFile(line.voice)} volume={1} />
					</Sequence>
				);
			})}
			<Hud />
			<Captions lines={lines} hide={NO_CAPTIONS} top={1440} accent={A.amber} />
			<Grain opacity={0.04} />
			<Html5Audio
				src={staticFile('sfx-real/music-lofi.mp3')}
				volume={(f) => interpolate(f, [0, 10, durationInFrames - 45, durationInFrames], [0, 0.06, 0.06, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
		</AbsoluteFill>
	);
};
