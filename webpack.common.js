const webpack = require("webpack");

const path = require("path");
const dirSrc = path.join(__dirname, "src");
const dirBuild = path.join(__dirname, "build");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractLocStrings = require("./localization/extract-strings.js");

const commonConfig = {
  context: path.join(__dirname, "src"),
  entry: {
    index: "./index.js",
  },
  output: {
    path: dirBuild,
    filename: "[name].[contenthash].bundle.js",
    chunkFilename: "[name].[contenthash].bundle.js",
  },
  devServer: {
    port: 8000,
    watchFiles: ["src/**/*"],
  },
  module: {
    rules: [
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        loader: "ts-shader-loader",
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.font\.js/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          "webfonts-loader",
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|jpg|jpeg|png|gif|webp)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new ExtractLocStrings({ locales: ["en-US", "fr-CA", "lo-IP"] }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      template: path.join(dirSrc, "index.ejs"),
      filename: "index.html",
      chunks: ["index"],
      baseUrl: "https://maxdup.dev",
    }),
    // Icons + manifest are a hand-maintained minimal set (favicon.ico,
    // apple-touch-icon-180, icon-192/512, icon-maskable-512). They live in
    // deploy/ and are copied to the site root below; link tags are in
    // index.ejs. Regenerate with scripts/gen-icons.js after changing the SVG.
    new CopyWebpackPlugin({
      patterns: [
        { from: "static", to: "static" },
        { from: "../deploy", to: "." },
      ],
    }),
  ],
};

module.exports = commonConfig;
