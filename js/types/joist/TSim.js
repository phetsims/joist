// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetio = require( 'PHET_IO/phetio' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var SimIFrameAPI = require( 'PHET_IO/SimIFrameAPI' );
  var TFunctionWrapper = require( 'PHET_IO/types/TFunctionWrapper' );
  var TObject = require( 'PHET_IO/types/TObject' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );
  var TString = require( 'PHET_IO/types/TString' );
  var TVoid = require( 'PHET_IO/types/TVoid' );

  /**
   * Wrapper type for phet/joist's Sim class.
   * @param sim
   * @param phetioID
   * @constructor
   */
  function TSim( sim, phetioID ) {
    TObject.call( this, sim, phetioID );
    assertInstanceOf( sim, phet.joist.Sim );

    toEventOnEmit( sim.startedSimConstructorEmitter, sim.endedSimConstructorEmitter, 'model', phetioID, TSim, 'simStarted',
      function( value ) {
        return {
          sessionID: value.sessionID,
          repoName: value.repoName,
          simName: value.simName,
          simVersion: value.simVersion,
          url: value.url,
          userAgent: window.navigator.userAgent,
          randomSeed: value.randomSeed,
          provider: 'PhET Interactive Simulations, University of Colorado Boulder' // See #137
        };
      } );

    // Store a reference to the sim so that subsequent calls will be simpler.  PhET-iO only works with a single sim.
    phetio.sim = sim;
    SimIFrameAPI.triggerSimInitialized();
    sim.endedSimConstructorEmitter.addListener( function() {
      phetio.simulationStarted();
    } );
  }

  phetioInherit( TObject, 'TSim', TSim, {

    disableRequestAnimationFrame: {
      returnType: TVoid,
      parameterTypes: [],
      implementation: function() {
        this.instance.disableRequestAnimationFrame();
      },
      documentation: 'Prevents the simulation from animating/updating'
    },

    addEventListener: {
      returnType: TVoid,
      parameterTypes: [ TString, TFunctionWrapper( TVoid, [ TString, TFunctionWrapper( TVoid, [] ) ] ) ],
      implementation: function( eventName, listener ) {
        this.instance.onStatic( eventName, listener );
      },
      documentation: 'Add an event listener to the sim instance'
    },

    getScreenshotDataURL: {
      returnType: TString,
      parameterTypes: [],
      implementation: function() {
        return window.phet.joist.ScreenshotGenerator.generateScreenshot( this.instance );
      },
      documentation: 'Gets a base64 representation of a screenshot of the simulation as a data url'
    }
  }, {
    documentation: 'The type for the simulation instance',
    events: [
      'simStarted'
    ]
  } );


  phetioNamespace.register( 'TSim', TSim );

  return TSim;
} );

