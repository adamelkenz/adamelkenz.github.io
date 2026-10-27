import {Composition} from 'remotion';
import {Halloween} from './halloween/Halloween';
import halloweenTimeline from './halloween/timeline.json';
import {Marches} from './marches/Marches';
import marchesTimeline from './marches/timeline.json';
import {Statuts} from './statuts/Statuts';
import statutsTimeline from './statuts/timeline.json';

export const Root = () => (
	<>
		<Composition
			id="Halloween"
			component={Halloween}
			durationInFrames={halloweenTimeline.durationInFrames}
			fps={halloweenTimeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition
			id="Statuts"
			component={Statuts}
			durationInFrames={statutsTimeline.durationInFrames}
			fps={statutsTimeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition
			id="Marches"
			component={Marches}
			durationInFrames={marchesTimeline.durationInFrames}
			fps={marchesTimeline.fps}
			width={1080}
			height={1920}
		/>
	</>
);
