import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {ease, money, pop} from '../components/anim';
import {ANTON, SANS} from '../components/fonts';

export const COLORS = {
	micro: '#22D3EE',
	eurl: '#F59E0B',
	sasu: '#A78BFA',
	sarl: '#34D399',
	sas: '#FB4D6D',
	ink: '#05060C',
	white: '#F7F7FA',
	grey: '#9AA0B4',
	red: '#FF4D4D',
	green: '#3BE38B',
	gold: '#FFD25A',
};

export type Statut = 'micro' | 'eurl' | 'sasu' | 'sarl' | 'sas';
export const STATUTS: {key: Statut; label: string}[] = [
	{key: 'micro', label: 'MICRO'},
	{key: 'eurl', label: 'EURL'},
	{key: 'sasu', label: 'SASU'},
	{key: 'sarl', label: 'SARL'},
	{key: 'sas', label: 'SAS'},
];

/** Stock footage background: slow push-in, darkened for legibility, optional colour grade. */
export const Footage = ({
	src,
	folder = 'statuts',
	trim = 0,
	tint,
	dim = 0.5,
	zoom = 0.1,
	len = 240,
	grey = false,
}: {
	src: string;
	folder?: string;
	trim?: number;
	tint?: string;
	dim?: number;
	zoom?: number;
	len?: number;
	grey?: boolean;
}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: COLORS.ink}}>
			<AbsoluteFill style={{transform: `scale(${1.04 + (zoom * Math.min(f, len)) / len})`}}>
				<OffthreadVideo
					src={staticFile(`${folder}/stock/${src}.mp4`)}
					trimBefore={trim}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', filter: grey ? 'grayscale(1) contrast(1.1)' : 'saturate(1.1) contrast(1.05)'}}
				/>
			</AbsoluteFill>
			{tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light', opacity: 0.8}} />}
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, rgba(5,6,12,${dim + 0.2}) 0%, rgba(5,6,12,${dim - 0.15}) 35%, rgba(5,6,12,${dim}) 65%, rgba(5,6,12,${dim + 0.35}) 100%)`,
				}}
			/>
		</AbsoluteFill>
	);
};

/** "1/5" style progress strip so viewers know how much is left. */
export const Steps = ({current}: {current: number}) => {
	const f = useCurrentFrame();
	const p = pop(f, 0);
	return (
		<div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, opacity: p}}>
			{STATUTS.map((s, i) => {
				const on = i === current;
				const done = i < current;
				return (
					<div
						key={s.key}
						style={{
							fontFamily: ANTON,
							fontSize: on ? 44 : 32,
							padding: on ? '8px 24px' : '8px 16px',
							borderRadius: 99,
							color: on ? COLORS.ink : done ? COLORS.white : 'rgba(247,247,250,0.45)',
							background: on ? COLORS[s.key] : done ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.35)',
							border: `2px solid ${on ? COLORS[s.key] : 'rgba(255,255,255,0.18)'}`,
							transform: on ? `scale(${0.8 + 0.2 * pop(f, 2)})` : 'none',
							alignSelf: 'center',
						}}
					>
						{s.label}
					</div>
				);
			})}
		</div>
	);
};

export const Icon = ({name, size = 120, color}: {name: string; size?: number; color?: string}) =>
	color ? (
		<div
			style={{
				width: size,
				height: size,
				backgroundColor: color,
				WebkitMaskImage: `url(${staticFile(`icons/${name}.svg`)})`,
				WebkitMaskSize: 'contain',
				WebkitMaskRepeat: 'no-repeat',
				WebkitMaskPosition: 'center',
			}}
		/>
	) : (
		<Img src={staticFile(`icons/${name}.svg`)} style={{width: size, height: size}} />
	);

/** The big statut name that slams in. */
export const Badge = ({at, label, color, icon, top = 520, size = 190}: {at: number; label: string; color: string; icon?: string; top?: number; size?: number}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, {damping: 10, stiffness: 210, mass: 0.7});
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 28,
					padding: '18px 54px 22px',
					borderRadius: 44,
					background: 'rgba(8,9,16,0.82)',
					border: `6px solid ${color}`,
					boxShadow: `0 0 ${90 * p}px ${color}88, 0 30px 80px rgba(0,0,0,0.6)`,
					transform: `scale(${2.2 - 1.2 * p}) rotate(${(1 - p) * -10}deg)`,
					opacity: Math.min(1, p * 2),
				}}
			>
				{icon && <Icon name={icon} size={size * 0.62} color={color} />}
				<span style={{fontFamily: ANTON, fontSize: size, color, lineHeight: 1.05, letterSpacing: 2}}>{label}</span>
			</div>
		</div>
	);
};

/** Small pill: ✓ good / ✗ bad / plain. */
export const Chip = ({
	at,
	text,
	kind = 'plain',
	color = COLORS.white,
	size = 54,
	sub,
}: {
	at: number;
	text: string;
	kind?: 'ok' | 'no' | 'plain';
	color?: string;
	size?: number;
	sub?: string;
}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, {damping: 12, stiffness: 240, mass: 0.5});
	const mark = kind === 'ok' ? {icon: 'check', c: COLORS.green} : kind === 'no' ? {icon: 'x', c: COLORS.red} : null;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 22,
				padding: '18px 34px',
				borderRadius: 26,
				background: 'rgba(8,9,16,0.8)',
				border: `3px solid ${mark ? mark.c : color}55`,
				transform: `translateX(${(1 - p) * -120}px)`,
				opacity: p,
				boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
			}}
		>
			{mark && (
				<div style={{width: size * 1.2, height: size * 1.2, borderRadius: 99, background: mark.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name={mark.icon} size={size * 0.8} color={COLORS.ink} />
				</div>
			)}
			<div>
				<div style={{fontFamily: ANTON, fontSize: size, color, lineHeight: 1.1, letterSpacing: 1}}>{text}</div>
				{sub && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size * 0.55, color: COLORS.grey, marginTop: 4}}>{sub}</div>}
			</div>
		</div>
	);
};

/** Column of chips at a given top. */
export const Stack = ({top, children, gap = 22}: {top: number; children: React.ReactNode; gap?: number}) => (
	<div style={{position: 'absolute', top, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap}}>{children}</div>
);

/** Big animated figure ("≈ 45 %", "83 600 €"). */
export const Figure = ({
	at,
	to,
	from = 0,
	len = 16,
	decimals = 0,
	prefix = '',
	suffix = '',
	label,
	color,
	top,
	size = 230,
}: {
	at: number;
	to: number;
	from?: number;
	len?: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	label?: string;
	color: string;
	top: number;
	size?: number;
}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	const v = from + (to - from) * ease(f, at, at + len);
	const shown = decimals ? v.toFixed(decimals).replace('.', ',') : money(v);
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2)}}>
			<div style={{fontFamily: ANTON, fontSize: size, color, lineHeight: 1, textShadow: `0 0 60px ${color}66, 0 12px 40px rgba(0,0,0,0.7)`}}>
				{prefix}
				{shown}
				{suffix}
			</div>
			{label && <div style={{fontFamily: ANTON, fontSize: 56, color: COLORS.white, marginTop: 10, letterSpacing: 2, textShadow: '0 6px 20px rgba(0,0,0,0.8)'}}>{label}</div>}
		</div>
	);
};

/** Centered headline that pops in. */
export const Head = ({at = 0, top, children, size = 110, color = COLORS.white, style = {}}: {at?: number; top: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 60,
				right: 60,
				textAlign: 'center',
				fontFamily: ANTON,
				fontSize: size,
				color,
				lineHeight: 1.04,
				letterSpacing: 1,
				transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`,
				opacity: Math.min(1, p * 1.6),
				textShadow: '0 10px 40px rgba(0,0,0,0.85)',
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Arrow whose stroke draws itself from left to right. */
export const DrawArrow = ({at, color, width = 150}: {at: number; color: string; width?: number}) => {
	const f = useCurrentFrame();
	const d = `M 6 30 L ${width - 20} 30 M ${width - 44} 10 L ${width - 18} 30 L ${width - 44} 50`;
	const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, at, at + 10), d);
	return (
		<svg width={width} height={60} viewBox={`0 0 ${width} 60`}>
			<path d={d} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
		</svg>
	);
};
