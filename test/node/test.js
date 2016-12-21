var SketchfabDataApi = require( '../../index' );

var api = new SketchfabDataApi();
api.then( function ( client ) {
    console.log( client.apis.help() );

    client.apis.models.get_v3_models().then( function ( response ) {
        var titles = response.obj.results.map( function( result ){
            return result.name;
        } );
        console.log( 'get_v3_models:' );
        console.log( titles );
        console.log( '\n' );
    }).catch(function( error ){
        console.error( error );
    } );

    client.apis.models.get_v3_models_uid( { uid: '7w7pAfrCfjovwykkEeRFLGw5SXS' } ).then( function( response ) {
        console.log( 'get_v3_models_uid 7w7pAfrCfjovwykkEeRFLGw5SXS:' );
        console.log( response.obj.name );
        console.log( response.obj.user.displayName );
        console.log( '\n' );
    } ).catch( function( error ) {
        console.error( error );
    } );
} );
