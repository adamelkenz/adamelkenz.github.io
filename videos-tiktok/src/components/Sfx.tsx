import {Html5Audio, Sequence, staticFile} from 'remotion';

/** One-shot sound effect from public/sfx, starting at frame `at` of the parent sequence. */
export const Sfx = ({at, name, volume = 0.5}: {at: number; name: string; volume?: number}) => (
	<Sequence from={Math.max(0, Math.round(at))} layout="none">
		<Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
	</Sequence>
);
