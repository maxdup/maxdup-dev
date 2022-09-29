const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

prodConfig = {
  mode: 'production',
  output: {
    publicPath: 'https://allorithmique',
    clean: true,
  },
  plugins: [new CssMinimizerPlugin()],
  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({}), new CssMinimizerPlugin()],
  }
}

module.exports = merge(common, prodConfig)
