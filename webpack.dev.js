const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const path = require('path');


devConfig = {
  mode: 'development',
  output: {
    publicPath: '/',
  },
  devtool: 'source-map',
  devServer: {
    port: 8000,
    watchFiles: ['src/**/*']
  },
  watchOptions: {
    ignored: ['**/node_modules/**/*', '**/\.\#*',
              '**/soulzone-web-shared/static/**/*'],
  }
}

module.exports = merge(common, devConfig)

