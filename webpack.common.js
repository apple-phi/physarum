module.exports = {
	entry: {
		index: './src/index.ts',
	},
	output: {
		filename: '[name].bundle.js',
		path: `${__dirname}/dist`,
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(vert|frag|glsl)$/,
				use: ['raw-loader', 'glslify-loader'],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.frag', '.vert', '.glsl'],
	},
};
