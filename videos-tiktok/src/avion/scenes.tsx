import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {ease, lerp, money, pop, rand, shake} from '../components/anim';
import {ANTON, SANS} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Head, Icon} from '../statuts/kit';
import {A, Plane, PlaneMark, Sky, Streaks} from './art';
import {AZORES, FRANCE, Land} from './maps';

type SceneProps = {line: Line};

/** Sub-shot: a hard, fast cut inside a scene. */
const Beat = ({at, until, children, transition = 'punch'}: {at: number; until?: number; children: React.ReactNode; transition?: 'punch' | 'whip' | 'flash' | 'fade' | 'none'}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={until !== undefined ? until - Math.max(0, at) : undefined}>
		<Shot transition={transition} push={0.04} len={120}>
			{children}
		</Shot>
	</Sequence>
);

const Big = ({at, top, children, color = A.white, size = 150}: {at: number; top: number; children: React.ReactNode; color?: string; size?: number}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, {damping: 10, stiffness: 260, mass: 0.5});
	return (
		<div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', fontFamily: ANTON, fontSize: size, color, lineHeight: 1, transform: `scale(${1.6 - 0.6 * p})`, opacity: Math.min(1, p * 2), textShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>
			{children}
		</div>
	);
};

const Stamp = ({at, children, color = A.red, top = 1150, rotate = -4}: {at: number; children: React.ReactNode; color?: string; top?: number; rotate?: number}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, {damping: 12, stiffness: 300, mass: 0.6});
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: ANTON, fontSize: 80, color: A.white, background: color, padding: '6px 38px 10px', transform: `rotate(${rotate}deg) scale(${2.2 - 1.2 * p})`, boxShadow: `0 0 50px ${color}88`}}>{children}</div>
		</div>
	);
};

/** The hero shot: the plane in the middle of the sky. */
const PlaneShot = ({f, engine, rat = 0, smoke = 0, tone = 'day', tilt = 0, y = 760, fast = 1}: {f: number; engine: number; rat?: number; smoke?: number; tone?: 'day' | 'dusk' | 'alarm'; tilt?: number; y?: number; fast?: number}) => {
	const drift = f * 14 * fast;
	return (
		<>
			<Sky drift={drift} climb={f * (1 - engine) * 1.5} tone={tone} />
			<Streaks drift={drift} opacity={0.12 + 0.2 * engine} />
			<div style={{position: 'absolute', top: y, left: 50, transform: `rotate(${tilt}deg) translateY(${Math.sin(f / 9) * 6}px)`}}>
				<Plane engine={engine} rat={rat} spin={f} smoke={smoke} />
			</div>
		</>
	);
};

/* 0 — Hook --------------------------------------------------------------------------- */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tAlt = W('onze') - 3;
	const tSoudain = W('et') - 3;
	const tStop = W("s'arretent") - 4;
	const tQ = W('que') - 3;
	const engine = f < tStop ? 1 : 1 - ease(f, tStop, tStop + 14);
	const smoke = f < tStop ? 0 : ease(f, tStop, tStop + 50);
	const alt = Math.round(lerp(ease(f, tAlt, tAlt + 22), 0, 11000));
	return (
		<AbsoluteFill>
			<Beat at={0} until={tAlt} transition="flash">
				<PlaneShot f={f} engine={1} fast={1.4} />
				<Big at={2} top={300} size={120}>
					UN AVION DE LIGNE
				</Big>
			</Beat>
			<Beat at={tAlt} until={tSoudain} transition="whip">
				<PlaneShot f={f} engine={1} y={980} />
				<div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 230, color: A.white, lineHeight: 1}}>{money(alt)}</div>
					<div style={{fontFamily: ANTON, fontSize: 70, color: A.cyan}}>MÈTRES D'ALTITUDE</div>
				</div>
			</Beat>
			<Beat at={tSoudain} until={tQ} transition="punch">
				<div style={{position: 'absolute', inset: 0, transform: f >= tSoudain + 10 ? shake(f, tSoudain + 10, 16, 40) : 'none'}}>
					<PlaneShot f={f} engine={engine} smoke={smoke} tone={f >= tStop ? 'alarm' : 'day'} />
				</div>
				{f >= tSoudain + 10 && <AbsoluteFill style={{boxShadow: `inset 0 0 ${140 + 60 * Math.sin(f / 3)}px rgba(255,40,40,0.55)`}} />}
				<Big at={W('soudain') - 2} top={300} size={110} color={A.amber}>
					ET SOUDAIN…
				</Big>
				<Stamp at={tStop} top={500}>
					MOTEURS : 0 / 2
				</Stamp>
			</Beat>
			<Beat at={tQ} transition="punch">
				<PlaneShot f={f} engine={0} tone="alarm" tilt={4} />
				<Big at={0} top={360} size={170} color={A.white}>
					QUE SE PASSE-T-IL{' '}?
				</Big>
			</Beat>
			<Fx at={0} name="synth-jet" />
			<Fx at={tAlt} name="whoosh" gain={0.55} />
			<Fx at={tSoudain + 10} name="synth-warning" />
			<Fx at={tStop} name="synth-spooldown" gain={0.6} />
			<Fx at={tStop} name="impact" gain={0.5} />
			<Fx at={tQ} name="synth-wind" gain={0.65} />
		</AbsoluteFill>
	);
};

/* 1 — It doesn't fall: it glides --------------------------------------------------------- */
export const S1Glide = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tPlane = W('plane') - 4;
	const path = 'M 120 600 Q 600 640 1000 980';
	const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, tPlane, tPlane + 20), path);
	return (
		<AbsoluteFill>
			<Beat at={0} until={tPlane - 6} transition="whip">
				<PlaneShot f={f} engine={0} tilt={3} />
				<Big at={W('tombe') - 4} top={330} size={130}>
					IL NE TOMBE PAS
				</Big>
				{f >= W('pas') && (
					<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
						<path d="M 540 520 L 540 1300 M 500 1250 L 540 1300 L 580 1250" stroke={A.white} strokeWidth={12} fill="none" opacity={0.5} />
						<line x1={420} y1={820} x2={660} y2={1000} stroke={A.red} strokeWidth={18} strokeLinecap="round" />
					</svg>
				)}
			</Beat>
			<Beat at={tPlane - 6} transition="punch">
				<PlaneShot f={f} engine={0} tilt={5} y={820} />
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<path d={path} stroke={A.cyan} strokeWidth={8} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} fill="none" strokeLinecap="round" />
				</svg>
				<Big at={4} top={300} size={200} color={A.cyan}>
					IL PLANE
				</Big>
			</Beat>
			<Fx at={W('pas') - 2} name="buzzer" gain={0.6} />
			<Fx at={tPlane - 6} name="swish" />
			<Fx at={tPlane} name="ding" />
		</AbsoluteFill>
	);
};

/* 2 — Glide ratio: 1 km down, 15 km forward --------------------------------------------- */
export const S2Ratio = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDown = W('descente') - 4;
	const tFwd = W('quinze') - 4;
	const down = ease(f, tDown, tDown + 14);
	const fwd = ease(f, tFwd, tFwd + 18);
	return (
		<Beat at={0} transition="punch">
			<Sky drift={f * 6} tone="day" />
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<line x1={110} y1={700} x2={110} y2={700 + 160 * down} stroke={A.amber} strokeWidth={14} strokeLinecap="round" />
				<line x1={110} y1={860} x2={110 + 860 * fwd} y2={860} stroke={A.cyan} strokeWidth={14} strokeLinecap="round" />
				<line x1={110} y1={700} x2={110 + 860 * fwd} y2={700 + 160 * fwd} stroke={A.white} strokeWidth={6} strokeDasharray="18 14" opacity={fwd} />
			</svg>
			<div style={{position: 'absolute', top: 600 + 160 * down * 0.3, left: 100 + 860 * fwd - 80, transform: 'scale(0.35)', transformOrigin: 'top left'}}>
				<Plane engine={0} spin={f} />
			</div>
			<Big at={tDown} top={930} size={90} color={A.amber}>
				1 KM ↓
			</Big>
			<Big at={tFwd} top={1040} size={130} color={A.cyan}>
				≈ 15 KM →
			</Big>
			<Big at={0} top={250} size={80} color={A.grey}>
				FINESSE D'UN AVION DE LIGNE
			</Big>
			<Fx at={tDown} name="click" />
			<Fx at={tFwd} name="riser-hit" gain={0.7} />
		</Beat>
	);
};

/* 3 — 150+ km without engines: range over France ----------------------------------------- */
export const S3Range = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMap = W('il') - 4;
	const tKm = W('cent') - 4;
	const paris = FRANCE.project([2.35, 48.86]);
	const edge = FRANCE.project([2.35 + 165 / (111.32 * Math.cos((48.86 * Math.PI) / 180)), 48.86]);
	const radius = (edge[0] - paris[0]) * ease(f, tKm, tKm + 24);
	const km = Math.round(165 * ease(f, tKm, tKm + 24));
	return (
		<AbsoluteFill>
			<Beat at={0} until={tMap} transition="whip">
				<PlaneShot f={f} engine={0} tilt={4} />
				<Big at={W('croisiere') - 6} top={330} size={110}>
					DEPUIS 11 000 M…
				</Big>
			</Beat>
			<Beat at={tMap} transition="punch">
				<AbsoluteFill style={{background: A.ink}} />
				<div style={{position: 'absolute', top: 400, left: 40}}>
					<svg width={1000} height={1000} viewBox="0 0 1000 1000">
						<Land map={FRANCE} highlight="France" />
						<circle cx={paris[0]} cy={paris[1]} r={radius} fill="rgba(60,214,240,0.15)" stroke={A.cyan} strokeWidth={6} />
						<circle cx={paris[0]} cy={paris[1]} r={10} fill={A.white} />
					</svg>
					<div style={{position: 'absolute', left: paris[0] - 30, top: paris[1] - 30}}>
						<PlaneMark size={60} angle={(f * 4) % 360} />
					</div>
				</div>
				<div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center'}}>
					<span style={{fontFamily: ANTON, fontSize: 180, color: A.white}}>{km}</span>
					<span style={{fontFamily: ANTON, fontSize: 90, color: A.cyan}}> KM</span>
				</div>
				<Big at={W('sans') - tMap - 3} top={1300} size={84} color={A.amber}>
					SANS AUCUN MOTEUR
				</Big>
				<Fx at={tKm - tMap} name="riser" />
				<Fx at={tKm - tMap + 24} name="impact" gain={0.7} />
			</Beat>
			<Fx at={tMap} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 4 — The ram air turbine --------------------------------------------------------------- */
export const S4Rat = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tOut = W('sort') - 4;
	const tPower = W('courant') - 4;
	const rat = ease(f, tOut, tOut + 14);
	return (
		<AbsoluteFill>
			<Beat at={0} until={tPower} transition="punch">
				<Sky drift={f * 10} tone="day" />
				<div style={{position: 'absolute', top: 260, left: -620, transform: 'scale(2.2)', transformOrigin: 'top left'}}>
					<Plane engine={0} rat={rat} spin={f * 4} />
				</div>
				<Big at={W('helice') - 4} top={240} size={110} color={A.amber}>
					UNE PETITE HÉLICE
				</Big>
				<Big at={tOut + 10} top={1180} size={80}>
					L'ÉOLIENNE DE SECOURS
				</Big>
			</Beat>
			<Beat at={tPower} transition="whip">
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #13254A 0%, ${A.ink} 70%)`}} />
				<div style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
					<div style={{width: 200, height: 200, borderRadius: 99, border: `6px solid ${A.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${f * 20}deg)`}}>
						<Icon name="wind" size={120} color={A.amber} />
					</div>
					<div style={{display: 'flex', gap: 10}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{opacity: ((f - tPower) / 4 + i) % 3 < 1 ? 1 : 0.25}}>
								<Icon name="zap" size={80} color={A.amber} />
							</div>
						))}
					</div>
					<div style={{width: 200, height: 200, borderRadius: 40, border: `6px solid ${A.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="plane" size={120} color={A.green} />
					</div>
				</div>
				<Big at={2} top={700} size={100} color={A.green}>
					COURANT RÉTABLI
				</Big>
				<Big at={W('commandes') - tPower - 4} top={840} size={70}>
					POUR LES COMMANDES DE VOL
				</Big>
				<Fx at={2} name="ding" />
			</Beat>
			<Fx at={tOut} name="paper" />
			<Fx at={tOut + 8} name="synth-wind" gain={0.7} />
		</AbsoluteFill>
	);
};

/* 5 — Pilots: relight, nearest runway ------------------------------------------------- */
export const S5Pilots = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tRelight = W('redemarrer') - 4;
	const tRunway = W('visent') - 4;
	return (
		<Beat at={0} transition="punch">
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #12224A 0%, ${A.ink} 70%)`}} />
			<Big at={0} top={220} size={110}>
				LES PILOTES
			</Big>
			<div style={{position: 'absolute', top: 430, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 34}}>
				{[
					{at: tRelight, icon: 'rotate-ccw', text: 'RELANCER LES MOTEURS', color: A.amber, spin: true},
					{at: tRunway, icon: 'plane-landing', text: 'LA PISTE LA PLUS PROCHE', color: A.green, spin: false},
				].map((s) =>
					f >= s.at ? (
						<div key={s.text} style={{display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(255,255,255,0.06)', border: `4px solid ${s.color}`, borderRadius: 28, padding: '26px 30px', transform: `translateX(${(1 - pop(f, s.at)) * -500}px)`}}>
							<div style={{transform: s.spin ? `rotate(${-f * 8}deg)` : 'none'}}>
								<Icon name={s.icon} size={110} color={s.color} />
							</div>
							<span style={{fontFamily: ANTON, fontSize: 64, color: A.white}}>{s.text}</span>
						</div>
					) : null,
				)}
			</div>
			{/* radar sweep looking for a runway */}
			{f >= tRunway && (
				<div style={{position: 'absolute', top: 820, left: 340, width: 400, height: 400, borderRadius: 999, border: `4px solid ${A.green}55`, overflow: 'hidden'}}>
					<div style={{position: 'absolute', inset: 0, background: `conic-gradient(from ${f * 8}deg, rgba(56,224,123,0.45), rgba(56,224,123,0) 25%)`}} />
					<div style={{position: 'absolute', left: 280, top: 110, width: 70, height: 14, background: A.green, transform: 'rotate(-30deg)', opacity: f > tRunway + 20 ? 1 : 0}} />
				</div>
			)}
			<Fx at={tRelight} name="click" />
			<Fx at={tRunway} name="alert" gain={0.7} />
		</Beat>
	);
};

/* 6 — Air Transat 236, 2001 ------------------------------------------------------------- */
export const S6Transat = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMap = W('il') - 4;
	const tLand = W('pose') - 4;
	const tToll = W('trois') - 4;
	const start = AZORES.project([-28.3, 39.45]);
	const lajes = AZORES.project([-27.09, 38.76]);
	const path = `M ${start[0]} ${start[1]} Q ${(start[0] + lajes[0]) / 2 + 60} ${(start[1] + lajes[1]) / 2 - 60} ${lajes[0]} ${lajes[1]}`;
	const progress = ease(f, tMap + 6, tLand, (x) => x);
	const {strokeDasharray, strokeDashoffset} = evolvePath(progress, path);
	const tip = getPointAtLength(path, getLength(path) * progress);
	const minutes = Math.floor(19 * progress);
	const seconds = Math.floor((19 * progress * 60) % 60);
	const km = Math.round(120 * progress);
	return (
		<AbsoluteFill>
			<Beat at={0} until={tMap} transition="whip">
				<PlaneShot f={f} engine={f < W('panne') ? 1 : 0} tone="dusk" smoke={f < W('panne') ? 0 : ease(f, W('panne'), W('panne') + 40)} />
				<Big at={W('2001') - 4} top={240} size={150} color={A.amber}>
					2001
				</Big>
				<Big at={W('transat') - 4} top={420} size={80}>
					AIRBUS A330 · AIR TRANSAT
				</Big>
				{f >= W('panne') - 4 && (
					<div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center', transform: `scale(${pop(f, W('panne') - 4)})`}}>
						<Icon name="fuel" size={90} color={A.red} />
						<span style={{fontFamily: ANTON, fontSize: 76, color: A.white, background: A.red, padding: '4px 26px'}}>PANNE DE CARBURANT</span>
					</div>
				)}
			</Beat>
			<Beat at={tMap} until={tToll} transition="punch">
				<AbsoluteFill style={{background: '#06142B'}} />
				<div style={{position: 'absolute', top: 420, left: 40}}>
					<svg width={1000} height={900} viewBox="0 0 1000 900">
						<Land map={AZORES} />
						<path d={path} stroke={A.amber} strokeWidth={8} fill="none" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
						<circle cx={lajes[0]} cy={lajes[1]} r={18 + 6 * Math.sin(f / 4)} fill="none" stroke={A.green} strokeWidth={6} />
						<text x={lajes[0] + 34} y={lajes[1] + 70} fill={A.green} fontFamily={ANTON} fontSize={44}>
							LAJES · TERCEIRA
						</text>
						<text x={start[0] - 40} y={start[1] - 40} fill={A.grey} fontFamily={ANTON} fontSize={36}>
							MOTEURS COUPÉS
						</text>
						<circle cx={start[0]} cy={start[1]} r={10} fill={A.red} />
					</svg>
					{progress > 0 && progress < 1 && (
						<div style={{position: 'absolute', left: tip.x - 36, top: tip.y - 36}}>
							<PlaneMark size={72} angle={30} />
						</div>
					)}
				</div>
				<div style={{position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60}}>
					<div style={{textAlign: 'center'}}>
						<div style={{fontFamily: ANTON, fontSize: 130, color: A.white}}>
							{minutes}:{String(seconds).padStart(2, '0')}
						</div>
						<div style={{fontFamily: ANTON, fontSize: 40, color: A.grey}}>MIN DE VOL PLANÉ</div>
					</div>
					<div style={{textAlign: 'center'}}>
						<div style={{fontFamily: ANTON, fontSize: 130, color: A.amber}}>{km}</div>
						<div style={{fontFamily: ANTON, fontSize: 40, color: A.grey}}>KM</div>
					</div>
				</div>
				<Stamp at={tLand - tMap} top={1250} color={A.green} rotate={0}>
					POSÉ AUX AÇORES
				</Stamp>
				<Fx at={tLand - tMap} name="stamp" />
			</Beat>
			<Beat at={tToll} transition="flash">
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0E3A26 0%, ${A.ink} 70%)`}} />
				<Big at={0} top={520} size={250}>
					306
				</Big>
				<Big at={4} top={800} size={80} color={A.grey}>
					PERSONNES À BORD
				</Big>
				<Big at={W('aucun') - tToll - 3} top={960} size={150} color={A.green}>
					0 MORT
				</Big>
				<Fx at={W('aucun') - tToll - 3} name="ding" gain={0.7} />
			</Beat>
			<Fx at={W('panne') - 4} name="synth-spooldown" gain={0.5} />
			<Fx at={tMap} name="whoosh" gain={0.55} />
			<Fx at={tMap + 6} name="clock" gain={0.6} />
		</AbsoluteFill>
	);
};

/* 7 — US Airways 1549, the Hudson ---------------------------------------------------- */
export const S7Hudson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCity = W('2009') - 4;
	const tBirds = W('oies') - 4;
	const tLand = W('pose') - 4;
	const tToll = W('cent') - 4;
	// stylised New York: river on the left, Manhattan on the right, LaGuardia up north-east
	const route = 'M 880 300 Q 760 190 560 260 Q 360 330 330 620 L 330 1120';
	const prog = f < tBirds ? ease(f, tCity, tBirds + 4, (x) => x) * 0.38 : lerp(ease(f, tBirds + 4, tLand + 8, (x) => x), 0.38, 1);
	const {strokeDasharray, strokeDashoffset} = evolvePath(prog, route);
	const seconds = Math.min(208, Math.round(lerp(ease(f, tBirds, tLand + 10, (x) => x), 0, 208)));
	return (
		<AbsoluteFill>
			<Beat at={0} until={tCity} transition="punch">
				<PlaneShot f={f} engine={1} fast={1.6} tilt={-6} />
				<Big at={W('apres') - 4} top={260} size={100}>
					JUSTE APRÈS LE DÉCOLLAGE
				</Big>
				<Big at={W('trois') - 4} top={480} size={180} color={A.red}>
					3 MINUTES
				</Big>
			</Beat>
			<Beat at={tCity} until={tToll} transition="whip">
				<AbsoluteFill style={{background: '#101626'}} />
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{/* New Jersey shore, river, Manhattan grid */}
					<rect x={0} y={0} width={240} height={1920} fill="#1A2236" />
					<rect x={240} y={0} width={180} height={1920} fill="#123A66" />
					<rect x={420} y={0} width={660} height={1920} fill="#1A2236" />
					{Array.from({length: 26}).map((_, r) =>
						Array.from({length: 7}).map((__, c) => <rect key={`${r}-${c}`} x={450 + c * 88} y={380 + r * 58} width={70} height={44} fill="#232E48" />),
					)}
					<rect x={760} y={250} width={220} height={60} rx={10} fill="#2C3A5C" />
					<text x={870} y={240} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill={A.grey}>
						LAGUARDIA
					</text>
					<text x={330} y={1300} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={A.cyan} transform="rotate(-90 330 1300)">
						HUDSON
					</text>
					<path d={route} stroke={f >= tBirds ? A.red : A.white} strokeWidth={9} fill="none" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
				</svg>
				{/* bird flock */}
				{f >= tBirds - 6 &&
					f < tBirds + 24 &&
					Array.from({length: 14}).map((_, i) => (
						<div key={i} style={{position: 'absolute', left: 540 + (rand(i) - 0.5) * 220 + (f - tBirds) * (rand(i + 2) - 0.5) * 8, top: 240 + (rand(i + 5) - 0.5) * 120}}>
							<Icon name="bird" size={44} color={A.white} />
						</div>
					))}
				{f >= tBirds && f < tBirds + 30 && <AbsoluteFill style={{background: A.white, opacity: Math.max(0, 0.5 - (f - tBirds) * 0.05)}} />}
				<div style={{position: 'absolute', top: 120, right: 50, textAlign: 'right'}}>
					<div style={{fontFamily: ANTON, fontSize: 110, color: f >= tBirds ? A.red : A.grey}}>{seconds} S</div>
					<div style={{fontFamily: ANTON, fontSize: 34, color: A.grey}}>DEPUIS LA COLLISION</div>
				</div>
				<Stamp at={tBirds - tCity} top={520} rotate={-6}>
					OIES · 2 MOTEURS DÉTRUITS
				</Stamp>
				{f >= tLand + 6 && (
					<div style={{position: 'absolute', left: 230, top: 1060, width: 200, height: 200, borderRadius: 999, border: `8px solid ${A.white}`, opacity: Math.max(0, 1 - (f - tLand - 6) / 30), transform: `scale(${1 + (f - tLand - 6) / 15})`}} />
				)}
				<Stamp at={tLand - tCity + 8} top={1200} color={A.cyan} rotate={0}>
					AMERRISSAGE SUR L'HUDSON
				</Stamp>
				<Fx at={tBirds - tCity} name="impact" gain={0.6} />
				<Fx at={tBirds - tCity + 2} name="synth-spooldown" gain={0.5} />
				<Fx at={tBirds - tCity + 8} name="synth-warning" gain={0.8} />
				<Fx at={tLand - tCity + 6} name="synth-splash" gain={0.4} />
			</Beat>
			<Beat at={tToll} transition="flash">
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0E3A26 0%, ${A.ink} 70%)`}} />
				<div style={{position: 'absolute', top: 360, left: 120, right: 120, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center'}}>
					{Array.from({length: 155}).map((_, i) => (
						<div key={i} style={{width: 26, height: 26, borderRadius: 99, background: A.green, transform: `scale(${pop(f - tToll, i * 0.15)})`}} />
					))}
				</div>
				<Big at={4} top={1000} size={200} color={A.green}>
					155
				</Big>
				<Big at={10} top={1210} size={80}>
					SURVIVANTS
				</Big>
				<Fx at={4} name="ding" />
			</Beat>
			<Fx at={0} name="synth-jet" gain={0.8} />
			<Fx at={W('trois') - 4} name="clock" />
			<Fx at={tCity} name="whoosh" gain={0.55} />
		</AbsoluteFill>
	);
};

/* 8 — Call to action: a two-button poll ----------------------------------------------- */
export const S8Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	const yes = Math.round(lerp(ease(f, 20, 90), 0, 64));
	return (
		<Beat at={0} transition="punch">
			<PlaneShot f={f} engine={1} tone="dusk" y={1080} />
			<Big at={0} top={240} size={100}>
				ALORS…
			</Big>
			<Big at={W('reprendrais') - 4} top={380} size={110} color={A.amber}>
				TU REPRENDRAIS L'AVION{' '}?
			</Big>
			<div style={{position: 'absolute', top: 640, left: 110, right: 110, display: 'flex', gap: 30}}>
				{[
					{label: 'OUI', pct: yes, color: A.green},
					{label: 'JAMAIS', pct: 100 - yes, color: A.red},
				].map((o) => (
					<div key={o.label} style={{flex: 1, height: 160, borderRadius: 30, background: 'rgba(5,9,18,0.8)', border: `5px solid ${o.color}`, position: 'relative', overflow: 'hidden', transform: `scale(${pop(f, W('reprendrais'))})`}}>
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${o.pct}%`, background: `${o.color}55`}} />
						<div style={{position: 'relative', textAlign: 'center', fontFamily: ANTON, fontSize: 80, color: A.white, lineHeight: '160px'}}>{o.label}</div>
					</div>
				))}
			</div>
			{f >= after && (
				<div style={{position: 'absolute', top: 870, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: A.ink, background: A.white, padding: '18px 40px', borderRadius: 99}}>DIS-LE EN COMMENTAIRE</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1560, left: 100, right: 100, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: 'rgba(244,247,252,0.75)', opacity: ease(f, 6, 20)}}>
				Animation illustrative, avion générique. Finesse et distances : ordres de grandeur.
				<br />
				Sources : Transat (vol TS236), NTSB / Guinness (vol 1549) · Voix : ElevenLabs
			</div>
			<Fx at={W('reprendrais') - 4} name="pop" />
			<Fx at={after} name="pop" />
		</Beat>
	);
};

export const SCENES = [S0Hook, S1Glide, S2Ratio, S3Range, S4Rat, S5Pilots, S6Transat, S7Hudson, S8Outro];
