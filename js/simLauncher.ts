// Copyright 2013-2022, University of Colorado Boulder
/* eslint indent: 0 */ // Because ESLint doesn't support import() at the time of this writing
/**
 * Singleton which launches a PhET Simulation, after using PHET_CORE/asyncLoader to make sure resources such as images,
 * sounds, or dynamic modules have finished loading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import { PhetioEngine } from '../../phet-io/js/phetioEngine.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

// See below for dynamic imports, which must be locked.
let phetioEngine: PhetioEngine | null = null;

const unlockBrand = asyncLoader.createLock( { name: 'brand' } );
import( /* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js` )
  .then( module => unlockBrand() )
  .catch( err => console.log( err ) );

if ( Tandem.PHET_IO_ENABLED ) {
  const unlockPhetioEngine = asyncLoader.createLock( { name: 'phetioEngine' } );
  import( /* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js' )
    .then( module => {
      phetioEngine = module.default;
      unlockPhetioEngine();
    } )
    .catch( err => console.log( err ) );
}

const unlockLaunch = asyncLoader.createLock( { name: 'launch' } );

class SimLauncher {

  private launchComplete: boolean; // Marked as true when simLauncher has finished its work cycle and control is given over to the simulation to finish initialization.

  public constructor() {
    this.launchComplete = false;
  }

  /**
   * Launch the Sim by preloading the images and calling the callback.
   * to be called by main()s everywhere
   *
   * callback - the callback function which should create and start the sim, given that all async
   *                              content is loaded
   */
  public launch( callback: () => void ): void {
    assert && assert( !window.phet.joist.launchCalled, 'Tried to launch twice' );

    // Add listener before unlocking the launch lock
    asyncLoader.addListener( () => {

      window.phet.joist.launchSimulation = () => {
        assert && assert( !this.launchComplete, 'should not have completed launching the sim yet' );
        this.launchComplete = true;

        // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
        // wants have been set up by now.
        if ( Tandem.PHET_IO_ENABLED ) {
          phetioEngine?.onCrossFrameListenersReady();
        }

        // Instantiate the sim and show it.
        callback();
      };

      // PhET-iO simulations support an initialization phase (before the sim launches)
      if ( Tandem.PHET_IO_ENABLED ) {
        phetioEngine?.initialize(); // calls back to window.phet.joist.launchSimulation
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
        window.phet.joist.launchSimulation();
      }
    } );
    unlockLaunch();

    // Signify that the simLauncher was called, see https://github.com/phetsims/joist/issues/142
    window.phet.joist.launchCalled = true;
  }
}

const simLauncher = new SimLauncher();

joist.register( 'simLauncher', simLauncher );

export default simLauncher;