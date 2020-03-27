// Copyright 2013-2020, University of Colorado Boulder
/**
 * Launches a PhET Simulation, after preloading the specified images.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import Random from '../../dot/js/Random.js';
import checkNamespaces from './checkNamespaces.js';
import joist from './joist.js';

// intermediates for holding dynamically loaded modules.
const phetioEngineProperty = new Property( null ); // {Property<null|PhetioEngine>}
const brandProperty = new Property( null ); // {Property<null|Brand>}
import( /* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js`).then( module => {
  brandProperty.value = module.default;
} );


if ( phet.chipper.brand === 'phet-io' ) {

  import( /* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js').then( module => {
    phetioEngineProperty.value = module.default;
  } );

}

// Taken from http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript
function isImageLoaded( img ) {

  // During the onload event, IE correctly identifies any images that weren't downloaded as not complete. Others
  // should too. Gecko-based browsers act like NS4 in that they report this incorrectly.
  if ( !img.complete ) {
    return false;
  }

  // However, they do have two very useful properties: naturalWidth and naturalHeight. These give the true size of
  // the image. If it failed to load, either of these should be zero.
  if ( typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0 ) {
    return false;
  }

  // No other way of checking: assume it’s ok.
  return true;
}

// Signify whether we are waiting for images to complete loading before moving to the next phase of the launch sequence
const allImagesLoadedProperty = new BooleanProperty( false );

// How many locks are waiting to be resolved before we can move to the next phase of the launch sequence
const pendingLockQuantity = new NumberProperty( 0 );

const SimLauncher = {

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
    let alreadyLaunched = false;

    const proceedIfReady = () => {
      if ( alreadyLaunched ) {
        return;
      }

      if ( !allImagesLoadedProperty.value ||
           pendingLockQuantity.value > 0 ||
           brandProperty.value === null ||
           ( phet.chipper.brand === 'phet-io' && phetioEngineProperty.value === null )
      ) {
        return;
      }
      window.phet.joist.launchSimulation = function() {

        // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
        // wants have been set up by now.
        if ( phet.phetio ) {
          phetioEngineProperty.value.onCrossFrameListenersReady();
        }

        // Provide a global Random that is easy to use and seedable from phet-io for playback
        // phet-io configuration happens after SimLauncher.launch is called and before phet.joist.launchSimulation is called
        phet.joist.random = new Random( { staticSeed: true } );

        // Instantiate the sim and show it.
        callback();
      };

      // PhET-iO simulations support an initialization phase (before the sim launches)
      if ( phet.phetio ) {
        phetioEngineProperty.value.initialize(); // calls back to window.phet.joist.launchSimulation
      }

      if ( phet.chipper.queryParameters.postMessageOnReady ) {
        window.parent && window.parent.postMessage( JSON.stringify( {
          type: 'ready',
          url: window.location.href
        } ), '*' );
      }

      if ( ( phet.phetio && !phet.phetio.queryParameters.phetioStandalone ) ||
           phet.chipper.queryParameters.playbackMode ) {

        // Wait for phet-io to finish adding listeners. It will direct the launch from there.
      }
      else {
        alreadyLaunched = true;
        window.phet.joist.launchSimulation();
      }
    };

    phetioEngineProperty.link( proceedIfReady );
    allImagesLoadedProperty.link( proceedIfReady );
    pendingLockQuantity.lazyLink( proceedIfReady );

    // On startup, and when an image is loaded, see if all images are ready to go
    const updateImageStatuses = () => {

      //For the images that were written to base64 format using requirejs, make sure they are loaded.
      //img.src = base64 is asynchronous on IE10 and OSX/Safari, so we have to make sure they loaded before returning.
      const value = _.every( window.phetImages, isImageLoaded );
      allImagesLoadedProperty.value = value;

      // We may receive image.onload callbacks even after we have identified that all images are loaded, because when
      // one image is loaded, we check all as a batch.  So we need to gracefully handle the case where an image onload
      // is called even after the simulation has launched.
      if ( value && window.phetImages ) {

        // Make sure the listenedImages didn't deviate from the phetImages, but only if we haven't launched yet
        assert && assert( listenedImages.length === window.phetImages.length, 'Images added or removed' );
        for ( let i = 0; i < listenedImages.length; i++ ) {
          assert && assert( listenedImages[ i ] === window.phetImages[ i ], 'Image mismatch' );
        }

        // Throw an error if any more images are added beyond this point, because we won't be able to listen for when
        // they loaded
        delete window.phetImages;
      }
    };

    let listenedImages = null;

    // Wait until the brand is defined before working on images because we know Brand will need to add images.
    brandProperty.link( Brand => {

      if ( Brand ) {

        assert && assert( window.phetImages && window.phetImages.length > 0, 'Sims usually have images' );

        listenedImages = window.phetImages.slice();

        window.phetImages.forEach( image => {
          image.onload = updateImageStatuses;
        } );
        updateImageStatuses();
      }
    } );

    // Check namespaces if assertions are enabled, see https://github.com/phetsims/joist/issues/307.
    assert && checkNamespaces();
  },

  /**
   * Creates a lock, which returns a callback that needs to be run before the launch sequence will continue to the
   * next phase.
   * @public
   *
   * @returns {function}
   */
  createLock() {
    pendingLockQuantity.value++;
    return () => {
      pendingLockQuantity.value--;
    };
  }
};

joist.register( 'SimLauncher', SimLauncher );

export default SimLauncher;