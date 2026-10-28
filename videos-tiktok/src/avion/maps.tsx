import React from 'react';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';

const countries = (feature(world as any, (world as any).objects.countries) as any).features as any[];

/** A small Mercator map of a lon/lat box, fitted to w×h pixels, computed once. */
export const makeMap = (west: number, south: number, east: number, north: number, w: number, h: number) => {
	const projection = geoMercator()
		.fitExtent(
			[
				[0, 0],
				[w, h],
			],
			{type: 'MultiPoint', coordinates: [[west, south], [east, south], [west, north], [east, north]]} as any,
		)
		.clipExtent([
			[0, 0],
			[w, h],
		]);
	const path = geoPath(projection);
	const paths = countries.map((c) => ({key: `${c.id}-${c.properties.name}`, name: c.properties.name as string, d: path(c) ?? ''})).filter((p) => p.d);
	return {w, h, paths, project: (lonlat: [number, number]) => projection(lonlat) as [number, number]};
};

export const FRANCE = makeMap(-5.5, 41.5, 9.8, 51.5, 1000, 1000);
export const AZORES = makeMap(-29.3, 37.9, -26.1, 40.1, 1000, 900);

export const Land = ({map, fill = '#16233F', stroke = 'rgba(140,170,230,0.45)', highlight}: {map: ReturnType<typeof makeMap>; fill?: string; stroke?: string; highlight?: string}) => (
	<g>
		{map.paths.map((p) => (
			<path key={p.key} d={p.d} fill={highlight && p.name === highlight ? '#21365E' : fill} stroke={stroke} strokeWidth={1.5} />
		))}
	</g>
);
