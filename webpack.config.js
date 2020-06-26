const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
require("@babel/register");

module.exports = {
  mode: "development",

  entry: {
    babel: "@babel/polyfill",
    index: "./src/page-index/main.js",
    viewauctions: "./src/page-auction/main.js",
  },

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].[hash:20].js",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[path][name].[ext]?hash=[hash:20]",
              esModule: false,
              limit: 8192,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["babel", "index"],
      filename: "index.html",
      template: path.resolve(__dirname, "src", "page-index", "index.html"),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["babel", "viewauctions"],
      filename: "viewauctions.html",
      template: path.resolve(
        __dirname,
        "src",
        "page-auction",
        "view-auction.html"
      ),
    }),
  ],

  watch: true,
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
};