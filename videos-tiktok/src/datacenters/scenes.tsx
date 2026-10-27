import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {CLAMP, ease, lerp, money, pop, shake} from '../components/anim';
import {ANTON, SANS, SERIF} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Chip, Footage as BaseFootage, Head, Icon, Stack} from '../statuts/kit';
import {CITIES, DOTS, EuropeShapes, IRELAND_H, IRELAND_W, irelandPath, MapFrame, project} from './maps';

type SceneProps = {line: Line};

export const D = {
	ink: '#04060F',
	white: '#F5F7FF',
	grey: '#8E9AB8',
	cyan: '#22D3EE',
	violet: '#8B5CF6',
	hot: '#FF5A36',
	green: '#3BE38B',
	gold: '#FFD25A',
	red: '#FF4D5A',
	blue: '#4F8BFF',
};

/* Building blocks ------------------------------------------------------------ */

const Clip = (props: React.ComponentProps<typeof BaseFootage>) => <BaseFootage folder="datacenters" {...props} />;

/** Photo with a slow pan/zoom (Ken Burns), darkened for text. */
const Photo = ({src, len = 200, from = [1.05, 0, 0], to = [1.18, 0, -40], dim = 0.45, tint}: {src: string; len?: number; from?: [number, number, number]; to?: [number, number, number]; dim?: number; tint?: string}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [0, len], [0, 1], CLAMP);
	const [s, x, y] = [lerp(p, from[0], to[0]), lerp(p, from[1], to[1]), lerp(p, from[2], to[2])];
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: D.ink}}>
			<Img src={staticFile(`datacenters/photos/${src}.jpg`)} style={{position: 'absolute', left: -81, top: -144, width: 1242, height: 2208, transform: `translate(${x}px, ${y}px) scale(${s})`}} />
			{tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light'}} />}
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(4,6,15,${dim + 0.25}) 0%, rgba(4,6,15,${dim - 0.1}) 40%, rgba(4,6,15,${dim}) 70%, rgba(4,6,15,${dim + 0.35}) 100%)`}} />
		</AbsoluteFill>
	);
};

/** Pure motion-design backdrop: deep gradient and a slowly scrolling circuit grid. */
const TechBg = ({hue = D.cyan}: {hue?: string}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #0F1A3A 0%, ${D.ink} 70%)`, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(${hue}14 2px, transparent 2px), linear-gradient(90deg, ${hue}14 2px, transparent 2px)`,
					backgroundSize: '90px 90px',
					backgroundPosition: `0px ${(f * 0.8) % 90}px`,
					maskImage: 'radial-gradient(ellipse at 50% 45%, black 30%, transparent 75%)',
					WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 30%, transparent 75%)',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Hard cut inside a scene. */
const Cut = ({at, until, children, transition = 'punch'}: {at: number; until?: number; children: React.ReactNode; transition?: 'punch' | 'whip' | 'flash' | 'none'}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={until !== undefined ? until - Math.max(0, at) : undefined}>
		<Shot transition={transition} push={0}>
			{children}
		</Shot>
	</Sequence>
);

const Pill = ({at, children, color = D.cyan, top, rotate = -2, size = 70, ink = D.ink}: {at: number; children: React.ReactNode; color?: string; top: number; rotate?: number; size?: number; ink?: string}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: ANTON, fontSize: size, color: ink, background: color, padding: '6px 34px 10px', borderRadius: 20, transform: `rotate(${rotate}deg) scale(${pop(f, at)})`, boxShadow: `0 0 50px ${color}55`}}>{children}</div>
		</div>
	);
};

/* 0 — Hook: Ireland ----------------------------------------------------------- */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCut = W('a') - 4;
	const level = 23 * ease(f, 4, W('quart') + 6);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tCut}>
				<Shot transition="flash" push={0.06}>
					<TechBg hue={D.green} />
					<div style={{position: 'absolute', top: 300, left: 140, transform: `scale(${0.95 + 0.05 * pop(f, 0)})`}}>
						<svg width={IRELAND_W} height={IRELAND_H} viewBox={`0 0 ${IRELAND_W} ${IRELAND_H}`}>
							<defs>
								<clipPath id="ie-fill">
									<rect x={0} y={IRELAND_H * (1 - level / 100) - 40} width={IRELAND_W} height={IRELAND_H} />
								</clipPath>
							</defs>
							<path d={irelandPath} fill="#0E2A1E" stroke={D.green} strokeWidth={5} />
							<path d={irelandPath} fill={D.green} clipPath="url(#ie-fill)" opacity={0.9} />
						</svg>
					</div>
					<Head at={0} top={150} size={110}>
						L'IRLANDE
					</Head>
					<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 300, color: D.white, textShadow: `0 0 60px ${D.green}aa, 0 10px 40px rgba(0,0,0,0.9)`, transform: shake(f, W('quart') + 6, 14, 10)}}>
						{Math.round(level)} %
					</div>
					<Head at={W('electricite') - 4} top={980} size={70} color={D.green}>
						DE SON ÉLECTRICITÉ
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tCut} transition="punch">
				<Photo src="building" len={line.durationInFrames - tCut + 20} from={[1.0, 0, 0]} to={[1.15, 0, 60]} dim={0.35} />
				<Head at={W('batiments') - tCut - 3} top={330} size={120}>
					DES BÂTIMENTS
				</Head>
				<Head at={W('sans') - tCut - 2} top={470} size={136} color={D.cyan}>
					SANS FENÊTRES{'\u00a0'}?
				</Head>
			</Cut>
			<Fx at={0} name="impact" />
			<Fx at={4} name="riser" />
			<Fx at={W('quart') + 6} name="stamp" />
			<Fx at={tCut} name="whoosh-hit" />
		</AbsoluteFill>
	);
};

/* 1 — What they are ----------------------------------------------------------- */
const FLOWS = [
	{word: 'video', icon: 'play', label: 'VIDÉO', angle: -150},
	{word: 'message', icon: 'message-circle', label: 'MESSAGE', angle: -90},
	{word: 'question', icon: 'sparkles', label: 'IA', angle: -30},
];

export const S1What = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMD = W('chaque') - 6;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMD}>
				<Shot transition="whip" push={0.08}>
					<Clip src="servers-v" dim={0.35} tint="rgba(34,211,238,0.3)" />
					<Head at={W('data') - 3} top={640} size={200} color={D.cyan} style={{textShadow: `0 0 70px ${D.cyan}aa, 0 10px 40px rgba(0,0,0,0.9)`}}>
						DATA CENTERS
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMD}>
				<TechBg />
				{/* server in the middle */}
				<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{width: 260, height: 260, borderRadius: 50, background: '#0B1530', border: `5px solid ${D.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${60 + 30 * Math.sin(f / 5)}px ${D.cyan}88`}}>
						<Icon name="server" size={150} color={D.cyan} />
					</div>
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{FLOWS.map((fl) => {
						const at = W(fl.word) - tMD - 2;
						const a = (fl.angle * Math.PI) / 180;
						const sx = 540 + Math.cos(a) * 420;
						const sy = 890 + Math.sin(a) * 420;
						const d = `M ${sx} ${sy} L 540 890`;
						const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, at + 4, at + 16), d);
						return <path key={fl.word} d={d} stroke={D.cyan} strokeWidth={6} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" opacity={0.7} />;
					})}
				</svg>
				{FLOWS.map((fl) => {
					const at = W(fl.word) - tMD - 2;
					if (f < at) return null;
					const a = (fl.angle * Math.PI) / 180;
					const p = pop(f, at);
					// a packet travelling down the line, on repeat
					const t = ((f - at - 10) % 24) / 24;
					const px = lerp(Math.max(0, t), 540 + Math.cos(a) * 420, 540);
					const py = lerp(Math.max(0, t), 890 + Math.sin(a) * 420, 890);
					return (
						<React.Fragment key={fl.word}>
							<div style={{position: 'absolute', left: 540 + Math.cos(a) * 420 - 90, top: 890 + Math.sin(a) * 420 - 110, width: 180, textAlign: 'center', transform: `scale(${p})`}}>
								<div style={{width: 150, height: 150, margin: '0 auto', borderRadius: 40, background: D.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${D.violet}88`}}>
									<Icon name={fl.icon} size={90} color={D.white} />
								</div>
								<div style={{fontFamily: ANTON, fontSize: 46, color: D.white, marginTop: 8}}>{fl.label}</div>
							</div>
							{f > at + 10 && <div style={{position: 'absolute', left: px - 12, top: py - 12, width: 24, height: 24, borderRadius: 99, background: D.white, boxShadow: `0 0 20px ${D.cyan}`}} />}
						</React.Fragment>
					);
				})}
				<Head at={W('passe') - tMD - 3} top={1130} size={84}>
					TOUT PASSE PAR EUX
				</Head>
				{FLOWS.map((fl) => (
					<Fx key={fl.word} at={W(fl.word) - tMD - 2} name="pop" />
				))}
				<Fx at={W('passe') - tMD - 3} name="whoosh" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('data') - 3} name="impact" />
			<Fx at={tMD} name="whoosh" gain={0.6} />
		</AbsoluteFill>
	);
};

/* 2 — Europe map: 10 000 sites, five hubs ------------------------------------ */
const EuropeHubs = ({f, dotsFrom, dotsTo, focusAt, cityTimes, showFlapd}: {f: number; dotsFrom: number; dotsTo: number; focusAt: number; cityTimes: number[]; showFlapd: number}) => {
	const shown = Math.floor(DOTS.length * ease(f, dotsFrom, dotsTo, (x) => x));
	const focus = ease(f, focusAt, focusAt + 12);
	return (
		<div style={{position: 'absolute', top: 260, left: 0}}>
			<MapFrame>
				<EuropeShapes />
				{DOTS.slice(0, shown).map((d, i) => (
					<circle key={i} cx={d.x} cy={d.y} r={d.hub ? 4.5 : 3.5} fill={d.hub ? D.cyan : D.violet} opacity={d.hub ? 0.9 : lerp(focus, 0.85, 0.2)} />
				))}
				{CITIES.map((c, i) => {
					const at = cityTimes[i];
					if (f < at) return null;
					const [x, y] = project(c.lonlat);
					const p = pop(f, at);
					const left = c.key === 'dublin' || c.key === 'londres';
					return (
						<g key={c.key}>
							<circle cx={x} cy={y} r={34 * p} fill="none" stroke={D.gold} strokeWidth={5} />
							<circle cx={x} cy={y} r={60 + ((f - at) % 30) * 2} fill="none" stroke={D.gold} strokeWidth={2} opacity={1 - ((f - at) % 30) / 30} />
							<text x={left ? x - 46 : x + 46} y={y + (c.key === 'paris' ? 40 : c.key === 'amsterdam' ? -30 : 12)} textAnchor={left ? 'end' : 'start'} fontFamily={ANTON} fontSize={44} fill={D.white} stroke={D.ink} strokeWidth={8} paintOrder="stroke" opacity={p}>
								{c.label}
							</text>
						</g>
					);
				})}
			</MapFrame>
			{f >= showFlapd && (
				<div style={{position: 'absolute', top: 1060, left: 0, width: 1080, display: 'flex', justifyContent: 'center', gap: 10}}>
					{'FLAP-D'.split('').map((ch, i) => (
						<div key={i} style={{fontFamily: ANTON, fontSize: 110, color: ch === '-' ? D.grey : D.ink, background: ch === '-' ? 'transparent' : D.gold, width: ch === '-' ? 40 : 100, textAlign: 'center', borderRadius: 14, transform: `translateY(${(1 - pop(f, showFlapd + i * 2)) * -200}px)`, opacity: pop(f, showFlapd + i * 2)}}>
							{ch}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export const S2Map = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tPlus = W('plus') - 2;
	const tMoitie = W('moitie') - 3;
	const cityTimes = [W('francfort'), W('londres'), W('amsterdam'), W('paris'), W('dublin')].map((t) => t - 3);
	return (
		<Shot transition="punch" push={0.04}>
			<TechBg hue={D.violet} />
			<EuropeHubs f={f} dotsFrom={tPlus} dotsTo={W('mille') + 6} focusAt={tMoitie} cityTimes={cityTimes} showFlapd={W('dublin') + 10} />
			<div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
				{f < tMoitie ? (
					<div style={{fontFamily: ANTON, fontSize: 120, color: D.white, opacity: f >= tPlus ? 1 : 0}}>
						{money(10000 * ease(f, tPlus, W('mille') + 4))}+ <span style={{fontSize: 60, color: D.grey}}>DATA CENTERS</span>
					</div>
				) : (
					<div style={{fontFamily: ANTON, fontSize: 96, color: D.gold, transform: `scale(${pop(f, tMoitie)})`}}>
						≈ 62 % <span style={{fontSize: 56, color: D.white}}>DE LA CAPACITÉ DANS 5 VILLES</span>
					</div>
				)}
			</div>
			<Fx at={0} name="whoosh" />
			{[0, 4, 8, 12, 16].map((d) => (
				<Fx key={d} at={tPlus + d} name="key" gain={0.7} />
			))}
			<Fx at={tMoitie} name="impact" gain={0.7} />
			{cityTimes.map((t, i) => (
				<Fx key={i} at={t} name="click" />
			))}
			<Fx at={W('dublin') + 10} name="stamp" />
		</Shot>
	);
};

/* 3 — Dublin 80 % ------------------------------------------------------------- */
export const S3Dublin = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tQ = W('quatre') - 3;
	const pct = 80 * ease(f, tQ, tQ + 22);
	const r = 250;
	const circ = 2 * Math.PI * r;
	return (
		<Shot transition="whip" push={0.05}>
			<Photo src="dublin" len={line.durationInFrames} from={[1.12, 30, 0]} to={[1.22, -40, -30]} dim={0.5} />
			<Head at={0} top={190} size={130}>
				À DUBLIN
			</Head>
			<div style={{position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<svg width={620} height={620} viewBox="-310 -310 620 620" style={{transform: 'rotate(-90deg)'}}>
					<circle r={r} fill="rgba(4,6,15,0.65)" stroke="rgba(255,255,255,0.15)" strokeWidth={46} />
					<circle r={r} fill="none" stroke={pct > 60 ? D.hot : D.gold} strokeWidth={46} strokeLinecap="round" strokeDasharray={`${(circ * pct) / 100} ${circ}`} style={{filter: `drop-shadow(0 0 20px ${D.hot})`}} />
				</svg>
				<div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 190, color: D.white}}>{Math.round(pct)} %</div>
			</div>
			<Head at={W("l'electricite") - 4} top={1080} size={64}>
				DE L'ÉLECTRICITÉ DE LA VILLE <span style={{color: D.grey}}>(2023)</span>
			</Head>
			<Fx at={0} name="swish" />
			<Fx at={tQ} name="riser" />
			<Fx at={tQ + 22} name="impact" gain={0.8} />
		</Shot>
	);
};

/* 4 — The grid can't keep up -------------------------------------------------- */
export const S4Grid = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMap = W('dublin') - 4;
	const tWait = W('et', 1) - 4;
	const years = Math.min(10, Math.floor(ease(f - tWait, 6, W('dix') - tWait + 4, (x) => x) * 10));
	const pauseAt = (city: string, at: number) => {
		const c = CITIES.find((x) => x.key === city)!;
		const [x, y] = project(c.lonlat);
		if (f - tMap < at) return null;
		const p = pop(f - tMap, at, {damping: 12, stiffness: 300, mass: 0.6});
		return (
			<g key={city} transform={`translate(${x}, ${y}) scale(${2.4 - 1.4 * p}) rotate(-8)`}>
				<rect x={-150} y={-46} width={300} height={92} rx={14} fill="rgba(4,6,15,0.85)" stroke={D.red} strokeWidth={8} />
				<text x={0} y={22} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill={D.red}>
					PAUSE
				</text>
			</g>
		);
	};
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMap}>
				<Shot transition="punch" push={0.06} flashColor={D.hot}>
					<Clip src="pylons" dim={0.45} tint="rgba(255,90,54,0.35)" />
					<Head at={W('reseau') - 4} top={560} size={150}>
						LE RÉSEAU
					</Head>
					<Head at={W('suit') - 4} top={720} size={150} color={D.hot} style={{transform: `translateX(${Math.sin(f * 1.7) * (f > W('suit') ? 4 : 0)}px)`}}>
						NE SUIT PLUS
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMap} until={tWait}>
				<TechBg hue={D.red} />
				<div style={{position: 'absolute', top: 160, left: 0, transform: 'scale(1.9)', transformOrigin: '320px 560px'}}>
					<MapFrame>
						<EuropeShapes />
						{pauseAt('dublin', 0)}
						{pauseAt('amsterdam', W('amsterdam') - tMap - 2)}
					</MapFrame>
				</div>
				<Head at={W('projets') - tMap - 4} top={1170} size={70} color={D.white}>
					NOUVEAUX PROJETS EN PAUSE
				</Head>
				<Fx at={0} name="stamp" />
				<Fx at={W('amsterdam') - tMap - 2} name="stamp" />
			</Cut>
			<Cut at={tWait}>
				<Clip src="pylons2" dim={0.5} />
				<Head at={W('raccordement') - tWait - 4} top={330} size={96}>
					UN RACCORDEMENT
				</Head>
				<div style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 320, color: D.hot, lineHeight: 1, textShadow: `0 0 70px ${D.hot}88`, transform: shake(f - tWait, W('dix') - tWait + 4, 16, 10)}}>
					{years >= 10 ? '10+' : years}
				</div>
				<Head at={W('dix') - tWait - 2} top={860} size={100}>
					ANS D'ATTENTE
				</Head>
				<Head at={W('dix') - tWait + 6} top={990} size={46} color={D.grey}>
					dans certains pays d'Europe
				</Head>
				<Fx at={0} name="whoosh" />
				<Fx at={6} name="clock" />
				<Fx at={W('dix') - tWait + 4} name="impact" gain={0.8} />
			</Cut>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={W('suit') - 4} name="buzzer" />
		</AbsoluteFill>
	);
};

/* 5 — AI accelerates: TWh chart ---------------------------------------------- */
export const S5Chart = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const t90 = W('quatre') - 3;
	const t130 = W('cent', 1) - 3;
	// chart box
	const x0 = 140;
	const x1 = 960;
	const yBase = 1150;
	const yFor = (twh: number) => yBase - (twh / 150) * 560;
	const pts: [number, number][] = [
		[x0, yFor(87)],
		[x0 + 270, yFor(98)],
		[x0 + 540, yFor(115)],
		[x1, yFor(134)],
	];
	const d = `M ${pts.map((p) => p.join(' ')).join(' L ')}`;
	const draw = ease(f, t90 + 6, t130 + 6, (x) => x);
	const {strokeDasharray, strokeDashoffset} = evolvePath(draw, d);
	return (
		<Shot transition="punch" push={0.03} flashColor={D.violet}>
			<TechBg hue={D.violet} />
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, alignItems: 'center'}}>
				<div style={{transform: `scale(${pop(f, W("l'ia") - 3)}) rotate(${Math.sin(f / 6) * 6}deg)`}}>
					<Icon name="sparkles" size={110} color={D.violet} />
				</div>
				<div style={{fontFamily: ANTON, fontSize: 110, color: D.white, opacity: pop(f, W("l'ia") - 3)}}>
					L'IA <span style={{color: D.violet}}>ACCÉLÈRE</span>
				</div>
			</div>
			<Head at={W('consommation') - 4} top={390} size={56} color={D.grey}>
				CONSOMMATION DES DATA CENTERS EUROPÉENS
			</Head>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
				{[50, 100, 150].map((v) => (
					<g key={v} opacity={ease(f, W('consommation'), W('consommation') + 10)}>
						<line x1={x0} y1={yFor(v)} x2={x1} y2={yFor(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
						<text x={x0 - 18} y={yFor(v) + 10} textAnchor="end" fontFamily={ANTON} fontSize={30} fill={D.grey}>
							{v}
						</text>
					</g>
				))}
				<path d={`${d} L ${x1} ${yBase} L ${x0} ${yBase} Z`} fill={`${D.violet}33`} opacity={draw} />
				<path d={d} stroke={D.violet} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{filter: `drop-shadow(0 0 16px ${D.violet})`}} />
				{f >= t90 && <circle cx={pts[0][0]} cy={pts[0][1]} r={18 * pop(f, t90)} fill={D.white} />}
				{f >= t130 + 6 && <circle cx={pts[3][0]} cy={pts[3][1]} r={22 * pop(f, t130 + 6)} fill={D.gold} />}
				<text x={x0} y={yBase + 60} fontFamily={ANTON} fontSize={44} fill={D.white}>
					2024
				</text>
				<text x={x1} y={yBase + 60} textAnchor="end" fontFamily={ANTON} fontSize={44} fill={D.white}>
					2030
				</text>
			</svg>
			{f >= t90 && (
				<div style={{position: 'absolute', left: x0 - 30, top: yFor(87) - 150, fontFamily: ANTON, fontSize: 80, color: D.white, transform: `scale(${pop(f, t90)})`}}>
					≈ 87 <span style={{fontSize: 40, color: D.grey}}>TWh</span>
				</div>
			)}
			{f >= t130 + 6 && (
				<div style={{position: 'absolute', right: 70, top: yFor(134) - 170, fontFamily: ANTON, fontSize: 110, color: D.gold, transform: `scale(${pop(f, t130 + 6)})`, textShadow: `0 0 40px ${D.gold}88`}}>
					134 <span style={{fontSize: 48}}>TWh</span>
				</div>
			)}
			<Head at={W('2030') - 2} top={1250} size={36} color={D.grey}>
				projection ENTSO-E · 2024 → 2030
			</Head>
			<Fx at={0} name="swish" />
			<Fx at={W("l'ia") - 3} name="ding" />
			<Fx at={t90} name="click" />
			<Fx at={t90 + 6} name="riser" />
			<Fx at={t130 + 6} name="riser-hit" />
		</Shot>
	);
};

/* 6 — Europe redraws its map: France ----------------------------------------- */
export const S6France = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tNuke = W('la') - 4;
	const tChoose = W('au') - 4;
	const shift = ease(f, 6, tNuke - 6);
	const fr = project([2.5, 46.6]);
	const no = project([15, 63]);
	const flapd = project([3, 51.5]);
	const arrow = (to: [number, number], at: number, color: string) => {
		const d = `M ${flapd[0]} ${flapd[1]} Q ${(flapd[0] + to[0]) / 2 + 80} ${(flapd[1] + to[1]) / 2} ${to[0]} ${to[1]}`;
		const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, at, at + 16), d);
		return <path d={d} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />;
	};
	const half = ease(f - tChoose, W('moitie') - tChoose - 3, W('moitie') - tChoose + 14);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tNuke}>
				<Shot transition="punch" push={0.04}>
					<TechBg hue={D.blue} />
					<div style={{position: 'absolute', top: 280, left: 0}}>
						<MapFrame>
							<EuropeShapes highlight={{France: shift > 0.3 ? '#1F3B7A' : '#141B2E', Norway: shift > 0.6 ? '#1E4A5E' : '#141B2E', Sweden: shift > 0.6 ? '#1E4A5E' : '#141B2E', Finland: shift > 0.6 ? '#1E4A5E' : '#141B2E'}} />
							<circle cx={flapd[0]} cy={flapd[1]} r={40} fill={D.gold} opacity={0.8} />
							{arrow(fr, 6, D.blue)}
							{arrow(no, 16, D.cyan)}
						</MapFrame>
					</div>
					<Head at={0} top={150} size={110}>
						L'EUROPE CHANGE
					</Head>
					<Head at={W('carte') - 4} top={270} size={110} color={D.gold}>
						DE CARTE
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tNuke} until={tChoose}>
				<Photo src="nuclear" len={tChoose - tNuke + 30} from={[1.05, 0, 40]} to={[1.2, 0, -40]} dim={0.4} />
				<Head at={W('france') - tNuke - 3} top={300} size={130}>
					LA FRANCE
				</Head>
				<Stack top={520} gap={26}>
					<Chip at={W('nucleaire') - tNuke - 3} text="ÉLECTRICITÉ NUCLÉAIRE" kind="ok" />
					<Chip at={W('bas') - tNuke - 3} text="BAS CARBONE" kind="ok" />
				</Stack>
				<Fx at={0} name="swish" />
				<Fx at={W('nucleaire') - tNuke - 3} name="pop" />
				<Fx at={W('bas') - tNuke - 3} name="pop" />
			</Cut>
			<Cut at={tChoose}>
				<Photo src="nuclear2" len={line.durationInFrames - tChoose} from={[1.1, 0, 0]} to={[1.2, 0, -30]} dim={0.72} />
				<Pill at={W('choose') - tChoose - 3} top={260} color={D.white} size={64}>
					CHOOSE FRANCE · 2026
				</Pill>
				<div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 280, color: D.gold, textShadow: `0 0 60px ${D.gold}77`, opacity: f - tChoose >= W('quatre') - tChoose - 3 ? 1 : 0}}>
					{Math.round(93 * ease(f - tChoose, W('quatre') - tChoose - 3, W('milliards') - tChoose + 6))} Md€
				</div>
				<Head at={W('annonces') - tChoose - 4} top={740} size={64}>
					D'INVESTISSEMENTS ANNONCÉS
				</Head>
				{f - tChoose >= W('pres') - tChoose - 4 && (
					<div style={{position: 'absolute', top: 880, left: 140, right: 140}}>
						<div style={{height: 70, borderRadius: 99, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', display: 'flex'}}>
							<div style={{width: `${50 * half}%`, background: D.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 40, color: D.white}}>{half > 0.6 ? '≈ ½' : ''}</div>
						</div>
						<div style={{fontFamily: ANTON, fontSize: 60, color: D.violet, textAlign: 'center', marginTop: 20, opacity: half}}>POUR DES DATA CENTERS D'IA</div>
					</div>
				)}
				<Fx at={0} name="whoosh" />
				<Fx at={W('quatre') - tChoose - 3} name="riser" />
				<Fx at={W('milliards') - tChoose + 6} name="cash" />
				<Fx at={W('moitie') - tChoose - 3} name="swish" />
			</Cut>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={6} name="swish" />
		</AbsoluteFill>
	);
};

/* 7 — Nordics + EU gigafactories --------------------------------------------- */
export const S7North = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tEU = W('et', 1) - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tEU}>
				<Shot transition="whip" push={0.05}>
					<Clip src="ice" dim={0.4} />
					<Head at={W('nordiques') - 4} top={300} size={110}>
						LES PAYS <span style={{color: D.cyan}}>NORDIQUES</span>
					</Head>
					<Stack top={520} gap={26}>
						<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: pop(f, W('froid') - 4)}}>
							<Icon name="snowflake" size={90} color={D.cyan} />
							<Chip at={W('froid') - 4} text="LE FROID = REFROIDISSEMENT GRATUIT" />
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: pop(f, W('energies') - 4)}}>
							<Icon name="wind" size={90} color={D.green} />
							<Chip at={W('energies') - 4} text="ÉNERGIES RENOUVELABLES" />
						</div>
					</Stack>
				</Shot>
			</Sequence>
			<Cut at={tEU}>
				<TechBg hue={D.blue} />
				{/* the twelve stars, assembling */}
				<div style={{position: 'absolute', top: 260, left: 340, width: 400, height: 400}}>
					{Array.from({length: 12}).map((_, i) => {
						const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
						const p = pop(f - tEU, 4 + i * 1.5);
						return (
							<div key={i} style={{position: 'absolute', left: 200 + Math.cos(a) * 170 * p - 24, top: 200 + Math.sin(a) * 170 * p - 24, width: 48, height: 48, transform: `rotate(${(1 - p) * 180}deg)`, opacity: p}}>
								<svg viewBox="-10 -10 20 20" width={48} height={48}>
									<path d="M0 -9 L2.6 -2.8 L9 -2.8 L3.8 1.2 L5.6 8 L0 4 L-5.6 8 L-3.8 1.2 L-9 -2.8 L-2.6 -2.8 Z" fill={D.gold} />
								</svg>
							</div>
						);
					})}
					<div style={{position: 'absolute', inset: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f - tEU, W('gigafactories') - tEU - 3)})`}}>
						<Icon name="cpu" size={150} color={D.white} />
					</div>
				</div>
				<Head at={W('bruxelles') - tEU - 3} top={720} size={90} color={D.grey}>
					BRUXELLES LANCE DES
				</Head>
				<Head at={W('gigafactories') - tEU - 3} top={830} size={130} color={D.gold}>
					GIGAFACTORIES D'IA
				</Head>
				<Stack top={1010} gap={20}>
					<Chip at={W('gigafactories') - tEU + 12} text="JUSQU'À 7 SITES · APPEL 2026" size={46} />
					<Chip at={W('dependre') - tEU - 3} text="MOINS DÉPENDRE DES GÉANTS US" kind="ok" size={46} />
				</Stack>
				<Fx at={0} name="whoosh" />
				<Fx at={4} name="riser" />
				<Fx at={W('gigafactories') - tEU - 3} name="impact" gain={0.8} />
				<Fx at={W('dependre') - tEU - 3} name="pop" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('froid') - 4} name="pop" />
			<Fx at={W('energies') - 4} name="pop" />
		</AbsoluteFill>
	);
};

/* 8 — The real challenge ------------------------------------------------------ */
export const S8Challenge = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tiles = [
		{at: W("l'electricite") - 3, icon: 'zap', label: 'ÉLECTRICITÉ', color: D.gold},
		{at: W("l'eau") - 3, icon: 'droplets', label: 'EAU', color: D.cyan},
		{at: W('place') - 3, icon: 'land-plot', label: 'TERRAIN', color: D.green},
	];
	return (
		<Shot transition="punch" push={0.04}>
			<Photo src="serverroom" len={line.durationInFrames} from={[1.05, 0, 0]} to={[1.15, 0, -30]} dim={0.78} />
			<Head at={W('defi') - 4} top={240} size={110}>
				LE VRAI DÉFI
			</Head>
			{f < W("c'est") - 4 ? (
				<Head at={W('construire') - 4} top={420} size={80} color={D.grey}>
					<span style={{textDecoration: f > W('serveurs') + 6 ? 'line-through' : 'none', textDecorationColor: D.red, textDecorationThickness: 10}}>CONSTRUIRE DES SERVEURS</span>
				</Head>
			) : (
				<Head at={W("c'est") - 4} top={420} size={80} color={D.white}>
					C'EST DE TROUVER…
				</Head>
			)}
			<div style={{position: 'absolute', top: 620, left: 50, right: 50, display: 'flex', justifyContent: 'center', gap: 26}}>
				{tiles.map((t) => {
					const p = pop(f, t.at);
					return (
						<div key={t.label} style={{width: 300, padding: '40px 0 30px', borderRadius: 40, background: 'rgba(4,6,15,0.85)', border: `5px solid ${f >= t.at ? t.color : 'rgba(255,255,255,0.15)'}`, textAlign: 'center', transform: `translateY(${(1 - p) * 120}px)`, opacity: Math.max(0.15, p), boxShadow: f >= t.at ? `0 0 50px ${t.color}55` : 'none'}}>
							<Icon name={t.icon} size={130} color={t.color} />
							<div style={{fontFamily: ANTON, fontSize: 54, color: D.white, marginTop: 16}}>{t.label}</div>
						</div>
					);
				})}
			</div>
			<Fx at={0} name="whoosh" />
			<Fx at={W('serveurs') + 6} name="buzzer" gain={0.7} />
			{tiles.map((t) => (
				<Fx key={t.label} at={t.at} name="click" />
			))}
		</Shot>
	);
};

/* 9 — The lesson -------------------------------------------------------------- */
export const S9Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tNow = W("aujourd'hui") - 6;
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const gold = ["l'intelligence", "l'électricité."];
	const words = (ws: typeof line.words) =>
		ws.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', marginRight: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: gold.includes(w.text) ? D.gold : D.white}}>
					{w.text}
				</span>
			);
		});
	const cross = ease(f, tNow, tNow + 18);
	return (
		<Shot transition="none" push={0.05} len={line.durationInFrames}>
			<AbsoluteFill style={{opacity: 1 - cross}}>
				<Photo src="smoke" len={tNow + 30} from={[1.05, 0, 0]} to={[1.18, 0, -50]} dim={0.55} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: cross}}>
				<Clip src="servers" dim={0.55} tint="rgba(255,210,90,0.25)" />
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 12)}} />
			<div style={{position: 'absolute', top: 430, left: 80, right: 80, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 82, lineHeight: 1.2, textShadow: '0 8px 30px rgba(0,0,0,0.9)'}}>
				<div>{words(line.words.slice(0, split))}</div>
				<div style={{marginTop: 46}}>{words(line.words.slice(split))}</div>
			</div>
			<Fx at={0} name="whoosh" gain={0.6} />
			<Fx at={tNow} name="swish" gain={0.6} />
		</Shot>
	);
};

/* 10 — Call to action ----------------------------------------------------------- */
export const S10Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	const dc = pop(f, W('data') - 3);
	return (
		<Shot transition="punch" push={0.03}>
			<TechBg hue={D.gold} />
			<Head at={0} top={200} size={110}>
				ET TOI ?
			</Head>
			{/* house and data center side by side */}
			<div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 50}}>
				<div style={{textAlign: 'center', transform: `scale(${pop(f, 4)})`}}>
					<div style={{width: 230, height: 230, borderRadius: 40, background: '#13203F', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${D.green}`}}>
						<Icon name="house" size={140} color={D.green} />
					</div>
					<div style={{fontFamily: ANTON, fontSize: 44, color: D.white, marginTop: 10}}>CHEZ TOI</div>
				</div>
				<div style={{textAlign: 'center', transform: `translateX(${(1 - dc) * 400}px)`, opacity: dc}}>
					<div style={{width: 330, height: 330, borderRadius: 40, background: '#1A1430', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${D.violet}`, boxShadow: `0 0 ${40 + 20 * Math.sin(f / 5)}px ${D.violet}88`}}>
						<Icon name="server" size={200} color={D.violet} />
					</div>
					<div style={{fontFamily: ANTON, fontSize: 44, color: D.white, marginTop: 10}}>DATA CENTER</div>
				</div>
			</div>
			<Head at={W('accepterais') - 3} top={860} size={90} color={D.gold}>
				TU ACCEPTERAIS ?
			</Head>
			{f >= after && (
				<div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: D.ink, background: D.white, padding: '18px 40px', borderRadius: 99}}>DIS-LE EN COMMENTAIRE</div>
					<div style={{fontSize: 80, color: D.gold, transform: `translateY(${Math.abs(Math.sin(f / 5)) * 18}px)`}}>▼</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1290, left: 110, right: 110, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(245,247,255,0.65)', opacity: ease(f, 6, 20)}}>
				Sources : CSO Irlande (2025), ENTSO-E, Ember, Choose France 2026, Commission européenne. Projections simplifiées.
				<br />
				Voix : ElevenLabs · Images : Pixabay
			</div>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={W('data') - 3} name="swish" />
			<Fx at={after} name="pop" />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1What, S2Map, S3Dublin, S4Grid, S5Chart, S6France, S7North, S8Challenge, S9Lesson, S10Outro];
