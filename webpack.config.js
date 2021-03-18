const path = require('path')

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "string_decoder": false,
      "url": false,
      "buffer": false,
      "util": false
    }
  },
  mode: "production",
  entry: './src/index.js',
  output: {
    filename: "map_app.js",
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  experiments: {
    topLevelAwait: true
  }
}