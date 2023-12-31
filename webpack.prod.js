const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const cssMinimizerPlugin = new CssMinimizerPlugin();

prodConfig = {
  mode: 'production',
  output: {
    publicPath: '/',
    clean: true,
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
  },
  plugins: [cssMinimizerPlugin],
  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({}), cssMinimizerPlugin],
  },
}

module.exports = merge(common, prodConfig)
