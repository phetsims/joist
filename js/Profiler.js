// Copyright 2014-2016, University of Colorado Boulder

/**
 * This minimalistic profiler is meant to help understand the time spent in running a PhET simulation.
 * It was designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * Note: just showing the average FPS or ms/frame is not sufficient, since we need to see when garbage collections
 * happen, which are typically a spike in a single frame.  Hence, the data is shown as a histogram. Data that
 * doesn't fit in the histogram appears in an optional 'longTimes' field.
 *
 * Output is displayed in the upper-left corner of the browser window, and updates every 60 frames.
 *
 * The general format is:
 *
 * FPS - ms/frame - histogram [- longTimes]
 *
 * Here's an example:
 *
 * 48 FPS - 21ms/frame - 0,0,5,0,0,0,0,0,1,0,0,0,0,3,1,3,18,19,5,3,1,0,1,0,0,0,0,1,0,0 - 50,37,217
 *
 * The histogram field is a sequence of 30 numbers, for 0-29ms. Each number indicates the number of frames that took
 * that amount of time. In the above example, there were 5 frames that took 2ms.
 *
 * The longTimes field is the set of frame times that exceeded 29ms, and thus don't fit in the histogram.
 * If 2 frames took 37ms, then 37ms will appear twice.  If no frames exceeded 29ms, then this field will be absent.
 *
 * TODO: Could take further steps to helping identify the time spent in render vs input handling vs model, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  // constants
  var FIELD_SEPARATOR = ' \u2014 '; // em dash, a long horizontal dash

  /**
   * Construct a Profiler
   * @constructor
   */
  function Profiler() {

    //TODO Now that profiler is enabled via a query parameter, we should use more sensible/flexible data structures here.
    // These data structured were chosen to minimize CPU time.
    this.histogram = []; // @private array index corresponds to number of ms, value is number of frames at that time
    this.longTimes = []; // @private any times that didn't fit in histogram
    this.allTimes = [];  // @private
    this.frameCount = 0; // @private
    for ( var i = 0; i < 30; i++ ) {
      this.histogram.push( 0 );
    }
    $( 'body' ).append( '<div style="z-index: 99999999;position: absolute;color:red" id="trace" ></div>' );
  }

  joist.register( 'Profiler', Profiler );

  return inherit( Object, Profiler, {

    // @private
    frameStarted: function() {
      this.frameStartTime = Date.now();
      this.frameCount++;
    },

    // @private
    frameEnded: function() {

      var timeBetweenFrames = this.frameStartTime - this.lastFrameStartTime;
      if ( this.frameCount % 60 === 0 ) {

        var totalTime = 0;
        for ( var i = 0; i < this.allTimes.length; i++ ) {
          totalTime += this.allTimes[ i ];
        }

        // FPS
        var averageFPS = Math.round( 1000 / (totalTime / this.allTimes.length) );
        var text = '' + averageFPS + ' FPS';

        // ms/frame
        var averageFrameTime = Math.round( totalTime / this.allTimes.length );
        text = text + FIELD_SEPARATOR + averageFrameTime + 'ms/frame';

        // histogram
        text = text + FIELD_SEPARATOR + this.histogram;

        // longTimes
        if ( this.longTimes.length ) {
          this.longTimes.sort( function( a, b ){ return b - a; } ); // sort longTimes in descending order
          text = text + FIELD_SEPARATOR + this.longTimes;
        }

        // update the display
        $( '#trace' ).html( text );

        // clear data structures
        for ( i = 0; i < 30; i++ ) {
          this.histogram[ i ] = 0;
        }
        this.longTimes.length = 0;
        this.allTimes.length = 0;
      }
      else {
        var key = timeBetweenFrames;
        if ( key < 30 ) {
          this.histogram[ key ]++;
        }
        else {
          this.longTimes.push( key );
        }
        this.allTimes.push( key );
      }
      this.lastFrameStartTime = this.frameStartTime;
    }
  }, {

    // @public
    start: function( sim ) {
      var profiler = new Profiler();
      sim.on( 'frameStarted', function() {
        profiler.frameStarted();
      } );
      sim.on( 'frameCompleted', function() {
        profiler.frameEnded();
      } );
    }
  } );
} );