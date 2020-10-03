var path = require('path');

module.exports = {
    entry: './src/Index.tsx',
    devtool: 'sourcemaps',
    cache: true,
    mode: 'development',
    output: {
        path: __dirname,
        filename: '../../AndroidFTPBackup/static/js/bundle.js'
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                use: [{
                    loader: 'ts-loader',
                    options: {}
                }]
            }
        ]
    },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
};
