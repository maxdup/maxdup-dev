const webpack = require('webpack');

const path = require('path');
const dirSrc = path.join(__dirname, 'src');
const dirBuild = path.join(__dirname, 'build');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractLocStrings = require('./localization/extract-strings');


module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
    index: './index.js',
  },
  output: {
    path: dirBuild,
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js'
  },
  devServer: {
    port: 8000,
    watchFiles: ['src/**/*']
  },
  module: {
    rules: [{
      test: /\.(glsl|vs|fs|vert|frag)$/,
      loader: 'ts-shader-loader'
    }, {
      test: /\.font\.js/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            url: false
          }
        },
        'webfonts-loader'
      ]
    }, {
      test: /\.(woff|woff2|eot|ttf|otf|svg|jpg|jpeg|png|gif|webp)$/i,
      type: "asset/resource",
    }]
  },
  plugins: [
    new ExtractLocStrings({locales:['en-US', 'fr-CA', 'lo-IP']}),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(dirSrc, 'index.html'),
      filename: 'index.html',
      chunks: ['index'],
      baseUrl: 'https://maxdup.dev',
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(dirSrc, './images/favicon.png'),
      mode: 'webapp',
      favicons: {
        background: '#000',
        theme_color: '#333',
      }
    }),
    new CopyWebpackPlugin({
      patterns: [{from: 'static', to: 'static'}]
    }),

  ]
}
