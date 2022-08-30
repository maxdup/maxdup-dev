const webpack = require('webpack');

const path = require('path');
const dirSrc = path.join(__dirname, 'src');
const dirBuild = path.join(__dirname, 'build');

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
          { loader: 'style-loader' },
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
      { test: /\.(woff|woff2|eot|ttf|otf|svg|png|pdf|mp4)$/,
        loader: "file-loader"
      }
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      template: path.join(dirSrc, 'index.html'),
    })
  ]

}
