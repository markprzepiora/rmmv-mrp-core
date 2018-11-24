const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const BannerWebpackPlugin = require('banner-webpack-plugin');

function getBanner(name) {
  return fs.readFileSync(path.resolve(__dirname, 'banners', `${name}.js.txt`)).toString() + "\n";
}

module.exports = {
  entry: {
    'rmmv-mrp-core': './src/rmmv-mrp-core.js',
    'rmmv-mrp-core--osx-fixes': './src/rmmv-mrp-core--osx-fixes.js',
    'rmmv-mrp-core--map-exporter': './src/rmmv-mrp-core--map-exporter.js',
    'test': './test/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new BannerWebpackPlugin({
      chunks: {
        'rmmv-mrp-core': { beforeContent: getBanner('rmmv-mrp-core') },
        'rmmv-mrp-core--osx-fixes': { beforeContent: getBanner('rmmv-mrp-core--osx-fixes') },
        'rmmv-mrp-core--map-exporter': { beforeContent: getBanner('rmmv-mrp-core--map-exporter') },
      },
    })
  ],
};
