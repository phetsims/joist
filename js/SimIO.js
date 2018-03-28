// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for Sim
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetio = require( 'ifphetio!PHET_IO/phetio' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var phetioCommandProcessor = require( 'ifphetio!PHET_IO/phetioCommandProcessor' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var StringIO = require( 'ifphetio!PHET_IO/types/StringIO' );

  // constants
  // The token for the event that occurs when the simulation constructor completes. This is hard-coded in many places
  // such as th playback wrapper, so should not be changed lightly!
  var SIM_STARTED = 'simStarted';

  /**
   * IO type for phet/joist's Sim class.
   * @param {Sim} sim
   * @param {string} phetioID
   * @constructor
   */
  function SimIO( sim, phetioID ) {
    assert && assertInstanceOf( sim, phet.joist.Sim );
    ObjectIO.call( this, sim, phetioID );

    // Store a reference to the sim so that subsequent calls will be simpler.  PhET-iO only works with a single sim.
    phetio.sim = sim;
    sim.endedSimConstructionEmitter.addListener( function() {

      // TODO: Can these be coalesced?  See https://github.com/phetsims/joist/issues/412
      phetioCommandProcessor.triggerSimInitialized();
      phetio.simulationStarted();
    } );
  }

  phetioInherit( ObjectIO, 'SimIO', SimIO, {

    getScreenshotDataURL: {
      returnType: StringIO,
      parameterTypes: [],
      implementation: function() {
        return window.phet.joist.ScreenshotGenerator.generateScreenshot( this.instance );
      },
      documentation: 'Gets a base64 representation of a screenshot of the simulation as a data url'
    }
  }, {
    documentation: 'The type for the simulation instance',
    events: [
      SIM_STARTED
    ]
  } );


  joist.register( 'SimIO', SimIO );

  return SimIO;
} );

