
module.exports = {
	context: __dirname + '/mods/fpt/client',
	entry: {
		client: [
			'./start.js'
		],
		"physics-demo": [
			'./demos/physics-demo.js'
		],
		"level-builder": [
			'./tools/level-builder/start.js'
		]
	},
	output: {
		path: __dirname + '/mods/fpt/built',
		filename: '[name].packed.js'
	},
	watch: true,
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true, 
					presets: ['es2015'] 
				}
			},
			{
				test: /\.html$/,
				loader: 'file?name=[name].[ext]'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	devServer: {
	  historyApiFallback: true
	},
	devtool: 'eval-source-map'
};
