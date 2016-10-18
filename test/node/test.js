var SketchfabDataApi = require( '../../index' );

var api = new SketchfabDataApi();
api.then( function ( client ) {
    console.log( client.apis.help() );

    client.apis.models.get_v3_models().then( function ( response ) {
        console.log( response );
    } );
} );
