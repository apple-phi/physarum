import type {
	Regl,
	Framebuffer2D,
	Vec4,
	DefaultContext,
	Texture2D,
} from 'regl';
import { flatten } from 'lodash';

// function fbo(regl: Regl, width: number, height: number): Framebuffer2D;
// function fbo(
// 	regl: Regl,
// 	width: number,
// 	height: number,
// 	data: Vec4[]
// ): Framebuffer2D;
// function fbo(
// 	regl: Regl,
// 	width: number,
// 	height: number,
// 	texture: Texture2D
// ): Framebuffer2D;

export type Rect = {
	width: number;
	height: number;
};

function fbo(
	regl: Regl,
	{ width, height }: Rect,
	//texture?: Texture2D,
	data?: Vec4[]
): Framebuffer2D {
	return regl.framebuffer({
		colorType: 'float',
		color:
			//texture ??
			regl.texture({
				width,
				height,
				data: data
					? flatten(data) // TODO: maybe just data.flat() instead
					: Array(width * height * 4).fill(0),
				format: 'rgba',
				type: 'float',
			}),
		depthStencil: false,
	});
}

type BufferTuple = [Framebuffer2D, Framebuffer2D];
type Fbo2D = Framebuffer2D;
/** Implementation of the double buffer protocol.
 *
 * `this.previous` refers to the buffer from the latest displayed Regl frame,
 * while `this.current` refers to the buffer for the Regl frame that is currently being calculated / rendered.
 */
export default class DoubleBuffer {
	state: BufferTuple;
	constructor(...args: Parameters<typeof fbo>) {
		this.state = [...Array(2)].map(() => fbo(...args)) as BufferTuple;
	}
	previous = ({ tick }: DefaultContext): Fbo2D => this.state[tick % 2];
	current = ({ tick }: DefaultContext): Fbo2D => this.state[(tick + 1) % 2];
}

// class FlipFlop<T> {
// 	constructor(public front: T, public back: T) {}

// 	/** Flip the front and back objects in-place. */
// 	iflip(): this {
// 		[this.front, this.back] = [this.back, this.front];
// 		return this;
// 	}
// }

// class FBOFlipFlop extends FlipFlop<Framebuffer2D> {
// 	constructor(regl: Regl, width: number, height: number, data?: Vec4[]) {
// 		if (data && data.length != width * height) {
// 			throw new Error(
// 				`Data must be length ${width * height}, got ${data.length}.`
// 			);
// 		}
// 		const flat_data = data
// 			? lodash.flatten(data) // TODO: maybe just data.flat() instead
// 			: Array(width * height * 4).fill(0);
// 		// Make two copies of the same framebuffer
// 		const _fbo = () => fbo(regl, width, height, flat_data);
// 		let front = _fbo();
// 		let back = _fbo();
// 		super(front, back);
// 	}

// 	clearBack(regl: Regl) {
// 		regl.clear({
// 			color: [0, 0, 0, 0],
// 			framebuffer: this.back,
// 		});
// 	}
// }

export { DoubleBuffer, fbo };
