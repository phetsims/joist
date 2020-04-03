// Copyright 2013-2020, University of Colorado Boulder
/**
 * Launches a PhET Simulation, after preloading the specified images.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import Random from '../../dot/js/Random.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import Tandem from '../../tandem/js/Tandem.js';
import checkNamespaces from './checkNamespaces.js';
import joist from './joist.js';

// See below for dynamic imports, which must be locked.

// Locks waiting to be resolved before we can move to the next phase of the launch sequence
const pendingLocks = [];

const lockRemovedEmitter = new Emitter();
let launchBegan = false;

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
    let launchComplete = false;

    const proceedIfReady = () => {
      if ( !launchComplete && pendingLocks.length === 0 ) {

        launchBegan = true;

        window.phet.joist.launchSimulation = function() {

          // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
          // wants have been set up by now.
          if ( Tandem.PHET_IO_ENABLED ) {
            phetioEngine.onCrossFrameListenersReady();
          }

          // Provide a global Random that is easy to use and seedable from phet-io for playback
          // phet-io configuration happens after SimLauncher.launch is called and before phet.joist.launchSimulation is called
          phet.joist.random = new Random( { staticSeed: true } );

          // Instantiate the sim and show it.
          callback();
        };

        // PhET-iO simulations support an initialization phase (before the sim launches)
        if ( Tandem.PHET_IO_ENABLED ) {
          phetioEngine.initialize(); // calls back to window.phet.joist.launchSimulation
        }

        if ( phet.chipper.queryParameters.postMessageOnReady ) {
          window.parent && window.parent.postMessage( JSON.stringify( {
            type: 'ready',
            url: window.location.href
          } ), '*' );
        }

        if ( ( Tandem.PHET_IO_ENABLED && !phet.phetio.queryParameters.phetioStandalone ) ||
             phet.chipper.queryParameters.playbackMode ) {

          // Wait for phet-io to finish adding listeners. It will direct the launch from there.
        }
        else {
          launchComplete = true;
          window.phet.joist.launchSimulation();
        }
      }
    };

    lockRemovedEmitter.addListener( proceedIfReady );

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
  createLock( object ) {
    assert && assert( !launchBegan, 'Cannot create more locks after launch began' );
    pendingLocks.push( object );
    return () => {
      assert && assert( pendingLocks.indexOf( object ) >= 0, 'invalid lock' );
      arrayRemove( pendingLocks, object );
      lockRemovedEmitter.emit();
    };
  }
};

// Export for debugging in the console
SimLauncher.pendingLocks = pendingLocks;

const unlockBrand = SimLauncher.createLock( { name: 'brand' } );
import( /* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js`).then( module => unlockBrand() );

let phetioEngine = null; // {null|PhetioEngine}
if ( phet.chipper.brand === 'phet-io' ) {
  const unlockPhetioEngine = SimLauncher.createLock( { name: 'phetioEngine' } );
  import( /* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js').then( module => {
    phetioEngine = module.default;
    unlockPhetioEngine();
  } );
}

joist.register( 'SimLauncher', SimLauncher );

export default SimLauncher;