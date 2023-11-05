const { merge } = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
  output: {
    publicPath: process.env.CHAT_APP + process.env.CHAT_PUBLIC_PATH,
  },
});
