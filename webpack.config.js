var webpack = require( 'webpack' );
var path = require( 'path' );
var libraryName = 'SketchfabDataApi';
var outputFile = libraryName + '.js';

var config = {
    entry: __dirname + '/index.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [ {
            test: /\.json$/,
            loader: "json"
        } ]
    }
};

module.exports = config;
