
var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'example');
var APP_DIR = path.resolve(__dirname, 'example');

var config = {
  entry: APP_DIR + '/example.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
    {
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react'],
      },
      stats: {
        colors: true,
        modules: true,
        reasons: true,
      },
      dist: {
        cache: false,
      },
    },
    {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
    }
  ],
  },
};

module.exports = config;
