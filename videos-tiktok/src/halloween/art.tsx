import React from 'react';
import {ANTON, CREEPY} from '../components/fonts';
import {rand} from '../components/anim';

export const C = {
	bg: '#08060D',
	night: '#140B22',
	purple: '#3B1D63',
	orange: '#FF7A1A',
	gold: '#FFC94D',
	bone: '#F4EEE3',
	red: '#E5322B',
	green: '#46E08A',
	grey: '#7D7590',
};

type Mood = 'happy' | 'sad' | 'wink';

/** Carved pumpkin. `flicker` is 0..1 candle intensity inside. */
export const Pumpkin = ({size = 400, mood = 'happy', flicker = 1, id = 'p'}: {size?: number; mood?: Mood; flicker?: number; id?: string}) => {
	const glow = `rgba(255, 196, 64, ${0.55 + 0.45 * flicker})`;
	return (
		<svg width={size} height={size * 0.92} viewBox="0 0 200 184" style={{overflow: 'visible'}}>
			<defs>
				<radialGradient id={`${id}-body`} cx="45%" cy="38%" r="70%">
					<stop offset="0%" stopColor="#FFA548" />
					<stop offset="55%" stopColor="#F26A12" />
					<stop offset="100%" stopColor="#8E3305" />
				</radialGradient>
				<radialGradient id={`${id}-fire`} cx="50%" cy="50%" r="60%">
					<stop offset="0%" stopColor="#FFF6C2" />
					<stop offset="60%" stopColor={glow} />
					<stop offset="100%" stopColor="#E0670F" />
				</radialGradient>
			</defs>
			<path d="M100 30 C 96 14, 104 4, 116 2 L 118 8 C 110 10, 106 18, 108 32 Z" fill="#4E7A2A" />
			{[-62, 62, -34, 34, 0].map((dx, i) => (
				<ellipse
					key={i}
					cx={100 + dx * 0.95}
					cy={104}
					rx={dx === 0 ? 46 : Math.abs(dx) > 50 ? 40 : 44}
					ry={76 - Math.abs(dx) * 0.12}
					fill={`url(#${id}-body)`}
					stroke="#7A2C04"
					strokeWidth={2}
				/>
			))}
			{/* eyes */}
			<path d="M58 84 L 80 58 L 92 88 Z" fill={`url(#${id}-fire)`} />
			{mood === 'wink' ? (
				<path d="M110 80 Q 126 66 144 80" stroke={`url(#${id}-fire)`} strokeWidth={8} fill="none" strokeLinecap="round" />
			) : (
				<path d="M108 88 L 120 58 L 142 84 Z" fill={`url(#${id}-fire)`} />
			)}
			<path d="M92 104 L 100 92 L 108 104 Z" fill={`url(#${id}-fire)`} />
			{mood === 'sad' ? (
				<path d="M56 146 Q 100 112 144 146 L 132 150 Q 100 128 68 150 Z" fill={`url(#${id}-fire)`} />
			) : (
				<path
					d="M48 118 Q 100 168 152 118 L 140 120 L 132 132 L 122 124 L 112 138 L 100 128 L 88 138 L 78 124 L 68 132 L 60 120 Z"
					fill={`url(#${id}-fire)`}
				/>
			)}
		</svg>
	);
};

/** Flying bat silhouette; `phase` drives the wing flap. */
export const Bat = ({size = 90, phase = 0, color = '#000'}: {size?: number; phase?: number; color?: string}) => {
	const flap = Math.sin(phase) * 0.6;
	return (
		<svg width={size} height={size * 0.6} viewBox="-50 -30 100 60" style={{overflow: 'visible'}}>
			<g transform={`scale(1, ${1 - flap * 0.6})`}>
				<path
					d="M0 -4 C -8 -16, -20 -20, -48 -14 C -38 -8, -36 0, -40 8 C -30 2, -22 4, -18 12 C -12 4, -6 4, 0 8 C 6 4, 12 4, 18 12 C 22 4, 30 2, 40 8 C 36 0, 38 -8, 48 -14 C 20 -20, 8 -16, 0 -4 Z"
					fill={color}
				/>
			</g>
			<ellipse cx={0} cy={0} rx={6} ry={9} fill={color} />
			<path d="M-5 -7 L -3 -14 L 0 -8 L 3 -14 L 5 -7 Z" fill={color} />
		</svg>
	);
};

export const Person = ({size = 34, color = C.bone}: {size?: number; color?: string}) => (
	<svg width={size} height={size} viewBox="0 0 20 20">
		<circle cx={10} cy={5.5} r={4.2} fill={color} />
		<path d="M2.5 20 C 2.5 12.5, 17.5 12.5, 17.5 20 Z" fill={color} />
	</svg>
);

/** Party poster used on the phone and in the "everyone has the same poster" grid. */
export const Poster = ({width = 300, glow = 1, id = 'poster', flicker = 1}: {width?: number; glow?: number; id?: string; flicker?: number}) => {
	const h = width * 1.4;
	return (
		<div
			style={{
				width,
				height: h,
				borderRadius: width * 0.05,
				background: `linear-gradient(170deg, ${C.purple}, #10071D 70%)`,
				border: `${Math.max(2, width * 0.012)}px solid rgba(255,122,26,${0.5 * glow})`,
				boxShadow: `0 0 ${width * 0.15}px rgba(255,122,26,${0.25 * glow})`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: width * 0.07,
				boxSizing: 'border-box',
				overflow: 'hidden',
			}}
		>
			<div style={{fontFamily: CREEPY, color: C.orange, fontSize: width * 0.17, lineHeight: 0.95, textAlign: 'center'}}>
				HALLOWEEN
				<br />
				PARTY
			</div>
			<Pumpkin size={width * 0.55} id={id} flicker={flicker} />
			<div style={{fontFamily: ANTON, color: C.bone, fontSize: width * 0.11, letterSpacing: width * 0.004}}>31.10 · 15 €</div>
		</div>
	);
};

export const Phone = ({children, width = 560}: {children: React.ReactNode; width?: number}) => (
	<div
		style={{
			width,
			height: width * 2.05,
			borderRadius: width * 0.12,
			background: '#0E0E12',
			border: '6px solid #2C2A33',
			boxShadow: '0 40px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #000',
			padding: width * 0.035,
			boxSizing: 'border-box',
			position: 'relative',
		}}
	>
		<div style={{position: 'absolute', top: width * 0.05, left: '50%', width: width * 0.28, height: width * 0.06, marginLeft: -width * 0.14, background: '#000', borderRadius: 99, zIndex: 3}} />
		<div style={{width: '100%', height: '100%', borderRadius: width * 0.09, overflow: 'hidden', background: '#17121F', position: 'relative'}}>
			{children}
		</div>
	</div>
);

export const TicketIcon = ({size = 160, color = C.gold, label = 'BILLET'}: {size?: number; color?: string; label?: string}) => (
	<svg width={size} height={size * 0.55} viewBox="0 0 200 110">
		<path
			d="M10 10 H 190 V 40 A 15 15 0 0 0 190 70 V 100 H 10 V 70 A 15 15 0 0 0 10 40 Z"
			fill={color}
			stroke="rgba(0,0,0,0.35)"
			strokeWidth={3}
		/>
		<line x1={140} y1={16} x2={140} y2={94} stroke="rgba(0,0,0,0.35)" strokeWidth={3} strokeDasharray="6 6" />
		<text x={75} y={66} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="rgba(0,0,0,0.7)">
			{label}
		</text>
	</svg>
);

export const Moon = ({size = 520}: {size?: number}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			background: 'radial-gradient(circle at 38% 36%, #FFF8E1, #F2DFA8 55%, #C9AE6C)',
			boxShadow: `0 0 ${size * 0.25}px rgba(255, 236, 170, 0.55), 0 0 ${size * 0.6}px rgba(255, 200, 90, 0.25)`,
		}}
	/>
);

export const Manor = ({width = 900, lit = 1}: {width?: number; lit?: number}) => {
	const win = `rgba(255, 196, 70, ${0.35 + 0.65 * lit})`;
	return (
		<svg width={width} height={width * 0.62} viewBox="0 0 400 248">
			<path
				d="M0 248 V 150 H 40 V 100 L 60 70 L 80 100 V 150 H 110 V 90 L 150 40 L 190 90 V 120 H 210 V 70 L 240 20 L 270 70 V 120 H 290 V 90 L 330 50 L 370 90 V 150 H 400 V 248 Z"
				fill="#050308"
			/>
			<rect x={236} y={4} width={8} height={18} fill="#050308" />
			{[
				[52, 112],
				[140, 100],
				[160, 100],
				[230, 84],
				[250, 84],
				[230, 130],
				[250, 130],
				[322, 104],
				[340, 104],
				[150, 150],
				[322, 160],
			].map(([x, y], i) => (
				<rect key={i} x={x} y={y} width={12} height={18} rx={6} fill={rand(i + Math.floor(lit * 3)) > 0.25 ? win : '#1A1022'} />
			))}
			<path d="M180 248 V 200 Q 200 180 220 200 V 248 Z" fill={win} opacity={0.6} />
		</svg>
	);
};

export const Clock = ({size = 560, minutes = 59}: {size?: number; minutes?: number}) => {
	// minutes after 23:00; 60 = midnight
	const minuteAngle = (minutes / 60) * 360;
	const hourAngle = 330 + (minutes / 60) * 30;
	return (
		<svg width={size} height={size} viewBox="-100 -100 200 200">
			<circle r={96} fill="#120A1C" stroke={C.gold} strokeWidth={4} />
			<circle r={88} fill="none" stroke="rgba(255,201,77,0.25)" strokeWidth={1} />
			{Array.from({length: 12}).map((_, i) => (
				<line
					key={i}
					x1={0}
					y1={-80}
					x2={0}
					y2={i % 3 === 0 ? -66 : -72}
					stroke={C.bone}
					strokeWidth={i % 3 === 0 ? 4 : 2}
					transform={`rotate(${i * 30})`}
				/>
			))}
			<line x1={0} y1={8} x2={0} y2={-48} stroke={C.bone} strokeWidth={7} strokeLinecap="round" transform={`rotate(${hourAngle})`} />
			<line x1={0} y1={10} x2={0} y2={-74} stroke={C.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
			<circle r={6} fill={C.gold} />
		</svg>
	);
};

export const Candle = ({height = 260, flicker = 1}: {height?: number; flicker?: number}) => {
	const w = height * 0.32;
	return (
		<div style={{position: 'relative', width: w * 3, height: height * 1.6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
			<div
				style={{
					position: 'absolute',
					top: 0,
					width: w * 3,
					height: w * 3,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(255,190,80,${0.45 * flicker}), rgba(255,140,40,0) 65%)`,
				}}
			/>
			<div
				style={{
					width: w * 0.42,
					height: height * 0.42,
					marginBottom: -4,
					borderRadius: '50% 50% 45% 45% / 70% 70% 30% 30%',
					background: 'radial-gradient(circle at 50% 75%, #FFFFFF, #FFE08A 35%, #FF8A1F 75%, rgba(255,90,0,0))',
					transform: `scaleY(${0.9 + 0.15 * flicker}) skewX(${(flicker - 0.5) * 8}deg)`,
					transformOrigin: 'bottom center',
					zIndex: 2,
				}}
			/>
			<div style={{width: 3, height: 10, background: '#222'}} />
			<div
				style={{
					width: w,
					height,
					borderRadius: '8px 8px 4px 4px',
					background: 'linear-gradient(90deg, #CFC3AE, #F7F0E2 45%, #BCAE95)',
					boxShadow: `0 -10px 40px rgba(255,180,70,${0.35 * flicker})`,
				}}
			/>
		</div>
	);
};

export const Stamp = ({text, color = C.red, size = 150}: {text: string; color?: string; size?: number}) => (
	<div
		style={{
			fontFamily: ANTON,
			fontSize: size,
			color,
			border: `${size * 0.07}px solid ${color}`,
			borderRadius: size * 0.12,
			padding: `${size * 0.02}px ${size * 0.22}px`,
			letterSpacing: size * 0.03,
			textShadow: `0 0 ${size * 0.2}px rgba(229,50,43,0.4)`,
			mixBlendMode: 'screen',
			whiteSpace: 'nowrap',
		}}
	>
		{text}
	</div>
);

/** Masked guest silhouette for the "who is the culprit" line-up. */
export const Suspect = ({size = 150, color = '#1C1228', mask = C.bone}: {size?: number; color?: string; mask?: string}) => (
	<svg width={size} height={size * 1.5} viewBox="0 0 100 150">
		<path d="M50 10 C 74 10, 80 34, 78 50 C 76 66, 66 76, 50 76 C 34 76, 24 66, 22 50 C 20 34, 26 10, 50 10 Z" fill={color} />
		<path d="M8 150 C 8 100, 30 84, 50 84 C 70 84, 92 100, 92 150 Z" fill={color} />
		<path d="M26 40 Q 50 30 74 40 Q 72 54 60 54 Q 54 54 50 48 Q 46 54 40 54 Q 28 54 26 40 Z" fill={mask} />
		<ellipse cx={38} cy={44} rx={5} ry={3} fill="#000" />
		<ellipse cx={62} cy={44} rx={5} ry={3} fill="#000" />
	</svg>
);
