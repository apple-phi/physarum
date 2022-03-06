#ifdef GL_ES
precision lowp float;
#endif

#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

uniform sampler2D trail_texture;
uniform vec3 color;
uniform vec2 resolution;
uniform vec2 offset;

// This should be 2 since max vector is [1, 1, 1, 1].
// But to get more contrast can go smaller.
#define MAX_LENGTH 1.2

void main() {
	vec2 pos = mod((gl_FragCoord.xy + offset) / resolution, 1.);
    float magnitude = length(texture2D(trail_texture, pos).rgb) / MAX_LENGTH;
    gl_FragColor = vec4(hsl2rgb(vec3(color.xy, color.z*magnitude)), 1.);
}