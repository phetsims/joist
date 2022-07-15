// Copyright 2019-2021, University of Colorado Boulder

/**
 * Used by EngagementMetrics to keep track of the seconds in which activity occurs. For example, with a binSize of 1000,
 * calling onEvent with three values within the range of 1000 will result in a single "count" because they were all in a
 * bin. See unit tests for more examples.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import joist from './joist.js';

class TemporalCounter {

  /**
   * @param {number} binSize - in ms
   */
  constructor( binSize ) {

    // @private
    this.previousTime = null;
    this.binSize = binSize;
    this.lastBinIndex = null;

    // @public
    this.counts = 0;
  }

  /**
   * @public
   * @param {number} time - relative elapsed time
   */
  onEvent( time ) {
    assert && this.previousTime && assert( time >= this.previousTime, 'time must increase each event' );

    assert && assert( Number.isInteger( time ), 'time must be an integer' );

    const currentBinIndex = Math.floor( time / this.binSize );

    if ( currentBinIndex !== this.lastBinIndex ) {

      // Increment the time on the current screen (if home screen not showing)
      this.counts++;
      this.lastBinIndex = currentBinIndex;
    }
    this.previousTime = time;
  }
}

joist.register( 'TemporalCounter', TemporalCounter );
export default TemporalCounter;