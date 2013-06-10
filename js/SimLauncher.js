// Copyright 2013, University of Colorado
/**
 * Launches a PhET Simulation, after preloading the specified images.
 * Requires PxLoader and PxImage
 *
 * @author Sam Reid
 */
define( function() {
  'use strict';

  return {
    /**
     * Launch the Sim by preloading the images and calling the callback.
     *
     * TODO: add an awesome loading screen
     *
     * @param {*} imageLoader an object with an {Array<String>} imageNames property
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     */
    launch: function( imageLoader, callback ) {

      //658 x 506
      $( "<style type='text/css'> .centered { position: fixed; top: 50%; left: 50%; margin-top: -253px; margin-left: -329px; } </style>" ).appendTo( "head" );

      //Show the loading screen
      var $x = $( "<div>hello world</div>" );
      $x.addClass( 'centered' );
      var $body = $( 'body' );
      $body.append( $x );

      // load images and configure the image loader
      var loader = new PxLoader();
      var loadedImages = {};
      imageLoader.imageNames.forEach( function( image ) {
        loadedImages[image] = loader.addImage( 'images/' + image );
      } );
      imageLoader.getImage = function( name ) { return loadedImages[name]; };
      loader.addCompletionListener( function() {
        $x.remove();
        callback();
      } );
      loader.start();
    }};
} );
  