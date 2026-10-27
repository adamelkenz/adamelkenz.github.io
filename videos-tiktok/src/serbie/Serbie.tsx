import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {LightLeak} from '@remotion/light-leaks';
import '../components/fonts';
import {Captions, Grain, Line} from '../components/layers';
import {R, SCENES} from './scenes';
import timeline from './timeline.json';

const lines = timeline.lines as Line[];

// Scenes whose on-screen text already carries the words.
const NO_CAPTIONS = [0, 11, 12];
// A light leak washes over the turning points.
const LEAKS = [4, 7, 9];

export const Serbie = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: R.ink, overflow: 'hidden'}}>
			{lines.map((line, i) => {
				const Scene = SCENES[i];
				const last = i === lines.length - 1;
				return (
					<Sequence key={i} from={line.from} durationInFrames={last ? durationInFrames - line.from : line.durationInFrames} name={`${i} ${line.text.slice(0, 24)}`}>
						<Scene line={line} />
						<Html5Audio src={staticFile(line.voice)} volume={1} />
					</Sequence>
				);
			})}
			{LEAKS.map((i, k) => (
				<LightLeak key={i} from={Math.max(0, lines[i].from - 8)} durationInFrames={24} seed={k + 41} style={{opacity: 0.5}} />
			))}
			<Captions lines={lines} hide={NO_CAPTIONS} top={1440} accent={R.gold} />
			<Grain opacity={0.05} />
			<Html5Audio
				src={staticFile('sfx-real/music-lofi.mp3')}
				volume={(f) => interpolate(f, [0, 10, durationInFrames - 45, durationInFrames], [0, 0.07, 0.07, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
		</AbsoluteFill>
	);
};
