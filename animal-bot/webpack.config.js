const path = require('path');
// eslint-disable-next-line import/no-unresolved
const slsw = require('serverless-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: process.env.SLS_DEBUG ? 'development'  : 'production',
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  // node: { __dirname: false}, // Uncomment - If you want to access files on lambda via path.
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {test: /\.ts(x?)$/, loader: 'ts-loader'},
    ],
  },
  externals: [nodeExternals()],
  plugins: [
    (function () {
      if (process.env.SLS_DEBUG) {
        return process.env.SLS_DEBUG_WEBPACK_MINIFIED ? new UglifyJSPlugin({sourceMap: true}) : () => {
        };
      }
      return new UglifyJSPlugin();
    })(),
  ],
  devtool: "source-map"
};
