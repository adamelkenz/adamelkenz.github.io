import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {LightLeak} from '@remotion/light-leaks';
import '../components/fonts';
import {Captions, Grain, Line} from '../components/layers';
import {L, SCENES} from './scenes';
import timeline from './timeline.json';

const lines = timeline.lines as Line[];

// Scenes whose on-screen text already carries the words.
const NO_CAPTIONS = [8, 9];
// A light leak washes over the big turns of the story.
const LEAKS = [1, 6, 8];

export const WhiteLabel = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: L.ink, overflow: 'hidden'}}>
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
				<LightLeak key={i} from={Math.max(0, lines[i].from - 8)} durationInFrames={24} seed={k + 31} style={{opacity: 0.6}} />
			))}
			<Captions lines={lines} hide={NO_CAPTIONS} top={1440} accent={L.lime} />
			<Grain opacity={0.04} />
			<Html5Audio
				src={staticFile('sfx-real/music-lofi.mp3')}
				volume={(f) => interpolate(f, [0, 10, durationInFrames - 45, durationInFrames], [0, 0.09, 0.09, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
		</AbsoluteFill>
	);
};
