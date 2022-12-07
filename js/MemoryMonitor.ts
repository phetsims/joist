// Copyright 2018-2022, University of Colorado Boulder

/**
 * Monitors the memory usage over time.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RunningAverage from '../../dot/js/RunningAverage.js';
import optionize from '../../phet-core/js/optionize.js';
import joist from './joist.js';

// constants
const MB = 1024 * 1024;

// globals
let hadMemoryFailure = false;

type MemoryMonitorOptions = {
  windowSize?: number;
  memoryLimit?: number;
};

class MemoryMonitor {

  private readonly memoryLimit: number;
  public readonly runningAverage: RunningAverage;
  private lastMemory: number;

  public constructor( providedOptions?: MemoryMonitorOptions ) {
    const options = optionize<MemoryMonitorOptions>()( {

      // {number} - Quantity of measurements in the running average
      windowSize: 2000,

      // {number} - Number of megabytes before operations will throw an error
      memoryLimit: phet.chipper.queryParameters.memoryLimit
    }, providedOptions );

    this.memoryLimit = options.memoryLimit * MB;
    this.runningAverage = new RunningAverage( options.windowSize );
    this.lastMemory = 0;
  }

  /**
   * Records a memory measurement.
   */
  public measure(): void {

    // @ts-expect-error Until we make typescript know about performance.memory
    if ( !window.performance || !window.performance.memory || !window.performance.memory.usedJSHeapSize ) {
      return;
    }

    // @ts-expect-error Until we make typescript know about performance.memory
    const currentMemory = window.performance.memory.usedJSHeapSize;
    this.lastMemory = currentMemory;
    const averageMemory = this.runningAverage.updateRunningAverage( currentMemory );

    if ( this.memoryLimit &&
         this.runningAverage.isSaturated() &&
         !hadMemoryFailure &&
         averageMemory > this.memoryLimit &&
         currentMemory > this.memoryLimit * 0.5 ) {
      hadMemoryFailure = true;
      throw new Error( `Average memory used (${MemoryMonitor.memoryString( averageMemory )}) is above our memoryLimit (${MemoryMonitor.memoryString( this.memoryLimit )}). Current memory: ${MemoryMonitor.memoryString( currentMemory )}.` );
    }
  }

  /**
   * Converts a number of bytes into a quick-to-read memory string.
   */
  private static memoryString( bytes: number ): string {
    return `${Math.ceil( bytes / MB )}MB`;
  }
}

joist.register( 'MemoryMonitor', MemoryMonitor );
export default MemoryMonitor;