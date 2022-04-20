const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        main: './view/app.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ],
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
