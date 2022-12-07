const webpack = require('webpack');

const path = require('path');
const dirSrc = path.join(__dirname, 'src');
const dirBuild = path.join(__dirname, 'build');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
    app: path.join(dirSrc, 'index.js')
  },
  output: {
    path: dirBuild,
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.html$/,
        loader: 'html-loader'
      },
      { test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader',
          },
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
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        loader: 'ts-shader-loader'
      },
    ]
  },
  plugins:[
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(dirSrc, 'index.html'),
      lang: 'fr',
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

  ],
  performance: {
    maxAssetSize: 400000,
  }
}
