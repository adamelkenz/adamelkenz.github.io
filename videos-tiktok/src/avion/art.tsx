import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rand} from '../components/anim';

export const A = {
	ink: '#050912',
	sky: '#0B1D3A',
	white: '#F4F7FC',
	grey: '#8E9AB2',
	red: '#FF3B3B',
	amber: '#FFB020',
	green: '#38E07B',
	blue: '#3E8BFF',
	cyan: '#3CD6F0',
};

/**
 * Generic airliner, side view, facing right (no airline livery).
 * engine: 1 = running (exhaust glow, fast fan), 0 = dead. rat: 0..1 how far the ram air turbine is deployed.
 */
export const Plane = ({engine = 1, rat = 0, spin = 0, smoke = 0}: {engine?: number; rat?: number; spin?: number; smoke?: number}) => (
	<svg width={980} height={420} viewBox="0 0 980 420" style={{overflow: 'visible'}}>
		<defs>
			<linearGradient id="fus" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#FFFFFF" />
				<stop offset="65%" stopColor="#DCE3EE" />
				<stop offset="100%" stopColor="#9FAAC0" />
			</linearGradient>
			<radialGradient id="glow">
				<stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.9} />
				<stop offset="100%" stopColor="#FF8A3D" stopOpacity={0} />
			</radialGradient>
		</defs>
		{/* tail fin */}
		<path d="M 70 170 L 20 40 L 95 40 L 190 170 Z" fill={A.blue} stroke="#2C3E66" strokeWidth={3} />
		<path d="M 60 196 L 10 214 L 120 214 L 170 196 Z" fill="#C9D2E2" stroke="#7D89A3" strokeWidth={3} />
		{/* fuselage */}
		<path d="M 60 160 L 800 150 C 880 150, 940 172, 960 205 C 940 238, 880 252, 800 252 L 90 245 C 60 240, 40 215, 60 160 Z" fill="url(#fus)" stroke="#6E7A94" strokeWidth={3} />
		<path d="M 860 168 C 900 170, 930 185, 944 200 L 880 200 Z" fill="#142140" />
		{Array.from({length: 18}).map((_, i) => (
			<rect key={i} x={230 + i * 32} y={178} width={16} height={18} rx={6} fill="#22314F" />
		))}
		<rect x={140} y={222} width={700} height={6} fill={A.blue} opacity={0.8} />
		{/* ram air turbine (deploys under the belly) */}
		{rat > 0 && (
			<g transform={`translate(560, ${248 + rat * 40})`}>
				<rect x={-4} y={-40 * rat} width={8} height={40 * rat} fill="#4A5570" />
				<g transform={`rotate(${spin * 3})`}>
					<ellipse cx={0} cy={0} rx={34 * rat} ry={6} fill="#C8D0E0" />
					<ellipse cx={0} cy={0} rx={6} ry={34 * rat} fill="#C8D0E0" />
				</g>
				<circle r={7} fill={A.amber} />
			</g>
		)}
		{/* wing */}
		<path d="M 420 232 L 640 236 L 520 300 L 360 300 Z" fill="#B8C2D6" stroke="#6E7A94" strokeWidth={3} />
		{/* engine nacelle under the wing */}
		<g transform="translate(470, 300)">
			<rect x={0} y={0} width={190} height={70} rx={34} fill="#D7DEEA" stroke="#6E7A94" strokeWidth={3} />
			<ellipse cx={190} cy={35} rx={14} ry={32} fill="#1B2438" stroke="#6E7A94" strokeWidth={3} />
			<g transform={`translate(190, 35) rotate(${spin * (engine > 0.5 ? 25 : 2)})`}>
				<line x1={0} y1={-26} x2={0} y2={26} stroke="#7D89A3" strokeWidth={4} />
				<line x1={-10} y1={-20} x2={10} y2={20} stroke="#7D89A3" strokeWidth={4} />
			</g>
			{/* exhaust glow when running */}
			<ellipse cx={-30} cy={35} rx={60 * engine} ry={26 * engine} fill="url(#glow)" opacity={engine} />
			{/* smoke puff when it dies */}
			{smoke > 0 &&
				Array.from({length: 7}).map((_, i) => (
					<circle key={i} cx={-30 - smoke * (60 + i * 30)} cy={35 - smoke * (i * 8) + Math.sin(i) * 8} r={18 + smoke * (20 + i * 6)} fill="#5A6070" opacity={Math.max(0, 0.6 - smoke * 0.5)} />
				))}
		</g>
	</svg>
);

/** Sky with parallax clouds; `drift` is how far we've flown, `climb` raises the clouds as we descend. */
export const Sky = ({drift, climb = 0, tone = 'day'}: {drift: number; climb?: number; tone?: 'day' | 'dusk' | 'alarm'}) => {
	const bg =
		tone === 'dusk'
			? 'linear-gradient(180deg, #08142E 0%, #263A6E 55%, #E07A55 100%)'
			: tone === 'alarm'
			? 'linear-gradient(180deg, #120A18 0%, #3A1626 60%, #6E2A2A 100%)'
			: 'linear-gradient(180deg, #071633 0%, #154A8C 55%, #6FB4E8 100%)';
	return (
		<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
			{[0.15, 0.35, 0.8].map((speed, layer) =>
				Array.from({length: 6}).map((_, i) => {
					const w = 380 + rand(i + layer * 7) * 420;
					const x = ((i * 420 - drift * speed) % 2600 + 2600) % 2600 - 700;
					const y = 200 + layer * 480 + rand(i * 3 + layer) * 280 - climb * (0.3 + speed);
					return (
						<div
							key={`${layer}-${i}`}
							style={{
								position: 'absolute',
								left: x,
								top: ((y % 2200) + 2200) % 2200 - 200,
								width: w,
								height: w * 0.36,
								borderRadius: '50%',
								background: `radial-gradient(ellipse at center, rgba(255,255,255,${0.18 + layer * 0.12}) 0%, rgba(255,255,255,0) 70%)`,
							}}
						/>
					);
				}),
			)}
		</AbsoluteFill>
	);
};

/** Speed streaks for a sense of motion. */
export const Streaks = ({drift, opacity = 0.35}: {drift: number; opacity?: number}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		{Array.from({length: 14}).map((_, i) => (
			<div key={i} style={{position: 'absolute', top: 300 + i * 90, left: ((i * 330 - drift * 3) % 1800 + 1800) % 1800 - 400, width: 240, height: 3, background: `rgba(255,255,255,${opacity})`}} />
		))}
	</AbsoluteFill>
);

/** Small top-down plane marker for maps. */
export const PlaneMark = ({size = 60, color = A.white, angle = 0}: {size?: number; color?: string; angle?: number}) => (
	<svg width={size} height={size} viewBox="-30 -30 60 60" style={{overflow: 'visible', transform: `rotate(${angle}deg)`}}>
		<path d="M 26 0 L 6 -4 L -6 -24 L -12 -24 L -4 -4 L -18 -3 L -24 -10 L -28 -10 L -24 0 L -28 10 L -24 10 L -18 3 L -4 4 L -12 24 L -6 24 L 6 4 Z" fill={color} stroke="#000" strokeWidth={2} />
	</svg>
);

export const useFrame = useCurrentFrame;
