const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        options: './src/options.js',  // ✅ Entry for options.js
        datacollection:'./src/datacollection.js', // ✅ Entry for datacollection.js
        contentScript: "./src/contentScript.js",
    },
    output: {
        filename: '[name].bundle.js',  // ✅ Outputs options.bundle.js
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',  // ✅ Ensures ES6+ support
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'manifest.json'), to: 'manifest.json' }, 
                { from: path.resolve(__dirname, 'src/options.html'), to: 'options.html' }    
            ],
        }),
    ],
    resolve: {
        fallback: {
            "fs": false, 
            "path": false
        }
    },
    optimization: {
        minimize: false,  
    }
};