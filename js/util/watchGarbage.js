//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Singleton method for use with Chrome profiling tools to automatically report garbage collection periods.
 * Must be run with chrome --enable-memory-info and hence only works in Google chrome.
 * Call this method each model.step to track garbage collections.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var lastUsedJSHeapSize = -1;
  var gcTimes = [];

  var average = function( array ) {
    var sum = 0;
    for ( var i = 0; i < array.length; i++ ) {
      sum += array[i];
    }
    return sum / array.length;
  };

  return function() {

    //Run with chrome --enable-memory-info
    if ( window.performance ) {
      var newHeapSize = window.performance.memory.usedJSHeapSize;

      if ( newHeapSize < lastUsedJSHeapSize ) {
        gcTimes.push( Date.now() );
        var deltas = [];
        for ( var i = 0; i < 3 && i < gcTimes.length - 1; i++ ) {
          deltas.push( gcTimes[gcTimes.length - 1 - i] - gcTimes[gcTimes.length - 1 - i - 1] );
        }
        if ( deltas.length > 0 ) {
          console.log( 'GC: average period (ms) over last ', deltas.length, ' collections:', average( deltas ), ', values: ', deltas );
        }
      }

      lastUsedJSHeapSize = newHeapSize;
    }

  };
} );
