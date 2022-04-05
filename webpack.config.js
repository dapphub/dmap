const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        main: './view/app.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
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
