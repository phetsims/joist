// Copyright 2002-2013, University of Colorado Boulder
/**
 * Launches a PhET Simulation, after preloading the specified images.
 * Requires PxLoader and PxImage
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var joistImageLoader = require( 'JOIST/joistImageLoader' );

  var loadedResourceCount = 0;

  return {
    /**
     * Launch the Sim by preloading the images and calling the callback.
     *
     * TODO: add an awesome loading screen
     *
     * @param {*} simImageLoader an object with an {Array<String>} imageNames property
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     */
    launch: function( simImageLoader, callback ) {

      function incrementResourceCount() {
        loadedResourceCount++;
        if ( loadedResourceCount === 2 ) {
          $( '#splash' ).remove();
          callback();
        }
      }

      // load images and configure the image loader
      var simPxLoader = new PxLoader();
      var simLoadedImages = {};
      simImageLoader.imageNames.forEach( function( image ) { simLoadedImages[image] = simPxLoader.addImage( 'images/' + image ); } );
      simImageLoader.getImage = function( name ) { return simLoadedImages[name]; };
      simPxLoader.addCompletionListener( incrementResourceCount );
      simPxLoader.start();

      //Check whether images are declared locally (for a build) or in joist (for requirejs)
      //TODO: this will have problems if the image name in joist overlaps an image name in the sim.
      //TODO: This is a tricky and brittle strategy which relies on trying to load an image from the wrong place as a cue to load it from the right place
      //TODO: It prints an error to the console in either case.
      //To get rid of the error, you could copy the joist images to images/joist/* but then you have to keep them updated when the originals change
      var simImage = new Image();
      simImage.onerror = function() {
        console.log( 'SimLauncher.js could not find the production/chipper image location for joist images, so looking for relative path ../joist/images...' );
        //Load joist images.  TODO: Abstract this out, code is duplicated with the above
        var joistPxLoader = new PxLoader();
        var joistLoadedImages = {};
        joistImageLoader.imageNames.forEach( function( image ) { joistLoadedImages[image] = joistPxLoader.addImage( '../joist/images/' + image ); } );
        joistImageLoader.getImage = function( name ) {return joistLoadedImages[name];};
        joistPxLoader.addCompletionListener( incrementResourceCount );
        joistPxLoader.start();
      };
      simImage.onload = function() {
        //Load joist images.  TODO: Abstract this out, code is duplicated with the above
        var joistPxLoader = new PxLoader();
        var joistLoadedImages = {};
        joistImageLoader.imageNames.forEach( function( image ) { joistLoadedImages[image] = joistPxLoader.addImage( 'images/joist/' + image ); } );
        joistImageLoader.getImage = function( name ) {return joistLoadedImages[name];};
        joistPxLoader.addCompletionListener( incrementResourceCount );
        joistPxLoader.start();
      };
      simImage.src = 'images/joist/' + joistImageLoader.imageNames[0];
    }};
} );