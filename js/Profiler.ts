// Copyright 2014-2022, University of Colorado Boulder

/**
 * This minimalistic profiler is meant to help understand the time spent in running a PhET simulation.
 * It was designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * Note: just showing the average FPS or ms/frame is not sufficient, since we need to see when garbage collections
 * happen, which are typically a spike in a single frame.  Hence, the data is shown as a histogram. Data that
 * doesn't fit in the histogram appears in an optional 'longTimes' field.
 *
 * When a sim is run with ?profiler, output is displayed in the upper-left corner of the browser window, and updates
 * every 60 frames.
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

import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';
import Sim from './Sim.js';

// constants
const FIELD_SEPARATOR = ' \u2014 '; // em dash, a long horizontal dash
const HISTOGRAM_LENGTH = 30;

class Profiler {


  // These data structured were chosen to minimize CPU time.
  private readonly allTimes: number[] = []; // {number[]} times for all frames, in ms
  private readonly histogram: number[] = []; // {number[]} array index corresponds to number of ms, value is number of frames at that time
  private readonly longTimes: number[] = []; // {number[]} any frame times that didn't fit in histogram
  private frameStartTime = 0; // {number} start time of the current frame
  private previousFrameStartTime = 0; // {number} start time of the previous frame

  public constructor() {

    // initialize histogram
    for ( let i = 0; i < HISTOGRAM_LENGTH; i++ ) {
      this.histogram.push( 0 );
    }

    // this is where the profiler displays its output
    $( 'body' ).append( '<div style="z-index: 99999999;position: absolute;color:red; left: 10px;" id="phetProfiler" ></div>' );
  }

  public static start( sim: Sim ): void {
    const profiler = new Profiler();
    sim.frameStartedEmitter.addListener( () => profiler.frameStarted() );
    sim.frameEndedEmitter.addListener( () => profiler.frameEnded() );
  }

  private frameStarted(): void {
    this.frameStartTime = Date.now();
  }

  private frameEnded(): void {

    // update the display every 60 frames
    if ( this.allTimes.length > 0 && this.allTimes.length % 60 === 0 ) {

      let totalTime = 0;
      for ( let i = 0; i < this.allTimes.length; i++ ) {
        totalTime += this.allTimes[ i ];
      }

      // FPS
      const averageFPS = Utils.roundSymmetric( 1000 / ( totalTime / this.allTimes.length ) );
      let text = `${averageFPS} FPS`;

      // ms/frame
      const averageFrameTime = Utils.roundSymmetric( totalTime / this.allTimes.length );
      text = `${text + FIELD_SEPARATOR + averageFrameTime}ms/frame`;

      // histogram
      text = text + FIELD_SEPARATOR + this.histogram;

      // longTimes
      if ( this.longTimes.length > 0 ) {
        this.longTimes.sort( ( a, b ) => ( b - a ) ); // sort longTimes in descending order
        text = text + FIELD_SEPARATOR + this.longTimes;
      }

      // update the display
      $( '#phetProfiler' ).html( text );

      // clear data structures
      for ( let i = 0; i < HISTOGRAM_LENGTH; i++ ) {
        this.histogram[ i ] = 0;
      }
      this.longTimes.length = 0;
      this.allTimes.length = 0;
    }

    // record data for the current frame, skip first frame because we can't compute its dt
    if ( this.previousFrameStartTime ) {
      const dt = this.frameStartTime - this.previousFrameStartTime;
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
}

joist.register( 'Profiler', Profiler );
export default Profiler;