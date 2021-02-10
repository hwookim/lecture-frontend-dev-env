const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const isProduction = mode === "production";

module.exports = {
  mode,
  entry: {
    main: "./src/app.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve("./dist"),
  },
  devServer: {
    overlay: true,
    stats: "errors-only",
    proxy: {
      "/api": "http://localhost:8081",
    },
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          isProduction
            ? MiniCssExtractPlugin.loader // 프로덕션 환경
            : "style-loader", // 개발 환경
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: "url-loader",
        options: {
          name: "[name].[ext]?[hash]",
          limit: 10000, // 10Kb
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader", // 바벨 로더를 추가한다
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `빌드 날짜: ${new Date().toLocaleString()}`,
    }),
    new webpack.DefinePlugin({}),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      templateParameters: {
        env: !isProduction ? "(개발용)" : "",
      },
      minify: isProduction
        ? {
            collapseWhitespace: true, // 빈칸 제거
            removeComments: true, // 주석 제거
          }
        : false,
      hash: isProduction,
    }),
    new CleanWebpackPlugin(),
    ...(isProduction
      ? [new MiniCssExtractPlugin({ filename: `[name].css` })]
      : []),
  ],
  optimization: {
    // 최적화
    minimizer: isProduction
      ? [
          new OptimizeCSSAssetsPlugin(), // css파일 최대 압축
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // 콘솔 로그를 제거한다
              },
            },
          }),
        ]
      : [],
  },
};
