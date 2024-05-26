const path = require('path');

module.exports = {
    entry: './src/index.js', // Your main JS file
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    mode: 'development', // Change to 'production' for production builds
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]', // Output path for images
                        },
                    },
                ],
            }
        ],
    },
};