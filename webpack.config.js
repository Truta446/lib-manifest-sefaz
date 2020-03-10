const path = require('path')

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'manifest-sefaz.min.js',
    libraryTarget: 'umd',
    library: 'ManifestSefaz'
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    fs: 'empty'
  }
}