#ifdef GL_ES
precision lowp float;
#endif

#pragma glslify: random = require(glsl-random/lowp)
#define pi 3.14159265358979
#define sensor_size 1.

uniform vec2 resolution;

uniform sampler2D agent_texture;
uniform sampler2D trail_texture;
uniform float move_speed;
uniform float turn_speed;
uniform float sensor_distance;
uniform float sensor_angle;

// // Sum all the chemoattractant in a sensor region
float sensor_weight(vec2 agent_pos, float curr_angle, float angle_offset) {
    float angle = curr_angle + angle_offset;
    vec2 sensor_pos = agent_pos + sensor_distance / resolution * vec2(cos(angle), sin(angle));
    float sum = 0.;
    for (float offsetX = -sensor_size; offsetX <= sensor_size; offsetX++) {
		for (float offsetY = -sensor_size; offsetY <= sensor_size; offsetY++) {
			vec2 sample_pos = mod(sensor_pos +  vec2(offsetX, offsetY), 1.);
            vec3 rgb = texture2D(trail_texture, sample_pos).rgb;
			sum += rgb.r + rgb.g + rgb.b;
		}
	}
	return sum;
}

float new_angle(vec2 pos, float curr_angle){
    float sensor_radians = radians(sensor_angle);
    float rotate_radians = radians(turn_speed);
    float forward_weight = sensor_weight(pos, curr_angle, 0.);
    float left_weight = sensor_weight(pos, curr_angle, 2. * pi - sensor_radians);
    float right_weight = sensor_weight(pos, curr_angle, sensor_radians);
    if (forward_weight > left_weight && forward_weight > right_weight) {
        return curr_angle;
    }
    if (forward_weight < left_weight && forward_weight < right_weight){
        return curr_angle + rotate_radians * (2. * random(gl_FragCoord.xy / resolution) - 1.);
    }
    if (left_weight > right_weight) {
        return curr_angle - rotate_radians;
    }
    if (left_weight < right_weight) {
        return curr_angle + rotate_radians;
    }
    return curr_angle + rotate_radians * (2. * random(gl_FragCoord.xy / resolution) - 1.);
}

void main() {
    // Agents are in the shape [x, y, Θ, a].
    // The final item dictates whether the pixel is part of the simulation.
    // All values are normalized to the range [0, 1].
    vec4 agent = texture2D(agent_texture, gl_FragCoord.xy / resolution);
    if (agent.a == 0.) {
        gl_FragColor = agent;
        return;
    }
    float agent_angle = 2. * pi * agent.z;
    float move_angle = mod(new_angle(agent.xy, agent_angle), 2. * pi);
    vec2 offset = vec2(move_speed) / resolution * vec2(cos(move_angle), sin(move_angle));
    gl_FragColor.xy = mod(agent.xy + offset, 1.);
    gl_FragColor.z = move_angle / (2. * pi);
    gl_FragColor.a = 1.;
}
