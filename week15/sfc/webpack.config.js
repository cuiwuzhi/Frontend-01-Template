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
        test: /\.view$/,
        use: [
          {
            loader: path.resolve('./my-loader.js'),
          }
        ]
      }
    ]
  },
  mode: 'development',
  optimization:{
    minimize: false
  }
};