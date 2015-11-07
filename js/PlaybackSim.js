// Copyright 2015, University of Colorado Boulder

/**
 * By recording scenery input events and associated values such as display size changes, the simulation can be played back.
 * This file provides logic for updating the Sim instance for playback.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @constructor
   */
  function PlaybackSim( sim, dataLog ) {
    this.playbackStartTime = 0;
    this.playbackIndex = 0;
    this.playbackFrameCount = 0;
    this.sim = sim;
    this.dataLog = dataLog;
  }

  return inherit( Object, PlaybackSim, {
    playbackAnimationLoop: function() {

      if ( this.playbackStartTime === 0 ) {
        this.playbackStartTime = Date.now();
      }

      // The log events currently use dot as a top level module, so we must promote it here.
      // In the next version of this, we shouldn't use eval, and this can be replaced with a better pattern.
      window.dot = window.dot || phet.dot;

      while ( this.playbackIndex < this.dataLog.length ) {
        var command = this.dataLog[ this.playbackIndex ];
        eval( command );

        this.playbackIndex++;
        if ( command.indexOf( 'stepSimulation' ) >= 0 ) {
          window.requestAnimationFrame( this.sim.boundRunAnimationLoop );
          this.playbackFrameCount++;
          break;
        }
      }

      // when we have already played the last frame
      if ( this.playbackIndex === this.dataLog.length - 1 ) {
        var endTime = Date.now();
        var elapsedTime = endTime - this.playbackStartTime;
        var fps = this.playbackFrameCount / ( elapsedTime / 1000 );

        // replace the page with a performance message
        document.body.innerHTML = '<div style="text-align: center; font-size: 16px;">' +
                                  '<h1>Performance results:</h1>' +
                                  '<p>Approximate frames per second: <strong>' + fps.toFixed( 1 ) + '</strong></p>' +
                                  '<p>Average time per frame (ms/frame): <strong>' +
                                  (elapsedTime / this.playbackFrameCount).toFixed( 1 ) + '</strong></p>' +
                                  '<p>Elapsed time: <strong>' + elapsedTime + 'ms</strong></p>' +
                                  '<p>Number of frames: <strong>' + this.playbackFrameCount + '</strong></p>' +
                                  '</div>';

        // ensure that the black text is readable (chipper-built sims have a black background right now)
        document.body.style.backgroundColor = '#fff';
      }
    }
  } );
} );