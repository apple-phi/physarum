import type {
	DrawCommand,
	Regl,
	Vec2,
	Vec4,
	MaybeDynamic,
	DefaultContext,
} from 'regl';
import DoubleBuffer, { type Rect } from './fbo';
import * as glsl from '../glsl';

type HSL = [number, number, number];
type Setting<T> = MaybeDynamic<T, DefaultContext, {}>;
export interface SlimeSettings {
	moveSpeed: Setting<number>; // pixels moved by each agent per frame
	turnSpeed: Setting<number>; // angle an agent melectoves in response to sensor input
	sensorDistance: Setting<number>; // distance from an agent to each of its sensors
	sensorAngle: Setting<number>; // angle between the three sensors
	sensorSize: Setting<number>; // diameter of the sensor
	color: Setting<HSL>; // agent display color in HSV with values in the interval [0, 1]
	width: number; // width of the canvas in pixels
	height: number; // height of the canvas in pixels
}

function flatPaddedArray(arr: Vec4[], { width, height }: Rect): Vec4[] {
	return Array.from(
		{ ...arr, length: width * height },
		(elem) => elem ?? [0, 0, 0, 0]
	);
}

function arrayIndices(length: number, { width, height }: Rect): Vec2[] {
	const indexArr = [];
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height && indexArr.length < length; j++) {
			indexArr.push([i / width, j / height]);
		}
	}
	return indexArr;
}

abstract class CommandRunner {
	commands: DrawCommand[] = [];
	abstract draw(...args: any[]): void;
	constructor(readonly regl: Regl, required_exts: string[]) {
		for (const ext of required_exts) {
			if (!regl.hasExtension(ext)) {
				throw new Error(`${ext} is unsupported, omitted or disabled.`);
			}
		}
	}
	protected addCommand(com: () => DrawCommand): void {
		this.commands.push(com.call(this));
	}
	protected addCommands(...commands: (() => DrawCommand)[]): void {
		commands.forEach((com) => this.addCommand(com));
	}
	protected drawAllCommands(): void {
		this.commands.forEach((com) => com());
	}
}
export class BasicSlime extends CommandRunner {
	numPixels: number;
	agentIndices: Vec2[];
	agentStates: DoubleBuffer;
	trailMap: DoubleBuffer;
	renderer: DrawCommand;

	offset: Vec2 = [0, 0];
	paused: boolean = false;

	constructor(
		readonly regl: Regl,
		public settings: SlimeSettings,
		readonly agents: Vec4[]
	) {
		super(regl, glsl.regl_exts);
		const agentArr = flatPaddedArray(agents, settings);
		this.agentIndices = arrayIndices(agents.length, settings);
		this.agentStates = new DoubleBuffer(regl, settings, agentArr);
		this.trailMap = new DoubleBuffer(regl, settings);
		this.addCommands(
			this.moveAgents,
			this.placeTrails,
			this.diffuseTrails,
			this.renderTrails
		);
		this.renderer = this.renderToCanvas();
	}
	draw = (): void => {
		if (!this.paused) {
			this.renderer(() => {
				this.drawAllCommands();
			});
		}
	};
	/** Default settings for other commands */
	renderToCanvas(this: BasicSlime): DrawCommand {
		return this.regl({
			...glsl.renderCanvas,
			attributes: {
				vertex_pos: glsl.canvas_verts,
			},
			count: glsl.canvas_verts.length,
			uniforms: {
				resolution: [this.settings.width, this.settings.height],
				offset: () => this.offset,
			},
			depth: { enable: false },
		});
	}
	moveAgents(this: BasicSlime): DrawCommand {
		return this.regl({
			...glsl.moveAgents,
			uniforms: {
				agent_texture: this.agentStates.previous,
				trail_texture: this.trailMap.previous,
				move_speed: this.settings.moveSpeed,
				turn_speed: this.settings.turnSpeed,
				sensor_distance: this.settings.sensorDistance,
				sensor_angle: this.settings.sensorAngle,
				sensor_size: this.settings.sensorSize,
			},
			framebuffer: this.agentStates.current,
		});
	}
	placeTrails(this: BasicSlime): DrawCommand {
		return this.regl({
			...glsl.placeTrails,
			count: this.agentIndices.length,
			primitive: 'points',
			attributes: {
				agent_texture_pos: this.agentIndices,
			},
			uniforms: {
				agent_texture: this.agentStates.current,
				color: this.settings.color,
			},
			framebuffer: this.trailMap.previous,
		});
	}
	diffuseTrails(this: BasicSlime): DrawCommand {
		return this.regl({
			...glsl.diffuseTrails,
			uniforms: {
				trail_texture: this.trailMap.previous,
			},
			framebuffer: this.trailMap.current,
		});
	}
	renderTrails(this: BasicSlime): DrawCommand {
		return this.regl({
			...glsl.renderTrails,
			uniforms: {
				trail_texture: this.trailMap.current,
				color: this.settings.color,
			},
		});
	}
}

export class DynamicSlime extends BasicSlime {
	protected mouseDown: boolean;
	protected mouseDrag: boolean;
	attachMouseDragTo(elem: HTMLElement): this {
		let x: number, y: number;
		let options = { passive: true };
		elem.addEventListener(
			'mousedown',
			(e) => {
				[x, y] = [e.offsetX, e.offsetY];
				this.mouseDown = true;
				this.mouseDrag = false;
			},
			options
		);
		elem.addEventListener(
			'mousemove',
			(e) => {
				if (this.mouseDown) {
					this.offset[0] -= e.offsetX - x;
					this.offset[1] += e.offsetY - y;
					[x, y] = [e.offsetX, e.offsetY];
				}
				this.mouseDrag = true;
			},
			options
		);
		elem.addEventListener('mouseup', () => (this.mouseDown = false), options);
		return this;
	}
	attachClickPauseTo(elem: HTMLElement): this {
		elem.addEventListener('click', () => {
			if (!this.mouseDrag) {
				this.paused = !this.paused;
			}
		});
		return this;
	}
}
