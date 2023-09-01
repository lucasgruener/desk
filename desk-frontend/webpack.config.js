const path = require('path');

module.exports = {
    mode: 'development',
    // entry: ['./src/game.js', './src/voice.js'], // Replace with the path to your game.js file
    entry: ['./src/game.js', './src/voice.js', './src/main.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist') // Output directory for bundled files
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Optional: Use Babel for wider browser compatibility
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};