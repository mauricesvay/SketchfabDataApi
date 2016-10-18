var Swagger = require( 'swagger-client' );
var spec = require( './swagger.json' );

function SketchfabDataApi() {
    return new Swagger( null, {
        spec: spec,
        usePromise: true
    } );
}

module.exports = SketchfabDataApi;
