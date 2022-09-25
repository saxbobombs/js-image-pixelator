var path = require('path');

module.exports = {
	entry: './src/js/main.js',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
	},

	devServer: {
		open: false,
		static: [
			path.join(__dirname, 'src'),
		],
		port: 8000,
	},

	plugins: [
		
	]
};
