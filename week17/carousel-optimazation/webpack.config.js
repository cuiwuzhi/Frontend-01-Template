const path = require('path');
module.exports = {
  entry: './main.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [["@babel/plugin-transform-react-jsx",{pragma:"create"}]]
          }
        }
      },
      {
        test: /\.css$/,
        use: {
          loader: path.resolve('./component-css-loadder.js'),//自定义css loader
        }
      }
      // ,{
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader'],
      // }
    ]
  },
  mode: 'development',
  devtool: 'inline-source-map',
  optimization:{
    minimize: false
  }
};