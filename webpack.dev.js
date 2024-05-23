const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

const devConfig = {
  mode: 'development',
  output: {
    publicPath: '/',
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: ['**/node_modules/**/*', '**/\.\#*'],
  },
  stats: {
    loggingDebug: ["sass-loader"],
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader' },
        { loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                ["autoprefixer",{}],
              ],
            },
          },
        },
        { loader: 'sass-loader'}
      ]
    }]
  }
}

const config = merge(common, devConfig);

module.exports = config;

