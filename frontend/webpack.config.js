"use strict";
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    `./index.jsx` // Your appʼs entry point
  ],
  target: 'web',
  devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
  output: {
    path: path.join(__dirname, 'dist', 'assets'),
    filename: 'sys.bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        },
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      },
      {
        test: /\.(woff|woff2)$/,
        loader: "url?prefix=font/&limit=5000"
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml"
      },
      {
        test: /\.gif/,
        loader: "url-loader?limit=10000&mimetype=image/gif"
      },
      {
        test: /\.jpg/,
        loader: "url-loader?limit=10000&mimetype=image/jpg"
      },
      {
        test: /\.png/,
        loader: "url-loader?limit=10000&mimetype=image/png"
      }
    ],
  },
  node: {
    fs: 'empty',
    tls: 'empty',
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new CopyWebpackPlugin([
      {from: './index.html'}
    ]),
  ]
};
