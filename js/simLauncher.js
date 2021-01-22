// Copyright 2013-2020, University of Colorado Boulder
/**
 * Singleton which launches a PhET Simulation, after preloading resources such as images or dynamic modules.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import arrayRemove from '../../phet-core/js/arrayRemove.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

// See below for dynamic imports, which must be locked.
let phetioEngine = null; // {null|PhetioEngine}

// Dynamic imports must be started after simLauncher is ready to process locks, hence the closure.
const initializeDynamicImports = simLauncher => {

  const unlockBrand = simLauncher.createLock( { name: 'brand' } );
  import( /* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js`).then( module => unlockBrand() );

  if ( Tandem.PHET_IO_ENABLED ) {
    const unlockPhetioEngine = simLauncher.createLock( { name: 'phetioEngine' } );
    import( /* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js').then( module => {
      phetioEngine = module.default;
      unlockPhetioEngine();
    } );
  }
};

class SimLauncher {
  constructor() {

    // @private {Array.<*>} - Locks waiting to be resolved before we can move to the next phase of the launch sequence.
    // Lock objects can be arbitrary objects.
    this.pendingLocks = [];

    // @private {boolean} - Marked as true when there are no more locks and we try to proceed.  Helps protect against
    // new locks being created after they should be.
    this.launchBegan = false;

    // @private {boolean} - Marked as true when simLauncher has finished its work cycle and control is given over to the
    // simulation to finish initialization.
    this.launchComplete = false;

    // @private {function} - The callback which should be invoked on launch.
    this.callback = null;
  }

  /**
   * Launch the Sim by preloading the images and calling the callback.
   * @public - to be called by main()s everywhere
   *
   * @param {function} callback - the callback function which should create and start the sim, given that the images
   *                              are loaded
   */
  launch( callback ) {
    assert && assert( !window.phet.launchCalled, 'Tried to launch twice' );

    this.callback = callback;

    // Signify that the simLauncher was called, see https://github.com/phetsims/joist/issues/142
    window.phet.joist.launchCalled = true;
  }

  /**
   * Attempts to proceed to the next phase if possible (otherwise it's a no-op).
   * @private
   */
  proceedIfReady() {

    assert && assert( !this.launchComplete, 'cannot proceed if already launched' );

    if ( this.pendingLocks.length === 0 && this.callback ) {

      this.launchBegan = true;

      window.phet.joist.launchSimulation = () => {

        // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
        // wants have been set up by now.
        if ( Tandem.PHET_IO_ENABLED ) {
          phetioEngine.onCrossFrameListenersReady();
        }

        // Instantiate the sim and show it.
        this.callback();
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

      if ( ( Tandem.PHET_IO_ENABLED && !phet.preloads.phetio.queryParameters.phetioStandalone ) ||
           phet.chipper.queryParameters.playbackMode ) {

        // Wait for phet-io to finish adding listeners. It will direct the launch from there.
      }
      else {
        this.launchComplete = true;
        window.phet.joist.launchSimulation();
      }
    }
  }

  /**
   * Creates a lock, which returns a callback that needs to be run before the launch sequence will continue to the
   * next phase.
   * @public
   *
   * @param {*} object
   * @returns {function}
   */
  createLock( object ) {
    assert && assert( !this.launchBegan, 'Cannot create more locks after launch began' );
    this.pendingLocks.push( object );
    return () => {
      assert && assert( this.pendingLocks.indexOf( object ) >= 0, 'invalid lock' );
      arrayRemove( this.pendingLocks, object );
      this.proceedIfReady();
    };
  }
}

const simLauncher = new SimLauncher();

// Dynamic imports must be started after simLauncher is ready to process locks
initializeDynamicImports( simLauncher );

joist.register( 'simLauncher', simLauncher );

export default simLauncher;