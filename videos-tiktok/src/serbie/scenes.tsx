import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP, ease, lerp, pop, rand, shake} from '../components/anim';
import {ANTON, SANS, SERIF} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Chip, Footage as BaseFootage, Head, Icon, Stack} from '../statuts/kit';

type SceneProps = {line: Line};

export const R = {
	ink: '#070A12',
	white: '#F5F6FA',
	grey: '#8D95A8',
	red: '#C6363C',
	blue: '#2E5BBA',
	gold: '#FFC93C',
	slate: '#5D6B86',
	green: '#3BE38B',
};

/* Building blocks --------------------------------------------------------------- */

const Clip = (props: React.ComponentProps<typeof BaseFootage>) => <BaseFootage folder="serbie" {...props} />;

const Photo = ({src, len = 200, from = [1.05, 0, 0], to = [1.18, 0, -40], dim = 0.45, grey = false}: {src: string; len?: number; from?: [number, number, number]; to?: [number, number, number]; dim?: number; grey?: boolean}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [0, len], [0, 1], CLAMP);
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: R.ink}}>
			<Img
				src={staticFile(`serbie/photos/${src}.jpg`)}
				style={{position: 'absolute', left: -81, top: -144, width: 1242, height: 2208, filter: grey ? 'grayscale(1) contrast(1.1)' : 'none', transform: `translate(${lerp(p, from[1], to[1])}px, ${lerp(p, from[2], to[2])}px) scale(${lerp(p, from[0], to[0])})`}}
			/>
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,10,18,${dim + 0.25}) 0%, rgba(7,10,18,${dim - 0.1}) 40%, rgba(7,10,18,${dim}) 70%, rgba(7,10,18,${dim + 0.35}) 100%)`}} />
		</AbsoluteFill>
	);
};

const NewsBg = ({tint = R.blue}: {tint?: string}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${tint}33 0%, ${R.ink} 65%)`, overflow: 'hidden'}}>
			<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)', transform: `translateY(${(f * 0.5) % 6}px)`}} />
		</AbsoluteFill>
	);
};

const Cut = ({at, until, children, transition = 'punch'}: {at: number; until?: number; children: React.ReactNode; transition?: 'punch' | 'whip' | 'flash' | 'none'}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={until !== undefined ? until - Math.max(0, at) : undefined}>
		<Shot transition={transition} push={0}>
			{children}
		</Shot>
	</Sequence>
);

/** News-style date/location tag. */
const Tag = ({at, children, top = 230, color = R.red}: {at: number; children: React.ReactNode; top?: number; color?: string}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	return (
		<div style={{position: 'absolute', top, left: 60, display: 'flex', alignItems: 'stretch', transform: `translateX(${(1 - p) * -600}px)`}}>
			<div style={{width: 16, background: color}} />
			<div style={{fontFamily: ANTON, fontSize: 64, color: R.white, background: 'rgba(7,10,18,0.85)', padding: '6px 26px 10px'}}>{children}</div>
		</div>
	);
};

/** Serbian flag colours as a thin animated band (no coat of arms). */
const FlagBand = ({at, top}: {at: number; top: number}) => {
	const f = useCurrentFrame();
	const w = ease(f, at, at + 14);
	return (
		<div style={{position: 'absolute', top, left: 0, width: 1080 * w, height: 54, overflow: 'hidden'}}>
			<div style={{height: 18, background: R.red}} />
			<div style={{height: 18, background: R.blue}} />
			<div style={{height: 18, background: R.white}} />
		</div>
	);
};

/* 0 — Hook: the canopy falls, then power falls ------------------------------------ */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tFall = W("s'effondre") - 2;
	const tPower = W('tomber') - 4;
	const canopy = ease(f, tFall, tFall + 10, (x) => x * x);
	const power = ease(f, tPower, tPower + 12, (x) => x * x);
	return (
		<Shot transition="flash" push={0.05}>
			<NewsBg tint={R.red} />
			<Head at={0} top={180} size={92}>
				UN TOIT DE GARE
			</Head>
			{/* station facade */}
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, transform: shake(f, tFall + 10, 18, 12)}}>
				<rect x={190} y={560} width={700} height={420} fill="#1A2236" stroke={R.grey} strokeWidth={4} />
				{[0, 1, 2, 3, 4].map((i) => (
					<rect key={i} x={240 + i * 130} y={640} width={80} height={160} rx={40} fill="#0C111E" stroke={R.grey} strokeWidth={3} />
				))}
				{/* the canopy slab */}
				<g transform={`translate(0, ${canopy * 300}) rotate(${canopy * 14}, 540, 860)`} opacity={1 - Math.max(0, power - 0.5)}>
					<rect x={130} y={840} width={820} height={44} fill={f >= tFall ? R.red : '#8E98AE'} stroke={R.ink} strokeWidth={4} />
				</g>
				{/* dust */}
				{f > tFall + 8 &&
					Array.from({length: 26}).map((_, i) => {
						const d = f - tFall - 8;
						return <circle key={i} cx={160 + rand(i) * 760 + Math.sin(i + d / 6) * d} cy={1180 - d * (1 + rand(i + 3) * 2)} r={20 + d * 1.2} fill="rgba(200,200,210,0.12)" />;
					})}
			</svg>
			{f >= W('a') - 4 && (
				<div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 82, color: R.grey}}>…A FAIT TOMBER</div>
					<div style={{display: 'inline-block', marginTop: 10, fontFamily: ANTON, fontSize: 150, color: R.ink, background: R.white, padding: '0 34px', transform: `translateY(${power * 40}px) rotate(${power * -8}deg)`, boxShadow: `0 0 60px ${R.red}66`}}>LE POUVOIR</div>
				</div>
			)}
			<FlagBand at={W('serbie') - 6} top={1440} />
			<Head at={W('serbie') - 4} top={1520} size={110}>
				EN SERBIE{' '}?
			</Head>
			<Fx at={0} name="riser" />
			<Fx at={tFall + 8} name="impact" />
			<Fx at={tPower + 10} name="stamp" />
		</Shot>
	);
};

/* 1 — Novi Sad, 1 November 2024 --------------------------------------------------- */
export const S1NoviSad = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCollapse = W("l'auvent") - 4;
	const tToll = W('seize') - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tToll}>
				<Shot transition="whip" push={0.06}>
					<Photo src="novisad" len={tToll + 20} from={[1.05, 0, 0]} to={[1.16, 0, -40]} dim={0.4} />
					<Tag at={W('novembre') - 6}>1ER NOVEMBRE 2024</Tag>
					<Tag at={W('novi') - 4} top={340} color={R.blue}>
						NOVI SAD
					</Tag>
					<Head at={tCollapse} top={760} size={96}>
						L'AUVENT DE LA GARE
					</Head>
					<Head at={W('renovee') - 4} top={880} size={60} color={R.grey}>
						TOUT JUSTE RÉNOVÉE
					</Head>
					<Head at={W("s'ecroule") - 4} top={990} size={130} color={R.red}>
						S'ÉCROULE
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tToll} transition="none">
				<Clip src="candle" dim={0.45} />
				<div style={{position: 'absolute', top: 360, left: 160, right: 160, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 26}}>
					{Array.from({length: 16}).map((_, i) => {
						const p = ease(f - tToll, 2 + i * 1.5, 10 + i * 1.5);
						return <div key={i} style={{width: 40, height: 40, borderRadius: 99, background: R.gold, opacity: p, boxShadow: `0 0 ${20 + 10 * Math.sin((f + i * 7) / 5)}px ${R.gold}`}} />;
					})}
				</div>
				<div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 300, color: R.white, opacity: ease(f - tToll, 4, 16)}}>16</div>
				<Head at={6} top={930} size={100}>
					MORTS
				</Head>
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('novembre') - 6} name="click" />
			<Fx at={W("s'ecroule") - 4} name="impact" gain={0.8} />
			<Fx at={tToll} name="whoosh" gain={0.5} />
		</AbsoluteFill>
	);
};

/* 2 — Not an accident: corruption ------------------------------------------------- */
export const S2Corruption = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tStrike = W('accident') + 2;
	const tStamp = W('corruption') - 3;
	return (
		<Shot transition="punch" push={0.05}>
			<Photo src="storm" len={line.durationInFrames} from={[1.1, 0, 0]} to={[1.22, -30, 0]} dim={0.5} />
			<Head at={W('beaucoup') - 4} top={300} size={80} color={R.grey}>
				POUR BEAUCOUP DE SERBES
			</Head>
			<div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', opacity: pop(f, W('pas') - 4)}}>
				<span style={{position: 'relative', fontFamily: ANTON, fontSize: 150, color: R.white}}>
					UN ACCIDENT ?
					<span style={{position: 'absolute', left: -10, top: '52%', height: 16, width: `${ease(f, tStrike, tStrike + 8) * 106}%`, background: R.red, transform: 'rotate(-4deg)'}} />
				</span>
			</div>
			{f >= tStamp && (
				<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(-6deg) scale(${2.4 - 1.4 * pop(f, tStamp, {damping: 12, stiffness: 300, mass: 0.6})})`}}>
					<div style={{fontFamily: ANTON, fontSize: 150, color: R.red, border: `12px solid ${R.red}`, borderRadius: 20, padding: '0 40px', background: 'rgba(7,10,18,0.7)'}}>CORRUPTION</div>
				</div>
			)}
			<Head at={tStamp + 10} top={1050} size={56} color={R.grey}>
				LE SYMBOLE DES GRANDS CHANTIERS PUBLICS
			</Head>
			<Fx at={0} name="whoosh" />
			<Fx at={tStrike} name="click" />
			<Fx at={tStamp} name="stamp" />
		</Shot>
	);
};

/* 3 — The students rise ------------------------------------------------------------ */
export const S3Students = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tSilence = W('en') - 4;
	const stages = [
		{at: W('universites') - 4, icon: 'book-open', label: 'UNIVERSITÉS BLOQUÉES'},
		{at: W('routes') - 4, icon: 'map-pin', label: 'ROUTES BLOQUÉES'},
	];
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tSilence}>
				<Shot transition="whip" push={0.05}>
					<NewsBg tint={R.gold} />
					<Head at={W('etudiants') - 4} top={200} size={130} color={R.gold}>
						LES ÉTUDIANTS
					</Head>
					<Head at={W('levent') - 4} top={340} size={90}>
						SE LÈVENT
					</Head>
					{/* a growing crowd of students */}
					<div style={{position: 'absolute', top: 520, left: 90, right: 90, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center'}}>
						{Array.from({length: 120}).map((_, i) => {
							const p = pop(f, W('levent') - 4 + (i % 12) * 0.8 + Math.floor(i / 12) * 1.6, {damping: 12, stiffness: 300, mass: 0.4});
							return (
								<div key={i} style={{transform: `scale(${p}) translateY(${Math.sin((f + i * 3) / 5) * 3}px)`, opacity: p > 0.05 ? 1 : 0}}>
									<Icon name="user" size={58} color={i % 9 === 0 ? R.gold : R.white} />
								</div>
							);
						})}
					</div>
					<Stack top={1180} gap={18}>
						{stages.map((s) =>
							f >= s.at ? (
								<div key={s.label} style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(7,10,18,0.85)', borderRadius: 22, padding: '12px 26px', transform: `translateX(${(1 - pop(f, s.at)) * -300}px)`}}>
									<Icon name={s.icon} size={60} color={R.gold} />
									<span style={{fontFamily: ANTON, fontSize: 56, color: R.white}}>{s.label}</span>
								</div>
							) : null,
						)}
					</Stack>
				</Shot>
			</Sequence>
			<Cut at={tSilence} transition="none">
				<AbsoluteFill style={{background: R.ink}} />
				<div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<svg width={420} height={420} viewBox="-210 -210 420 420" style={{transform: 'rotate(-90deg)'}}>
						<circle r={180} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={18} />
						<circle r={180} fill="none" stroke={R.white} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 180 * ease(f - tSilence, 0, line.durationInFrames - tSilence, (x) => x)} 2000`} />
					</svg>
				</div>
				<Head at={2} top={1000} size={110}>
					EN SILENCE
				</Head>
				<Head at={W('une') - tSilence - 4} top={1130} size={64} color={R.gold}>
					UNE MINUTE PAR VICTIME
				</Head>
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('levent') - 4} name="riser" />
			{stages.map((s) => (
				<Fx key={s.label} at={s.at} name="stamp" gain={0.8} />
			))}
			<Fx at={tSilence + 4} name="clock" gain={0.6} />
		</AbsoluteFill>
	);
};

/* 4 — 15 March 2025, Belgrade ------------------------------------------------------ */
export const S4March = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tPm = W('le', 1) - 4;
	const crowd = Math.floor(ease(f, W('belgrade') - 4, W('histoire'), (x) => x) * 420);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tPm}>
				<Shot transition="punch" push={0.06}>
					<Clip src="belgrade-river" dim={0.45} />
					<Tag at={W('quinze') - 4}>15 MARS 2025</Tag>
					<Tag at={W('belgrade') - 4} top={340} color={R.blue}>
						BELGRADE
					</Tag>
					{/* crowd density, drawn as light points */}
					<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
						{Array.from({length: crowd}).map((_, i) => (
							<circle key={i} cx={80 + rand(i * 1.7) * 920} cy={560 + rand(i * 3.3) * 520} r={5 + rand(i) * 3} fill={i % 7 === 0 ? R.gold : R.white} opacity={0.75} />
						))}
					</svg>
					<Head at={W('grandes') - 4} top={1130} size={78}>
						L'UNE DES PLUS GRANDES
					</Head>
					<Head at={W('manifestations') - 4} top={1220} size={78} color={R.gold}>
						MANIFESTATIONS DU PAYS
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tPm}>
				<NewsBg tint={R.blue} />
				<div style={{position: 'absolute', top: 330, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 40}}>
					{[
						{at: 0, role: 'PREMIER MINISTRE', status: 'DÉMISSION', sub: 'janvier 2025', color: R.red},
						{at: W('president') - tPm - 4, role: 'PRÉSIDENT · A. VUČIĆ', status: 'RESTE', sub: '', color: R.slate},
					].map((r) =>
						f - tPm >= r.at ? (
							<div key={r.role} style={{background: 'rgba(245,246,250,0.06)', border: `4px solid ${r.color}`, borderRadius: 28, padding: '30px 36px', transform: `translateX(${(1 - pop(f - tPm, r.at)) * 400}px)`}}>
								<div style={{fontFamily: ANTON, fontSize: 54, color: R.grey}}>{r.role}</div>
								<div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
									<div style={{fontFamily: ANTON, fontSize: 120, color: r.color === R.red ? R.red : R.white}}>{r.status}</div>
									<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: R.grey}}>{r.sub}</div>
								</div>
							</div>
						) : null,
					)}
				</div>
				<Head at={W('tient') - tPm - 4} top={1000} size={110} color={R.white}>
					IL TIENT BON.
				</Head>
				<Fx at={0} name="stamp" gain={0.8} />
				<Fx at={W('president') - tPm - 4} name="whoosh" />
			</Cut>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={W('belgrade') - 4} name="riser" />
		</AbsoluteFill>
	);
};

/* 5 — Sixteen months of refusal ---------------------------------------------------- */
export const S5Refusal = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCount = W('pendant') - 4;
	const months = Math.min(16, Math.floor(ease(f, tCount, W('mois') + 4, (x) => x) * 16));
	return (
		<Shot transition="whip" push={0.04}>
			<NewsBg tint={R.slate} />
			<Head at={0} top={240} size={86} color={R.grey}>
				LES ÉTUDIANTS RÉCLAMENT
			</Head>
			<Head at={W('elections') - 4} top={350} size={84} color={R.gold}>
				DES ÉLECTIONS ANTICIPÉES
			</Head>
			{f >= W('refuse') - 4 && (
				<div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 90, color: R.white, background: R.red, padding: '4px 40px', transform: `rotate(-4deg) scale(${pop(f, W('refuse') - 4)})`}}>VUČIĆ REFUSE</div>
				</div>
			)}
			{f >= tCount && (
				<>
					<div style={{position: 'absolute', top: 740, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 300, color: R.white, lineHeight: 1}}>{months}</div>
					<Head at={tCount + 2} top={1050} size={90}>
						MOIS
					</Head>
					<div style={{position: 'absolute', top: 1180, left: 120, right: 120, display: 'flex', gap: 8}}>
						{Array.from({length: 16}).map((_, i) => (
							<div key={i} style={{flex: 1, height: 40, borderRadius: 8, background: i < months ? R.red : 'rgba(255,255,255,0.12)'}} />
						))}
					</div>
				</>
			)}
			<Fx at={0} name="swish" />
			<Fx at={W('refuse') - 4} name="buzzer" />
			<Fx at={tCount} name="clock" />
		</Shot>
	);
};

/* 6 — September 2026: he steps down to run ----------------------------------------- */
export const S6Run = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tSwap = W('quitte') - 4;
	const move = ease(f, tSwap, tSwap + 16);
	return (
		<Shot transition="punch" push={0.05}>
			<Photo src="fortress" len={line.durationInFrames} dim={0.62} />
			<Tag at={W('septembre') - 4}>SEPTEMBRE 2026</Tag>
			<Head at={W('cede') - 4} top={360} size={130} color={R.gold}>
				IL CÈDE
			</Head>
			<div style={{position: 'absolute', top: 620, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<div style={{width: 400, padding: '30px 20px', borderRadius: 26, border: `4px solid ${R.grey}`, background: 'rgba(7,10,18,0.8)', textAlign: 'center', opacity: lerp(move, 1, 0.45)}}>
					<div style={{fontFamily: ANTON, fontSize: 52, color: R.grey}}>QUITTE</div>
					<div style={{fontFamily: ANTON, fontSize: 70, color: R.white, textDecoration: move > 0.6 ? 'line-through' : 'none', textDecorationColor: R.red}}>PRÉSIDENCE</div>
				</div>
				<div style={{fontFamily: ANTON, fontSize: 100, color: R.gold, opacity: move}}>→</div>
				<div style={{width: 400, padding: '30px 20px', borderRadius: 26, border: `4px solid ${R.gold}`, background: 'rgba(7,10,18,0.8)', textAlign: 'center', transform: `scale(${pop(f, W('presenter') - 4)})`}}>
					<div style={{fontFamily: ANTON, fontSize: 52, color: R.grey}}>CANDIDAT</div>
					<div style={{fontFamily: ANTON, fontSize: 64, color: R.gold}}>PREMIER MINISTRE</div>
				</div>
			</div>
			<Head at={W('presenter') + 6} top={960} size={44} color={R.grey}>
				démission le 27 septembre · élections législatives anticipées le 25 octobre
			</Head>
			<Fx at={0} name="whoosh" />
			<Fx at={tSwap} name="swish" />
			<Fx at={W('presenter') - 4} name="pop" />
		</Shot>
	);
};

/* 7 — The Student List -------------------------------------------------------------- */
export const S7List = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tBadge = W('liste') - 3;
	const who = [
		{at: W('professeurs') - 4, icon: 'book-open', label: 'PROFESSEURS'},
		{at: W('medecins') - 4, icon: 'hospital', label: 'MÉDECINS'},
		{at: W('figures') - 4, icon: 'users', label: 'SOCIÉTÉ CIVILE'},
	];
	return (
		<Shot transition="punch" push={0.04} flashColor={R.gold}>
			<NewsBg tint={R.gold} />
			<Head at={0} top={190} size={70} color={R.grey}>
				FACE À LUI
			</Head>
			{f >= tBadge && (
				<div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 130, color: R.ink, background: R.gold, padding: '0 46px 10px', borderRadius: 26, transform: `scale(${2 - pop(f, tBadge)}) rotate(${(1 - pop(f, tBadge)) * -8}deg)`, boxShadow: `0 0 80px ${R.gold}66`}}>LISTE ÉTUDIANTE</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 600, left: 50, right: 50, display: 'flex', justifyContent: 'center', gap: 24}}>
				{who.map((w) => {
					const p = pop(f, w.at);
					return (
						<div key={w.label} style={{width: 300, padding: '34px 0 26px', borderRadius: 34, background: 'rgba(245,246,250,0.06)', border: `4px solid ${f >= w.at ? R.gold : 'rgba(255,255,255,0.12)'}`, textAlign: 'center', transform: `translateY(${(1 - p) * 140}px)`, opacity: Math.max(0.12, p)}}>
							<Icon name={w.icon} size={120} color={R.gold} />
							<div style={{fontFamily: ANTON, fontSize: 46, color: R.white, marginTop: 14}}>{w.label}</div>
						</div>
					);
				})}
			</div>
			<Head at={W('choisis') - 4} top={1000} size={90}>
				CHOISIS PAR <span style={{color: R.gold}}>LES ÉTUDIANTS</span>
			</Head>
			<Fx at={tBadge} name="impact" gain={0.8} />
			{who.map((w) => (
				<Fx key={w.label} at={w.at} name="pop" />
			))}
		</Shot>
	);
};

/* 8 — Election night: turnout and results ------------------------------------------- */
export const S8Results = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tRes = W('la', 1) - 4;
	const bar = (label: string, pct: number, color: string, at: number) => {
		const p = ease(f - tRes, at, at + 22);
		return (
			<div style={{marginBottom: 46, opacity: f - tRes >= at ? 1 : 0.2}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: ANTON, color: R.white}}>
					<span style={{fontSize: 58}}>{label}</span>
					<span style={{fontSize: 96, color}}>≈ {Math.round(pct * p)} %</span>
				</div>
				<div style={{height: 70, borderRadius: 14, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
					<div style={{width: `${pct * p}%`, height: '100%', background: color}} />
				</div>
			</div>
		);
	};
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tRes}>
				<Shot transition="whip" push={0.05}>
					<Clip src="belgrade-tower" dim={0.5} />
					<Tag at={W('25') - 4}>25 OCTOBRE 2026</Tag>
					<Head at={W('participation') - 4} top={700} size={96}>
						PARTICIPATION
					</Head>
					<Head at={W('forte') - 4} top={820} size={110} color={R.gold}>
						LA PLUS FORTE
					</Head>
					<Head at={W('trente') - 4} top={950} size={80}>
						DEPUIS 30 ANS
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tRes}>
				<NewsBg tint={R.gold} />
				<Head at={0} top={210} size={84}>
					RÉSULTATS
				</Head>
				<Head at={2} top={310} size={40} color={R.grey}>
					provisoires · commission électorale (RIK)
				</Head>
				<div style={{position: 'absolute', top: 460, left: 80, right: 80}}>
					{bar('LISTE ÉTUDIANTE', 53, R.gold, W('cinquante') - tRes - 6)}
					{bar('LISTE DE VUČIĆ (SNS)', 40, R.slate, W('quarante') - tRes - 6)}
				</div>
				<Fx at={W('cinquante') - tRes - 6} name="riser-hit" />
				<Fx at={W('quarante') - tRes - 6} name="click" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('forte') - 4} name="impact" gain={0.6} />
			<Fx at={tRes} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 9 — Majority, concession, end of an era ------------------------------------------- */
const SEATS = (() => {
	// 250 seats on concentric arcs, ordered left to right.
	const rows = [34, 40, 46, 52, 78];
	const radii = [190, 250, 310, 370, 430];
	const out: {x: number; y: number; a: number}[] = [];
	rows.forEach((n, r) => {
		for (let i = 0; i < n; i++) {
			const a = Math.PI - (i / (n - 1)) * Math.PI;
			out.push({x: 540 + Math.cos(a) * radii[r], y: 900 - Math.sin(a) * radii[r], a});
		}
	});
	return out.sort((p, q) => q.a - p.a);
})();

export const S9Majority = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const fill = ease(f, 6, W('absolue') + 6, (x) => x);
	const tConcede = W('le') - 4;
	const tEra = W('quatorze') - 4;
	const years = Math.round(lerp(ease(f, tEra, tEra + 20), 0, 14));
	return (
		<Shot transition="punch" push={0.03}>
			<NewsBg tint={R.gold} />
			<Head at={0} top={180} size={70} color={R.grey}>
				PARLEMENT · 250 SIÈGES
			</Head>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				{SEATS.map((s, i) => {
					// projections: about 138 Student List, about 104 SNS, the rest others
					const color = i < 138 ? R.gold : i >= 146 ? R.slate : R.grey;
					const shown = i < 250 * fill;
					return <circle key={i} cx={s.x} cy={s.y} r={11} fill={shown ? color : 'rgba(255,255,255,0.08)'} />;
				})}
				<line x1={540} y1={440} x2={540} y2={920} stroke={R.white} strokeWidth={4} strokeDasharray="12 10" opacity={ease(f, W('majorite') - 4, W('majorite') + 6)} />
			</svg>
			<Head at={W('majorite') - 4} top={940} size={86} color={R.gold}>
				MAJORITÉ ABSOLUE
			</Head>
			<Head at={W('majorite') + 4} top={1040} size={40} color={R.grey}>
				≈ 138 / 250 sièges (projections) · majorité : 126
			</Head>
			{f >= tConcede && f < tEra && (
				<div style={{position: 'absolute', top: 1130, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 70, color: R.white, background: R.red, padding: '6px 34px', transform: `rotate(-3deg) scale(${pop(f, tConcede)})`}}>VUČIĆ RECONNAÎT SA DÉFAITE</div>
				</div>
			)}
			{f >= tEra && (
				<div style={{position: 'absolute', top: 1120, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, tEra)})`}}>
					<span style={{fontFamily: ANTON, fontSize: 110, color: R.white}}>{years} ANS</span>
					<span style={{fontFamily: ANTON, fontSize: 60, color: R.grey}}> DE POUVOIR SNS · FIN</span>
				</div>
			)}
			<Fx at={6} name="riser" />
			<Fx at={W('majorite') - 4} name="impact" gain={0.8} />
			<Fx at={tConcede} name="stamp" />
			<Fx at={tEra} name="clock" gain={0.6} />
		</Shot>
	);
};

/* 10 — What's next ------------------------------------------------------------------ */
export const S10Next = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const todo = [
		{at: W('gouvernement') - 4, text: 'FORMER UN GOUVERNEMENT'},
		{at: W('president') - 4, text: 'ÉLIRE UN PRÉSIDENT', sub: 'scrutin attendu d’ici fin 2026'},
		{at: W('corruption') - 6, text: 'LUTTER CONTRE LA CORRUPTION'},
	];
	return (
		<Shot transition="whip" push={0.05}>
			<Clip src="belgrade-bridge" dim={0.6} />
			<Head at={0} top={250} size={110}>
				MAINTENANT
			</Head>
			<Head at={W('reste') - 4} top={370} size={80} color={R.gold}>
				TOUT RESTE À FAIRE
			</Head>
			<Stack top={580} gap={28}>
				{todo.map((t) => (
					<Chip key={t.text} at={t.at} text={t.text} sub={t.sub} />
				))}
			</Stack>
			<Fx at={0} name="whoosh" />
			{todo.map((t) => (
				<Fx key={t.text} at={t.at} name="click" />
			))}
		</Shot>
	);
};

/* 11 — The lesson ------------------------------------------------------------------- */
export const S11Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const gold = ['silence.', 'entendre.'];
	const words = (ws: typeof line.words) =>
		ws.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', marginRight: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: gold.includes(w.text) ? R.gold : R.white}}>
					{w.text}
				</span>
			);
		});
	return (
		<Shot transition="none" push={0.06} len={line.durationInFrames}>
			<Clip src="candle" trim={150} dim={0.5} />
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 14)}} />
			<div style={{position: 'absolute', top: 420, left: 80, right: 80, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 88, lineHeight: 1.2, textShadow: '0 8px 30px rgba(0,0,0,0.9)'}}>
				<div>{words(line.words.slice(0, split))}</div>
				<div style={{marginTop: 46}}>{words(line.words.slice(split))}</div>
			</div>
		</Shot>
	);
};

/* 12 — Call to action ----------------------------------------------------------------- */
export const S12Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	return (
		<Shot transition="punch" push={0.03}>
			<Photo src="danube" len={line.durationInFrames + 60} dim={0.55} />
			<Head at={0} top={420} size={120}>
				TU VEUX
			</Head>
			<Head at={W('suite') - 4} top={560} size={160} color={R.gold}>
				LA SUITE ?
			</Head>
			{f >= after && (
				<div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: R.ink, background: R.white, padding: '18px 40px', borderRadius: 99}}>DIS-LE EN COMMENTAIRE</div>
					<div style={{fontSize: 80, color: R.gold, transform: `translateY(${Math.abs(Math.sin(f / 5)) * 18}px)`}}>▼</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1180, left: 110, right: 110, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(245,246,250,0.7)', opacity: ease(f, 4, 18)}}>
				Résultats provisoires au 26/10/2026 (RIK). Sources : Euronews, Al Jazeera, France 24, RTS, CNN.
				<br />
				Voix : ElevenLabs · Images : Pixabay
			</div>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={after} name="pop" />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1NoviSad, S2Corruption, S3Students, S4March, S5Refusal, S6Run, S7List, S8Results, S9Majority, S10Next, S11Lesson, S12Outro];
