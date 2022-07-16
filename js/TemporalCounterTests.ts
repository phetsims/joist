// Copyright 2019-2022, University of Colorado Boulder

/**
 * QUnit tests for TemporalCounter
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TemporalCounter from './TemporalCounter.js';

QUnit.test( 'TemporalCounter basics', async assert => {

  const testTemporalCounter = ( binSize: number, timeEvents: number[], expectedCount: number, message: string ) => {
    const counter = new TemporalCounter( binSize );
    timeEvents.forEach( time => counter.onEvent( time ) );
    assert.ok( counter.counts === expectedCount, message );
  };

  testTemporalCounter( 1000, [ 12, 14, 20 ], 1,
    'three events in one bin size' );
  testTemporalCounter( 1000, [ 10012, 10014, 10020 ], 1,
    'three events in one bin size, larger than the bin' );
  testTemporalCounter( 1000, [ 12, 1014, 10020 ], 3,
    'three events, 3 counts' );
  testTemporalCounter( 1000, [ 0, 999, 1000, 1001, 5000, 5001 ], 3,
    'edge cases, 3 counts expected' );
  testTemporalCounter( 1, [ 12, 14, 20, 39, 40, 41, 50 ], 7,
    'seven events' );
  testTemporalCounter( 1000000, [ 1, 11, 111, 1111, 11111, 111111 ], 1,
    'six events in one big bin size' );
  testTemporalCounter( 5000, [ 11, 11, 11, 11, 11, 11, 11, 4000 ], 1,
    'repetition' );
} );