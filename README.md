# SketchfabDataApi

This library is a client for Sketchfab Data API, based on the
[Swagger JS Library](https://github.com/swagger-api/swagger-js).
Works in both Node.JS and browsers.

## Using the library

In your HTML, insert the script:

```
<script src="SketchfabDataApi.js"></script>
```

In Node.JS, require the library.

Use the API:
```
var api = new SketchfabDataApi();
api.then( function ( client ) {
    console.log( client.apis.help() );

    client.apis.models.get_v3_models().then( function ( response ){
        console.log( response );
    } );
} );
```

## Build the browser library

* `npm install -g webpack`
* `npm install`
* `npm run build`

The result of the build is located in `dist`.
