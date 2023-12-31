const { merge } = require('webpack-merge');

const devConfig = require('./webpack.dev.js');
const prodConfig = require('./webpack.prod.js');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

debugConfig = {
  plugins:[new BundleAnalyzerPlugin({'analyzerPort': 8888})],
}

module.exports = merge(prodConfig, debugConfig)
