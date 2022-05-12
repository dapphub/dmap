const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        main: './main.js',
    },
    output: {
        path: path.resolve(__dirname),
        filename: '[name].unmin.js',
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                dependencies: {
                    name: 'dependencies',
                    minChunks: 1,
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                },
            },
        },
    },
};
