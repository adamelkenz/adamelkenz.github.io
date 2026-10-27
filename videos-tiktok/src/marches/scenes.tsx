import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ease, money, pop, shake} from '../components/anim';
import {ANTON, SANS, SERIF} from '../components/fonts';
import {Fx} from '../components/Fx';
import {Line, Shot, wordAt} from '../components/layers';
import {Chip, Figure, Footage as BaseFootage, Head, Icon, Stack} from '../statuts/kit';

type SceneProps = {line: Line};

export const M = {
	ink: '#05070F',
	white: '#F7F7FA',
	grey: '#9AA3B8',
	blue: '#4F8BFF',
	red: '#FF4D5A',
	gold: '#FFD25A',
	green: '#3BE38B',
	amber: '#FFA62B',
};

const Footage = (props: React.ComponentProps<typeof BaseFootage>) => <BaseFootage folder="marches" {...props} />;

const STEPS = ['LE PRINCIPE', 'LES SEUILS', 'TROUVER', 'RÉPONDRE', 'ÊTRE PAYÉ'];

/** Chapter strip at the top: where we are in the explanation. */
const Progress = ({current}: {current: number}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: 115, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 10, opacity: pop(f, 0)}}>
			{STEPS.map((s, i) => {
				const on = i === current;
				return (
					<div
						key={s}
						style={{
							fontFamily: ANTON,
							fontSize: on ? 36 : 26,
							padding: on ? '8px 20px' : '8px 12px',
							borderRadius: 99,
							alignSelf: 'center',
							color: on ? M.ink : i < current ? M.white : 'rgba(247,247,250,0.45)',
							background: on ? M.blue : i < current ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.35)',
							border: `2px solid ${on ? M.blue : 'rgba(255,255,255,0.18)'}`,
						}}
					>
						{on ? `${i + 1}. ${s}` : i + 1}
					</div>
				);
			})}
		</div>
	);
};

/** Hard cut to another clip inside a scene. */
const Cut = ({at, until, children}: {at: number; until?: number; children: React.ReactNode}) => (
	<Sequence from={at} durationInFrames={until !== undefined ? until - at : undefined}>
		<Shot transition="punch" push={0}>
			{children}
		</Shot>
	</Sequence>
);

/* 0 — Hook ------------------------------------------------------------------ */
export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tTrav = W('travailler');
	const tEtre = W('etre');
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tTrav - 2}>
				<Shot transition="flash" push={0.08}>
					<Footage src="hook-office" dim={0.5} tint="rgba(79,139,255,0.35)" />
				</Shot>
			</Sequence>
			<Cut at={tTrav - 2}>
				<Footage src="hook-town" dim={0.5} zoom={0.18} />
			</Cut>
			<Head at={0} top={330} size={84} color={M.white}>
				COMMENT UNE
				<br />
				<span style={{color: M.gold}}>PETITE ENTREPRISE</span>
			</Head>
			{f >= tTrav - 2 && (
				<div style={{position: 'absolute', top: 600, left: 0, right: 0, textAlign: 'center', transform: `${shake(f, W("l'etat"), 14, 8)} scale(${1.5 - 0.5 * pop(f, tTrav - 2)})`}}>
					<div style={{fontFamily: ANTON, fontSize: 120, color: M.white, lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>TRAVAILLE POUR</div>
					<div style={{fontFamily: ANTON, fontSize: 210, color: M.blue, lineHeight: 1, textShadow: `0 0 60px ${M.blue}88, 0 10px 40px rgba(0,0,0,0.8)`}}>L'ÉTAT</div>
				</div>
			)}
			{f >= tEtre - 2 && (
				<div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 86, color: M.ink, background: M.gold, padding: '6px 36px 10px', borderRadius: 20, transform: `rotate(-3deg) scale(${pop(f, tEtre - 2)})`}}>
						…ET EST PAYÉE À TEMPS ?
					</div>
				</div>
			)}
			<Fx at={0} name="impact" />
			<Fx at={tTrav - 4} name="whoosh-hit" />
			<Fx at={tEtre - 2} name="stamp" />
		</AbsoluteFill>
	);
};

/* 1 — The size of it --------------------------------------------------------- */
export const S1Stats = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDeux = W('deux');
	const tEt = W('et');
	const tSix = W('six');
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tEt - 3}>
				<Shot transition="whip" push={0.06}>
					<Footage src="billions" dim={0.6} />
					<Head at={W('2024') - 4} top={340} size={90} color={M.grey}>
						EN 2024
					</Head>
					<Figure at={tDeux - 2} to={233} len={W('milliards') - tDeux + 8} color={M.gold} top={470} size={300} label="MILLIARDS D'EUROS DE MARCHÉS PUBLICS" />
				</Shot>
			</Sequence>
			<Cut at={tEt - 3}>
				<Footage src="construction" dim={0.6} />
				<Head at={2} top={330} size={110}>
					ET <span style={{color: M.green}}>6 MARCHÉS SUR 10</span>
				</Head>
				<div style={{position: 'absolute', top: 560, left: 120, right: 120, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 26}}>
					{Array.from({length: 10}).map((_, i) => {
						const lit = i < 6 && f - (tEt - 3) >= tSix - (tEt - 3) + i * 2;
						return (
							<div key={i} style={{width: 140, height: 140, borderRadius: 30, background: lit ? M.green : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f - (tEt - 3), 2 + i)})`}}>
								<Icon name="store" size={80} color={lit ? M.ink : 'rgba(255,255,255,0.4)'} />
							</div>
						);
					})}
				</div>
				<Head at={W('pme') - (tEt - 3) - 2} top={930} size={100} color={M.green}>
					VONT À DES PME
				</Head>
				<Fx at={tSix - (tEt - 3)} name="pop" />
				<Fx at={W('pme') - (tEt - 3) - 2} name="ding" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={tDeux - 2} name="riser" />
			<Fx at={W('marches') - 2} name="coins" />
			<Fx at={tEt - 3} name="whoosh" />
		</AbsoluteFill>
	);
};

/* 2 — Who buys, and the rule ------------------------------------------------ */
export const S2Buyers = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const buyers = [
		{at: W('mairie') - 2, label: 'MAIRIE', icon: 'landmark', clip: 'town'},
		{at: W('hopital') - 2, label: 'HÔPITAL', icon: 'hospital', clip: 'hospital'},
		{at: W('ministere') - 2, label: 'MINISTÈRE', icon: 'building-2', clip: 'flag'},
	];
	const tRule = W('il') - 3;
	return (
		<AbsoluteFill>
			{buyers.map((b, i) => (
				<Sequence key={b.label} from={i === 0 ? 0 : b.at} durationInFrames={(buyers[i + 1]?.at ?? tRule) - (i === 0 ? 0 : b.at)}>
					<Shot transition={i === 0 ? 'whip' : 'punch'} push={0.08}>
						<Footage src={b.clip} dim={0.55} />
					</Shot>
				</Sequence>
			))}
			<Cut at={tRule}>
				<Footage src="hospital" trim={60} dim={0.75} />
			</Cut>
			<Progress current={0} />
			{f < tRule &&
				buyers.map((b, i) =>
					f >= b.at ? (
						<div key={b.label} style={{position: 'absolute', top: 360 + i * 210, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(5,7,15,0.82)', border: `4px solid ${M.blue}`, borderRadius: 30, padding: '16px 44px', transform: `translateX(${(1 - pop(f, b.at)) * (i % 2 ? 500 : -500)}px)`}}>
								<Icon name={b.icon} size={100} color={M.blue} />
								<span style={{fontFamily: ANTON, fontSize: 100, color: M.white}}>{b.label}</span>
							</div>
						</div>
					) : null,
				)}
			{f >= tRule && (
				<>
					<Head at={tRule} top={330} size={96}>
						RÈGLE N°1
					</Head>
					<div style={{position: 'absolute', top: 500, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
						{['store', 'hard-hat', 'briefcase'].map((ic, i) => (
							<div key={ic} style={{width: 220, height: 220, borderRadius: 40, background: 'rgba(5,7,15,0.85)', border: `4px solid ${M.white}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, tRule + 4 + i * 3)}) translateY(${Math.sin((f + i * 10) / 6) * 8}px)`}}>
								<Icon name={ic} size={130} color={M.white} />
							</div>
						))}
					</div>
					<Head at={W('concurrence') - 4} top={800} size={110} color={M.gold}>
						MISE EN CONCURRENCE
					</Head>
					<Head at={W('concurrence') + 4} top={930} size={80}>
						OBLIGATOIRE
					</Head>
				</>
			)}
			{buyers.map((b, i) => (
				<React.Fragment key={b.label}>
					<Fx at={b.at} name={i === 0 ? 'swish' : 'shutter'} />
				</React.Fragment>
			))}
			<Fx at={tRule} name="whoosh" />
			<Fx at={W('concurrence') + 4} name="gavel" />
		</AbsoluteFill>
	);
};

/* 3 & 4 — The threshold ladder ---------------------------------------------- */
type Rung = {at: number; amount: string; note: string; color: string};
type Zone = {at: number; label: string; sub: string; color: string};

const Ladder = ({rungs, zones}: {rungs: Rung[]; zones: Zone[]}) => {
	const f = useCurrentFrame();
	const top = 330;
	const height = 960;
	return (
		<>
			{/* axis */}
			<div style={{position: 'absolute', top, left: 150, width: 12, height: height * ease(f, 0, 14), background: `linear-gradient(0deg, ${M.green}, ${M.amber}, ${M.red})`, borderRadius: 8}} />
			<div style={{position: 'absolute', top: top - 70, left: 92, fontFamily: ANTON, fontSize: 44, color: M.grey}}>MONTANT HT ↑</div>
			{zones.map((z, i) => {
				if (f < z.at) return null;
				const p = pop(f, z.at);
				// Label sits inside its band, below the threshold rung (the lowest band also holds the 100 k€ line).
				const zoneTop = top + height - (i + 1) * (height / 3) + (i === 0 ? 170 : 110);
				return (
					<div key={z.label} style={{position: 'absolute', top: zoneTop, left: 200, right: 60, transform: `translateX(${(1 - p) * 300}px)`, opacity: p}}>
						<div style={{display: 'inline-block', fontFamily: ANTON, fontSize: 64, color: M.ink, background: z.color, padding: '4px 26px 8px', borderRadius: 16}}>{z.label}</div>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: M.white, marginTop: 10, textShadow: '0 4px 16px rgba(0,0,0,0.9)'}}>{z.sub}</div>
					</div>
				);
			})}
			{rungs.map((r, i) => {
				if (f < r.at) return null;
				const p = pop(f, r.at);
				const y = top + height - (i + 1) * (height / 3);
				return (
					<div key={r.amount} style={{position: 'absolute', top: y - 34, left: 40, right: 60, display: 'flex', alignItems: 'center', gap: 18, opacity: p}}>
						<div style={{width: 230 * p, height: 8, background: r.color, borderRadius: 4, marginLeft: 50}} />
						<div style={{fontFamily: ANTON, fontSize: 70, color: r.color, textShadow: '0 6px 20px rgba(0,0,0,0.9)', transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: 'left center'}}>{r.amount}</div>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: M.white, textShadow: '0 4px 16px rgba(0,0,0,0.9)'}}>{r.note}</div>
					</div>
				);
			})}
		</>
	);
};

export const S3Thresholds = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tSous = W('sous') - 3;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tSous}>
				<Shot transition="punch" push={0.05}>
					<Footage src="workers" dim={0.6} />
					<Progress current={1} />
					<Head at={W('depend') - 4} top={620} size={140}>
						TOUT DÉPEND
					</Head>
					<Head at={W('montant') - 4} top={780} size={140} color={M.gold}>
						DU MONTANT
					</Head>
				</Shot>
			</Sequence>
			<Cut at={tSous}>
				<Footage src="typing" dim={0.72} />
				<Progress current={1} />
				<Ladder
					rungs={[{at: W('soixante') - 2 - tSous, amount: '60 000 €', note: 'services', color: M.green}]}
					zones={[{at: W("l'acheteur") - 4 - tSous, label: 'GRÉ À GRÉ', sub: "l'acheteur peut te choisir directement", color: M.green}]}
				/>
				<Rung2 at={W('cent') - 2 - tSous} />
				<Fx at={W('soixante') - 2 - tSous} name="click" />
				<Fx at={W('cent') - 2 - tSous} name="click" />
				<Fx at={W("l'acheteur") - 4 - tSous} name="ding" />
			</Cut>
			<Fx at={0} name="whoosh" />
			<Fx at={W('montant') - 4} name="impact" gain={0.8} />
			<Fx at={tSous} name="swish" />
		</AbsoluteFill>
	);
};

/** "100 000 € travaux" shown next to the 60 000 € rung (same level of the ladder). */
const Rung2 = ({at}: {at: number}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at);
	return (
		<div style={{position: 'absolute', top: 330 + 960 - 960 / 3 + 50, left: 340, display: 'flex', alignItems: 'baseline', gap: 16, opacity: p, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: 'left center'}}>
			<div style={{fontFamily: ANTON, fontSize: 70, color: M.green, textShadow: '0 6px 20px rgba(0,0,0,0.9)'}}>100 000 €</div>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: M.white, textShadow: '0 4px 16px rgba(0,0,0,0.9)'}}>travaux</div>
		</div>
	);
};

export const S4Formal = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tContract = W('et') - 3;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tContract}>
				<Shot transition="none" push={0.04}>
					<Footage src="typing" trim={200} dim={0.72} />
				</Shot>
			</Sequence>
			<Cut at={tContract}>
				<Footage src="archive" dim={0.72} />
			</Cut>
			<Progress current={1} />
			<Ladder
				rungs={[
					{at: 0, amount: '60 / 100 k€', note: '', color: M.green},
					{at: W('deux') - 2, amount: '216 000 €', note: 'collectivités', color: M.red},
				]}
				zones={[
					{at: 0, label: 'GRÉ À GRÉ', sub: 'en dessous du seuil', color: M.green},
					{at: W('publie') - 3, label: 'AVIS PUBLIÉ', sub: 'procédure adaptée (MAPA)', color: M.amber},
					{at: W('procedure') - 3, label: 'PROCÉDURE FORMALISÉE', sub: 'appel d’offres', color: M.red},
				]}
			/>
			<Fx at={W('publie') - 3} name="page" />
			<Fx at={W('deux') - 2} name="click" />
			<Fx at={W('procedure') - 3} name="stamp" />
		</AbsoluteFill>
	);
};

/* 5 — Where to find tenders -------------------------------------------------- */
const RESULTS = [
	['Commune', "Entretien des espaces verts"],
	['Hôpital', 'Prestations de nettoyage'],
	['Département', "Rénovation d'un collège"],
];

export const S5Find = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tType = W('sur') - 4;
	const query = 'avis de marché  ·  mon métier  ·  ma région';
	const typed = query.slice(0, Math.max(0, Math.floor((f - tType) * 1.6)));
	const tAlert = W('alertes') - 4;
	return (
		<Shot transition="whip" push={0.04}>
			<Footage src="laptop" dim={0.7} />
			<Progress current={2} />
			<Head at={0} top={260} size={96}>
				CES AVIS SONT <span style={{color: M.blue}}>PUBLICS</span>
			</Head>
			<div style={{position: 'absolute', top: 420, left: 70, right: 70, background: 'rgba(247,247,250,0.96)', borderRadius: 30, padding: '26px 30px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', transform: `translateY(${(1 - pop(f, tType - 6)) * 200}px)`, opacity: pop(f, tType - 6)}}>
				<div style={{display: 'flex', gap: 12, marginBottom: 20}}>
					{['BOAMP', 'Plateformes acheteurs'].map((t, i) => (
						<div key={t} style={{fontFamily: ANTON, fontSize: 36, padding: '6px 18px', borderRadius: 12, background: i === 0 ? M.blue : '#E3E7F0', color: i === 0 ? M.white : '#33405C', opacity: f >= (i === 0 ? W('boamp') - 3 : W('plateformes') - 3) ? 1 : 0.25}}>{t}</div>
					))}
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 16, border: '3px solid #C9D2E3', borderRadius: 18, padding: '14px 18px'}}>
					<Icon name="search" size={48} color="#33405C" />
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#1B2333'}}>
						{typed}
						<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>
					</span>
				</div>
				{RESULTS.map(([buyer, what], i) => {
					const at = W('acheteurs') - 4 + i * 6;
					if (f < at) return null;
					const p = pop(f, at);
					return (
						<div key={what} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E3E7F0', padding: '18px 6px', transform: `translateX(${(1 - p) * 80}px)`, opacity: p}}>
							<div>
								<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#1B2333'}}>{what}</div>
								<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: '#5B6782'}}>{buyer} · avis de marché</div>
							</div>
							<div style={{fontFamily: ANTON, fontSize: 30, color: M.blue}}>VOIR →</div>
						</div>
					);
				})}
			</div>
			{f >= tAlert && (
				<div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, background: M.gold, borderRadius: 26, padding: '16px 34px', transform: `scale(${pop(f, tAlert)}) rotate(${Math.sin((f - tAlert) / 2) * Math.max(0, 8 - (f - tAlert) * 0.5)}deg)`}}>
						<Icon name="bell" size={64} color={M.ink} />
						<span style={{fontFamily: ANTON, fontSize: 60, color: M.ink}}>ALERTES GRATUITES</span>
					</div>
				</div>
			)}
			<Fx at={0} name="swish" />
			{[0, 4, 8, 12, 16, 20, 24].map((d) => (
				<Fx key={d} at={tType + d} name="key" gain={0.8} />
			))}
			{RESULTS.map((_, i) => (
				<Fx key={i} at={W('acheteurs') - 4 + i * 6} name="pop" gain={0.8} />
			))}
			<Fx at={tAlert} name="alert" />
		</Shot>
	);
};

/* 6 — What to send ----------------------------------------------------------- */
export const S6Answer = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDoss = W('dossier') - 3;
	const tMem = W('memoire') - 3;
	const doc = (at: number, title: string, lines: string[], color: string, big: boolean) => {
		if (f < at) return null;
		const p = pop(f, at);
		return (
			<div style={{width: big ? 470 : 380, padding: '30px 30px', borderRadius: 26, background: 'rgba(247,247,250,0.96)', boxShadow: big ? `0 0 70px ${color}88` : '0 30px 60px rgba(0,0,0,0.5)', border: `6px solid ${color}`, transform: `translateY(${(1 - p) * 200}px) rotate(${big ? 2 : -3}deg) scale(${big ? 1.05 : 0.95})`, opacity: p}}>
				<Icon name={big ? 'file-check' : 'file-text'} size={90} color={color} />
				<div style={{fontFamily: ANTON, fontSize: big ? 58 : 48, color: '#1B2333', lineHeight: 1.05, marginTop: 10}}>{title}</div>
				{lines.map((l) => (
					<div key={l} style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#5B6782', marginTop: 8}}>{l}</div>
				))}
			</div>
		);
	};
	return (
		<Shot transition="punch" push={0.04}>
			<Footage src="notebook" dim={0.65} />
			<Progress current={3} />
			<Head at={0} top={260} size={100}>
				POUR RÉPONDRE
			</Head>
			<div style={{position: 'absolute', top: 440, left: 40, right: 40, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 30}}>
				{doc(tDoss, 'DOSSIER ADMINISTRATIF', ['DUME ou DC1 / DC2', 'attestations'], M.grey, false)}
				{doc(tMem, 'MÉMOIRE TECHNIQUE', ['méthode', 'équipe et moyens', 'planning'], M.gold, true)}
			</div>
			{f >= W('prouve') - 4 && (
				<div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 60, color: M.ink, background: M.gold, padding: '8px 34px', borderRadius: 18, transform: `scale(${pop(f, W('prouve') - 4)})`}}>C'EST LUI QUI FAIT GAGNER</div>
				</div>
			)}
			<Fx at={0} name="whoosh" />
			<Fx at={tDoss} name="paper" />
			<Fx at={tMem} name="page" />
			<Fx at={W('prouve') - 4} name="ding" />
		</Shot>
	);
};

/* 7 — How offers are scored ------------------------------------------------- */
export const S7Score = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tNote = W('notee') - 3;
	const bar = (label: string, pct: number, color: string, at: number) => (
		<div style={{marginBottom: 34, opacity: f >= at ? 1 : 0.2}}>
			<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: ANTON, fontSize: 64, color: M.white, marginBottom: 10}}>
				<span>{label}</span>
				<span style={{color}}>{Math.round(pct * ease(f, at, at + 16))} %</span>
			</div>
			<div style={{height: 46, borderRadius: 99, background: 'rgba(255,255,255,0.14)', overflow: 'hidden'}}>
				<div style={{height: '100%', width: `${pct * ease(f, at, at + 16)}%`, background: color, borderRadius: 99}} />
			</div>
		</div>
	);
	return (
		<Shot transition="whip" push={0.04}>
			<Footage src="contract" dim={0.68} />
			<Progress current={3} />
			<Head at={0} top={270} size={96}>
				LE MOINS CHER
			</Head>
			<Head at={W('gagne') - 4} top={380} size={96} color={M.red}>
				NE GAGNE PAS TOUJOURS
			</Head>
			{f >= tNote && (
				<div style={{position: 'absolute', top: 600, left: 90, right: 90, transform: `translateY(${(1 - pop(f, tNote)) * 100}px)`, opacity: pop(f, tNote)}}>
					{bar('PRIX', 40, M.blue, W('prix') - 3)}
					{bar('QUALITÉ', 60, M.gold, W('qualite') - 3)}
					<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: M.grey, textAlign: 'right'}}>exemple de pondération, fixée par l'acheteur</div>
				</div>
			)}
			<Fx at={0} name="swish" />
			<Fx at={W('gagne') - 4} name="buzzer" />
			<Fx at={W('prix') - 3} name="click" />
			<Fx at={W('qualite') - 3} name="gavel" />
		</Shot>
	);
};

/* 8 — Team up ---------------------------------------------------------------- */
export const S8Group = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tGroup = W('groupement') - 6;
	const merge = ease(f, tGroup, tGroup + 14);
	const icons = ['store', 'hard-hat', 'briefcase'];
	return (
		<Shot transition="punch" push={0.05}>
			<Footage src="team" dim={0.62} />
			<Progress current={3} />
			<Head at={W('trop') - 3} top={270} size={100}>
				TROP GROS
			</Head>
			<Head at={W('toi') - 3} top={380} size={100} color={M.gold}>
				POUR TOI SEUL ?
			</Head>
			<div style={{position: 'absolute', top: 620, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{position: 'relative', width: 900, height: 300}}>
					{icons.map((ic, i) => {
						const x = (i - 1) * 300 * (1 - merge) + (i - 1) * 245 * merge;
						return (
							<div key={ic} style={{position: 'absolute', left: 450 - 110 + x, top: 40, width: 220, height: 220, borderRadius: 40, background: 'rgba(5,7,15,0.88)', border: `5px solid ${merge > 0.9 ? M.green : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, W('reponds') - 6 + i * 3)})`}}>
								<Icon name={ic} size={120} color={M.white} />
							</div>
						);
					})}
					{merge > 0.5 && (
						<div style={{position: 'absolute', left: 30, top: 20, width: 840, height: 260, borderRadius: 50, border: `6px solid ${M.green}`, opacity: (merge - 0.5) * 2, boxShadow: `0 0 60px ${M.green}66`}} />
					)}
				</div>
			</div>
			{f >= tGroup + 10 && (
				<div style={{position: 'absolute', top: 960, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 96, color: M.ink, background: M.green, padding: '6px 40px 10px', borderRadius: 22, transform: `scale(${pop(f, tGroup + 10)})`}}>GROUPEMENT</div>
				</div>
			)}
			<Fx at={0} name="whoosh" />
			{icons.map((_, i) => (
				<Fx key={i} at={W('reponds') - 6 + i * 3} name="pop" gain={0.8} />
			))}
			<Fx at={tGroup} name="swish" />
			<Fx at={tGroup + 12} name="impact" gain={0.8} />
		</Shot>
	);
};

/* 9 — Getting paid ----------------------------------------------------------- */
export const S9Paid = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tTrente = W('trente') - 3;
	const tLate = W('au-dela') - 3;
	const days = Math.max(0, 30 - Math.floor(Math.max(0, f - tTrente - 6) / 1.1));
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tLate}>
				<Shot transition="whip" push={0.05}>
					<Footage src="calendar" dim={0.6} />
					<Progress current={4} />
					<Head at={W('gagne') - 4} top={300} size={100}>
						MARCHÉ GAGNÉ ?
					</Head>
					<Head at={W('payer') - 4} top={430} size={90} color={M.grey}>
						L'ACHETEUR DOIT PAYER EN
					</Head>
					{f >= tTrente && (
						<div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.7 + 0.3 * pop(f, tTrente)})`}}>
							<div style={{fontFamily: ANTON, fontSize: 330, color: M.gold, lineHeight: 1, textShadow: `0 0 70px ${M.gold}77`}}>{f < tTrente + 8 ? 30 : days}</div>
							<div style={{fontFamily: ANTON, fontSize: 90, color: M.white}}>JOURS MAX.</div>
						</div>
					)}
				</Shot>
			</Sequence>
			<Cut at={tLate}>
				<Footage src="coins" dim={0.62} />
				<Progress current={4} />
				<Head at={0} top={330} size={110} color={M.red}>
					EN RETARD ?
				</Head>
				<Stack top={560} gap={30}>
					<Chip at={W('interets') - tLate - 4} text="INTÉRÊTS MORATOIRES" kind="ok" sub="dus automatiquement" />
					<Chip at={W('interets') - tLate + 8} text="+ 40 € PAR FACTURE" kind="ok" sub="indemnité forfaitaire de recouvrement" />
				</Stack>
				<Fx at={0} name="buzzer" gain={0.8} />
				<Fx at={W('interets') - tLate - 4} name="coins" />
				<Fx at={W('interets') - tLate + 8} name="cash" />
			</Cut>
			<Fx at={0} name="swish" />
			<Fx at={tTrente} name="impact" gain={0.7} />
			<Fx at={tTrente + 8} name="clock" />
		</AbsoluteFill>
	);
};

/* 10 — The lesson ------------------------------------------------------------ */
export const S10Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const gold = ['lire', 'cahier', 'des', 'charges.'];
	const words = (ws: typeof line.words, highlight: boolean) =>
		ws.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', marginRight: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: highlight && gold.includes(w.text) ? M.gold : M.white}}>
					{w.text}
				</span>
			);
		});
	return (
		<Shot transition="none" push={0.06} len={line.durationInFrames}>
			<Footage src="judge" dim={0.6} zoom={0.12} len={line.durationInFrames + 60} />
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 12)}} />
			<div style={{position: 'absolute', top: 430, left: 80, right: 80, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 84, lineHeight: 1.2, textShadow: '0 8px 30px rgba(0,0,0,0.85)'}}>
				<div>{words(line.words.slice(0, split), false)}</div>
				<div style={{marginTop: 46}}>{words(line.words.slice(split), true)}</div>
			</div>
			<Fx at={0} name="whoosh" gain={0.7} />
		</Shot>
	);
};

/* 11 — Call to action -------------------------------------------------------- */
export const S11Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	return (
		<Shot transition="punch" push={0.04}>
			<Footage src="typing" trim={120} dim={0.7} zoom={0.05} />
			<div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, 0)})`}}>
				<Icon name="trophy" size={170} color={M.gold} />
			</div>
			<Head at={W('comment') - 3} top={520} size={96}>
				ÉCRIRE UN
			</Head>
			<Head at={W('memoire') - 3} top={640} size={100} color={M.gold}>
				MÉMOIRE TECHNIQUE
			</Head>
			<Head at={W('gagne') - 3} top={790} size={110}>
				QUI GAGNE ?
			</Head>
			{f >= after && (
				<div style={{position: 'absolute', top: 980, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: M.ink, background: M.white, padding: '18px 40px', borderRadius: 99}}>DIS-LE EN COMMENTAIRE</div>
					<div style={{fontSize: 80, color: M.gold, transform: `translateY(${Math.abs(Math.sin(f / 5)) * 18}px)`}}>▼</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1260, left: 110, right: 110, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 27, color: 'rgba(247,247,250,0.7)', opacity: ease(f, 6, 20)}}>
				Seuils HT 2026 simplifiés (dispense : {money(60000)} € fournitures et services depuis le 1er avril 2026, {money(100000)} € travaux). À vérifier sur Légifrance.
				<br />
				Chiffres 2024 : OECP · Voix : ElevenLabs · Images : Pixabay
			</div>
			<Fx at={0} name="whoosh-hit" />
			<Fx at={W('memoire') - 3} name="ding" />
			<Fx at={after} name="pop" />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1Stats, S2Buyers, S3Thresholds, S4Formal, S5Find, S6Answer, S7Score, S8Group, S9Paid, S10Lesson, S11Outro];
