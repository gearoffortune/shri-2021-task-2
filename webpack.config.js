
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [path.resolve(__dirname, 'main.ts')],

  // Where webpack outputs the assets and bundles
  output: {
    path: path.resolve(__dirname, 'build/'),
    filename: 'index.js',
    library: {
      type: 'commonjs',
    }

  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    // new CleanWebpackPlugin(),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      // { test: /\.js$/, use: ['babel-loader'] },
      {test: /\.(ts|js)$/, use: ['babel-loader']},
    ],
  },
}