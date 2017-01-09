var SketchfabDataApi = require( '../../index' );
var Swagger = require('swagger-client');
var fs = require('fs');
var path = require('path');

var api = new SketchfabDataApi();
api.then( function ( client ) {

    // This is how you authenticate your requests with the "Token" scheme
    client.clientAuthorizations.add("Token",
        new Swagger.ApiKeyAuthorization(
            "Authorization",
            "Token INSERT_YOU_TOKEN_HERE",
            "header"
        )
    );

    // This is how you upload a file
    client.apis.models.post_v3_models( {
        isPublished: 'false',
        modelFile: fs.createReadStream( path.resolve( __dirname, '../sample.zip' ) )
    } ).then( function( response ){

        if (response.status === 201) {
            // The model URI is immediately returned, even if processing hasn't finished yet
            console.log('After processing, model will be available at: ' + response.headers.location);
            var uid = response.headers.location.replace('https://api.sketchfab.com/v3/models/', '');

            // You can poll the processing status to know when the model is ready
            // See how `pollStatus` is implemented below
            pollStatus( client, uid, function( err, res ){
                console.log( err, res );
            } );
        }

    } ).catch( function( error ){
        console.error( error );
    } );

} ).catch( function( error ) {
    console.log( error );
});

/**
 * Poll processing status
 * @param {object} client Swagger client
 * @param {string} uid Model uid
 * @param {function} callback will receive (err, result)
 */
function pollStatus( client, uid, callback ) {
    client.apis.models.get_v3_models_uid( {
        uid: uid
    } ).then( function( response ){
        if ( response.obj.status.processing === 'SUCCEEDED' ) {
            callback(null, response.obj.status);
        } else if ( response.obj.status.processing === 'FAILED' ) {
            callback( response.obj.status.processing, null );
        } else {
            setTimeout(function(){
                console.log(response.obj.status);
                pollStatus( client, uid, callback );
            }, 1000);
        }
    } );
}
