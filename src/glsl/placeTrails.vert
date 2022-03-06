#ifdef GL_ES
precision lowp float;
#endif

uniform sampler2D agent_texture;
attribute vec2 agent_texture_pos;


void main() {
    // map pos from [0, 1] to [-1, 1]
    // since that's what the shader expects
    // aka "clip coordinates",
    // then position the agent there
    // as a single pixel
	vec2 agent_pos = texture2D(agent_texture, agent_texture_pos).xy;
	agent_pos = agent_pos * 2. - vec2(1.); 
	gl_Position = vec4(agent_pos, 0., 1.);
	gl_PointSize = 1.;
}