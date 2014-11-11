//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The iframe API for communicating with a PhET Simulation using postMessage.  Every Sim has one PhetAPI associated with it.
 * The syntax for communication is command [argument]
 *
 * The supported API commands are:
 * connect: the parent frame requests a connection to this frame.  Response is "connected".
 * addSimStateListener: the parent registers to receive states from the sim, one per frame
 * addSimEventListener: the parent registers to receive event streams from the sim
 * setActive BOOLEAN: sets the sim to be active (running, and interactive) or inactive (passive, and ready to display states)
 * setState STRING: sets the state of the sim from a captured state.
 *
 * Example API usage is provided in together/record-playback-iframe.html
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

    console.log( 'enabled SimIFrameAPI' );

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
        sim.active = (substring === 'true');
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