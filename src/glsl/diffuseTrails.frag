#ifdef GL_ES
precision lowp float;
#endif

#define BLUR_RADIUS 1.
#define FADE_RATE 0.92


uniform vec2 resolution;
uniform sampler2D trail_texture;

/**
 * Perform a small blur effect by averaging points around the given point.
 */
vec3 blurred(vec2 pos) {
	vec3 color = vec3(0.);
	for (float i = -BLUR_RADIUS; i <= BLUR_RADIUS; i++) {
        for (float j = -BLUR_RADIUS; j <= BLUR_RADIUS; j++) {
			color += texture2D(trail_texture, mod(pos + vec2(i, j) / resolution, 1.)).rgb;
		}
    }
	return color / pow(BLUR_RADIUS * 2. + 1., 2.);
}
// #define CONTRAST 1.3
// vec3 contrasted(vec3 color) {
//     return clamp((color.rgb - 0.5) * CONTRAST + 0.5, 0., 1.);
// }


void main() {
    vec2 pos = gl_FragCoord.xy / resolution;
	gl_FragColor = vec4(blurred(pos) * FADE_RATE, 1.);
}