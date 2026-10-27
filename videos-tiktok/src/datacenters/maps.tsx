import React from 'react';
import {geoCentroid, geoContains, geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {rand} from '../components/anim';

// Map data is projected once, when the module loads, not on every frame.
const countries = (feature(world as any, (world as any).objects.countries) as any).features as any[];

const inEurope = (f: any) => {
	const [lon, lat] = geoCentroid(f);
	return lon > -25 && lon < 45 && lat > 34 && lat < 72;
};
const europe = countries.filter(inEurope);
const ireland = countries.find((f) => f.id === '372');

export const MAP_W = 1000;
export const MAP_H = 1100;

const projection = geoMercator()
	.fitExtent(
		[
			[0, 0],
			[MAP_W, MAP_H],
		],
		{type: 'MultiPoint', coordinates: [[-11, 35], [31, 35], [-11, 70.5], [31, 70.5]]} as any,
	)
	.clipExtent([
		[0, 0],
		[MAP_W, MAP_H],
	]);
const path = geoPath(projection);

export const europePaths = europe.map((f) => ({id: String(f.id), name: f.properties.name as string, d: path(f) ?? ''}));

export const CITIES: {key: string; label: string; lonlat: [number, number]}[] = [
	{key: 'francfort', label: 'FRANCFORT', lonlat: [8.68, 50.11]},
	{key: 'londres', label: 'LONDRES', lonlat: [-0.13, 51.51]},
	{key: 'amsterdam', label: 'AMSTERDAM', lonlat: [4.9, 52.37]},
	{key: 'paris', label: 'PARIS', lonlat: [2.35, 48.86]},
	{key: 'dublin', label: 'DUBLIN', lonlat: [-6.26, 53.35]},
];
export const project = (lonlat: [number, number]) => projection(lonlat) as [number, number];

/** Pseudo-random "data center" dots: a dense cloud around the five hubs plus a scatter over land. */
export const DOTS: {x: number; y: number; hub: boolean}[] = (() => {
	const out: {x: number; y: number; hub: boolean}[] = [];
	let i = 0;
	CITIES.forEach((c) => {
		for (let k = 0; k < 40; k++, i++) {
			const r = Math.sqrt(rand(i * 3.1)) * 1.4;
			const a = rand(i * 7.7) * Math.PI * 2;
			const [x, y] = project([c.lonlat[0] + Math.cos(a) * r * 1.4, c.lonlat[1] + Math.sin(a) * r]);
			out.push({x, y, hub: true});
		}
	});
	let tries = 0;
	while (out.length < 420 && tries < 6000) {
		tries++;
		const lon = -10 + rand(tries * 1.37) * 40;
		const lat = 36 + rand(tries * 2.71) * 33;
		if (!europe.some((f) => geoContains(f, [lon, lat]))) continue;
		const [x, y] = project([lon, lat]);
		out.push({x, y, hub: false});
	}
	return out;
})();

/** Ireland on its own, fitted to a square. */
const irelandProjection = geoMercator().fitExtent(
	[
		[40, 40],
		[760, 860],
	],
	ireland,
);
export const IRELAND_W = 800;
export const IRELAND_H = 900;
export const irelandPath = geoPath(irelandProjection)(ireland) ?? '';

export const EuropeShapes = ({fill = '#141B2E', stroke = 'rgba(120,160,255,0.35)', highlight}: {fill?: string; stroke?: string; highlight?: Record<string, string>}) => (
	<g>
		{europePaths.map((c) => (
			<path key={c.id + c.name} d={c.d} fill={highlight?.[c.name] ?? fill} stroke={stroke} strokeWidth={1.2} />
		))}
	</g>
);

export const MapFrame = ({children, width = 1080}: {children: React.ReactNode; width?: number}) => (
	<svg width={width} height={(width / MAP_W) * MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{overflow: 'visible'}}>
		{children}
	</svg>
);
