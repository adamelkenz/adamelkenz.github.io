import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {CLAMP, ease, lerp, money, pop} from '../components/anim';
import {ANTON, SANS, SERIF} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Footage as BaseFootage, Head, Icon} from '../statuts/kit';

type SceneProps = {line: Line};

export const L = {
	ink: '#0A0A0F',
	paper: '#F3F2EC',
	white: '#FFFFFF',
	grey: '#8A8A96',
	lime: '#C6FF3D',
	red: '#FF4D4D',
	gold: '#FFC93C',
	blue: '#4F8BFF',
	green: '#2EDB7C',
};

/* Building blocks ------------------------------------------------------------ */

const Clip = (props: React.ComponentProps<typeof BaseFootage>) => <BaseFootage folder="whitelabel" {...props} />;

const Photo = ({src, len = 200, from = [1.05, 0, 0], to = [1.18, 0, -40], dim = 0.45}: {src: string; len?: number; from?: [number, number, number]; to?: [number, number, number]; dim?: number}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [0, len], [0, 1], CLAMP);
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: L.ink}}>
			<Img
				src={staticFile(`whitelabel/photos/${src}.jpg`)}
				style={{position: 'absolute', left: -81, top: -144, width: 1242, height: 2208, transform: `translate(${lerp(p, from[1], to[1])}px, ${lerp(p, from[2], to[2])}px) scale(${lerp(p, from[0], to[0])})`}}
			/>
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,10,15,${dim + 0.25}) 0%, rgba(10,10,15,${dim - 0.1}) 40%, rgba(10,10,15,${dim}) 70%, rgba(10,10,15,${dim + 0.35}) 100%)`}} />
		</AbsoluteFill>
	);
};

/** Light, "white label" backdrop for motion-design scenes. */
const PaperBg = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: L.paper, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					backgroundImage: 'radial-gradient(rgba(10,10,15,0.13) 2px, transparent 2px)',
					backgroundSize: '44px 44px',
					backgroundPosition: `${(f * 0.4) % 44}px 0px`,
				}}
			/>
		</AbsoluteFill>
	);
};

const DarkBg = () => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #1C1C26 0%, ${L.ink} 70%)`}} />;

const Cut = ({at, until, children, transition = 'punch'}: {at: number; until?: number; children: React.ReactNode; transition?: 'punch' | 'whip' | 'flash' | 'none'}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={until !== undefined ? until - Math.max(0, at) : undefined}>
		<Shot transition={transition} push={0}>
			{children}
		</Shot>
	</Sequence>
);

/** Dark text on the paper backdrop (Head is styled for dark backgrounds). */
const Ink = ({at = 0, top, children, size = 100, color = L.ink}: {at?: number; top: number; children: React.ReactNode; size?: number; color?: string}) => (
	<Head at={at} top={top} size={size} color={color} style={{textShadow: 'none'}}>
		{children}
	</Head>
);

/** A plain white jar with an optional brand label that slaps on. */
const Jar = ({label, labelAt, color = L.lime, size = 1, f}: {label?: string; labelAt?: number; color?: string; size?: number; f: number}) => {
	const p = labelAt !== undefined ? pop(f, labelAt, {damping: 11, stiffness: 260, mass: 0.6}) : 0;
	return (
		<div style={{position: 'relative', width: 300 * size, height: 380 * size}}>
			<div style={{position: 'absolute', left: 20 * size, top: 0, width: 260 * size, height: 70 * size, borderRadius: 18 * size, background: '#E6E6E1', border: `${4 * size}px solid ${L.ink}`}} />
			<div style={{position: 'absolute', left: 0, top: 60 * size, width: 300 * size, height: 320 * size, borderRadius: 40 * size, background: L.white, border: `${4 * size}px solid ${L.ink}`, boxShadow: '0 30px 60px rgba(0,0,0,0.18)'}} />
			{label && labelAt !== undefined && f >= labelAt && (
				<div
					style={{
						position: 'absolute',
						left: 30 * size,
						top: 150 * size,
						width: 240 * size,
						height: 150 * size,
						borderRadius: 14 * size,
						background: color,
						border: `${4 * size}px solid ${L.ink}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: ANTON,
						fontSize: 46 * size,
						color: L.ink,
						textAlign: 'center',
						lineHeight: 1,
						transform: `translateY(${(1 - p) * -260 * size}px) rotate(${(1 - p) * -25 - 3}deg) scale(${1.4 - 0.4 * p})`,
					}}
				>
					{label}
				</div>
			)}
		</div>
	);
};

const Node = ({icon, label, color, at, f}: {icon: string; label: string; color: string; at: number; f: number}) => {
	const p = pop(f, at);
	return (
		<div style={{textAlign: 'center', transform: `scale(${p})`, opacity: Math.min(1, p * 2)}}>
			<div style={{width: 200, height: 200, borderRadius: 44, background: color, border: `5px solid ${L.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `8px 8px 0 ${L.ink}`}}>
				<Icon name={icon} size={110} color={L.ink} />
			</div>
			<div style={{fontFamily: ANTON, fontSize: 50, color: L.ink, marginTop: 16}}>{label}</div>
		</div>
	);
};

const Arrow = ({x1, y1, x2, y2, at, f, color = L.ink}: {x1: number; y1: number; x2: number; y2: number; at: number; f: number; color?: string}) => {
	const d = `M ${x1} ${y1} L ${x2} ${y2}`;
	const {strokeDasharray, strokeDashoffset} = evolvePath(ease(f, at, at + 10), d);
	const done = f >= at + 10;
	const ang = Math.atan2(y2 - y1, x2 - x1);
	return (
		<g>
			<path d={d} stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
			{done && (
				<path
					d={`M ${x2} ${y2} L ${x2 - 34 * Math.cos(ang - 0.5)} ${y2 - 34 * Math.sin(ang - 0.5)} M ${x2} ${y2} L ${x2 - 34 * Math.cos(ang + 0.5)} ${y2 - 34 * Math.sin(ang + 0.5)}`}
					stroke={color}
					strokeWidth={10}
					strokeLinecap="round"
				/>
			)}
		</g>
	);
};

/* 0 — Hook --------------------------------------------------------------------- */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMD = W("qu'elles") - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tMD}>
				<Shot transition="flash" push={0.08}>
					<Clip src="factory" dim={0.45} />
					<Head at={0} top={360} size={96}>
						DES MARQUES VENDENT
					</Head>
					<Head at={W('produits') - 4} top={480} size={150} color={L.lime}>
						DES PRODUITS…
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tMD}>
				<PaperBg />
				<div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<Jar f={f - tMD} label="TA MARQUE" labelAt={W('fabriques') - tMD - 6} size={1.3} />
				</div>
				<Ink at={W('jamais') - tMD - 3} top={900} size={96}>
					QU'ELLES N'ONT
				</Ink>
				<Ink at={W('fabriques') - tMD - 3} top={1010} size={120} color={L.red}>
					JAMAIS FABRIQUÉS{' '}?
				</Ink>
				<Fx at={W('fabriques') - tMD - 6} name="stamp" />
			</Cut>
			<Fx at={0} name="impact" />
			<Fx at={tMD} name="whoosh-hit" />
		</AbsoluteFill>
	);
};

/* 1 — What it is: maker → your brand → customer ---------------------------------- */
export const S1What = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMaker = W('une') - 3;
	const tBrand = W('autre') - 3;
	const tSell = W('vend') - 4;
	return (
		<Shot transition="punch" push={0.03}>
			<PaperBg />
			<div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, W('white') - 4)})`}}>
				<div style={{display: 'inline-block', fontFamily: ANTON, fontSize: 150, color: L.ink, background: L.white, border: `6px solid ${L.ink}`, padding: '0 40px 10px', boxShadow: `12px 12px 0 ${L.lime}`}}>WHITE LABEL</div>
			</div>
			<Ink at={W('label') + 4} top={450} size={56} color={L.grey}>
				= MARQUE BLANCHE
			</Ink>
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 150}}>
				<Node icon="factory" label="FABRICANT" color={L.white} at={tMaker} f={f} />
				<Node icon="tag" label="TA MARQUE" color={L.lime} at={tBrand} f={f} />
			</div>
			<div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<Node icon="user" label="LE CLIENT" color={L.gold} at={tSell} f={f} />
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<Arrow x1={430} y1={740} x2={600} y2={740} at={tBrand} f={f} />
				<Arrow x1={720} y1={900} x2={600} y2={1000} at={tSell} f={f} />
			</svg>
			<Fx at={W('white') - 4} name="impact" gain={0.8} />
			<Fx at={tMaker} name="pop" />
			<Fx at={tBrand} name="pop" />
			<Fx at={tSell} name="cash" />
		</Shot>
	);
};

/* 2 — Same factory, different brands ---------------------------------------------- */
export const S2Same = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const shots = [
		{at: 0, src: 'cream', label: 'CRÈME', word: 'creme'},
		{at: W('application') - 4, src: 'app', label: 'APPLICATION', word: 'application'},
		{at: W('site') - 4, src: 'website', label: 'SITE INTERNET', word: 'site'},
	];
	const tMD = W('sortent') - 4;
	return (
		<AbsoluteFill>
			{shots.map((s, i) => (
				<Sequence key={s.src} from={s.at} durationInFrames={(shots[i + 1]?.at ?? tMD) - s.at}>
					<Shot transition={i === 0 ? 'whip' : 'punch'} push={0.1}>
						<Photo src={s.src} len={90} dim={0.3} />
						<div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
							<div style={{fontFamily: ANTON, fontSize: 96, color: L.ink, background: L.lime, padding: '4px 36px 8px', transform: `rotate(-3deg) scale(${pop(f - s.at, 2)})`}}>{s.label}</div>
						</div>
					</Shot>
				</Sequence>
			))}
			<Cut at={tMD}>
				<PaperBg />
				<Ink at={0} top={230} size={90}>
					LA MÊME USINE…
				</Ink>
				<div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 90}}>
					<Jar f={f - tMD} label="MARQUE A" labelAt={W('meme') - tMD - 2} color={L.lime} />
					<Jar f={f - tMD} label="MARQUE B" labelAt={W('concurrent') - tMD - 4} color={L.gold} />
				</div>
				<Ink at={W('concurrent') - tMD - 2} top={950} size={80} color={L.red}>
					…QUE TON CONCURRENT
				</Ink>
				<Fx at={W('meme') - tMD - 2} name="stamp" />
				<Fx at={W('concurrent') - tMD - 4} name="stamp" />
			</Cut>
			{shots.map((s) => (
				<Fx key={s.src} at={s.at} name="shutter" />
			))}
			<Fx at={tMD} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 3 — Why it works: volume vs brand + customer ---------------------------------- */
export const S3Why = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tVol = W('volume') - 4;
	const tYou = W('et') - 3;
	const boxes = Math.floor(lerp(ease(f, tVol, tVol + 20, (x) => x), 0, 9));
	return (
		<Shot transition="whip" push={0.03}>
			<PaperBg />
			<Ink at={0} top={170} size={100}>
				POURQUOI ÇA MARCHE{'\u00a0'}?
			</Ink>
			{/* maker side */}
			<div style={{position: 'absolute', top: 380, left: 70, width: 430, textAlign: 'center', opacity: pop(f, W('fabricant') - 4)}}>
				<div style={{fontFamily: ANTON, fontSize: 56, color: L.ink}}>LE FABRICANT</div>
				<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 30, height: 360, alignContent: 'flex-end'}}>
					{Array.from({length: boxes}).map((_, i) => (
						<div key={i} style={{width: 110, height: 100, background: '#E6E6E1', border: `4px solid ${L.ink}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - pop(f, tVol + i * 2)) * -300}px)`}}>
							<Icon name="package" size={60} color={L.ink} />
						</div>
					))}
				</div>
				<div style={{fontFamily: ANTON, fontSize: 70, color: L.ink, background: L.white, border: `4px solid ${L.ink}`, display: 'inline-block', padding: '0 24px', marginTop: 20, opacity: f >= tVol ? 1 : 0}}>VOLUME</div>
			</div>
			{/* your side */}
			<div style={{position: 'absolute', top: 380, left: 560, width: 450, textAlign: 'center', opacity: pop(f, tYou)}}>
				<div style={{fontFamily: ANTON, fontSize: 56, color: L.ink}}>TOI</div>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 40}}>
					{[
						{at: W('marque') - 3, icon: 'tag', text: 'LA MARQUE'},
						{at: W('client') - 3, icon: 'user', text: 'LE CLIENT'},
					].map((b) => (
						<div key={b.text} style={{display: 'flex', alignItems: 'center', gap: 16, background: L.gold, border: `5px solid ${L.ink}`, borderRadius: 24, padding: '18px 28px', boxShadow: `8px 8px 0 ${L.ink}`, transform: `scale(${pop(f, b.at)})`}}>
							<Icon name={b.icon} size={70} color={L.ink} />
							<span style={{fontFamily: ANTON, fontSize: 60, color: L.ink}}>{b.text}</span>
						</div>
					))}
				</div>
			</div>
			<Ink at={W('rapporte') - 4} top={1080} size={64} color={L.ink}>
				TU GARDES <span style={{background: L.lime, padding: '0 14px'}}>CE QUI RAPPORTE LE PLUS</span>
			</Ink>
			<Fx at={0} name="swish" />
			{[0, 4, 8, 12, 16].map((d) => (
				<Fx key={d} at={tVol + d} name="click" gain={0.7} />
			))}
			<Fx at={W('marque') - 3} name="ding" />
			<Fx at={W('client') - 3} name="ding" />
		</Shot>
	);
};

/* 4 — Example margin ------------------------------------------------------------ */
export const S4Margin = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tBuy = W('cent') - 4;
	const tSell = W('trois') - 4;
	const margin = ease(f, tSell + 6, tSell + 24);
	const card = (title: string, amount: number, color: string, at: number, x: number) => (
		<div style={{position: 'absolute', top: 420, left: x, width: 430, padding: '30px 34px', background: L.white, border: `5px solid ${L.ink}`, borderRadius: 26, boxShadow: `10px 10px 0 ${color}`, transform: `translateY(${(1 - pop(f, at)) * 200}px)`, opacity: pop(f, at)}}>
			<div style={{fontFamily: ANTON, fontSize: 44, color: L.grey}}>{title}</div>
			<div style={{fontFamily: ANTON, fontSize: 130, color: L.ink, lineHeight: 1.05}}>{Math.round(amount * ease(f, at, at + 14))} €</div>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: L.grey}}>par mois</div>
		</div>
	);
	return (
		<Shot transition="punch" push={0.03}>
			<PaperBg />
			<div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{fontFamily: ANTON, fontSize: 70, color: L.ink, background: L.gold, padding: '4px 30px', border: `4px solid ${L.ink}`, transform: `rotate(-2deg) scale(${pop(f, 0)})`}}>EXEMPLE</div>
			</div>
			<Ink at={W('logiciel') - 4} top={300} size={60} color={L.ink}>
				UN LOGICIEL EN MARQUE BLANCHE
			</Ink>
			{card('TU L’ACHÈTES', 100, L.grey, tBuy, 60)}
			{card('TU LE REVENDS', 300, L.lime, tSell, 590)}
			{f >= tSell + 6 && (
				<div style={{position: 'absolute', top: 820, left: 90, right: 90}}>
					<div style={{height: 90, border: `5px solid ${L.ink}`, borderRadius: 99, background: L.white, overflow: 'hidden', display: 'flex'}}>
						<div style={{width: '33.3%', background: '#D6D6D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 38, color: L.ink}}>COÛT</div>
						<div style={{width: `${66.7 * margin}%`, background: L.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 44, color: L.ink, whiteSpace: 'nowrap', overflow: 'hidden'}}>+200 € DE MARGE</div>
					</div>
				</div>
			)}
			<Ink at={W('avec') - 4} top={980} size={56} color={L.ink}>
				+ TON NOM + TON ACCOMPAGNEMENT
			</Ink>
			<Fx at={0} name="stamp" />
			<Fx at={tBuy} name="pop" />
			<Fx at={tSell} name="pop" />
			<Fx at={tSell + 6} name="riser" />
			<Fx at={tSell + 24} name="cash" />
		</Shot>
	);
};

/* 5 — Launch fast ----------------------------------------------------------------- */
export const S5Fast = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const items = [
		{at: W("d'usine") - 4, text: 'USINE', icon: 'factory'},
		{at: W('developpeurs') - 4, text: 'DÉVELOPPEURS', icon: 'code'},
		{at: W("d'annees") - 4, text: 'ANNÉES DE R&D', icon: 'flask-conical'},
	];
	const tLaunch = W('tu') - 4;
	return (
		<Shot transition="whip" push={0.05}>
			<Clip src="laptop" dim={0.55} />
			<div style={{position: 'absolute', top: 260, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 26}}>
				{items.map((it) => {
					if (f < it.at) return null;
					const p = pop(f, it.at);
					const strike = ease(f, it.at + 6, it.at + 14);
					return (
						<div key={it.text} style={{display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(10,10,15,0.8)', borderRadius: 24, padding: '18px 30px', transform: `translateX(${(1 - p) * -200}px)`, position: 'relative'}}>
							<Icon name={it.icon} size={80} color={L.white} />
							<span style={{fontFamily: ANTON, fontSize: 70, color: L.white}}>PAS {it.text.startsWith('U') ? "D'" : 'DE '}{it.text}</span>
							<div style={{position: 'absolute', left: 20, top: '50%', height: 10, width: `${strike * 95}%`, background: L.red, borderRadius: 6}} />
						</div>
					);
				})}
			</div>
			{f >= tLaunch && (
				<div style={{position: 'absolute', top: 830, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, tLaunch)})`}}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 20, background: L.lime, padding: '14px 40px', borderRadius: 26}}>
						<Icon name="calendar" size={90} color={L.ink} />
						<span style={{fontFamily: ANTON, fontSize: 80, color: L.ink}}>LANCÉ EN QUELQUES SEMAINES</span>
					</div>
				</div>
			)}
			<Fx at={0} name="swish" />
			{items.map((it) => (
				<Fx key={it.text} at={it.at + 6} name="click" />
			))}
			<Fx at={tLaunch} name="ding" />
		</Shot>
	);
};

/* 6 — The risks ----------------------------------------------------------------- */
export const S6Risk = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tFall = W('tombe') - 2;
	const tAngry = W('et') - 4;
	const dominos = ['FOURNISSEUR', 'TON OFFRE', 'TES CLIENTS', 'TON BUSINESS'];
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tAngry}>
				<Shot transition="punch" push={0.03} flashColor={L.red}>
					<DarkBg />
					<Head at={W('attention') - 4} top={200} size={130} color={L.red}>
						ATTENTION
					</Head>
					<div style={{position: 'absolute', top: 700, left: 90, display: 'flex', gap: 60, alignItems: 'flex-end'}}>
						{dominos.map((d, i) => {
							const fall = ease(f, tFall + i * 5, tFall + i * 5 + 10);
							return (
								<div key={d} style={{width: 150, height: 380, background: i === 0 ? L.red : L.white, borderRadius: 16, border: `5px solid ${L.ink}`, transformOrigin: 'bottom right', transform: `rotate(${fall * 72}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<span style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: ANTON, fontSize: 52, color: L.ink}}>{d}</span>
								</div>
							);
						})}
					</div>
					<Head at={W('business') - 4} top={1180} size={70}>
						TON FOURNISSEUR TOMBE = TU TOMBES
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tAngry}>
				<Photo src="angry" len={line.durationInFrames - tAngry} from={[1.05, 0, 0]} to={[1.2, 0, 30]} dim={0.4} />
				<div style={{position: 'absolute', top: 260, left: 90, right: 90, background: L.white, borderRadius: 28, padding: '28px 34px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', transform: `translateY(${(1 - pop(f - tAngry, W('mecontent') - tAngry - 4)) * -300}px)`, opacity: pop(f - tAngry, W('mecontent') - tAngry - 4)}}>
					<div style={{display: 'flex', gap: 6}}>
						{[0, 1, 2, 3, 4].map((s) => (
							<Icon key={s} name="star" size={60} color={s === 0 ? L.gold : '#D6D6D0'} />
						))}
					</div>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: L.ink, marginTop: 12}}>« Produit décevant. Je ne recommande pas. »</div>
					<div style={{fontFamily: ANTON, fontSize: 44, color: L.red, marginTop: 10}}>→ AVIS SUR <span style={{background: L.lime, color: L.ink, padding: '0 10px'}}>TA MARQUE</span></div>
				</div>
				<Head at={W('toi') - tAngry - 4} top={1050} size={110} color={L.red}>
					PAS SUR L'USINE.
				</Head>
				<Fx at={W('mecontent') - tAngry - 4} name="alert" />
				<Fx at={W('toi') - tAngry - 4} name="buzzer" />
			</Cut>
			<Fx at={0} name="whoosh" />
			<Fx at={W('attention') - 4} name="impact" gain={0.7} />
			{dominos.map((_, i) => (
				<Fx key={i} at={tFall + i * 5 + 8} name="click" gain={0.8} />
			))}
			<Fx at={tAngry} name="whoosh-hit" />
		</AbsoluteFill>
	);
};

/* 7 — What you build around the product ----------------------------------------- */
export const S7Around = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const rings = [
		{at: W('marque') - 3, label: 'MARQUE', color: L.lime, r: 250},
		{at: W('service') - 3, label: 'SERVICE', color: L.gold, r: 340},
		{at: W('relation') - 3, label: 'RELATION', color: L.blue, r: 430},
	];
	return (
		<Shot transition="punch" push={0.04}>
			<PaperBg />
			<Ink at={W('secret') - 4} top={150} size={100}>
				LE SECRET
			</Ink>
			<Ink at={W('produit') - 4} top={260} size={70} color={L.grey}>
				{f < W("c'est") - 4 ? "CE N'EST PAS LE PRODUIT" : "C'EST CE QUE TU CONSTRUIS AUTOUR"}
			</Ink>
			<div style={{position: 'absolute', left: 0, top: 380, width: 1080, height: 1000}}>
				<svg width={1080} height={1000} style={{position: 'absolute'}}>
					{rings.map((ring) => {
						const p = pop(f, ring.at);
						return f >= ring.at ? <circle key={ring.label} cx={540} cy={480} r={ring.r * p} fill="none" stroke={ring.color} strokeWidth={34} opacity={0.9} /> : null;
					})}
				</svg>
				{rings.map((ring) =>
					f >= ring.at ? (
						<div key={ring.label} style={{position: 'absolute', top: 480 - ring.r - 34, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, ring.at + 4)})`}}>
							<span style={{fontFamily: ANTON, fontSize: 50, color: L.ink, background: ring.color, padding: '2px 22px', border: `4px solid ${L.ink}`, borderRadius: 14}}>{ring.label}</span>
						</div>
					) : null,
				)}
				<div style={{position: 'absolute', top: 480 - 190, left: 540 - 150}}>
					<Jar f={f} size={0.95} />
				</div>
			</div>
			<Fx at={W('secret') - 4} name="whoosh" />
			{rings.map((ring) => (
				<Fx key={ring.label} at={ring.at} name="ding" />
			))}
		</Shot>
	);
};

/* 8 — The lesson ------------------------------------------------------------------ */
export const S8Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const gold = ['confiance'];
	const words = (ws: typeof line.words) =>
		ws.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', marginRight: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: gold.includes(w.text) ? L.lime : L.white}}>
					{w.text}
				</span>
			);
		});
	return (
		<Shot transition="none" push={0.06} len={line.durationInFrames}>
			<Photo src="trust" len={line.durationInFrames + 40} from={[1.05, 0, 0]} to={[1.18, 0, -40]} dim={0.6} />
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 12)}} />
			<div style={{position: 'absolute', top: 500, left: 80, right: 80, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 90, lineHeight: 1.2, textShadow: '0 8px 30px rgba(0,0,0,0.9)'}}>
				<div>{words(line.words.slice(0, split))}</div>
				<div style={{marginTop: 46}}>{words(line.words.slice(split))}</div>
			</div>
			<Fx at={0} name="whoosh" gain={0.6} />
		</Shot>
	);
};

/* 9 — Call to action: comment WHITE --------------------------------------------- */
const FAKE = ['lucas.b', 'sarah_m', 'nina.biz', 'karim75', 'jules.ecom', 'lea.creates'];

export const S9Cta = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tType = W('ecris') - 2;
	const typed = 'WHITE'.slice(0, Math.max(0, Math.min(5, Math.floor((f - tType) / 3))));
	const tSent = tType + 18;
	const tDm = W("t'envoie") - 4;
	return (
		<Shot transition="punch" push={0.02}>
			<DarkBg />
			<Head at={0} top={150} size={84}>
				QUELS PRODUITS LANCER
			</Head>
			<Head at={W('marque') - 4} top={250} size={84} color={L.lime}>
				EN MARQUE BLANCHE ?
			</Head>
			{/* comments panel */}
			<div style={{position: 'absolute', top: 420, left: 60, right: 60, background: '#16161E', borderRadius: 36, padding: '30px 32px', border: '2px solid #2A2A36', transform: `translateY(${(1 - pop(f, tType - 10)) * 400}px)`, opacity: pop(f, tType - 10)}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: L.grey, marginBottom: 20, display: 'flex', justifyContent: 'space-between'}}>
					<span>Commentaires</span>
					<span>{f >= tSent ? money(Math.floor(lerp(ease(f, tSent, tSent + 50), 1, 248))) : 0}</span>
				</div>
				{FAKE.slice(0, Math.max(0, Math.min(FAKE.length, Math.floor((f - tSent) / 6)))).map((name, i) => (
					<div key={name} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 0', opacity: pop(f, tSent + i * 6)}}>
						<div style={{width: 64, height: 64, borderRadius: 99, background: [L.lime, L.gold, L.blue, L.red, L.green, '#B983FF'][i]}} />
						<div>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: L.grey}}>{name}</div>
							<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: L.white}}>WHITE</div>
						</div>
						<div style={{marginLeft: 'auto'}}>
							<Icon name="heart" size={40} color={L.grey} />
						</div>
					</div>
				))}
				{/* the viewer's own comment box */}
				<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, background: '#22222C', borderRadius: 99, padding: '16px 26px', border: `3px solid ${f >= tType ? L.lime : '#33333F'}`}}>
					<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: L.white, flex: 1}}>
						{typed}
						<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: L.lime}}>|</span>
					</span>
					<div style={{width: 76, height: 76, borderRadius: 99, background: f >= tSent - 4 ? L.lime : '#33333F', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f >= tSent - 4 && f < tSent + 4 ? 1.2 : 1})`}}>
						<Icon name="send" size={40} color={L.ink} />
					</div>
				</div>
			</div>
			{f >= W('commentaire') - 4 && (
				<div style={{position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, W('commentaire') - 4)})`}}>
					<span style={{fontFamily: ANTON, fontSize: 80, color: L.ink, background: L.lime, padding: '6px 34px 10px', borderRadius: 20}}>ÉCRIS « WHITE »</span>
				</div>
			)}
			{f >= tDm && (
				<div style={{position: 'absolute', top: 40, left: 60, right: 60, zIndex: 5, display: 'flex', alignItems: 'center', gap: 20, background: L.white, borderRadius: 28, padding: '20px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transform: `translateY(${(1 - pop(f, tDm)) * -260}px)`}}>
					<div style={{width: 80, height: 80, borderRadius: 22, background: L.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="message-circle" size={50} color={L.ink} />
					</div>
					<div>
						<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 34, color: L.ink}}>Nouveau message</div>
						<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#555'}}>Voici ta liste de produits en marque blanche</div>
					</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1490, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: 'rgba(255,255,255,0.55)', opacity: ease(f, 10, 25)}}>
				Exemple de prix illustratif · Voix : ElevenLabs · Images : Pixabay
			</div>
			{[0, 3, 6, 9, 12].map((d) => (
				<Fx key={d} at={tType + d} name="key" />
			))}
			<Fx at={tSent} name="pop" />
			{[1, 2, 3, 4, 5].map((i) => (
				<Fx key={i} at={tSent + i * 6} name="click" gain={0.6} />
			))}
			<Fx at={tDm} name="alert" />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1What, S2Same, S3Why, S4Margin, S5Fast, S6Risk, S7Around, S8Lesson, S9Cta];
