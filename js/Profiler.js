// Copyright 2014-2019, University of Colorado Boulder

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
 * that amount of time. In the above example, histogram[2] is 5; there were 5 frames that took 2ms.
 *
 * The longTimes field is the set of frame times that exceeded 29ms, and thus don't fit in the histogram.
 * If 2 frames took 37ms, then 37ms will appear twice.  If no frames exceeded 29ms, then this field will be absent.
 * These values are sorted in descending order, so you can easily identify the largest frame time.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Util = require( 'DOT/Util' );


  // constants
  var FIELD_SEPARATOR = ' \u2014 '; // em dash, a long horizontal dash
  var HISTOGRAM_LENGTH = 30;

  /**
   * Construct a Profiler
   * @constructor
   */
  function Profiler() {

    // @private These data structured were chosen to minimize CPU time.
    this.allTimes = [];  // {number[]} times for all frames, in ms
    this.histogram = []; // {number[]} array index corresponds to number of ms, value is number of frames at that time
    this.longTimes = []; // {number[]} any frame times that didn't fit in histogram
    this.frameStartTime = 0; // {number} start time of the current frame
    this.previousFrameStartTime = 0; // {number} start time of the previous frame

    // initialize histogram
    for ( var i = 0; i < HISTOGRAM_LENGTH; i++ ) {
      this.histogram.push( 0 );
    }

    // this is where the profiler displays its output
    $( 'body' ).append( '<div style="z-index: 99999999;position: absolute;color:red" id="phetProfiler" ></div>' );
  }

  joist.register( 'Profiler', Profiler );

  return inherit( Object, Profiler, {

    // @private
    frameStarted: function() {
      this.frameStartTime = Date.now();
    },

    // @private
    frameEnded: function() {

      // update the display every 60 frames
      if ( this.allTimes.length > 0 && this.allTimes.length % 60 === 0 ) {

        var totalTime = 0;
        for ( var i = 0; i < this.allTimes.length; i++ ) {
          totalTime += this.allTimes[ i ];
        }

        // FPS
        var averageFPS = Util.roundSymmetric( 1000 / (totalTime / this.allTimes.length) );
        var text = '' + averageFPS + ' FPS';

        // ms/frame
        var averageFrameTime = Util.roundSymmetric( totalTime / this.allTimes.length );
        text = text + FIELD_SEPARATOR + averageFrameTime + 'ms/frame';

        // histogram
        text = text + FIELD_SEPARATOR + this.histogram;

        // longTimes
        if ( this.longTimes.length > 0 ) {
          this.longTimes.sort( function( a, b ) { return b - a; } ); // sort longTimes in descending order
          text = text + FIELD_SEPARATOR + this.longTimes;
        }

        // update the display
        $( '#phetProfiler' ).html( text );

        // clear data structures
        for ( i = 0; i < HISTOGRAM_LENGTH; i++ ) {
          this.histogram[ i ] = 0;
        }
        this.longTimes.length = 0;
        this.allTimes.length = 0;
      }

      // record data for the current frame, skip first frame because we can't compute its dt
      if ( this.previousFrameStartTime ) {
        var dt = this.frameStartTime - this.previousFrameStartTime;
        this.allTimes.push( dt );
        if ( dt < HISTOGRAM_LENGTH ) {
          this.histogram[ dt ]++; // increment the histogram cell for the corresponding time
        }
        else {
          this.longTimes.push( dt ); // time doesn't fit in histogram, record in longTimes
        }
      }

      this.previousFrameStartTime = this.frameStartTime;
    }
  }, {

    // @public
    start: function( sim ) {
      var profiler = new Profiler();
      sim.frameStartedEmitter.addListener( function() {
        profiler.frameStarted();
      } );
      sim.frameEndedEmitter.addListener( function() {
        profiler.frameEnded();
      } );
    }
  } );
} );