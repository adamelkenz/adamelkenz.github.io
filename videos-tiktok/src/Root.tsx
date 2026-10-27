import {Composition} from 'remotion';
import {Halloween} from './halloween/Halloween';
import halloweenTimeline from './halloween/timeline.json';

export const Root = () => (
	<Composition
		id="Halloween"
		component={Halloween}
		durationInFrames={halloweenTimeline.durationInFrames}
		fps={halloweenTimeline.fps}
		width={1080}
		height={1920}
	/>
);
