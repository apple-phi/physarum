import type { Regl, Vec4 } from 'regl';
import Reglmodule from 'regl';

import * as glsl from '../glsl';

export function reglify(options: Reglmodule.InitializationOptions): Regl {
	return Reglmodule({
		...options,
		extensions: glsl.regl_exts.concat(
			'extensions' in options ? options.extensions : []
		),
	});
}

/**
 * Generate agents in the shape [x, y, Θ, a].
 * The final item dictates whether the pixel is part of the simulation.
 * All values are normalized to the range [0, 1].
 *
 * This number of agents used must be less than or equal to the number of pixels.
 */
export module RandomAgents {
	export function rect(n: number, perc_cover: number): Vec4[] {
		// https://itnext.io/heres-why-mapping-a-constructed-array-doesn-t-work-in-javascript-f1195138615a
		const side_length = Math.sqrt(perc_cover);
		return [...Array(Math.floor(n))].map(() => [
			Math.random() * side_length + 0.5 - side_length / 2,
			Math.random() * side_length + 0.5 - side_length / 2,
			Math.random(),
			1,
		]);
	}
	export function circular(
		n: number,
		radius: number,
		screen_width: number,
		screen_height: number
	): Vec4[] {
		return [...Array(Math.floor(n))].map(() => {
			const θ = Math.random() * 2 * Math.PI;
			const r = Math.random() * radius;
			return [
				(r / screen_width) * Math.cos(θ) + 0.5,
				(r / screen_height) * Math.sin(θ) + 0.5,
				θ + Math.PI,
				1,
			];
		});
	}
	export function circumference(
		n: number,
		radius: number,
		screen_width: number,
		screen_height: number
	): Vec4[] {
		return [...Array(Math.floor(n))].map(() => {
			const θ = Math.random() * 2 * Math.PI;
			const circle_width = radius / screen_width;
			const circle_height = radius / screen_height;
			return [
				circle_width * Math.cos(θ) + 0.5,
				circle_height * Math.sin(θ) + 0.5,
				Math.sign(Math.random() - 0.5) * 0.5 + (θ / 2 / Math.PI + 0.25), // pi/2 is 0.25 in 0-1 range
				1,
			];
		});
	}
}
