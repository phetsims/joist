// Copyright 2018, University of Colorado Boulder

/**
 * Monitors the memory usage over time.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const RunningAverage = require( 'DOT/RunningAverage' );

  // constants
  const MB = 1024 * 1024;
  
  // globals
  let hadMemoryFailure = false;

  class MemoryMonitor {
    /**
     * @param {Object} [options]
     */
    constructor( options ) {
      options = _.extend( {
        // {number} - Quantity of measurements in the running average
        windowSize: 2000,

        // {number} - Number of megabytes before operations will throw an error
        memoryLimit: phet.chipper.queryParameters.memoryLimit
      }, options );

      // @private {number}
      this.memoryLimit = options.memoryLimit * MB;

      // @public {RunningAverage}
      this.runningAverage = new RunningAverage( options.windowSize );

      // @public {number}
      this.lastMemory = 0;
    }

    /**
     * Records a memory measurement.
     * @public
     */
    measure() {
      if ( !window.performance || !window.performance.memory || !window.performance.memory.usedJSHeapSize ) {
        return;
      }
      
      const currentMemory = window.performance.memory.usedJSHeapSize;
      this.lastMemory = currentMemory;
      const averageMemory = this.runningAverage.updateRunningAverage( currentMemory );

      if ( this.memoryLimit &&
           this.runningAverage.isSaturated() &&
           !hadMemoryFailure && 
           averageMemory > this.memoryLimit &&
           currentMemory > this.memoryLimit * 0.5 ) {
        hadMemoryFailure = true;
        throw new Error( 'Average memory used (' + MemoryMonitor.memoryString( averageMemory ) + ') is above our memoryLimit (' + MemoryMonitor.memoryString( this.memoryLimit ) + '). Current memory: ' + MemoryMonitor.memoryString( currentMemory ) + '.'  );
      }
    }

    /**
     * Convers a number of bytes into a quick-to-read memory string.
     * @public
     *
     * @param {number} bytes
     * @returns {string}
     */
    static memoryString( bytes ) {
      return Math.ceil( bytes / MB ) + 'MB';
    }
  }

  return joist.register( 'MemoryMonitor', MemoryMonitor );
} );