import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import '../components/fonts';
import {Captions, Fog, Grain, Line} from '../components/layers';
import {C} from './art';
import {SCENES} from './scenes';
import timeline from './timeline.json';

const lines = timeline.lines as Line[];

// Scenes whose on-screen text already carries the words.
const NO_CAPTIONS = [11, 12];

export const Halloween = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${C.night}, ${C.bg} 70%)`, overflow: 'hidden'}}>
			<Fog />
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
			<Captions lines={lines} hide={NO_CAPTIONS} />
			<Grain />
			<Html5Audio
				src={staticFile('sfx/drone.wav')}
				volume={(f) => interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.16, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
		</AbsoluteFill>
	);
};
