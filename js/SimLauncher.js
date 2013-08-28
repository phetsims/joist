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
      
      var pxLoader;
      
      var elementsToRemove = [];
      var delayCompletionEvent = false;

      function doneLoadingImages() {
        loadedResourceCount++;
        if ( loadedResourceCount === 1 ) {
          $( '#splash' ).remove();
          callback();
        }
      }

      //Load the images for a single imageLoader.
      //TODO would there be any benefit from multiplexing the image loaders to use a single PxLoader?
      function load( imageLoader, path ) {
        var loadedImages = {};
        imageLoader.getImage = function( name ) { return loadedImages[name]; };
        
        imageLoader.imageNames.forEach( function( image ) {
          var filename = path + '/' + image;
          loadedImages[image] = document.getElementById( filename );
          if ( loadedImages[image] ) {
            window.console && console.log && console.log( 'loaded ' + filename + ' with dimensions: ' + loadedImages[image].width + 'x' + loadedImages[image].height );
            if ( loadedImages[image].width === 0 || loadedImages[image].height === 0 ) {
              delayCompletionEvent = true;
              // loadedImages.onload = doneLoadingImages;
            }
            
            // pull it out from the DOM, just maintain the direct reference
            elementsToRemove.push( loadedImages[image] );
            // loadedImages[image].parentNode.removeChild( loadedImages[image] );
          } else {
            window.console && console.log && console.log( 'WARNING: could not find image: ' + filename + ', using PxLoader' );
            
            if ( !pxLoader ) { pxLoader = new PxLoader(); }
            loadedImages[image] = pxLoader.addImage( filename );
          }
        } );
      }

      // load images and configure the image loader
      load( simImageLoader, 'images' );
      load( joistImageLoader, '../joist/images' );
      
      window.simImageLoader = simImageLoader;
      window.joistImageLoader = joistImageLoader;
      
      // if any images failed to load normally, use the PxLoader
      if ( pxLoader ) {
        pxLoader.addCompletionListener( doneLoadingImages );
        pxLoader.start();
      } else {
        // otherwise things seem to load too quickly!
        if ( !delayCompletionEvent ) {
          doneLoadingImages();
        }
      }
      
      $( window ).load( function() {
        
        if ( delayCompletionEvent ) {
          console.log( elementsToRemove[0].width );
          doneLoadingImages();
        }
        
        _.each( elementsToRemove, function( element ) {
          element.parentNode.removeChild( element );
        } );
      } );
    }};
} );
