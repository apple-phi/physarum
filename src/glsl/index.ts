import type { Vec2, DrawConfig } from 'regl';

export const moveAgents: DrawConfig = {
	frag: require('./moveAgents.frag').default,
};
export const diffuseTrails: DrawConfig = {
	frag: require('./diffuseTrails.frag').default,
};
export const placeTrails: DrawConfig = {
	frag: require('./placeTrails.frag').default,
	vert: require('./placeTrails.vert').default,
};
export const renderTrails: DrawConfig = {
	frag: require('./renderTrails.frag').default,
};
export const renderCanvas: DrawConfig = {
	vert: require('./renderCanvas.vert').default,
};
export const canvas_verts: Vec2[] = [
	[-1, -1],
	[1, -1],
	[-1, 1],
	[-1, 1],
	[1, -1],
	[1, 1],
];
export const regl_exts: string[] = [
	'OES_texture_float',
	'WEBGL_color_buffer_float',
];
