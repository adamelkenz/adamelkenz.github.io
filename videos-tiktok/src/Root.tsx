import {Composition} from 'remotion';
import {DataCenters} from './datacenters/DataCenters';
import datacentersTimeline from './datacenters/timeline.json';
import {Halloween} from './halloween/Halloween';
import halloweenTimeline from './halloween/timeline.json';
import {Marches} from './marches/Marches';
import marchesTimeline from './marches/timeline.json';
import {Serbie} from './serbie/Serbie';
import serbieTimeline from './serbie/timeline.json';
import {Statuts} from './statuts/Statuts';
import {TrainVideo} from './train/TrainVideo';
import trainTimeline from './train/timeline.json';
import {WhiteLabel} from './whitelabel/WhiteLabel';
import whitelabelTimeline from './whitelabel/timeline.json';
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
		<Composition
			id="DataCenters"
			component={DataCenters}
			durationInFrames={datacentersTimeline.durationInFrames}
			fps={datacentersTimeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition
			id="WhiteLabel"
			component={WhiteLabel}
			durationInFrames={whitelabelTimeline.durationInFrames}
			fps={whitelabelTimeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition
			id="Serbie"
			component={Serbie}
			durationInFrames={serbieTimeline.durationInFrames}
			fps={serbieTimeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition
			id="Train"
			component={TrainVideo}
			durationInFrames={trainTimeline.durationInFrames}
			fps={trainTimeline.fps}
			width={1080}
			height={1920}
		/>
	</>
);
