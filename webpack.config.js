
const
    path = require('path');
    webpack = require('webpack');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const extractCSS = new ExtractTextPlugin('[name].bundle.css');

const config = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'docs/build/'),
    filename: 'fullscreen.bundle.js'
  },
  mode: 'production',
  watch: true,
  plugins : [
//     new webpack.optimize.UglifyJsPlugin({
//       compress: { warnings: false }
//     })
  ],
  module: {
    rules: [
/*
    { test: /\.scss$/, use: [
      { loader: "style-loader" }, // creates style nodes from JS strings
      { loader: "css-loader" }, // translates CSS into CommonJS
      { loader: "sass-loader" } // compiles Sass to CSS
    ]},
*/
      {
        test: /\.js$/,
//        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015' ]
            ]
          }
        }]
      }
    ]
  }
};

module.exports = config;
