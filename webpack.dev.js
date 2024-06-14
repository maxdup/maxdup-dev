import { merge } from 'webpack-merge';
import { commonConfig } from './webpack.common.js';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import path from 'path';

process.traceDeprecation = true;

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

const config = merge(commonConfig, devConfig);

export default config

