// Copyright 2013-2018, University of Colorado Boulder
/**
 * Launches a PhET Simulation, after preloading the specified images.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Tandem = require( 'TANDEM/Tandem' );
  var checkNamespaces = require( 'JOIST/checkNamespaces' );
  var joist = require( 'JOIST/joist' );
  var Random = require( 'DOT/Random' );

  // ifphetio
  var dataStream = require( 'ifphetio!PHET_IO/dataStream' );
  var phetioCommandProcessor = require( 'ifphetio!PHET_IO/phetioCommandProcessor' );

  var SimLauncher = {

    /**
     * Launch the Sim by preloading the images and calling the callback.
     *
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     * @public - to be called by main()s everywhere
     */
    launch: function( callback ) {
      assert && assert( !window.phet.launchCalled, 'Tried to launch twice' );

      //Signify that the SimLauncher was called, see https://github.com/phetsims/joist/issues/142
      window.phet.joist.launchCalled = true;

      // image elements to remove once we are fully loaded
      var elementsToRemove = [];

      function doneLoadingImages() {

        window.phet.joist.launchSimulation = function() {

          // After listeners have been attached, we can send the buffered events to all the listeners.
          Tandem.launch();
          dataStream.launch && dataStream.launch();

          // Provide a global Random that is easy to use and seedable from phet-io for playback
          // phet-io configuration happens after SimLauncher.launch is called and before phet.joist.launchSimulation is called
          phet.joist.random = new Random( { staticSeed: true } );

          // Instantiate the sim and show it.
          callback();
        };

        // PhET-iO simulations support an initialization phase (before the sim launches)
        if ( phet.phetio ) {
          phetioCommandProcessor.initialize(); // calls back to window.phet.joist.launchSimulation
        }

        if ( phet.chipper.queryParameters.postMessageOnReady ) {
          ( window.parent !== window ) && window.parent.postMessage( JSON.stringify( {
            type: 'ready',
            url: window.location.href
          } ), '*' );
        }

        if ( ( phet.phetio && !phet.phetio.queryParameters.phetioStandalone ) ||
             phet.chipper.queryParameters.playbackMode ) {

          // Wait for phet-io to finish adding listeners. It will direct the launch from there.
        }
        else {
          window.phet.joist.launchSimulation();
        }
      }

      // if image dimensions exist, immediately fire the "all images loaded" event
      var loaded = 0;

      // Taken from http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript
      function isImageOK( img ) {

        // During the onload event, IE correctly identifies any images that
        // weren't downloaded as not complete. Others should too. Gecko-based
        // browsers act like NS4 in that they report this incorrectly.
        if ( !img.complete ) {
          return false;
        }

        // However, they do have two very useful properties: naturalWidth and
        // naturalHeight. These give the true size of the image. If it failed
        // to load, either of these should be zero.
        if ( typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0 ) {
          return false;
        }

        // No other way of checking: assume it’s ok.
        return true;
      }

      //For the images that were written to base64 format using requirejs, make sure they are loaded.
      //img.src = base64 is asynchronous on IE10 and OSX/Safari, so we have to make sure they loaded before returning.
      if ( window.phetImages ) {
        for ( var i = 0; i < window.phetImages.length; i++ ) {
          var phetImage = window.phetImages[ i ];

          // For built versions that use phet-io, the simulation may have already loaded all of the images, so
          // check them here before scheduling them for load.
          if ( isImageOK( phetImage ) ) {
            loaded++;
            if ( loaded === window.phetImages.length ) {
              doneLoadingImages();
            }
          }
          else {
            phetImage.onload = function() {
              loaded++;
              if ( loaded === window.phetImages.length ) {
                doneLoadingImages();
              }
            };
          }

        }
      }
      else {
        doneLoadingImages();
      }

      $( window ).load( function() {
        // if images were not loaded immediately, signal the "all images loaded" event

        // we wait for here to remove the images from the DOM, otherwise IE9/10 treat the images as completely blank!
        _.each( elementsToRemove, function( element ) {

          //TODO: Why is this null sometimes?  see https://github.com/phetsims/joist/issues/388
          if ( element.parentNode ) {
            element.parentNode.removeChild( element );
          }
        } );
      } );

      // Check namespaces if assertions are enabled, see https://github.com/phetsims/joist/issues/307.
      assert && checkNamespaces();
    }
  };

  joist.register( 'SimLauncher', SimLauncher );

  return SimLauncher;
} );