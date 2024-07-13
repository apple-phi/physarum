import { RandomAgents, reglify, DynamicSlime, SlimeSettings } from './ts';

window.addEventListener('load', async () => {
	const canvas = document.getElementById('gl') as HTMLCanvasElement;
	const { width, height } = canvas;
	const pixels = width * height;
	const regl = reglify({ canvas: canvas });
	const settings: SlimeSettings = {
		moveSpeed: 2,
		turnSpeed: 20,
		sensorDistance: 10,
		sensorAngle: 20,
		sensorSize: 5,
		color: ({ tick }) => [Math.cos(tick * 0.001 - 1.1), 1, 0.6], // acos(0.45) = 1.1
		width,
		height,
	};
	const agents = RandomAgents.circular(0.4 * pixels, 200, width, height); // RandomAgents.rect(0.1 * pixels, 0.1);
	const slime = new DynamicSlime(regl, settings, agents)
		.attachMouseDragTo(canvas)
		.attachClickPauseTo(canvas);
	regl.frame(slime.draw);
});
