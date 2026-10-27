import {Sfx} from './Sfx';

/**
 * Calibrated sound effects. Files in public/sfx-norm are all brought to the same perceived
 * level by scripts/normalize-sfx.sh; the gains below set how present each kind sits under
 * the voice, so a scene only says which sound and when.
 */
export const FX_LEVELS = {
	whoosh: 0.25,
	swish: 0.3,
	'whoosh-hit': 0.22,
	impact: 0.32,
	'riser-hit': 0.25,
	riser: 0.14,
	pop: 0.3,
	click: 0.35,
	cash: 0.22,
	stamp: 0.28,
	key: 0.3,
	ding: 0.28,
	buzzer: 0.18,
	shutter: 0.3,
	paper: 0.22,
	clock: 0.28,
	gavel: 0.22,
	alert: 0.3,
	page: 0.3,
	coins: 0.2,
} as const;

export type FxName = keyof typeof FX_LEVELS;

export const Fx = ({at, name, gain = 1}: {at: number; name: FxName; gain?: number}) => (
	<Sfx at={at} name={`sfx-norm/${name}.wav`} volume={FX_LEVELS[name] * gain} />
);
