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
     * @param {*} imageLoader an object with a {String|Array<String>} imageNames property
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     */
    launch: function( imageLoader, callback ) {

      // load images and configure the image loader
      var loader = new PxLoader();
      var loadedImages = {};

      var imageNamesArray = ( typeof imageLoader.imageNames === 'string' ) ? imageLoader.imageNames.split( ' ' ) : imageLoader.imageNames;
      imageNamesArray.forEach( function( image ) {
        loadedImages[image] = loader.addImage( 'images/' + image );
      } );
      imageLoader.getImage = function( name ) { return loadedImages[name]; };
      loader.addCompletionListener( callback );
      loader.start();
    }};
} );
  