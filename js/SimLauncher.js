// Copyright 2013, University of Colorado
/**
 * Launches a PhET Simulation, after preloading the specified images.
 * Requires PxLoader and PxImage
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';
  var imageLoader = require( 'imageLoader' );

  return {
    /**
     * Launch the Sim by preloading the images and calling the callback.
     *
     * TODO: add an awesome loading screen
     *
     * @param {String} imageNames the images to be loaded into the module system.
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     */
    launch: function( imageNames, callback ) {
      var loader = new PxLoader();
      var loadedImages = {};
      imageNames.split( ' ' ).forEach( function( image ) {
        loadedImages[image] = loader.addImage( 'images/' + image );
      } );
      imageLoader.getImage = function( name ) { return loadedImages[name]; };
      loader.addCompletionListener( callback );
      loader.start();
    }};
} );
  