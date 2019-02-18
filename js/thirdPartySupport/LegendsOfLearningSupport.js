// Copyright 2017-2018, University of Colorado Boulder

/**
 * Support for Legends of Learning platform. Sends init message after sim is constructed and support pause/resume.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  /**
   * @param {Sim} sim
   * @constructor
   */
  function LegendsOfLearningSupport( sim ) {

    // @private
    this.sim = sim;

    // Respond to pause/resume commands from the Legends of Learning platform
    window.addEventListener( 'message', function( message ) {
      if ( message.data.messageName === 'pause' ) {
        sim.stepOneFrame();
        sim.activeProperty.value = false;
      }
      else if ( message.data.messageName === 'resume' ) {
        sim.activeProperty.value = true;
      }
    } );
  }

  joist.register( 'LegendsOfLearningSupport', LegendsOfLearningSupport );

  return inherit( Object, LegendsOfLearningSupport, {
    start: function() {

      // Send init message when sim has started up so that Legends of Learning can remove their splash screen
      this.sim.endedSimConstructionEmitter.addListener( function() {
        ( window.parent !== window ) && window.parent.postMessage( { message: 'init' }, '*' );
      } );
    }
  } );
} );