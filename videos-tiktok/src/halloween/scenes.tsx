import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ease, lerp, money, pop, rand, shake} from '../components/anim';
import {ANTON, CREEPY, SANS, SERIF} from '../components/fonts';
import {Line, Shot, wordAt} from '../components/layers';
import {Sfx} from '../components/Sfx';
import {Bat, C, Candle, Clock, Manor, Moon, Person, Phone, Poster, Pumpkin, Stamp, Suspect, TicketIcon} from './art';

type SceneProps = {line: Line};

const flickerAt = (f: number, seed = 0) => 0.55 + 0.45 * Math.abs(Math.sin(f * 0.37 + seed) * Math.sin(f * 0.13 + 1 + seed));

/** Centered block of text that pops in at frame `at`. */
const Txt = ({
	at = 0,
	top,
	children,
	font = ANTON,
	size = 100,
	color = C.bone,
	style = {},
}: {
	at?: number;
	top: number;
	children: React.ReactNode;
	font?: string;
	size?: number;
	color?: string;
	style?: React.CSSProperties;
}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 50,
				right: 50,
				textAlign: 'center',
				fontFamily: font,
				fontSize: size,
				color,
				lineHeight: 1.02,
				transform: `translateY(${(1 - p) * 70}px) scale(${0.75 + 0.25 * p})`,
				opacity: Math.min(1, p * 1.6),
				textShadow: '0 10px 40px rgba(0,0,0,0.65)',
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Places children centered horizontally at a given top. */
const At = ({top, left = 0, children, style = {}}: {top: number; left?: number; children: React.ReactNode; style?: React.CSSProperties}) => (
	<div style={{position: 'absolute', top, left, right: left ? undefined : 0, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

const Bats = ({count = 4, seed = 0}: {count?: number; seed?: number}) => {
	const f = useCurrentFrame();
	return (
		<>
			{Array.from({length: count}).map((_, i) => {
				const start = Math.floor(rand(i + seed) * 40);
				const speed = 14 + rand(i + seed + 9) * 12;
				const x = -160 + (f - start) * speed;
				const y = 160 + rand(i + seed + 3) * 700 + Math.sin((f + i * 20) / 9) * 30;
				if (x < -200 || x > 1300) return null;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${Math.sin(f / 7 + i) * 8}deg)`}}>
						<Bat size={70 + rand(i + seed + 5) * 60} phase={f * 0.9 + i} color="#020103" />
					</div>
				);
			})}
		</>
	);
};

const Tint = ({color, opacity}: {color: string; opacity: number}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${color}, rgba(0,0,0,0) 70%)`, opacity}} />
);

/* 0 — Hook ------------------------------------------------------------------ */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tTrois = W('trois');
	const tNuit = W('nuit');
	const slam = pop(f, 0, {damping: 9, stiffness: 140, mass: 0.8});
	const shrink = ease(f, tTrois - 8, tTrois + 6);
	const scale = (1.8 - 0.8 * slam) * lerp(shrink, 1, 0.6);
	const pumpkinTop = lerp(shrink, 380, 190);
	const titleTop = lerp(shrink, 960, 560);
	const coins = f >= tTrois;
	return (
		<Shot transition="flash" push={0.06}>
			<Tint color="rgba(255,122,26,0.35)" opacity={0.8} />
			<Bats count={5} />
			<At top={110}>
				<div style={{fontFamily: ANTON, fontSize: 64, color: C.bone, opacity: 0.9, letterSpacing: 2}}>QUE SE PASSE-T-IL SI…</div>
			</At>
			<At top={pumpkinTop}>
				<div style={{transform: `scale(${scale}) rotate(${Math.sin(f / 10) * 3}deg)`, filter: `drop-shadow(0 0 ${60 * flickerAt(f)}px rgba(255,140,30,0.8))`}}>
					<Pumpkin size={560} flicker={flickerAt(f)} id="hook" />
				</div>
			</At>
			<At top={titleTop}>
				<div style={{textAlign: 'center', transform: `scale(${0.6 + 0.4 * pop(f, 2)})`}}>
					<div style={{fontFamily: ANTON, fontSize: 70, color: C.bone, letterSpacing: 4}}>TU ORGANISES UNE SOIRÉE</div>
					<div style={{fontFamily: CREEPY, fontSize: 190, color: C.orange, lineHeight: 0.95, textShadow: '0 0 40px rgba(255,122,26,0.7)'}}>
						HALLOWEEN
					</div>
				</div>
			</At>
			{coins &&
				Array.from({length: 16}).map((_, i) => {
					const d = f - tTrois;
					const a = (i / 16) * Math.PI * 2 + rand(i) * 0.4;
					const v = 22 + rand(i + 4) * 16;
					const x = 540 + Math.cos(a) * v * d;
					const y = 980 + Math.sin(a) * v * d + 1.4 * d * d;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: x - 30,
								top: y - 30,
								width: 60,
								height: 60,
								borderRadius: '50%',
								background: 'radial-gradient(circle at 35% 35%, #FFF1B0, #FFC94D 50%, #B9861B)',
								border: '4px solid #8F6510',
								transform: `scaleX(${Math.cos(d * 0.4 + i)})`,
							}}
						/>
					);
				})}
			<Txt at={tTrois - 2} top={800} size={250} color={C.gold} style={{textShadow: '0 0 60px rgba(255,201,77,0.6)', transform: undefined}}>
				<div style={{transform: shake(f, tTrois, 18, 10)}}>{money(3000 * ease(f, tTrois - 2, tTrois + 8))} €</div>
			</Txt>
			<Txt at={tNuit - 6} top={1075} size={96}>
				EN UNE NUIT ?
			</Txt>
			<Sfx at={0} name="thunder" volume={0.55} />
			<Sfx at={0} name="impact" volume={0.6} />
			<Sfx at={tTrois - 10} name="whoosh" volume={0.45} />
			<Sfx at={tTrois} name="ching" volume={0.5} />
			<Sfx at={tNuit - 6} name="pop" volume={0.35} />
		</Shot>
	);
};

/* 1 — Spoiler --------------------------------------------------------------- */
export const S1Spoiler = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tSpoiler = W('spoiler');
	const stamp = pop(f, tSpoiler, {damping: 13, stiffness: 300, mass: 0.6});
	const glitching = f < 8 || (f > 44 && f < 50) || (f > 80 && f < 84);
	const jitter = glitching ? (rand(f) - 0.5) * 30 : 0;
	return (
		<Shot transition="none" push={0.05}>
			<Tint color="rgba(229,50,43,0.6)" opacity={0.55 + (glitching ? 0.3 : 0)} />
			{f >= tSpoiler && (
				<At top={330}>
					<div style={{position: 'relative', transform: `${shake(f, tSpoiler + 4, 22, 10)} rotate(-7deg) scale(${2.6 - 1.6 * stamp})`}}>
						{glitching && (
							<>
								<div style={{position: 'absolute', left: jitter, top: 0, opacity: 0.7}}>
									<Stamp text="SPOILER" color="#00E5FF" size={200} />
								</div>
								<div style={{position: 'absolute', left: -jitter, top: 4, opacity: 0.7}}>
									<Stamp text="SPOILER" color="#FF2E88" size={200} />
								</div>
							</>
						)}
						<Stamp text="SPOILER" size={200} />
					</div>
				</At>
			)}
			<Txt at={W('rien') - 2} top={700} size={120}>
				RIEN NE VA
				<br />
				SE PASSER
			</Txt>
			<Txt at={W('comme') - 2} top={950} size={120} color={C.red}>
				COMME PRÉVU.
			</Txt>
			<Sfx at={0} name="glitch" volume={0.4} />
			<Sfx at={tSpoiler + 4} name="stamp" volume={0.6} />
			<Sfx at={44} name="glitch" volume={0.25} />
			<Sfx at={W('comme')} name="impact" volume={0.35} />
		</Shot>
	);
};

/* 2 — The plan: 200 × 15 € --------------------------------------------------- */
export const S2Plan = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDeux = W('deux');
	const tQuinze = W('quinze');
	const tTrois = W('trois');
	const cols = 20;
	return (
		<Shot transition="whip" push={0.04}>
			<Tint color="rgba(59,29,99,0.9)" opacity={0.7} />
			<Txt at={0} top={170} size={150} color={C.orange}>
				LE PLAN
			</Txt>
			<At top={340}>
				<div style={{height: 10, width: 440 * ease(f, 4, 18), background: C.orange, borderRadius: 6}} />
			</At>
			{f < tDeux && (
				<Txt at={6} top={560} size={84} color={C.grey}>
					SOIRÉE DU 31.10
					<br />
					DANS TA VILLE
				</Txt>
			)}
			{f >= tDeux && (
				<div style={{position: 'absolute', top: 420, left: 100, width: 880, display: 'flex', flexWrap: 'wrap', gap: 6}}>
					{Array.from({length: 200}).map((_, i) => {
						const at = tDeux + ((i % cols) / cols) * 6 + Math.floor(i / cols) * 1.6;
						const p = pop(f, at, {damping: 10, stiffness: 300, mass: 0.4});
						return (
							<div key={i} style={{transform: `scale(${p})`, opacity: p > 0.02 ? 1 : 0}}>
								<Person size={38} color={i % 7 === 0 ? C.orange : C.bone} />
							</div>
						);
					})}
				</div>
			)}
			<Txt at={tDeux + 4} top={900} size={96}>
				200 PERSONNES{f >= tQuinze ? <span style={{color: C.gold}}> × 15 €</span> : null}
			</Txt>
			{f >= tTrois - 3 && (
				<Txt at={tTrois - 3} top={1040} size={210} color={C.green} style={{textShadow: '0 0 50px rgba(70,224,138,0.5)'}}>
					= {money(3000 * ease(f, tTrois - 3, tTrois + 12))} €
				</Txt>
			)}
			<Sfx at={0} name="whoosh" volume={0.4} />
			{[0, 3, 6, 9, 12, 15].map((d) => (
				<Sfx key={d} at={tDeux + d} name="tick" volume={0.25} />
			))}
			<Sfx at={tQuinze} name="pop" volume={0.35} />
			<Sfx at={tTrois + 8} name="ching" volume={0.45} />
		</Shot>
	);
};

/* 3 — The receipt ----------------------------------------------------------- */
const COSTS: [string, string, number][] = [
	['salle', 'LA SALLE', 800],
	['dj', 'LE DJ', 400],
	['deco', 'LA DÉCO', 300],
	['securite', 'LA SÉCURITÉ', 400],
	["l'assurance", 'ASSURANCE + SACEM', 250],
];

export const S3Receipt = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tLa = W('la');
	const items = COSTS.map(([word, label, amount]) => ({label, amount, at: W(word) - 2}));
	const spent = items.reduce((acc, it) => acc + it.amount * ease(f, it.at, it.at + 8), 0);
	const left = 3000 - spent;
	const shown = items.filter((it) => f >= it.at).length;
	const paperIn = pop(f, tLa - 10, {damping: 15, stiffness: 120, mass: 0.8});
	return (
		<Shot transition="punch" push={0.04} flashColor={C.red}>
			<Tint color="rgba(229,50,43,0.7)" opacity={0.15 + (spent / 2150) * 0.6} />
			<At top={120}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 52, color: C.grey, letterSpacing: 3}}>IL TE RESTE</div>
					<div style={{fontFamily: ANTON, fontSize: 130, color: left > 1500 ? C.green : left > 1000 ? C.gold : C.red, lineHeight: 1}}>
						{money(left)} €
					</div>
				</div>
			</At>
			{f < tLa - 4 && (
				<Txt at={2} top={640} size={170} color={C.red}>
					SAUF QUE…
				</Txt>
			)}
			{f >= tLa - 10 && (
				<div
					style={{
						position: 'absolute',
						top: 400,
						left: 150,
						width: 780,
						transform: `translateY(${(1 - paperIn) * -900}px) rotate(-1.5deg)`,
						background: '#F4EEE3',
						borderRadius: '6px 6px 0 0',
						padding: '36px 44px 30px',
						boxSizing: 'border-box',
						boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
						fontFamily: '"DejaVu Sans Mono", monospace',
						color: '#1A1420',
						clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), 96% 100%, 92% calc(100% - 14px), 88% 100%, 84% calc(100% - 14px), 80% 100%, 76% calc(100% - 14px), 72% 100%, 68% calc(100% - 14px), 64% 100%, 60% calc(100% - 14px), 56% 100%, 52% calc(100% - 14px), 48% 100%, 44% calc(100% - 14px), 40% 100%, 36% calc(100% - 14px), 32% 100%, 28% calc(100% - 14px), 24% 100%, 20% calc(100% - 14px), 16% 100%, 12% calc(100% - 14px), 8% 100%, 4% calc(100% - 14px), 0 100%)',
					}}
				>
					<div style={{fontFamily: ANTON, fontSize: 56, textAlign: 'center', letterSpacing: 2}}>FACTURE · SOIRÉE 31.10</div>
					<div style={{borderTop: '4px dashed #1A1420', margin: '18px 0 10px'}} />
					{items.slice(0, shown).map((it, i) => {
						const p = pop(f, it.at, {damping: 12, stiffness: 260, mass: 0.5});
						return (
							<div
								key={i}
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: 46,
									fontWeight: 700,
									padding: '12px 0',
									transform: `translateX(${(1 - p) * 60}px)`,
									opacity: p,
								}}
							>
								<span>{it.label}</span>
								<span style={{color: C.red}}>−{it.amount} €</span>
							</div>
						);
					})}
					<div style={{height: 20}} />
				</div>
			)}
			{items.map((it, i) => (
				<Sfx key={i} at={it.at} name="pop" volume={0.4} />
			))}
			<Sfx at={0} name="impact" volume={0.3} />
			<Sfx at={tLa - 10} name="paper" volume={0.5} />
		</Shot>
	);
};

/* 4 — Total ----------------------------------------------------------------- */
export const S4Total = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tEuros = W('euros');
	const tAvant = W('avant');
	const n = 2150 * ease(f, 2, tEuros);
	return (
		<Shot transition="punch" push={0.06} flashColor={C.red}>
			<Tint color="rgba(229,50,43,0.85)" opacity={0.75} />
			<Txt at={0} top={330} size={80} color={C.grey}>
				TOTAL DES FRAIS
			</Txt>
			<At top={450}>
				<div
					style={{
						fontFamily: ANTON,
						fontSize: 270,
						color: C.red,
						textShadow: '0 0 70px rgba(229,50,43,0.7)',
						transform: `${shake(f, tEuros, 34, 16)} scale(${1 + 0.08 * (1 - ease(f, tEuros, tEuros + 10))})`,
					}}
				>
					−{money(n)} €
				</div>
			</At>
			{f >= tAvant - 2 && (
				<At top={880}>
					<div style={{transform: `scale(${pop(f, tAvant - 2)}) rotate(-4deg)`, filter: 'grayscale(1) brightness(0.7)'}}>
						<TicketIcon size={300} />
					</div>
				</At>
			)}
			<Txt at={W('vendu') - 2} top={1080} size={90} color={C.bone}>
				BILLETS VENDUS : <span style={{color: C.red}}>0</span>
			</Txt>
			<Sfx at={tEuros} name="impact" volume={0.7} />
			<Sfx at={tAvant} name="heartbeat" volume={0.6} />
			<Sfx at={W('billet')} name="heartbeat" volume={0.5} />
		</Shot>
	);
};

/* 5 — Posting the poster: 12 tickets ---------------------------------------- */
export const S5Post = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tPost = W('postes');
	const tWeek = W('une');
	const tDouze = W('douze');
	const posterIn = pop(f, tPost, {damping: 12, stiffness: 140, mass: 0.7});
	const dim = ease(f, tDouze - 4, tDouze + 6);
	const counter = pop(f, tDouze - 4, {damping: 12, stiffness: 200, mass: 0.6});
	return (
		<Shot transition="whip" push={0.04}>
			<Tint color="rgba(59,29,99,0.9)" opacity={0.6} />
			<At top={170} style={{opacity: 1 - dim * 0.6, transform: `scale(${1 - dim * 0.05})`}}>
				<Phone width={520}>
					<div style={{padding: '70px 26px 0', fontFamily: SANS, color: C.bone}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
							<div style={{width: 54, height: 54, borderRadius: '50%', background: C.orange}} />
							<div style={{fontWeight: 800, fontSize: 30}}>ta_soiree_31</div>
						</div>
						<div style={{transform: `translateY(${(1 - posterIn) * 700}px) rotate(${(1 - posterIn) * 12}deg)`}}>
							<Poster width={442} id="phone" flicker={flickerAt(f)} />
						</div>
						<div style={{display: 'flex', gap: 26, marginTop: 20, fontSize: 30, fontWeight: 800, opacity: posterIn}}>
							<span style={{color: C.red}}>♥ {Math.min(3, Math.floor(Math.max(0, f - tPost) / 25))}</span>
							<span style={{color: C.grey}}>0 commentaire</span>
						</div>
					</div>
				</Phone>
			</At>
			{f >= tPost + 6 && f < tWeek && (
				<At top={1150}>
					<div
						style={{
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 44,
							background: C.green,
							color: '#04140A',
							padding: '14px 34px',
							borderRadius: 99,
							transform: `scale(${pop(f, tPost + 6)})`,
						}}
					>
						PUBLIÉ !
					</div>
				</At>
			)}
			{f >= tWeek - 2 && (
				<div
					style={{
						position: 'absolute',
						top: 230,
						right: 40,
						transform: `translateX(${(1 - pop(f, tWeek - 2)) * 600}px) rotate(6deg)`,
						background: C.orange,
						color: '#1A0A00',
						fontFamily: ANTON,
						fontSize: 80,
						padding: '10px 36px',
						borderRadius: 24,
						boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
					}}
				>
					+7 JOURS
				</div>
			)}
			{f >= tDouze - 4 && (
				<At top={560}>
					<div
						style={{
							width: 820,
							padding: '40px 50px 50px',
							background: 'rgba(12, 8, 18, 0.94)',
							border: `3px solid ${C.grey}`,
							borderRadius: 40,
							textAlign: 'center',
							transform: `scale(${0.6 + 0.4 * counter})`,
							opacity: counter,
							boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
						}}
					>
						<div style={{fontFamily: ANTON, fontSize: 52, color: C.grey, letterSpacing: 3}}>BILLETS VENDUS</div>
						<div style={{fontFamily: ANTON, fontSize: 200, color: C.bone, lineHeight: 1.05}}>
							12<span style={{color: C.grey, fontSize: 110}}> / 200</span>
						</div>
						<div style={{height: 34, borderRadius: 99, background: '#2A2236', overflow: 'hidden', marginTop: 16}}>
							<div style={{height: '100%', width: `${6 * ease(f, tDouze, tDouze + 14)}%`, background: C.red, borderRadius: 99}} />
						</div>
					</div>
				</At>
			)}
			<Sfx at={0} name="whoosh" volume={0.4} />
			<Sfx at={tPost} name="whoosh" volume={0.35} />
			<Sfx at={tPost + 6} name="pop" volume={0.4} />
			{[0, 3, 6, 9, 12].map((d) => (
				<Sfx key={d} at={tWeek - 2 + d} name="tick" volume={0.3} />
			))}
			<Sfx at={tDouze - 4} name="impact" volume={0.3} />
			<Sfx at={tDouze + 10} name="crickets" volume={0.35} />
		</Shot>
	);
};

/* 6 — Dozens of identical parties ------------------------------------------ */
export const S6Crowd = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tCe = W('ce');
	const tDiz = W('dizaines');
	const tToutes = W('toutes');
	const cols = 7;
	const rows = 9;
	const cell = 264;
	const zoom = ease(f, tCe, tDiz + 12);
	const scale = lerp(zoom, 3.1, 0.56);
	const center = (rows * cols - 1) / 2;
	const bob = f >= tToutes ? Math.sin((f - tToutes) / 4) * 10 : 0;
	return (
		<Shot transition="punch" push={0.03}>
			<Tint color="rgba(255,122,26,0.5)" opacity={0.4} />
			{f < tCe && (
				<Txt at={0} top={680} size={170} color={C.orange} style={{transform: `rotate(${Math.sin(f / 5) * 4}deg)`}}>
					LE PROBLÈME ?
				</Txt>
			)}
			{f >= tCe && (
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 780,
						width: cols * cell,
						height: rows * cell * 1.36,
						marginLeft: (-cols * cell) / 2,
						marginTop: (-rows * cell * 1.36) / 2,
						transform: `scale(${scale})`,
						display: 'grid',
						gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
						gridAutoRows: `${cell * 1.36}px`,
						justifyItems: 'center',
						alignItems: 'center',
						opacity: f >= tDiz ? 0.55 : 1,
					}}
				>
					{Array.from({length: rows * cols}).map((_, i) => {
						const r = Math.floor(i / cols);
						const c = i % cols;
						const dist = Math.hypot(r - (rows - 1) / 2, c - (cols - 1) / 2);
						const p = i === center ? 1 : pop(f, tCe + 6 + dist * 5);
						return (
							<div key={i} style={{transform: `scale(${p}) translateY(${bob}px)`}}>
								<Poster width={232} id={`g${i}`} glow={i === center && f < tDiz ? 3 : 1} flicker={flickerAt(f, i)} />
							</div>
						);
					})}
				</div>
			)}
			{f >= tDiz - 4 && (
				<At top={560}>
					<div style={{background: '#000', padding: '16px 40px', transform: `scale(${pop(f, tDiz - 4)}) rotate(-2deg)`}}>
						<div style={{fontFamily: ANTON, fontSize: 104, color: C.bone}}>DES DIZAINES DE SOIRÉES</div>
					</div>
				</At>
			)}
			{f >= tToutes - 4 && (
				<At top={780}>
					<div style={{background: C.orange, padding: '16px 40px', transform: `scale(${pop(f, tToutes - 4)}) rotate(2deg)`}}>
						<div style={{fontFamily: ANTON, fontSize: 104, color: '#120700'}}>LA MÊME CITROUILLE.</div>
					</div>
				</At>
			)}
			<Sfx at={0} name="whoosh" volume={0.4} />
			{[6, 14, 22, 30].map((d) => (
				<Sfx key={d} at={tCe + d} name="pop" volume={0.3} />
			))}
			<Sfx at={tDiz - 4} name="impact" volume={0.4} />
			<Sfx at={tToutes - 4} name="stamp" volume={0.4} />
			<Sfx at={line.durationInFrames - 62} name="riser" volume={0.35} />
		</Shot>
	);
};

/* 7 — The pivot: sell a story ----------------------------------------------- */
export const S7Pivot = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tSecond = W('tu', 1);
	const tThird = W('tu', 2);
	const tSoiree = W('soiree');
	const fadeFirst = 1 - ease(f, tSecond - 6, tSecond);
	const dimSecond = ease(f, tThird - 4, tThird + 6);
	return (
		<Shot transition="none" push={0.07}>
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 18) * 0.4}} />
			<At top={880} style={{opacity: ease(f, 4, 20)}}>
				<Candle height={300} flicker={flickerAt(f, 3)} />
			</At>
			{fadeFirst > 0 && (
				<div style={{opacity: fadeFirst}}>
					<Txt at={W('alors')} top={300} size={110}>
						TU CHANGES
						<br />
						<span style={{color: C.gold}}>UNE SEULE CHOSE.</span>
					</Txt>
				</div>
			)}
			{f >= tSecond && (
				<div style={{opacity: 1 - dimSecond * 0.55, transform: `translateY(${-dimSecond * 60}px)`}}>
					<Txt at={tSecond} top={250} size={92}>
						TU NE VENDS PLUS
					</Txt>
					<Txt at={tSecond + 6} top={350} size={150} color={C.grey}>
						<span style={{position: 'relative'}}>
							UNE SOIRÉE
							<span
								style={{
									position: 'absolute',
									left: -10,
									top: '52%',
									height: 14,
									width: `${ease(f, tSoiree + 4, tSoiree + 12) * 104}%`,
									background: C.red,
									borderRadius: 8,
									transform: 'rotate(-3deg)',
								}}
							/>
						</span>
					</Txt>
				</div>
			)}
			<Txt at={tThird} top={560} size={92}>
				TU VENDS
			</Txt>
			<Txt
				at={tThird + 6}
				top={650}
				font={SERIF}
				size={160}
				color={C.gold}
				style={{fontStyle: 'italic', fontWeight: 700, textShadow: `0 0 ${40 + 20 * flickerAt(f)}px rgba(255,201,77,0.65)`}}
			>
				une histoire.
			</Txt>
			<Sfx at={0} name="sub-drop" volume={0.6} />
			<Sfx at={tSecond} name="whoosh" volume={0.3} />
			<Sfx at={tSoiree + 4} name="glitch" volume={0.2} />
			<Sfx at={tThird - 6} name="swell" volume={0.45} />
		</Shot>
	);
};

/* 8 — The murder mystery ---------------------------------------------------- */
const Envelope = ({f, tOpen, tRole, tSecret}: {f: number; tOpen: number; tRole: number; tSecret: number}) => {
	const flap = ease(f, tOpen, tOpen + 10);
	const rise = pop(f, tOpen + 8, {damping: 15, stiffness: 90, mass: 0.9});
	return (
		<div style={{position: 'relative', width: 720, height: 1100}}>
			{/* back */}
			<div style={{position: 'absolute', bottom: 0, width: 720, height: 460, background: '#5A1A1A', borderRadius: 18}} />
			{/* card */}
			<div
				style={{
					position: 'absolute',
					left: 60,
					bottom: 40 + rise * 520,
					width: 600,
					height: 720,
					background: 'linear-gradient(170deg, #F6EBD3, #E2CFA6)',
					borderRadius: 14,
					padding: '40px 44px',
					boxSizing: 'border-box',
					textAlign: 'center',
					boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
				}}
			>
				<div style={{fontFamily: CREEPY, fontSize: 84, color: '#7A1010'}}>INVITATION</div>
				<div style={{borderTop: '3px solid #7A1010', margin: '16px 40px 26px'}} />
				<div style={{opacity: ease(f, tRole - 4, tRole + 4)}}>
					<div style={{fontFamily: ANTON, fontSize: 40, color: '#6B5B47', letterSpacing: 3}}>TON RÔLE</div>
					<div style={{fontFamily: ANTON, fontSize: 84, color: '#1A1010'}}>LA VEUVE NOIRE</div>
				</div>
				<div style={{opacity: ease(f, tSecret - 4, tSecret + 4), marginTop: 30}}>
					<div style={{fontFamily: ANTON, fontSize: 40, color: '#6B5B47', letterSpacing: 3}}>TON SECRET</div>
					{[300, 420, 240].map((w, i) => (
						<div key={i} style={{height: 34, width: w * ease(f, tSecret + i * 3, tSecret + i * 3 + 8), background: '#111', margin: '14px auto 0', borderRadius: 4}} />
					))}
				</div>
			</div>
			{/* front pocket */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					width: 720,
					height: 460,
					background: 'linear-gradient(180deg, #7E2424, #5E1818)',
					clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)',
					borderRadius: 18,
				}}
			/>
			{/* flap */}
			<div
				style={{
					position: 'absolute',
					bottom: 460 - 2,
					width: 720,
					height: 300,
					transformOrigin: 'bottom center',
					transform: `perspective(1400px) rotateX(${180 - flap * 180}deg)`,
					background: '#8A2A2A',
					clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
					zIndex: flap > 0.5 ? 0 : 3,
				}}
			/>
			{flap < 0.4 && (
				<div style={{position: 'absolute', left: 310, bottom: 360, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #E04040, #8E0F0F)', zIndex: 4}} />
			)}
		</div>
	);
};

export const S8Mystery = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMeurtre = W('meurtre');
	const tMinuit = W('minuit');
	const tChaque = W('chaque');
	const tRole = W('role');
	const tSecret = W('secret');
	const tEt = W('et');
	const tCoupable = W('coupable');
	const cut1 = tMeurtre - 4;
	const cut2 = tChaque - 4;
	const cut3 = tEt - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={cut1}>
				<Shot transition="flash" push={0.08}>
					<Tint color="rgba(59,29,99,1)" opacity={0.9} />
					<At top={200}>
						<Moon size={560} />
					</At>
					<At top={640}>
						<Manor width={1060} lit={flickerAt(f, 5)} />
					</At>
					<Bats count={4} seed={11} />
					<Txt at={4} top={120} font={CREEPY} size={150} color={C.orange} style={{textShadow: '0 0 30px #000, 0 0 60px #000'}}>
						LE MANOIR
					</Txt>
					<Sfx at={0} name="thunder" volume={0.4} />
				</Shot>
			</Sequence>
			<Sequence from={cut1} durationInFrames={cut2 - cut1}>
				<Clockshot tMeurtre={tMeurtre - cut1} tMinuit={tMinuit - cut1} />
			</Sequence>
			<Sequence from={cut2} durationInFrames={cut3 - cut2}>
				<Shot transition="punch" push={0.04}>
					<Tint color="rgba(122,16,16,0.8)" opacity={0.5} />
					<At top={230}>
						<Envelope f={f - cut2} tOpen={6} tRole={tRole - cut2} tSecret={tSecret - cut2} />
					</At>
					<Sfx at={6} name="paper" volume={0.6} />
					<Sfx at={tRole - cut2} name="pop" volume={0.35} />
					<Sfx at={tSecret - cut2} name="pop" volume={0.35} />
				</Shot>
			</Sequence>
			<Sequence from={cut3}>
				<Lineup tCoupable={tCoupable - cut3} />
			</Sequence>
		</AbsoluteFill>
	);
};

const Clockshot = ({tMeurtre, tMinuit}: {tMeurtre: number; tMinuit: number}) => {
	const f = useCurrentFrame();
	const minutes = lerp(ease(f, 0, tMinuit, (x) => x), 56, 60);
	const strike = f >= tMinuit;
	return (
		<Shot transition="punch" push={0.06}>
			<Tint color="rgba(229,50,43,0.8)" opacity={strike ? 0.6 * (1 - ease(f, tMinuit, tMinuit + 30)) + 0.25 : 0.15} />
			<At top={230}>
				<div style={{transform: `${shake(f, tMinuit, 20, 12)} scale(${1 + 0.06 * (strike ? 1 - ease(f, tMinuit, tMinuit + 10) : 0)})`}}>
					<Clock size={620} minutes={minutes} />
				</div>
			</At>
			<Txt at={tMeurtre - 2} top={900} size={130} color={C.red}>
				UN MEURTRE
			</Txt>
			<Txt at={tMinuit - 2} top={1050} font={CREEPY} size={130} color={C.bone}>
				À MINUIT
			</Txt>
			{[0, 8, 16, 24].filter((d) => d < tMinuit).map((d) => (
				<Sfx key={d} at={d} name="clock-tick" volume={0.45} />
			))}
			<Sfx at={tMinuit} name="bell" volume={0.6} />
		</Shot>
	);
};

const Lineup = ({tCoupable}: {tCoupable: number}) => {
	const f = useCurrentFrame();
	const spot = 540 + Math.sin(f / 9) * 380;
	const culprit = 3;
	return (
		<Shot transition="whip" push={0.05}>
			<AbsoluteFill style={{background: '#050308'}} />
			<AbsoluteFill style={{background: `radial-gradient(circle at ${spot}px 820px, rgba(255,230,170,0.35), rgba(0,0,0,0) 260px)`}} />
			<At top={620}>
				<div style={{display: 'flex', gap: 14}}>
					{[0, 1, 2, 3, 4].map((i) => (
						<div key={i} style={{transform: `translateY(${Math.sin(f / 8 + i) * 6}px)`, position: 'relative'}}>
							<Suspect size={190} mask={i === culprit && f >= tCoupable ? C.red : C.bone} />
							{i === culprit && f >= tCoupable && (
								<div
									style={{
										position: 'absolute',
										top: -150,
										left: 0,
										right: 0,
										textAlign: 'center',
										fontFamily: ANTON,
										fontSize: 170,
										color: C.red,
										transform: `scale(${pop(f, tCoupable)})`,
										textShadow: '0 0 40px rgba(229,50,43,0.8)',
									}}
								>
									?
								</div>
							)}
						</div>
					))}
				</div>
			</At>
			<Txt at={2} top={250} size={100}>
				QUI EST
			</Txt>
			<Txt at={tCoupable - 2} top={360} size={140} color={C.red}>
				LE COUPABLE ?
			</Txt>
			<Sfx at={0} name="whoosh" volume={0.4} />
			<Sfx at={tCoupable} name="impact" volume={0.5} />
		</Shot>
	);
};

/* 9 — Sold out -------------------------------------------------------------- */
export const S9SoldOut = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tComplet = W('complet');
	const tMeme = W('meme');
	const tVingt = W('vingt');
	const tSoixante = W('soixante');
	const sold = Math.round(lerp(ease(f, 0, tComplet, (x) => x * x), 12, 200));
	const stamp = pop(f, tComplet, {damping: 13, stiffness: 300, mass: 0.6});
	const ticks = Array.from({length: Math.floor(tComplet / 3)}, (_, i) => i * 3);
	return (
		<Shot transition="punch" push={0.04} flashColor={C.green}>
			<Tint color="rgba(70,224,138,0.6)" opacity={0.2 + 0.4 * ease(f, 0, tComplet)} />
			<At top={170}>
				<div
					style={{
						width: 820,
						padding: '36px 50px 46px',
						background: 'rgba(12, 8, 18, 0.94)',
						border: `3px solid ${sold === 200 ? C.green : C.grey}`,
						borderRadius: 40,
						textAlign: 'center',
						position: 'relative',
					}}
				>
					<div style={{fontFamily: ANTON, fontSize: 52, color: C.grey, letterSpacing: 3}}>BILLETS VENDUS</div>
					<div style={{fontFamily: ANTON, fontSize: 190, color: C.bone, lineHeight: 1.05}}>
						{sold}
						<span style={{color: C.grey, fontSize: 104}}> / 200</span>
					</div>
					<div style={{height: 34, borderRadius: 99, background: '#2A2236', overflow: 'hidden', marginTop: 12}}>
						<div style={{height: '100%', width: `${(sold / 200) * 100}%`, background: sold === 200 ? C.green : C.gold, borderRadius: 99}} />
					</div>
					{f >= tComplet && (
						<div style={{position: 'absolute', top: 95, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(-10deg) scale(${2.8 - 1.8 * stamp})`}}>
							<div style={{background: 'rgba(10, 5, 15, 0.92)', borderRadius: 24}}>
								<Stamp text="COMPLET" size={150} />
							</div>
						</div>
					)}
				</div>
			</At>
			{f >= tMeme - 2 && (
				<At top={700}>
					<div style={{display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${pop(f, tMeme - 2)})`}}>
						<span style={{fontFamily: ANTON, fontSize: 120, color: C.grey, position: 'relative'}}>
							15 €
							<span
								style={{
									position: 'absolute',
									left: -8,
									top: '50%',
									height: 12,
									width: `${ease(f, tVingt - 6, tVingt) * 110}%`,
									background: C.red,
									transform: 'rotate(-8deg)',
								}}
							/>
						</span>
						<span style={{fontFamily: ANTON, fontSize: 90, color: C.bone}}>→</span>
						<span style={{fontFamily: ANTON, fontSize: 170, color: C.gold, transform: `scale(${pop(f, tVingt)})`, display: 'inline-block'}}>
							25 €
						</span>
					</div>
				</At>
			)}
			{f >= tSoixante - 4 && (
				<>
					<div style={{position: 'absolute', top: 960, left: 120, width: 840, display: 'flex', flexWrap: 'wrap', gap: 4}}>
						{Array.from({length: 60}).map((_, i) => {
							const p = pop(f, tSoixante - 4 + i * 0.35, {damping: 12, stiffness: 260, mass: 0.4});
							return (
								<div key={i} style={{transform: `translateX(${(1 - p) * 400}px)`, opacity: p}}>
									<Person size={38} color={C.gold} />
								</div>
							);
						})}
					</div>
					<Txt at={tSoixante + 6} top={1150} size={76} color={C.gold}>
						+60 EN LISTE D'ATTENTE
					</Txt>
				</>
			)}
			{ticks.map((d) => (
				<Sfx key={d} at={d} name="tick" volume={0.22} />
			))}
			<Sfx at={0} name="riser" volume={0.3} />
			<Sfx at={tComplet + 2} name="stamp" volume={0.65} />
			<Sfx at={tVingt} name="pop" volume={0.4} />
			<Sfx at={tSoixante - 4} name="whoosh" volume={0.35} />
		</Shot>
	);
};

/* 10 — The real result ------------------------------------------------------ */
export const S10Result = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDeux = W('deux');
	const tBenef = W('benefice');
	const tPas = W('pas');
	const tMais = W('mais');
	const rows: [string, string, string, number][] = [
		['RECETTES (200 × 25 €)', '5 000 €', C.green, 0],
		['FRAIS', '−2 150 €', C.red, 6],
		['ACCESSOIRES DU JEU', '−350 €', C.red, 12],
	];
	return (
		<Shot transition="whip" push={0.04}>
			<Tint color="rgba(70,224,138,0.5)" opacity={0.35} />
			<At top={150}>
				<div style={{width: 880, background: 'rgba(12,8,18,0.92)', border: `3px solid ${C.grey}`, borderRadius: 36, padding: '34px 46px', boxSizing: 'border-box'}}>
					{rows.map(([label, value, color, at], i) => {
						const p = pop(f, at);
						return (
							<div key={i} style={{display: 'flex', justifyContent: 'space-between', fontFamily: ANTON, fontSize: 56, color: C.bone, padding: '8px 0', opacity: p, transform: `translateX(${(1 - p) * -60}px)`}}>
								<span style={{color: C.grey}}>{label}</span>
								<span style={{color}}>{value}</span>
							</div>
						);
					})}
					<div style={{borderTop: `4px solid ${C.bone}`, margin: '18px 0 10px', width: `${ease(f, 16, 26) * 100}%`}} />
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: ANTON, color: C.bone, opacity: ease(f, tDeux - 6, tDeux)}}>
						<span style={{fontSize: 64}}>BÉNÉFICE</span>
						<span style={{fontSize: 140, color: C.green, textShadow: '0 0 40px rgba(70,224,138,0.5)'}}>{money(2500 * ease(f, tDeux - 4, tBenef))} €</span>
					</div>
				</div>
			</At>
			{f >= tPas - 3 && (
				<At top={760}>
					<div style={{fontFamily: ANTON, fontSize: 130, color: C.grey, transform: `scale(${pop(f, tPas - 3)})`, position: 'relative'}}>
						PAS 3 000 €
						<span style={{position: 'absolute', left: -10, top: '50%', height: 14, width: `${ease(f, tPas + 4, tPas + 12) * 106}%`, background: C.red, transform: 'rotate(-4deg)'}} />
					</div>
				</At>
			)}
			{f >= tMais - 3 && (
				<At top={980}>
					<div
						style={{
							background: C.gold,
							color: '#1A1000',
							fontFamily: ANTON,
							fontSize: 70,
							textAlign: 'center',
							lineHeight: 1.08,
							padding: '22px 44px',
							borderRadius: 30,
							transform: `scale(${pop(f, tMais - 3)}) rotate(-2deg)`,
							boxShadow: '0 20px 60px rgba(255,201,77,0.35)',
						}}
					>
						MAIS UNE LISTE D'ATTENTE
						<br />
						POUR L'AN PROCHAIN
					</div>
				</At>
			)}
			<Sfx at={0} name="whoosh" volume={0.35} />
			{rows.map((r, i) => (
				<Sfx key={i} at={r[3]} name="pop" volume={0.3} />
			))}
			<Sfx at={tBenef} name="ching" volume={0.5} />
			<Sfx at={tPas + 4} name="glitch" volume={0.2} />
			<Sfx at={tMais - 3} name="pop" volume={0.4} />
		</Shot>
	);
};

/* 11 — The lesson ----------------------------------------------------------- */
export const S11Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const gold = ["l'histoire", 'lendemain.'];
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const renderWords = (words: typeof line.words) =>
		words.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, color: gold.includes(w.text) ? C.gold : C.bone, marginRight: 22}}>
					{w.text}
				</span>
			);
		});
	return (
		<Shot transition="none" push={0.08} len={line.durationInFrames}>
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 14) * 0.5}} />
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 360, color: C.gold, opacity: 0.25 * ease(f, 0, 20), lineHeight: 1}}>
				“
			</div>
			<div style={{position: 'absolute', top: 470, left: 90, right: 90, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 84, lineHeight: 1.18}}>
				<div>{renderWords(line.words.slice(0, split))}</div>
				<div style={{marginTop: 50}}>{renderWords(line.words.slice(split))}</div>
			</div>
			<At top={1180} style={{opacity: ease(f, 8, 24)}}>
				<Candle height={150} flicker={flickerAt(f, 9)} />
			</At>
			<Sfx at={0} name="swell" volume={0.4} />
		</Shot>
	);
};

/* 12 — Call to action ------------------------------------------------------- */
export const S12Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = line.voiceFrames + 2;
	return (
		<Shot transition="punch" push={0.05}>
			<Tint color="rgba(255,122,26,0.35)" opacity={0.8} />
			<Bats count={3} seed={21} />
			<At top={230}>
				<div style={{transform: `scale(${pop(f, 0, {damping: 9, stiffness: 140, mass: 0.8})}) rotate(${Math.sin(f / 10) * 4}deg)`, filter: `drop-shadow(0 0 ${50 * flickerAt(f)}px rgba(255,140,30,0.8))`}}>
					<Pumpkin size={460} mood={f > W('toi') + 4 ? 'wink' : 'happy'} flicker={flickerAt(f)} id="outro" />
				</div>
			</At>
			<Txt at={W('et') - 2} top={720} size={110}>
				ET TOI…
			</Txt>
			<Txt at={W('tu') - 2} top={850} size={110}>
				TU VENDRAIS
			</Txt>
			<Txt at={W('quelle') - 2} top={980} font={CREEPY} size={128} color={C.orange} style={{textShadow: '0 0 40px rgba(255,122,26,0.7)'}}>
				QUELLE HISTOIRE{'\u00a0'}?
			</Txt>
			{f >= after && (
				<At top={1260}>
					<div style={{textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
						<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.bone, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>DIS-LE EN COMMENTAIRE</div>
						<div style={{fontSize: 80, color: C.gold, transform: `translateY(${Math.abs(Math.sin(f / 5)) * 18}px)`}}>▼</div>
					</div>
				</At>
			)}
			<Sfx at={0} name="impact" volume={0.5} />
			<Sfx at={W('quelle')} name="whoosh" volume={0.3} />
			<Sfx at={after} name="pop" volume={0.4} />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1Spoiler, S2Plan, S3Receipt, S4Total, S5Post, S6Crowd, S7Pivot, S8Mystery, S9SoldOut, S10Result, S11Lesson, S12Outro];
