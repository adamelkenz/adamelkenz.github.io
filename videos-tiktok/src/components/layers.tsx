import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ease, pop} from './anim';
import {SANS} from './fonts';

export type Word = {text: string; frame: number};
export type Line = {text: string; voice: string; from: number; durationInFrames: number; voiceFrames: number; words: Word[]};

/** Film grain (pre-rendered noise tiles, cycled) + vignette on top of everything. */
export const Grain = ({opacity = 0.06}: {opacity?: number}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<Img
				src={staticFile(`fx/grain-${Math.floor(frame / 2) % 6}.png`)}
				style={{position: 'absolute', width: '100%', height: '100%', opacity, mixBlendMode: 'overlay', imageRendering: 'pixelated'}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)'}} />
		</AbsoluteFill>
	);
};

/** Slow drifting fog blobs (soft radial gradients, no blur filter so it renders fast). */
export const Fog = ({color = '120, 80, 170', alpha = 0.2, count = 5}: {color?: string; alpha?: number; count?: number}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
			{Array.from({length: count}).map((_, i) => {
				const x = ((i * 380 + frame * (0.6 + i * 0.25)) % 1900) - 700;
				const y = 150 + i * 330 + Math.sin(frame / 60 + i) * 40;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: 1200,
							height: 700,
							background: `radial-gradient(ellipse at center, rgba(${color}, ${alpha}), rgba(${color}, 0) 70%)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

type Transition = 'punch' | 'whip' | 'drop' | 'flash' | 'fade' | 'none';

/** Wraps a scene: entrance transition + slow push-in so nothing ever sits still. */
export const Shot = ({children, transition = 'punch', push = 0.05, len = 400, flashColor = '#fff'}: {children: React.ReactNode; transition?: Transition; push?: number; len?: number; flashColor?: string}) => {
	const f = useCurrentFrame();
	const p = pop(f, 0, {damping: 16, stiffness: 160, mass: 0.7});
	let transform = '';
	let filter = '';
	if (transition === 'punch') {
		transform = `scale(${1.3 - 0.3 * p})`;
		filter = `blur(${Math.max(0, (1 - ease(f, 0, 7)) * 14)}px)`;
	} else if (transition === 'whip') {
		transform = `translateX(${(1 - ease(f, 0, 9)) * 1080}px)`;
		filter = `blur(${Math.max(0, (1 - ease(f, 0, 9)) * 22)}px)`;
	} else if (transition === 'drop') {
		transform = `translateY(${(1 - p) * -1920}px)`;
	}
	// Slow, cinematic entrance: soft cross-fade from black with a gentle settle.
	const fade = transition === 'fade' ? ease(f, 0, 18) : 1;
	if (transition === 'fade') transform = `scale(${1.04 - 0.04 * fade})`;
	const scale = 1 + push * Math.min(1, f / len);
	const flash = transition === 'flash' || transition === 'punch' ? 1 - ease(f, 0, 6) : 0;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `${transform} scale(${scale})`, filter, opacity: fade}}>{children}</AbsoluteFill>
			{flash > 0 && <AbsoluteFill style={{background: flashColor, opacity: flash * (transition === 'flash' ? 0.9 : 0.35)}} />}
		</AbsoluteFill>
	);
};

const isBreak = (w: string) => /[….?!:,;]$/.test(w);

/** TikTok-style captions: 1–3 words at a time, the spoken word lit up. */
export const Captions = ({lines, hide = [], top = 1330, accent = '#FFC94D'}: {lines: Line[]; hide?: number[]; top?: number; accent?: string}) => {
	const frame = useCurrentFrame();
	const index = lines.findIndex((l) => frame >= l.from && frame < l.from + l.durationInFrames);
	if (index < 0 || hide.includes(index)) return null;
	const line = lines[index];
	const f = frame - line.from;

	const chunks: Word[][] = [];
	let cur: Word[] = [];
	for (const w of line.words) {
		cur.push(w);
		if (cur.length === 3 || isBreak(w.text)) {
			chunks.push(cur);
			cur = [];
		}
	}
	if (cur.length) chunks.push(cur);

	let ci = 0;
	for (let i = 0; i < chunks.length; i++) if (f >= chunks[i][0].frame - 2) ci = i;
	const chunk = chunks[ci];
	if (f > line.voiceFrames + 4) return null;
	const enter = pop(f, chunk[0].frame - 2, {damping: 12, stiffness: 260, mass: 0.5});

	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 70,
				right: 70,
				display: 'flex',
				justifyContent: 'center',
				flexWrap: 'wrap',
				gap: '4px 0',
				transform: `scale(${0.8 + 0.2 * enter})`,
				opacity: enter,
			}}
		>
			{chunk.map((w, i) => {
				const on = f >= w.frame - 1;
				return (
					<span
						key={i}
						style={{
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 76,
							textTransform: 'uppercase',
							color: on ? accent : '#FFFFFF',
							transform: on ? 'translateY(-4px) scale(1.06)' : 'none',
							WebkitTextStroke: '10px #000',
							paintOrder: 'stroke fill',
							textShadow: '0 6px 0 rgba(0,0,0,0.9)',
							display: 'inline-block',
							margin: '0 24px',
							letterSpacing: -1,
						}}
					>
						{w.text.replace(/ /g, ' ')}
					</span>
				);
			})}
		</div>
	);
};

/** Finds a word's frame inside a line by its first letters (n = occurrence). */
export const wordAt = (line: Line) => (prefix: string, n = 0) => {
	const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	const hits = line.words.filter((w) => norm(w.text).startsWith(norm(prefix)));
	const hit = hits[n] ?? hits[hits.length - 1];
	if (!hit) throw new Error(`Word "${prefix}" not found in: ${line.text}`);
	return hit.frame;
};
