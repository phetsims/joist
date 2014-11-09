//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The iframe API for communicating with a PhET Simulation using postMessage.  Every Sim has one PhetAPI associated with it.
 * The syntax for communication is:
 * command [argument]
 * where command is a whitespaceless string such as connect, emitStates or setActive
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SimJSON = require( 'JOIST/SimJSON' );
  var PropertySet = require( 'AXON/PropertySet' );

  // TODO: merge emitTargets with emitStates and remove emitStates
  var emitTargets = [];

  /**
   *
   * @constructor
   */
  function SimIFrameAPI( sim ) {
    var simIFrameAPI = this;
    this.sim = sim;

    // These fields may eventually want to be moved to Sim.js, but right now it would be complicated because
    // The entire state of the Sim is saved/loaded and these state variables should not be
    // (otherwise playing back a value with active: true would set active:true again, which would end the playback.
    PropertySet.call( this, {

      //Flag for if the sim is active (alive) and the user is able to interact with the sim.
      //Set to false for when the sim will be controlled externally, such as through record/playback or other controls.
      active: true,

      // True if it should send states to receivers
      emitStates: false
    } );

    // Listen for messages as early as possible, so that a client can establish a connection early.
    window.addEventListener( 'message', function( e ) {
      var message = e.data;

      // The iframe has requested a connection after startup.  Reply with a 'connected' message so it can finalize initalization
      if ( message === 'connect' ) {
        e.source.postMessage( 'connected', '*' );
      }
      else if ( message === 'emitStates' ) {
        simIFrameAPI.emitStates = true;
        emitTargets.push( e.source );
      }
      else if ( message.indexOf( 'setActive' ) === 0 ) {
        var substring = message.substring( 'setActive'.length ).trim();
        var isTrue = substring === 'true';
        simIFrameAPI.active = isTrue;
      }
      else if ( message.indexOf( 'setState' ) === 0 ) {
        var stateString = message.substring( 'setState'.length );
        sim.setState( JSON.parse( stateString, SimJSON.reviver ) );
      }
    } );
  }

  return inherit( PropertySet, SimIFrameAPI, {
    frameFinished: function() {
      if ( this.emitStates && this.active ) {
        var state = this.sim.getState();
        var stateString = JSON.stringify( state, SimJSON.replacer );
        for ( var i = 0; i < emitTargets.length; i++ ) {
          var emitTarget = emitTargets[i];
          emitTarget.postMessage( 'state ' + stateString, '*' );
        }
      }
    }
  } );
} );