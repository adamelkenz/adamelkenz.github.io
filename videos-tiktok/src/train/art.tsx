import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rand} from '../components/anim';
import {ANTON} from '../components/fonts';

export const T = {
	ink: '#06080F',
	night: '#0E1428',
	white: '#F4F6FB',
	grey: '#8C95AA',
	red: '#FF3B3B',
	amber: '#FFB020',
	green: '#38E07B',
	blue: '#3E8BFF',
	accent: '#E63946',
};

/** Generic high-speed train, side view (no real livery or logo). `wheel` is the wheel rotation in degrees. */
export const TrainSide = ({cars = 4, wheel = 0, lights = true}: {cars?: number; wheel?: number; lights?: boolean}) => {
	const carW = 420;
	const width = 330 + cars * carW;
	return (
		<svg width={width} height={300} viewBox={`0 0 ${width} 300`} style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#FFFFFF" />
					<stop offset="70%" stopColor="#D9DEE8" />
					<stop offset="100%" stopColor="#A7AFC0" />
				</linearGradient>
			</defs>
			{/* pantograph */}
			<path d={`M ${330 + carW * 0.5} 92 L ${330 + carW * 0.5 + 40} 50 L ${330 + carW * 0.5 + 80} 92 M ${330 + carW * 0.5 + 10} 50 L ${330 + carW * 0.5 + 70} 50`} stroke="#5A6378" strokeWidth={5} fill="none" />
			{/* nose (power car, facing left) */}
			<path d="M 0 214 C 6 170, 60 118, 190 100 L 330 96 L 330 226 L 16 226 C 4 224, 0 220, 0 214 Z" fill="url(#body)" stroke="#59627A" strokeWidth={3} />
			<path d="M 70 150 C 100 124, 150 112, 210 108 L 250 108 L 250 140 L 92 152 Z" fill="#141B2E" />
			{lights && <ellipse cx={22} cy={200} rx={12} ry={6} fill="#FFF6C8" style={{filter: 'drop-shadow(0 0 12px #FFF6C8)'}} />}
			{/* cars */}
			{Array.from({length: cars}).map((_, i) => {
				const x = 336 + i * carW;
				return (
					<g key={i}>
						<rect x={x} y={96} width={carW - 8} height={130} rx={12} fill="url(#body)" stroke="#59627A" strokeWidth={3} />
						<rect x={x + 14} y={120} width={carW - 36} height={34} rx={8} fill="#141B2E" />
						{Array.from({length: 6}).map((__, w) => (
							<rect key={w} x={x + 22 + w * 64} y={124} width={50} height={26} rx={5} fill="#22304F" />
						))}
					</g>
				);
			})}
			{/* accent stripe */}
			<rect x={40} y={176} width={width - 50} height={9} fill={T.accent} />
			{/* bogies + wheels */}
			{Array.from({length: cars + 1}).map((_, i) => {
				const bx = 150 + i * carW;
				return (
					<g key={i}>
						<rect x={bx - 70} y={222} width={140} height={22} rx={8} fill="#2A3142" />
						{[-38, 38].map((dx) => (
							<g key={dx} transform={`translate(${bx + dx}, 250) rotate(${wheel})`}>
								<circle r={22} fill="#1B2030" stroke="#7B849A" strokeWidth={4} />
								<line x1={-18} y1={0} x2={18} y2={0} stroke="#7B849A" strokeWidth={3} />
								<line x1={0} y1={-18} x2={0} y2={18} stroke="#7B849A" strokeWidth={3} />
							</g>
						))}
					</g>
				);
			})}
		</svg>
	);
};

/**
 * Side-on world that scrolls past a train: dusk sky, hills, catenary masts and rails.
 * `distance` is how far we've travelled (pixels); the caller integrates speed over time.
 */
export const SpeedWorld = ({distance, railY = 1180, dusk = true}: {distance: number; railY?: number; dusk?: boolean}) => {
	const poleGap = 520;
	const poleOffset = -(distance % poleGap);
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: dusk ? 'linear-gradient(180deg, #0B1230 0%, #2A1E4A 45%, #E0644B 78%, #F2A65A 100%)' : T.night}}>
			{/* far hills: slow */}
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				{[0, 1].map((k) => {
					const x = -((distance * 0.08) % 1080) + k * 1080;
					return <path key={k} d={`M ${x} ${railY - 120} Q ${x + 270} ${railY - 330} ${x + 540} ${railY - 150} Q ${x + 810} ${railY - 280} ${x + 1080} ${railY - 120} L ${x + 1080} ${railY + 400} L ${x} ${railY + 400} Z`} fill="#1A1533" opacity={0.9} />;
				})}
				{/* trees: medium */}
				{Array.from({length: 14}).map((_, i) => {
					const x = ((i * 190 - distance * 0.35) % 2660 + 2660) % 2660 - 200;
					const h = 90 + rand(i) * 90;
					return <path key={i} d={`M ${x} ${railY - 40} L ${x + 34} ${railY - 40 - h} L ${x + 68} ${railY - 40} Z`} fill="#120F24" />;
				})}
				{/* ground */}
				<rect x={0} y={railY - 40} width={1080} height={1920} fill="#0A0A14" />
				{/* ballast streaks: fast */}
				{Array.from({length: 22}).map((_, i) => {
					const x = ((i * 140 - distance * 1.6) % 3080 + 3080) % 3080 - 200;
					return <rect key={i} x={x} y={railY + 40 + (i % 3) * 18} width={120} height={4} fill="rgba(255,255,255,0.12)" />;
				})}
				{/* rails */}
				<rect x={0} y={railY + 10} width={1080} height={10} fill="#8C95AA" />
				<rect x={0} y={railY + 26} width={1080} height={6} fill="#3A4152" />
				{/* catenary wire */}
				<line x1={0} y1={railY - 380} x2={1080} y2={railY - 380} stroke="#3A3F55" strokeWidth={3} />
				{/* masts: fastest */}
				{Array.from({length: 5}).map((_, i) => {
					const x = poleOffset + i * poleGap;
					return (
						<g key={i}>
							<rect x={x} y={railY - 420} width={14} height={440} fill="#232838" />
							<rect x={x - 70} y={railY - 412} width={110} height={8} fill="#232838" />
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Speed dial 0–320 km/h, with an optional limit tick. */
export const Speedo = ({speed, limit, size = 560, alarm = false}: {speed: number; limit?: number; size?: number; alarm?: boolean}) => {
	const toAngle = (v: number) => -225 + (Math.min(v, 320) / 320) * 270;
	const r = 230;
	const arc = (a0: number, a1: number) => {
		const p = (a: number) => [Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r];
		const [x0, y0] = p(a0);
		const [x1, y1] = p(a1);
		return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
	};
	const over = limit !== undefined && speed > limit;
	return (
		<svg width={size} height={size} viewBox="-280 -280 560 560">
			<circle r={268} fill="#0B1020" stroke={alarm || over ? T.red : '#2A3350'} strokeWidth={8} />
			<path d={arc(-225, 45)} stroke="rgba(255,255,255,0.1)" strokeWidth={28} fill="none" strokeLinecap="round" />
			<path d={arc(-225, toAngle(speed))} stroke={over ? T.red : T.blue} strokeWidth={28} fill="none" strokeLinecap="round" />
			{limit !== undefined && (
				<g transform={`rotate(${toAngle(limit)})`}>
					<rect x={r - 30} y={-6} width={60} height={12} fill={T.amber} />
				</g>
			)}
			{[0, 80, 160, 240, 320].map((v) => {
				const a = (toAngle(v) * Math.PI) / 180;
				return (
					<text key={v} x={Math.cos(a) * 175} y={Math.sin(a) * 175 + 12} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill={T.grey}>
						{v}
					</text>
				);
			})}
			<text x={0} y={40} textAnchor="middle" fontFamily={ANTON} fontSize={150} fill={over || alarm ? T.red : T.white}>
				{Math.round(speed)}
			</text>
			<text x={0} y={100} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill={T.grey}>
				KM/H
			</text>
		</svg>
	);
};

/** Top-down track scrolling toward the viewer, with beacons between the rails and an optional signal. */
export const TopTrack = ({distance, beacons = true, cab = false, signalAt, red = false}: {distance: number; beacons?: boolean; cab?: boolean; signalAt?: number; red?: boolean}) => {
	const sleeperGap = 90;
	const beaconGap = 900;
	const off = distance % sleeperGap;
	const bOff = distance % beaconGap;
	return (
		<AbsoluteFill style={{background: '#0B0E16', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<rect x={300} y={0} width={480} height={1920} fill="#2A2830" />
				{Array.from({length: 24}).map((_, i) => (
					<rect key={i} x={330} y={i * sleeperGap + off - sleeperGap} width={420} height={34} rx={4} fill="#4A4038" />
				))}
				<rect x={400} y={0} width={18} height={1920} fill="#9AA3B6" />
				<rect x={662} y={0} width={18} height={1920} fill="#9AA3B6" />
				{cab && <rect x={532} y={0} width={16} height={1920} fill={T.blue} opacity={0.7} style={{filter: `drop-shadow(0 0 12px ${T.blue})`}} />}
				{beacons &&
					[0, 1, 2].map((k) => {
						const y = k * beaconGap + bOff - beaconGap + 200;
						return (
							<g key={k}>
								<rect x={480} y={y} width={120} height={60} rx={8} fill={T.amber} stroke="#000" strokeWidth={3} />
								<text x={540} y={y + 42} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#000">
									BALISE
								</text>
							</g>
						);
					})}
				{signalAt !== undefined && (
					<g transform={`translate(800, ${signalAt})`}>
						<rect x={0} y={-20} width={16} height={180} fill="#3A3F55" />
						<rect x={-40} y={-160} width={96} height={170} rx={20} fill="#111" stroke="#3A3F55" strokeWidth={4} />
						<circle cx={8} cy={-110} r={28} fill={red ? T.red : '#3A1010'} style={{filter: red ? `drop-shadow(0 0 30px ${T.red})` : 'none'}} />
						<circle cx={8} cy={-40} r={28} fill={red ? '#103A1C' : T.green} />
					</g>
				)}
			</svg>
		</AbsoluteFill>
	);
};

/** A football pitch drawn as a small green rectangle (for the braking-distance comparison). */
export const Pitch = ({w = 90, h = 56}: {w?: number; h?: number}) => (
	<svg width={w} height={h} viewBox="0 0 90 56">
		<rect x={1} y={1} width={88} height={54} rx={3} fill="#1E8C4E" stroke="#E8F5EC" strokeWidth={2} />
		<line x1={45} y1={1} x2={45} y2={55} stroke="#E8F5EC" strokeWidth={2} />
		<circle cx={45} cy={28} r={9} fill="none" stroke="#E8F5EC" strokeWidth={2} />
	</svg>
);
