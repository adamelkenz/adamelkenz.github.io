import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Springy 0 → 1 starting at frame `at`. */
export const pop = (f: number, at: number, config = {damping: 11, stiffness: 170, mass: 0.6}) =>
	spring({frame: Math.max(0, f - at), fps: FPS, config});

/** Smooth 0 → 1 between frames a and b. */
export const ease = (f: number, a: number, b: number, easing = Easing.out(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...CLAMP, easing});

export const lerp = (p: number, a: number, b: number) => a + (b - a) * p;

/** Decaying camera shake starting at `at`. Returns a CSS translate. */
export const shake = (f: number, at: number, strength = 26, len = 14) => {
	const d = f - at;
	if (d < 0 || d > len) return 'translate(0px, 0px)';
	const k = strength * (1 - d / len);
	return `translate(${Math.sin(d * 2.7) * k}px, ${Math.cos(d * 3.3) * k * 0.7}px)`;
};

/** Thousands with a non-breaking space, French style: 3 000. */
export const money = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Deterministic pseudo-random in [0, 1). */
export const rand = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
