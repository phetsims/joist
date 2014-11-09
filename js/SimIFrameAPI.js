//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The iframe API for communicating with a PhET Simulation using postMessage.  Every Sim has one PhetAPI associated with it.
 * The syntax for communication is:
 * command [argument]
 * where command is a whitespaceless string such as connect, addSimStateListener or setActive
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SimJSON = require( 'JOIST/SimJSON' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @constructor
   */
  function SimIFrameAPI( sim ) {
    var simIFrameAPI = this;
    this.sim = sim;
    this.stateListeners = [];

    // Listen for messages as early as possible, so that a client can establish a connection early.
    window.addEventListener( 'message', function( e ) {
      var message = e.data;

      // The iframe has requested a connection after startup.  Reply with a 'connected' message so it can finalize initalization
      if ( message === 'connect' ) {
        e.source.postMessage( 'connected', '*' );
      }
      else if ( message === 'addSimStateListener' ) {
        simIFrameAPI.stateListeners.push( e.source );
      }
      else if ( message === 'addSimEventListener' ) {

        // Wire into the existing infrastructure in arch.js, which is currently private
        // Note: this is subject to change based on https://github.com/phetsims/arch/issues/2
        if ( window.phetEvents ) {
          window.phetEvents.targets.push( function( message ) {
            e.source.postMessage( 'event ' + message, '*' );
          } );
        }
      }
      else if ( message.indexOf( 'setActive' ) === 0 ) {
        var substring = message.substring( 'setActive'.length ).trim();
        var isTrue = substring === 'true';
        sim.active = isTrue;
      }
      else if ( message.indexOf( 'setState' ) === 0 ) {
        var stateString = message.substring( 'setState'.length );
        sim.setState( JSON.parse( stateString, SimJSON.reviver ) );
      }
    } );
  }

  return inherit( PropertySet, SimIFrameAPI, {
    frameFinished: function() {
      if ( this.sim.active && this.stateListeners.length > 0 ) {

        // TODO: perhaps we shouldn't record whether the sim is active, since that value may be overriden by setState
        // Though this hasn't shown any problems in testing
        var state = this.sim.getState();
        var stateString = JSON.stringify( state, SimJSON.replacer );
        for ( var i = 0; i < this.stateListeners.length; i++ ) {
          var emitTarget = this.stateListeners[i];
          emitTarget.postMessage( 'state ' + stateString, '*' );
        }
      }
    }
  } );
} );