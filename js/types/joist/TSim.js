// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
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
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );
  var TString = require( 'PHET_IO/types/TString' );
  var TVoid = require( 'PHET_IO/types/TVoid' );
  var TBarrierRectangle = require( 'PHET_IO/types/scenery/nodes/TBarrierRectangle' );
  var TBoolean = require( 'PHET_IO/types/TBoolean' );
  var TNumber = require( 'PHET_IO/types/TNumber' );
  var TProperty = require( 'PHET_IO/types/axon/TProperty' );

  var TSim = phetioInherit( TObject, 'TSim', function( sim, phetioID ) {
    TObject.call( this, sim, phetioID );
    assertInstanceOf( sim, phet.joist.Sim );

    toEventOnStatic( sim, 'SimConstructor', 'model', phetioID, 'simStarted', function( value ) {
      return {
        sessionID: value.sessionID,
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
    sim.onStatic( 'simulationStarted', function() {
      phetio.simulationStarted();
    } );
  }, {
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
    api: {
      active: TProperty( TBoolean ),
      barrierRectangle: TBarrierRectangle,
      screenIndex: TProperty( TNumber ),
      showHomeScreen: TProperty( TBoolean )
    },
    documentation: 'The type for the simulation instance',
    events: [
      'simStarted',

      // The entire state for the sim, for the first frame and for keyframes
      'state',

      // not necessarily a stateChanged because the delta might be empty
      'stateDelta',

      // For addEventListener, not emitted at every frame into the data stream
      'frameCompleted',

      'stepSimulation',

      'inputEvent'
    ]
  } );


  phetioNamespace.register( 'TSim', TSim );

  return TSim;
} );

