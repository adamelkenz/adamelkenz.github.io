import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ease, pop, shake} from '../components/anim';
import {ANTON, SANS, SERIF} from '../components/fonts';
import {Line, Shot, wordAt} from '../components/layers';
import {Sfx} from '../components/Sfx';
import {Badge, Chip, COLORS, DrawArrow, Figure, Footage, Head, Icon, Stack, STATUTS, Steps} from './kit';

type SceneProps = {line: Line};

const S = {
	whoosh: 'sfx-real/whoosh.mp3',
	swish: 'sfx-real/swish.mp3',
	whooshHit: 'sfx-real/whoosh-hit.mp3',
	impact: 'sfx-real/impact.mp3',
	riserHit: 'sfx-real/riser-hit.mp3',
	riser: 'sfx-real/riser.mp3',
	pop: 'sfx-real/pop.mp3',
	click: 'sfx-real/click.mp3',
	cash: 'sfx-real/cash.mp3',
	stamp: 'sfx-real/stamp.mp3',
	key: 'sfx-real/key.mp3',
	ding: 'sfx-real/ding.mp3',
	buzzer: 'sfx-real/buzzer.mp3',
	shutter: 'sfx-real/shutter.mp3',
	paper: 'sfx-real/paper.mp3',
};

/** Hard cut to another clip inside a scene, from frame `at` to `until`. */
const Cut = ({at, until, children}: {at: number; until?: number; children: React.ReactNode}) => (
	<Sequence from={at} durationInFrames={until !== undefined ? until - at : undefined}>
		<Shot transition="punch" push={0}>
			{children}
		</Shot>
	</Sequence>
);

/* 0 — Hook: five names, five cuts ---------------------------------------- */
const HOOK_CLIPS = ['hook-freelance', 'hook-artisan', 'hook-office', 'hook-handshake', 'hook-startup'];

export const S0Hook = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const hits = [W('micro'), W('eurl'), W('sasu'), W('sarl'), W('sas…')];
	const tQ = W('lequel');
	const current = hits.reduce((acc, t, i) => (f >= t - 2 ? i : acc), 0);
	return (
		<AbsoluteFill>
			{hits.map((t, i) => (
				<Sequence key={i} from={i === 0 ? 0 : t - 2} durationInFrames={(hits[i + 1] ?? line.durationInFrames + 2) - (i === 0 ? 0 : t - 2)}>
					<Shot transition={i === 0 ? 'flash' : 'punch'} push={0.08}>
						<Footage src={HOOK_CLIPS[i]} dim={f >= tQ ? 0.72 : 0.42} tint={`${COLORS[STATUTS[i].key]}55`} />
					</Shot>
				</Sequence>
			))}
			{/* the statut being said, huge */}
			{f < tQ - 4 && (
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center'}}>
					<span
						key={current}
						style={{
							display: 'inline-block',
							fontFamily: ANTON,
							fontSize: 300,
							color: COLORS[STATUTS[current].key],
							textShadow: `0 0 80px ${COLORS[STATUTS[current].key]}aa, 0 20px 60px rgba(0,0,0,0.8)`,
							transform: `${shake(f, hits[current], 16, 8)} scale(${1.6 - 0.6 * pop(f, hits[current] - 2, {damping: 10, stiffness: 260, mass: 0.5})})`,
						}}
					>
						{STATUTS[current].label}
					</span>
				</div>
			)}
			{/* then all five line up */}
			{f >= tQ - 4 && (
				<>
					<div style={{position: 'absolute', top: 330, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22}}>
						{STATUTS.map((s, i) => {
							const p = pop(f, tQ - 4 + i * 2, {damping: 12, stiffness: 240, mass: 0.5});
							return (
								<div
									key={s.key}
									style={{
										fontFamily: ANTON,
										fontSize: 96,
										color: COLORS.ink,
										background: COLORS[s.key],
										padding: '6px 34px 10px',
										borderRadius: 24,
										transform: `scale(${p}) rotate(${(i % 2 ? 3 : -3) * p}deg)`,
									}}
								>
									{s.label}
								</div>
							);
						})}
					</div>
					<Head at={tQ} top={720} size={150}>
						LEQUEL EST FAIT
					</Head>
					<Head at={W('pour')} top={880} size={150} color={COLORS.gold}>
						POUR TOI ?
					</Head>
				</>
			)}
			<Sfx at={0} name={S.impact} volume={0.7} />
			{hits.slice(1).map((t, i) => (
				<Sfx key={i} at={t - 3} name={S.shutter} volume={0.7} />
			))}
			{hits.map((t, i) => (
				<Sfx key={`w${i}`} at={t - 4} name={S.swish} volume={0.35} />
			))}
			<Sfx at={tQ - 6} name={S.whooshHit} volume={0.55} />
			<Sfx at={W('pour')} name={S.pop} volume={0.5} />
		</AbsoluteFill>
	);
};

/* 1 — The stakes ----------------------------------------------------------- */
export const S1Stakes = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tMal = W('mal');
	const tAnnees = W('annees');
	const years = Math.min(10, Math.max(1, Math.floor(ease(f, W('paies'), tAnnees + 10, (x) => x) * 10)));
	return (
		<Shot transition="whip" push={0.06}>
			<Footage src="stress" grey dim={0.5} tint="rgba(255,60,60,0.5)" />
			<Head at={0} top={420} size={170}>
				CHOISIS MAL…
			</Head>
			{f >= W('paies') - 2 && (
				<Head at={W('paies') - 2} top={640} size={110} color={COLORS.red}>
					ET TU PAIES PENDANT
				</Head>
			)}
			{f >= W('paies') && (
				<div style={{position: 'absolute', top: 790, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 230, color: COLORS.red, textShadow: '0 0 60px rgba(255,77,77,0.6)', transform: shake(f, tAnnees, 18, 10)}}>
					{years} AN{years > 1 ? 'S' : ''}
				</div>
			)}
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={tMal} name={S.buzzer} volume={0.35} />
			{[0, 3, 6, 9, 12, 15].map((d) => (
				<Sfx key={d} at={W('paies') + d} name={S.key} volume={0.5} />
			))}
			<Sfx at={tAnnees} name={S.impact} volume={0.5} />
		</Shot>
	);
};

/* 2 — Micro: who it's for --------------------------------------------------- */
export const S2Micro = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tBadge = W('la') - 2;
	return (
		<Shot transition="punch" push={0.05} flashColor={COLORS.micro}>
			<Footage src="micro" tint={`${COLORS.micro}44`} />
			<Steps current={0} />
			<Head at={W('tester') - 2} top={290} size={100}>
				TU VEUX TESTER
				<br />
				UNE IDÉE{'\u00a0'}?
			</Head>
			<Stack top={1000}>
				<Chip at={W('seul') - 2} text="SEUL" kind="ok" />
				<Chip at={W('sans') - 2} text="SANS GROS FRAIS" kind="ok" />
			</Stack>
			<Badge at={tBadge} label="MICRO" color={COLORS.micro} icon="flask-conical" top={560} />
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={W('seul') - 2} name={S.pop} volume={0.45} />
			<Sfx at={W('sans') - 2} name={S.pop} volume={0.45} />
			<Sfx at={tBadge} name={S.impact} volume={0.55} />
		</Shot>
	);
};

/* 3 — Micro: pros ----------------------------------------------------------- */
export const S3MicroPros = ({line}: SceneProps) => {
	const W = wordAt(line);
	return (
		<Shot transition="whip" push={0.05}>
			<Footage src="micro-desk" tint={`${COLORS.micro}44`} />
			<Steps current={0} />
			<Head at={0} top={300} size={120} color={COLORS.micro}>
				LES +
			</Head>
			<Stack top={520} gap={30}>
				<Chip at={W('creation')} text="CRÉATION EN 10 MIN" kind="ok" sub="en ligne, gratuite" />
				<Chip at={W('cotisations') - 3} text="COTISATIONS SUR CE QUE TU ENCAISSES" kind="ok" size={48} sub="≈ 12 à 26 % selon l'activité" />
				<Chip at={W("c'est") - 2} text="PAS DE CA = PAS DE COTISATIONS" kind="ok" size={48} />
			</Stack>
			<Sfx at={0} name={S.swish} volume={0.4} />
			<Sfx at={W('creation')} name={S.ding} volume={0.35} />
			<Sfx at={W('cotisations') - 3} name={S.pop} volume={0.45} />
			<Sfx at={W("c'est") - 2} name={S.pop} volume={0.45} />
		</Shot>
	);
};

/* 4 — Micro: limits --------------------------------------------------------- */
export const S4MicroLimits = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tNum = W('quatre');
	const tSors = W('sors');
	const fill = ease(f, tNum, tSors, (x) => x);
	return (
		<Shot transition="punch" push={0.05} flashColor={COLORS.red}>
			<Footage src="micro" trim={150} tint="rgba(255,60,60,0.4)" dim={0.6} />
			<Steps current={0} />
			<Head at={0} top={300} size={120} color={COLORS.red}>
				LES LIMITES
			</Head>
			<Figure at={tNum - 2} to={83600} len={W('euros') - tNum + 4} suffix=" €" color={COLORS.white} top={470} size={190} label="PLAFOND EN SERVICES / AN" />
			{f >= tNum && (
				<div style={{position: 'absolute', top: 780, left: 110, right: 110, height: 44, borderRadius: 99, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
					<div style={{width: `${fill * 100}%`, height: '100%', background: fill > 0.85 ? COLORS.red : COLORS.micro, borderRadius: 99}} />
				</div>
			)}
			{f >= tSors && (
				<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 90, color: COLORS.white, background: COLORS.red, padding: '4px 40px', borderRadius: 18, transform: `rotate(-6deg) scale(${2 - pop(f, tSors)})`}}>TU EN SORS</div>
				</div>
			)}
			<Stack top={1000}>
				<Chip at={W('frais') - 2} text="FRAIS NON DÉDUCTIBLES" kind="no" />
			</Stack>
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={tNum - 2} name={S.riser} volume={0.3} />
			<Sfx at={tSors} name={S.buzzer} volume={0.45} />
			<Sfx at={tSors} name={S.stamp} volume={0.5} />
			<Sfx at={W('frais') - 2} name={S.pop} volume={0.45} />
		</Shot>
	);
};

/* 5 — EURL ------------------------------------------------------------------ */
export const S5Eurl = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tBadge = W("l'eurl") - 2;
	const tEnv = W('environ') - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tEnv}>
				<Shot transition="punch" push={0.06} flashColor={COLORS.eurl}>
					<Footage src="eurl" tint={`${COLORS.eurl}44`} />
					<Steps current={1} />
					<Stack top={330}>
						<Chip at={W('seul')} text="SEUL" kind="ok" />
						<Chip at={W('frais') - 2} text="AVEC DES FRAIS" kind="ok" />
						<Chip at={W('verser') - 2} text="TU VEUX TE VERSER UN REVENU" kind="ok" size={48} />
					</Stack>
					<Badge at={tBadge} label="EURL" color={COLORS.eurl} icon="hammer" top={900} />
				</Shot>
			</Sequence>
			<Cut at={tEnv}>
				<Footage src="eurl-wood" tint={`${COLORS.eurl}44`} dim={0.55} />
				<Steps current={1} />
				<Head at={0} top={300} size={110} color={COLORS.eurl}>
					EURL
				</Head>
				<Figure at={W('quarante') - 4 - tEnv} to={45} len={14} prefix="≈ " suffix=" %" color={COLORS.eurl} top={500} size={260} label="DE COTISATIONS SUR TA RÉMUNÉRATION" />
				<Stack top={940}>
					<Chip at={W('verses') - tEnv - 6} text="PARMI LES MOINS CHÈRES POUR SE PAYER" kind="ok" size={44} sub="régime TNS (travailleur non salarié)" />
				</Stack>
				<Sfx at={W('quarante') - 4 - tEnv} name={S.riserHit} volume={0.45} />
				<Sfx at={W('verses') - tEnv - 6} name={S.pop} volume={0.4} />
			</Cut>
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={W('seul')} name={S.pop} volume={0.45} />
			<Sfx at={W('frais') - 2} name={S.pop} volume={0.45} />
			<Sfx at={W('verser') - 2} name={S.pop} volume={0.45} />
			<Sfx at={tBadge} name={S.impact} volume={0.55} />
			<Sfx at={tEnv} name={S.swish} volume={0.4} />
		</AbsoluteFill>
	);
};

/* 6 — SASU ------------------------------------------------------------------ */
export const S6Sasu = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tBadge = W('sasu') - 2;
	const tSal = W('ton') - 3;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tSal}>
				<Shot transition="punch" push={0.06} flashColor={COLORS.sasu}>
					<Footage src="sasu" tint={`${COLORS.sasu}55`} />
					<Steps current={2} />
					<Stack top={330}>
						<Chip at={W('seul')} text="SEUL" kind="ok" />
						<Chip at={W('beaucoup') - 2} text="BEAUCOUP DE MARGE" kind="ok" />
					</Stack>
					<Badge at={tBadge} label="SASU" color={COLORS.sasu} icon="crown" top={780} />
				</Shot>
			</Sequence>
			<Cut at={tSal}>
				<Footage src="sasu-office" tint="rgba(255,60,60,0.35)" dim={0.55} />
				<Steps current={2} />
				<Head at={0} top={300} size={110}>
					TON SALAIRE
				</Head>
				<Head at={W('cher') - tSal - 2} top={420} size={110} color={COLORS.red}>
					COÛTE CHER
				</Head>
				<Figure at={W('quatre') - 4 - tSal} to={80} len={14} prefix="≈ " suffix=" %" color={COLORS.red} top={600} size={260} label="DE CHARGES SUR TON NET" />
				<Stack top={1030}>
					<Chip at={W('charges') - tSal} text="MAIS PROTECTION SOCIALE D'UN SALARIÉ" kind="ok" size={42} sub="hors chômage" />
				</Stack>
				<Sfx at={W('cher') - tSal - 2} name={S.buzzer} volume={0.3} />
				<Sfx at={W('quatre') - 4 - tSal} name={S.riserHit} volume={0.45} />
			</Cut>
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={W('seul')} name={S.pop} volume={0.45} />
			<Sfx at={W('beaucoup') - 2} name={S.pop} volume={0.45} />
			<Sfx at={tBadge} name={S.impact} volume={0.55} />
			<Sfx at={tSal} name={S.swish} volume={0.4} />
		</AbsoluteFill>
	);
};

/* 7 — SASU dividends vs salary --------------------------------------------- */
export const S7Dividends = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const tDiv = W('dividendes') - 3;
	const tAucune = W('aucune');
	const tTrente = W('trente');
	const bar = (pct: number, color: string, at: number) => (
		<div style={{height: 480, width: 230, display: 'flex', alignItems: 'flex-end', background: 'rgba(255,255,255,0.08)', borderRadius: 26, overflow: 'hidden'}}>
			<div style={{width: '100%', height: `${pct * ease(f, at, at + 14)}%`, background: color, borderRadius: 26}} />
		</div>
	);
	return (
		<Shot transition="whip" push={0.05}>
			<Footage src="sasu-office" trim={120} tint={`${COLORS.sasu}55`} dim={0.7} />
			<Steps current={2} />
			<Head at={0} top={260} size={88}>
				LE VRAI ATOUT :
				<br />
				<span style={{color: COLORS.sasu}}>LES DIVIDENDES</span>
			</Head>
			<div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 120}}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 70, color: COLORS.red, marginBottom: 14}}>≈ 80 %</div>
					{bar(80, COLORS.red, 2)}
					<div style={{fontFamily: ANTON, fontSize: 52, color: COLORS.white, marginTop: 16}}>SALAIRE</div>
				</div>
				<div style={{textAlign: 'center', opacity: f >= tDiv ? 1 : 0.25}}>
					<div style={{fontFamily: ANTON, fontSize: 70, color: COLORS.green, marginBottom: 14}}>{f >= tTrente - 2 ? '31,4 %' : f >= tAucune ? '0 % COTIS.' : '…'}</div>
					{bar(f >= tTrente - 2 ? 31.4 : 4, COLORS.green, f >= tTrente - 2 ? tTrente - 2 : tDiv)}
					<div style={{fontFamily: ANTON, fontSize: 52, color: COLORS.white, marginTop: 16}}>DIVIDENDES</div>
				</div>
			</div>
			{f >= W('flat') - 2 && (
				<div style={{position: 'absolute', top: 1250, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: ANTON, fontSize: 64, color: COLORS.ink, background: COLORS.green, padding: '8px 36px', borderRadius: 18, transform: `scale(${pop(f, W('flat') - 2)})`}}>
						JUSTE LA FLAT TAX (2026)
					</div>
				</div>
			)}
			<Sfx at={0} name={S.swish} volume={0.4} />
			<Sfx at={tDiv} name={S.cash} volume={0.45} />
			<Sfx at={tAucune} name={S.ding} volume={0.35} />
			<Sfx at={W('flat') - 2} name={S.pop} volume={0.45} />
			<Sfx at={tTrente - 2} name={S.impact} volume={0.4} />
		</Shot>
	);
};

/* 8 — SARL ------------------------------------------------------------------ */
export const S8Sarl = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tBadge = W('sarl') - 2;
	const tCadre = W('un') - 3;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tCadre}>
				<Shot transition="punch" push={0.06} flashColor={COLORS.sarl}>
					<Footage src="sarl" tint={`${COLORS.sarl}44`} />
					<Steps current={3} />
					<Head at={W('plusieurs') - 3} top={300} size={130}>
						À PLUSIEURS
					</Head>
					<Stack top={480}>
						<Chip at={W('famille') - 2} text="EN FAMILLE" kind="ok" />
						<Chip at={W('associes') - 3} text="ENTRE ASSOCIÉS" kind="ok" />
					</Stack>
					<Badge at={tBadge} label="SARL" color={COLORS.sarl} icon="shield-check" top={880} />
				</Shot>
			</Sequence>
			<Cut at={tCadre}>
				<Footage src="sarl-hands" tint={`${COLORS.sarl}44`} dim={0.55} />
				<Steps current={3} />
				<div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<Icon name="landmark" size={170} color={COLORS.sarl} />
				</div>
				<Head at={W('cadre') - tCadre - 2} top={480} size={96}>
					UN CADRE
					<br />
					<span style={{color: COLORS.sarl}}>FIXÉ PAR LA LOI</span>
				</Head>
				<Stack top={760} gap={30}>
					<Chip at={W('moins') - tCadre - 2} text="MOINS DE LIBERTÉ" kind="no" />
					<Chip at={W('moins', 1) - tCadre - 2} text="MOINS DE MAUVAISES SURPRISES" kind="ok" />
				</Stack>
				<Sfx at={W('cadre') - tCadre - 2} name={S.stamp} volume={0.4} />
				<Sfx at={W('moins') - tCadre - 2} name={S.pop} volume={0.45} />
				<Sfx at={W('moins', 1) - tCadre - 2} name={S.ding} volume={0.35} />
			</Cut>
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={W('famille') - 2} name={S.pop} volume={0.45} />
			<Sfx at={W('associes') - 3} name={S.pop} volume={0.45} />
			<Sfx at={tBadge} name={S.impact} volume={0.55} />
			<Sfx at={tCadre} name={S.swish} volume={0.4} />
		</AbsoluteFill>
	);
};

/* 9 — SAS ------------------------------------------------------------------- */
export const S9Sas = ({line}: SceneProps) => {
	const W = wordAt(line);
	const tBadge = W('sas') - 2;
	const tRocket = W("c'est") - 4;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={tRocket}>
				<Shot transition="punch" push={0.06} flashColor={COLORS.sas}>
					<Footage src="sas" tint={`${COLORS.sas}44`} />
					<Steps current={4} />
					<Stack top={330}>
						<Chip at={W('investisseurs') - 4} text="DES INVESTISSEURS" kind="ok" />
						<Chip at={W('grandir') - 2} text="GRANDIR VITE" kind="ok" />
					</Stack>
					<Badge at={tBadge} label="SAS" color={COLORS.sas} icon="rocket" top={700} />
					<Stack top={1030}>
						<Chip at={W('statuts') - 3} text="STATUTS SUR MESURE" kind="ok" sub="entrée / sortie d'associés facile" />
					</Stack>
				</Shot>
			</Sequence>
			<Cut at={tRocket}>
				<Footage src="sas-rocket" dim={0.35} tint={`${COLORS.sas}33`} />
				<Head at={2} top={560} size={110}>
					LE FORMAT DES
				</Head>
				<Head at={W('startups') - tRocket - 2} top={690} size={190} color={COLORS.sas}>
					STARTUPS
				</Head>
				<Sfx at={0} name={S.riserHit} volume={0.5} />
			</Cut>
			<Sfx at={0} name={S.whoosh} volume={0.4} />
			<Sfx at={W('investisseurs') - 4} name={S.pop} volume={0.45} />
			<Sfx at={W('grandir') - 2} name={S.pop} volume={0.45} />
			<Sfx at={tBadge} name={S.impact} volume={0.55} />
			<Sfx at={W('statuts') - 3} name={S.pop} volume={0.45} />
		</AbsoluteFill>
	);
};

/* 10 — Recap decision tree -------------------------------------------------- */
export const S10Recap = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const rows: {at: number; cond: string; to: {label: string; color: string; at: number}[]}[] = [
		{at: W('testes') - 3, cond: 'TU TESTES', to: [{label: 'MICRO', color: COLORS.micro, at: W('micro') - 2}]},
		{at: W('seul') - 3, cond: 'SEUL + FRAIS', to: [{label: 'EURL', color: COLORS.eurl, at: W('eurl') - 2}]},
		{at: W('seul', 1) - 3, cond: 'SEUL + MARGE', to: [{label: 'SASU', color: COLORS.sasu, at: W('sasu') - 2}]},
		{
			at: W('plusieurs') - 3,
			cond: 'À PLUSIEURS',
			to: [
				{label: 'SARL', color: COLORS.sarl, at: W('sarl') - 2},
				{label: 'SAS', color: COLORS.sas, at: W('sas', 1) - 2},
			],
		},
	];
	return (
		<Shot transition="flash" push={0.04}>
			<Footage src="recap" dim={0.72} />
			<Head at={0} top={190} size={130} color={COLORS.gold}>
				RETIENS ÇA
			</Head>
			<div style={{position: 'absolute', top: 430, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 40}}>
				{rows.map((r, i) => {
					if (f < r.at) return null;
					const p = pop(f, r.at, {damping: 13, stiffness: 220, mass: 0.5});
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, transform: `translateX(${(1 - p) * -200}px)`, opacity: p}}>
							<div style={{fontFamily: ANTON, fontSize: 62, color: COLORS.white, width: 400, textAlign: 'right'}}>{r.cond}</div>
							<DrawArrow at={r.at + 4} color={COLORS.white} width={130} />
							<div style={{display: 'flex', gap: 14}}>
								{r.to.map((t, k) => (
									<div
										key={k}
										style={{
											fontFamily: ANTON,
											fontSize: 64,
											color: COLORS.ink,
											background: t.color,
											padding: '2px 26px 6px',
											borderRadius: 16,
											transform: `scale(${pop(f, t.at)})`,
										}}
									>
										{t.label}
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
			<Sfx at={0} name={S.whooshHit} volume={0.45} />
			{rows.map((r, i) => (
				<React.Fragment key={i}>
					<Sfx at={r.at} name={S.swish} volume={0.3} />
					{r.to.map((t, k) => (
						<Sfx key={k} at={t.at} name={S.click} volume={0.6} />
					))}
				</React.Fragment>
			))}
		</Shot>
	);
};

/* 11 — The lesson ----------------------------------------------------------- */
export const S11Lesson = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const split = line.words.findIndex((w) => w.text.endsWith('.')) + 1;
	const gold = ["l'entreprise", 'devenir.'];
	const words = (ws: typeof line.words) =>
		ws.map((w, i) => {
			const p = ease(f, w.frame - 3, w.frame + 6);
			return (
				<span key={i} style={{display: 'inline-block', marginRight: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: gold.includes(w.text) ? COLORS.gold : COLORS.white}}>
					{w.text}
				</span>
			);
		});
	return (
		<Shot transition="none" push={0.06} len={line.durationInFrames}>
			<Footage src="road" dim={0.45} zoom={0.15} len={line.durationInFrames + 80} />
			<AbsoluteFill style={{background: '#000', opacity: 1 - ease(f, 0, 12)}} />
			<div style={{position: 'absolute', top: 520, left: 80, right: 80, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 90, lineHeight: 1.18, textShadow: '0 8px 30px rgba(0,0,0,0.8)'}}>
				<div>{words(line.words.slice(0, split))}</div>
				<div style={{marginTop: 50}}>{words(line.words.slice(split))}</div>
			</div>
			<Sfx at={0} name={S.whoosh} volume={0.25} />
		</Shot>
	);
};

/* 12 — Call to action ------------------------------------------------------- */
export const S12Outro = ({line}: SceneProps) => {
	const f = useCurrentFrame();
	const W = wordAt(line);
	const after = W('dis') - 2;
	return (
		<Shot transition="none" push={0.04}>
			<Footage src="road" trim={130} dim={0.6} zoom={0.05} />
			<Head at={0} top={420} size={120}>
				ET TOI,
			</Head>
			<Head at={W('tu') - 2} top={560} size={140} color={COLORS.gold}>
				TU LANCES QUOI ?
			</Head>
			{f >= after && (
				<div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(f, after)})`}}>
					<div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 54, color: COLORS.ink, background: COLORS.white, padding: '18px 40px', borderRadius: 99}}>ÉCRIS TON PROJET EN COMMENTAIRE</div>
					<div style={{fontSize: 80, color: COLORS.gold, transform: `translateY(${Math.abs(Math.sin(f / 5)) * 18}px)`}}>▼</div>
				</div>
			)}
			<div style={{position: 'absolute', top: 1150, left: 120, right: 120, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: 'rgba(247,247,250,0.7)', opacity: ease(f, 6, 20)}}>
				Chiffres 2026 simplifiés, à valider avec un expert-comptable.
				<br />
				Voix : ElevenLabs · Images : Pixabay
			</div>
			<Sfx at={0} name={S.whooshHit} volume={0.4} />
			<Sfx at={after} name={S.pop} volume={0.5} />
		</Shot>
	);
};

export const SCENES = [S0Hook, S1Stakes, S2Micro, S3MicroPros, S4MicroLimits, S5Eurl, S6Sasu, S7Dividends, S8Sarl, S9Sas, S10Recap, S11Lesson, S12Outro];
