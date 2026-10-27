import {Html5Audio, Sequence, staticFile} from 'remotion';

/**
 * One-shot sound effect starting at frame `at` of the parent sequence.
 * `name` is either a synthesized effect in public/sfx ("whoosh") or a path in public ("sfx-real/whoosh.mp3").
 */
export const Sfx = ({at, name, volume = 0.5}: {at: number; name: string; volume?: number}) => (
	<Sequence from={Math.max(0, Math.round(at))} layout="none">
		<Html5Audio src={staticFile(name.includes('.') ? name : `sfx/${name}.wav`)} volume={volume} />
	</Sequence>
);
