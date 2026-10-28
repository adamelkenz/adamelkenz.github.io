import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {ease, lerp, pop, rand, shake} from '../components/anim';
import {ANTON, SANS} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Footage as BaseFootage, Head, Icon} from '../statuts/kit';
import {Pitch, Speedo, SpeedWorld, T, TopTrack, TrainSide} from './art';

type SceneProps = {line: Line};

const Clip = (props: React.ComponentProps<typeof BaseFootage>) => <BaseFootage folder="train" rate={0.8} {...props} />;

const Cut = ({at, until, children, transition = 'punch'}: {at: number; until?: number; children: React.ReactNode; transition?: 'punch' | 'whip' | 'flash' | 'fade' | 'none'}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={until !== undefined ? until - Math.max(0, at) : undefined}>
		<Shot transition={transition} push={0}>
			{children}
		</Shot>
	</Sequence>
);

/** Distance travelled after f frames for a speed curve (pixels per frame). */
const travelled = (f: number, speed: (t: number) => number) => {
	let d = 0;
	for (let i = 0; i < f; i++) d += speed(i);
	return d;
};

const Tag = ({at, children, top = 230, color = T.accent}: {at: number; children: React.ReactNode; top?: number; color?: string}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	return (
		<div style={{position: 'absolute', top, left: 60, display: 'flex', alignItems: 'stretch', transform: `translateX(${(1 - p) * -600}px)`}}>
			<div style={{width: 16, background: color}} />
			<div style={{fontFamily: ANTON, fontSize: 52, color: T.white, background: 'rgba(6,8,15,0.85)', padding: '6px 24px 10px'}}>{children}</div>
		</div>
	);
};

const Banner = ({at, children, color = T.red, top = 1180, rotate = -3}: {at: number; children: React.ReactNode; color?: string; top?: number; rotate?: number}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: ANTON, fontSize: 84, color: T.white, background: color, padding: '6px 40px 10px', transform: `rotate(${rotate}deg) scale(${pop(f, at)})`, boxShadow: `0 0 60px ${color}88`}}>{children}</div>
		</div>
	);
};

/** Red alarm wash that pulses. */
const Alarm = ({from}: {from: number}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const pulse = 0.5 + 0.5 * Math.sin((f - from) / 3);
	return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, rgba(255,40,40,${0.12 + 0.2 * pulse}) 0%, rgba(255,0,0,0) 70%)`, boxShadow: `inset 0 0 ${120 + 80 * pulse}px rgba(255,30,30,0.6)`}} />;
};

/* 0 — Hook: a TGV at 300 km/h, then nobody at the controls --------------------------- */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCab = W('et') - 3;
	const tQ = W('que') - 4;
	const speedOf = (t: number) => lerp(ease(t, 0, W('kilometres') + 6), 6, 70);
	const dist = travelled(f, speedOf);
	const kmh = Math.round(lerp(ease(f, 0, W('kilometres') + 6), 0, 300));
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tCab}>
				<Shot transition="flash" push={0.03}>
					<SpeedWorld distance={dist} />
					<div style={{position: 'absolute', top: 1180 - 262, left: lerp(ease(f, 0, 30), 1100, 120), transform: `translateY(${Math.sin(f * 1.3) * 2}px)`}}>
						<TrainSide cars={3} wheel={dist * 0.9} />
					</div>
					{/* speed lines */}
					{Array.from({length: 10}).map((_, i) => (
						<div key={i} style={{position: 'absolute', top: 820 + i * 34, left: ((i * 300 - dist * 2) % 1600 + 1600) % 1600 - 300, width: 260, height: 3, background: 'rgba(255,255,255,0.35)', opacity: ease(f, 20, 50)}} />
					))}
					<div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
						<div style={{fontFamily: ANTON, fontSize: 240, color: T.white, lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>{kmh}</div>
						<div style={{fontFamily: ANTON, fontSize: 70, color: T.amber}}>KM/H</div>
					</div>
				</Shot>
			</Sequence>
			<Cut at={tCab} transition="punch">
				<Clip src="tracks" dim={0.35} rate={1.4} />
				<Alarm from={W('controle') - tCab - 4} />
				<Head at={W('plus') - tCab - 4} top={420} size={110}>
					PLUS PERSONNE
				</Head>
				<Head at={W('controle') - tCab - 4} top={550} size={130} color={T.red} style={{transform: `translateX(${Math.sin(f * 2.1) * (f > W('controle') ? 5 : 0)}px)`}}>
					AUX COMMANDES
				</Head>
				{f >= tQ && (
					<div style={{position: 'absolute', top: 800, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<div style={{fontFamily: ANTON, fontSize: 120, color: T.ink, background: T.amber, padding: '4px 40px 10px', transform: `rotate(-3deg) scale(${pop(f, tQ)})`}}>ET MAINTENANT ?</div>
					</div>
				)}
			</Cut>
			<Fx at={0} name="riser" />
			<Fx at={W('kilometres') + 4} name="whoosh-hit" />
			<Fx at={tCab} name="impact" />
			<Fx at={W('controle') - 4} name="alert" />
			<Fx at={tQ} name="stamp" />
		</AbsoluteFill>
	);
};

/* 1 — The vigilance device ---------------------------------------------------------- */
const Pedal = ({pressed}: {pressed: number}) => (
	<svg width={420} height={300} viewBox="0 0 420 300">
		<rect x={40} y={230} width={340} height={40} rx={10} fill="#2A3142" />
		<g transform={`rotate(${-18 + pressed * 14}, 80, 230)`}>
			<rect x={70} y={150} width={300} height={70} rx={20} fill={pressed > 0.5 ? T.green : '#4A5470'} stroke="#0B1020" strokeWidth={6} />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={110 + i * 60} y={170} width={30} height={30} rx={6} fill="rgba(0,0,0,0.25)" />
			))}
		</g>
	</svg>
);

export const S1Vacma = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMD = W('regulierement') - 4;
	const cycle = ((f - tMD) % 40) / 40;
	const pressed = f < W('relacher') ? 1 : cycle < 0.15 ? 1 - cycle / 0.15 : cycle < 0.3 ? (cycle - 0.15) / 0.15 : 1;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMD}>
				<Shot transition="whip" push={0.05}>
					<Clip src="cab" dim={0.45} rate={0.6} />
					<Head at={W('surveille') - 4} top={330} size={96}>
						LE TRAIN SURVEILLE
					</Head>
					<Head at={W('conducteur') - 4} top={450} size={140} color={T.amber}>
						SON CONDUCTEUR
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMD}>
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #182240 0%, ${T.ink} 70%)`}} />
				<div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<Pedal pressed={pressed} />
				</div>
				<div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
					{[
						{at: W('relacher') - tMD - 3, t: 'RELÂCHER', c: T.amber},
						{at: W('reappuyer') - tMD - 3, t: 'RÉAPPUYER', c: T.green},
					].map((b) => (
						<div key={b.t} style={{fontFamily: ANTON, fontSize: 64, color: T.ink, background: b.c, padding: '4px 28px 8px', borderRadius: 14, transform: `scale(${pop(f - tMD, b.at)})`}}>{b.t}</div>
					))}
				</div>
				<Head at={W('vacma') - tMD - 4} top={880} size={200} color={T.white} style={{letterSpacing: 12}}>
					VACMA
				</Head>
				<Head at={W('vacma') - tMD + 6} top={1100} size={38} color={T.grey}>
					Veille Automatique à Contrôle du Maintien d'Appui
				</Head>
				<Fx at={W('relacher') - tMD - 3} name="click" />
				<Fx at={W('reappuyer') - tMD - 3} name="click" />
				<Fx at={W('vacma') - tMD - 4} name="impact" gain={0.7} />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={tMD} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 2 — No answer: alarm, then automatic braking ---------------------------------------- */
export const S2Alarm = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tAlarm = W('alarme') - 4;
	const tCount = W('quelques') - 4;
	const tCut = W('coupe') - 4;
	const tBrake = W('freine') - 4;
	const count = Math.max(0, 3 - Math.floor((f - tCount) / 12));
	const speed = f < tBrake ? 300 : lerp(ease(f, tBrake, tBrake + 70, (x) => x), 300, 140);
	return (
		<Shot transition="punch" push={0.04} flashColor={T.red}>
			<Clip src="night" dim={0.55} rate={0.7} />
			<Alarm from={tAlarm} />
			<Head at={0} top={240} size={100}>
				PAS DE RÉPONSE
			</Head>
			<div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: f >= tAlarm ? shake(f, tAlarm, 10, 10) : 'none'}}>
				<div style={{width: 200, height: 200, borderRadius: 99, background: f >= tAlarm && Math.floor(f / 6) % 2 ? T.red : '#3A1010', boxShadow: f >= tAlarm ? `0 0 ${80 + 40 * Math.sin(f / 3)}px ${T.red}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="siren" size={110} color={T.white} />
				</div>
			</div>
			{f >= tCount && f < tCut && (
				<div style={{position: 'absolute', top: 650, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 300, color: T.white, lineHeight: 1}}>{count}</div>
			)}
			{f >= tCut && (
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, tCut)})`}}>
					<Speedo speed={speed} size={460} alarm />
				</div>
			)}
			<Banner at={tCut} top={1130} color="#3A4152">
				MOTEURS COUPÉS
			</Banner>
			<Banner at={tBrake} top={1250} rotate={2}>
				FREINAGE AUTOMATIQUE
			</Banner>
			<Fx at={0} name="whoosh" />
			<Fx at={tAlarm} name="alert" />
			<Fx at={tAlarm + 12} name="alert" gain={0.8} />
			{[0, 12, 24].map((d) => (
				<Fx key={d} at={tCount + d} name="clock" />
			))}
			<Fx at={tCut} name="stamp" />
			<Fx at={tBrake} name="impact" gain={0.8} />
		</Shot>
	);
};

/* 3 — Speed control: beacons, then cab signalling -------------------------------------- */
export const S3Control = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tLgv = W('sur', 2) - 4;
	const dist = f * 26;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tLgv}>
				<Shot transition="whip" push={0.02}>
					<TopTrack distance={dist} beacons={f >= W('balises') - 6} />
					<Head at={0} top={150} size={92}>
						LE TRAIN SURVEILLE
					</Head>
					<Head at={W('vitesse') - 4} top={260} size={130} color={T.amber}>
						SA VITESSE
					</Head>
					<Tag at={W('classiques') - 4} top={1050}>
						LIGNES CLASSIQUES
					</Tag>
					<Tag at={W('balises') - 4} top={1160} color={T.amber}>
						BALISES AU SOL (KVB)
					</Tag>
					<Tag at={W('limites') - 4} top={1270} color={T.green}>
						→ LIMITES ENVOYÉES AU TRAIN
					</Tag>
				</Shot>
			</Sequence>
			<Cut at={tLgv} transition="whip">
				<TopTrack distance={dist * 2} beacons={false} cab />
				{/* data packets flowing up to the cab */}
				{Array.from({length: 8}).map((_, i) => {
					const y = 1920 - (((f - tLgv) * 22 + i * 260) % 2100);
					return <div key={i} style={{position: 'absolute', left: 520, top: y, width: 40, height: 40, borderRadius: 8, background: T.blue, boxShadow: `0 0 20px ${T.blue}`}} />;
				})}
				<Tag at={0} top={1050} color={T.blue}>
					LIGNES À GRANDE VITESSE
				</Tag>
				<Tag at={W('continu') - tLgv - 4} top={1160} color={T.blue}>
					INFOS EN CONTINU EN CABINE (TVM)
				</Tag>
				<Fx at={0} name="whoosh" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={W('balises') - 4} name="click" />
			<Fx at={W('limites') - 4} name="ding" />
		</AbsoluteFill>
	);
};

/* 4 — Too fast / red signal → emergency brake ----------------------------------------- */
export const S4Emergency = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tSignal = W('signal') - 4;
	const tBrake = W('declenche') - 4;
	const speed = f < tBrake ? lerp(ease(f, 0, 20), 300, 330) : lerp(ease(f, tBrake, tBrake + 60), 330, 200);
	const signalY = f < tSignal ? -400 : lerp(ease(f, tSignal, tBrake + 30), -200, 760);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tSignal}>
				<Shot transition="punch" push={0.03}>
					<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #241220 0%, ${T.ink} 70%)`}} />
					<div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<Speedo speed={speed} limit={300} size={600} />
					</div>
					<Head at={0} top={180} size={130} color={T.red}>
						TROP VITE ?
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tSignal} transition="punch">
				<TopTrack distance={f * 30} beacons={false} signalAt={signalY} red />
				<Head at={0} top={180} size={100}>
					UN SIGNAL FERMÉ ?
				</Head>
				<Alarm from={tBrake - tSignal} />
				{f >= tBrake &&
					Array.from({length: 30}).map((_, i) => {
						const d = (f - tBrake + i * 3) % 30;
						return <div key={i} style={{position: 'absolute', left: (i % 2 ? 410 : 670) + (rand(i) - 0.5) * 40 + (rand(i + d) - 0.5) * d * 6, top: 1500 - d * 14, width: 8, height: 8, borderRadius: 99, background: T.amber, opacity: 1 - d / 30, boxShadow: `0 0 10px ${T.amber}`}} />;
					})}
			</Cut>
			<Banner at={tBrake} top={1180}>
				FREINAGE D'URGENCE
			</Banner>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={tSignal} name="alert" />
			<Fx at={tBrake} name="impact" />
			<Fx at={tBrake + 2} name="riser-hit" gain={0.6} />
		</AbsoluteFill>
	);
};

/* 5 — A train doesn't stop like a car: ~3.5 km --------------------------------------- */
export const S5Distance = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMD = W('voiture') - 6;
	const tKm = W('trois', 1) - 4;
	const bars = ease(f - tMD, 4, 40);
	const km = 3.5 * ease(f, tKm, tKm + 30);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMD}>
				<Shot transition="whip" push={0.05}>
					<Clip src="rails" dim={0.45} rate={0.6} />
					<Head at={W('lance') - 4} top={600} size={110}>
						UN TRAIN LANCÉ
					</Head>
					<Head at={W("s'arrete") - 4} top={740} size={90} color={T.amber}>
						NE S'ARRÊTE PAS COMME…
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMD}>
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #142040 0%, ${T.ink} 70%)`}} />
				<Head at={0} top={200} size={84} color={T.grey}>
					DISTANCE DE FREINAGE
				</Head>
				{[
					{icon: 'car', label: 'VOITURE · 130 KM/H', w: 0.03, color: T.green, top: 400},
					{icon: 'train-front', label: 'TGV · 300 KM/H', w: 1, color: T.red, top: 640},
				].map((r) => (
					<div key={r.label} style={{position: 'absolute', top: r.top, left: 80, right: 80}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16}}>
							<Icon name={r.icon} size={70} color={r.color} />
							<span style={{fontFamily: ANTON, fontSize: 52, color: T.white}}>{r.label}</span>
						</div>
						<div style={{height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
							<div style={{height: '100%', width: `${Math.max(1.5, r.w * 100 * bars)}%`, background: r.color, borderRadius: 12}} />
						</div>
					</div>
				))}
				{f >= tKm && (
					<div style={{position: 'absolute', top: 880, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, tKm)})`}}>
						<span style={{fontFamily: ANTON, fontSize: 260, color: T.white}}>≈ {km.toFixed(1).replace('.', ',')}</span>
						<span style={{fontFamily: ANTON, fontSize: 110, color: T.red}}> KM</span>
					</div>
				)}
				<Head at={W('demi') + 4 - tMD} top={1180} size={36} color={T.grey}>
					freinage d'urgence, ordre de grandeur · voiture : environ 100 m
				</Head>
				<Fx at={4} name="swish" />
				<Fx at={tKm - tMD} name="riser-hit" />
			</Cut>
			<Fx at={0} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 6 — 30+ football pitches ---------------------------------------------------------- */
export const S6Pitches = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const n = Math.floor(ease(f, W('plus') - 4, W('foot') + 4, (x) => x) * 33);
	return (
		<Shot transition="punch" push={0.04}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #102A1C 0%, ${T.ink} 70%)`}} />
			<Head at={0} top={200} size={150}>
				3,5 KM
			</Head>
			<div style={{position: 'absolute', top: 420, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center'}}>
				{Array.from({length: 33}).map((_, i) => (
					<div key={i} style={{transform: `scale(${i < n ? pop(f, W('plus') - 4 + i * 1.2) : 0})`}}>
						<Pitch w={140} h={88} />
					</div>
				))}
			</div>
			<Head at={W('trente') - 4} top={1150} size={90} color={T.green}>
				+ DE 30 TERRAINS DE FOOT
			</Head>
			{[0, 6, 12, 18, 24].map((d) => (
				<Fx key={d} at={W('plus') - 4 + d} name="pop" gain={0.7} />
			))}
			<Fx at={W('trente') - 4} name="ding" />
		</Shot>
	);
};

/* 7 — Eckwersheim, 2015 (sober) ------------------------------------------------------ */
export const S7Eckwersheim = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCurve = W('courbe') - 6;
	const tLate = W('freinage') - 4;
	const tToll = W('onze') - 6;
	const curve = 'M 120 1250 L 520 1250 Q 900 1250 900 860 L 900 420';
	const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, W('tgv') - 4, tCurve + 10), curve);
	const kmh = Math.round(lerp(ease(f, tCurve, tCurve + 14), 0, 265));
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tToll}>
				<Shot transition="fade" push={0.03}>
					<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1A1A24 0%, ${T.ink} 70%)`}} />
					<Head at={W('avant') - 4} top={160} size={90} color={T.amber}>
						TOUT SE JOUE AVANT
					</Head>
					<Tag at={W('2015') - 4} top={290} color={T.grey}>
						14 NOV. 2015 · ECKWERSHEIM (ALSACE)
					</Tag>
					<Tag at={W('tgv') - 4} top={400} color={T.grey}>
						TGV D'ESSAI · LIGNE NON OUVERTE
					</Tag>
					<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
						<path d={curve} stroke="#3A4152" strokeWidth={26} fill="none" strokeLinecap="round" />
						<path d={curve} stroke={f >= tLate ? T.red : T.white} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
					</svg>
					{f >= tCurve && (
						<div style={{position: 'absolute', top: 640, left: 110, transform: `scale(${pop(f, tCurve)})`}}>
							<div style={{fontFamily: ANTON, fontSize: 200, color: T.red, lineHeight: 1}}>{kmh}</div>
							<div style={{fontFamily: ANTON, fontSize: 52, color: T.white}}>KM/H DANS LA COURBE</div>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: T.grey, marginTop: 6}}>≈ 90 km/h de trop</div>
						</div>
					)}
					<Banner at={tLate} top={1250} color="#3A4152" rotate={0}>
						FREINAGE TROP TARD
					</Banner>
				</Shot>
			</Sequence>
			<Cut at={tToll} transition="fade">
				<AbsoluteFill style={{background: '#000'}} />
				<Head at={4} top={700} size={200} color={T.white}>
					11
				</Head>
				<Head at={8} top={920} size={90} color={T.grey}>
					MORTS
				</Head>
			</Cut>
			<Fx at={W('2015') - 4} name="click" gain={0.7} />
			<Fx at={tCurve} name="riser" gain={0.6} />
			<Fx at={tLate} name="buzzer" gain={0.6} />
		</AbsoluteFill>
	);
};

/* 8 — ETCS: the system that can stop the train --------------------------------------- */
export const S8Etcs = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMD = W('il') - 4;
	const tStop = W('arreter') - 4;
	const curve = 'M 120 520 L 560 520 Q 760 520 860 900 L 960 1100';
	const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f - tMD, 4, W('sure') - tMD + 6), curve);
	const dotT = ease(f, tStop, tStop + 50);
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMD}>
				<Shot transition="fade" push={0.05}>
					<Clip src="regional" dim={0.45} rate={0.6} />
					<Head at={W("l'europe") - 4} top={360} size={96}>
						L'EUROPE DÉPLOIE
					</Head>
					<div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<div style={{fontFamily: ANTON, fontSize: 170, color: T.ink, background: T.amber, padding: '0 44px 8px', borderRadius: 20, transform: `scale(${pop(f, W("l'etcs") - 4)})`, opacity: f >= W("l'etcs") - 4 ? 1 : 0}}>ETCS</div>
					</div>
					<Head at={W('commun') - 4} top={830} size={56} color={T.grey}>
						UN SYSTÈME COMMUN À TOUTE L'EUROPE
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMD} transition="punch">
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #142040 0%, ${T.ink} 70%)`}} />
				<Head at={0} top={200} size={66}>
					VITESSE SÛRE, CALCULÉE EN PERMANENCE
				</Head>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<line x1={100} y1={1120} x2={980} y2={1120} stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
					<line x1={100} y1={420} x2={100} y2={1120} stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
					<path d={curve} stroke={T.amber} strokeWidth={10} fill="none" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
					{f >= tStop && <circle cx={lerp(dotT, 560, 940)} cy={lerp(dotT * dotT, 520, 1080)} r={22} fill={T.white} style={{filter: `drop-shadow(0 0 16px ${T.white})`}} />}
					<text x={960} y={1170} textAnchor="end" fontFamily={ANTON} fontSize={38} fill={T.grey}>
						POINT D'ARRÊT
					</text>
					<text x={120} y={500} fontFamily={ANTON} fontSize={38} fill={T.grey}>
						VITESSE
					</text>
				</svg>
				<Banner at={tStop - tMD} top={1240} color={T.green} rotate={0}>
					IL PEUT ARRÊTER LE TRAIN
				</Banner>
				<Fx at={4} name="whoosh" />
				<Fx at={tStop - tMD} name="ding" />
			</Cut>
			<Fx at={W("l'etcs") - 4} name="impact" gain={0.7} />
		</AbsoluteFill>
	);
};

/* 9 — Call to action ----------------------------------------------------------------- */
export const S9Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	const dist = f * 18;
	return (
		<Shot transition="fade" push={0.02}>
			<SpeedWorld distance={dist} />
			<div style={{position: 'absolute', top: 1180 - 262, left: lerp(ease(f, 0, 160), 1100, -800)}}>
				<TrainSide cars={3} wheel={dist * 0.9} />
			</div>
			<Head at={0} top={300} size={110}>
				TU SAVAIS QUE
			</Head>
			<Head at={W('surveillait') - 4} top={430} size={100} color={T.amber}>
				TON TRAIN TE SURVEILLAIT{' '}?
			</Head>
			{f >= after && (
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: T.ink, background: T.white, padding: '18px 40px', borderRadius: 99}}>DIS-LE EN COMMENTAIRE</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1500, left: 100, right: 100, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 25, color: 'rgba(244,246,251,0.75)', opacity: ease(f, 6, 20)}}>
				Animation illustrative, train générique. Délais et distances : ordres de grandeur.
				<br />
				Sources : presse (Europe 1, Al Jazeera), Railway Gazette · Voix : ElevenLabs · Images : Pixabay
			</div>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={after} name="pop" />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1Vacma, S2Alarm, S3Control, S4Emergency, S5Distance, S6Pitches, S7Eckwersheim, S8Etcs, S9Outro];
