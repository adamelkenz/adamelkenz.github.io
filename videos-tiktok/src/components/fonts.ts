import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, FontFaceDescriptors?][] = [
	['Anton', 'Anton-Regular.ttf'],
	['Creepster', 'Creepster-Regular.ttf'],
	['Playfair', 'PlayfairDisplay-Italic.ttf', {style: 'italic', weight: '400 900'}],
];

const handle = delayRender('Loading fonts');
Promise.all(
	FONTS.map(([family, file, desc]) =>
		new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, desc).load().then((f) => document.fonts.add(f)),
	),
)
	.then(() => continueRender(handle))
	.catch((err) => {
		console.error(err);
		continueRender(handle);
	});

export const ANTON = 'Anton, Impact, sans-serif';
export const CREEPY = 'Creepster, Anton, sans-serif';
export const SERIF = 'Playfair, Georgia, serif';
export const SANS = 'Inter, "Inter Display", Arial, sans-serif';
