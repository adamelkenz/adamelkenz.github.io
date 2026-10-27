import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, lerp, rand} from '../components/anim';
import {ANTON} from '../components/fonts';
import {Line} from '../components/layers';
import {R} from './scenes';

/** Where each line of the script sits in time, in months after November 2024. */
const WHEN: Record<number, {from: number; to?: number; label: string}> = {
	1: {from: 0, label: 'NOV. 2024'},
	2: {from: 0, label: 'NOV. 2024'},
	3: {from: 1, label: 'HIVER 2024'},
	4: {from: 4, label: 'MARS 2025'},
	5: {from: 4, to: 22, label: '16 MOIS'},
	6: {from: 22, label: 'SEPT. 2026'},
	7: {from: 23, label: 'OCT. 2026'},
	8: {from: 23, label: '25 OCT. 2026'},
	9: {from: 23, label: '25 OCT. 2026'},
	10: {from: 23, label: 'ET APRÈS ?'},
};
const SPAN = 23;
const X0 = 130;
const X1 = 950;

/** A timeline ruler across the top; its marker glides to the date each scene talks about. */
export const TimelineBar = ({lines}: {lines: Line[]}) => {
	const frame = useCurrentFrame();
	const index = lines.findIndex((l) => frame >= l.from && frame < l.from + l.durationInFrames);
	const when = WHEN[index];
	if (!when) return null;
	const line = lines[index];
	const f = frame - line.from;
	const prev = WHEN[index - 1];
	const start = prev ? (prev.to ?? prev.from) : when.from;
	const month = when.to !== undefined ? lerp(ease(f, 10, line.durationInFrames - 10, (x) => x), when.from, when.to) : lerp(ease(f, 0, 30), start, when.from);
	const x = lerp(month / SPAN, X0, X1);
	const appear = WHEN[index - 1] ? 1 : ease(f, 0, 16);
	const tick = (m: number, label: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
		<g key={label}>
			<line x1={lerp(m / SPAN, X0, X1)} y1={92} x2={lerp(m / SPAN, X0, X1)} y2={110} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
			{label && (
				<text x={lerp(m / SPAN, X0, X1)} y={150} textAnchor={anchor} fontFamily={ANTON} fontSize={30} fill="rgba(255,255,255,0.7)">
					{label}
				</text>
			)}
		</g>
	);
	return (
		<svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 0, opacity: appear}}>
			<line x1={X0} y1={100} x2={X1} y2={100} stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeLinecap="round" />
			<line x1={X0} y1={100} x2={x} y2={100} stroke={R.gold} strokeWidth={9} strokeLinecap="round" />
			{tick(0, 'NOV. 2024', 'start')}
			{tick(2, '')}
			{tick(14, '2026')}
			{tick(23, 'OCT. 2026', 'end')}
			<circle cx={x} cy={100} r={22} fill={R.gold} opacity={0.25 + 0.15 * Math.sin(frame / 6)} />
			<circle cx={x} cy={100} r={11} fill={R.gold} />
			<text x={Math.min(Math.max(x, 190), 890)} y={62} textAnchor="middle" fontFamily={ANTON} fontSize={46} fill={R.white}>
				{when.label}
			</text>
		</svg>
	);
};

/** Slow light motes drifting upward over the whole video. */
export const Motes = ({count = 36}: {count?: number}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			{Array.from({length: count}).map((_, i) => {
				const speed = 0.6 + rand(i * 3.7) * 1.2;
				const y = 1960 - ((frame * speed + rand(i) * 2000) % 2040);
				const x = rand(i * 1.9) * 1080 + Math.sin((frame + i * 40) / 70) * 30;
				const size = 4 + rand(i * 5.3) * 8;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: size,
							height: size,
							borderRadius: 99,
							background: i % 4 === 0 ? R.gold : '#FFFFFF',
							opacity: 0.18 + 0.2 * Math.abs(Math.sin((frame + i * 13) / 40)),
							boxShadow: `0 0 ${size * 2}px ${i % 4 === 0 ? R.gold : '#FFFFFF'}`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
