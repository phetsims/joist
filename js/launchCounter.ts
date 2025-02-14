// Copyright 2024, University of Colorado Boulder

/**
 * Utility for counting the launches of a simulation, which is helpful when counting crashes during
 * extended fuzzing. Replaces the sim name with a title that indicates the run number.
 *
 * NOTE: There is no easy way to clear the local storage for this value, so correct usage would focus on the differences
 * in values rather than the absolute values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TinyProperty from '../../axon/js/TinyProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../dot/js/util/toFixed.js';

// Key for storing the launch count in local storage. This is transient and does not need to be maintained or migrated.
// Safe to rename.
const LOCAL_STORAGE_KEY = 'phet.sim.launchCount';

/**
 * Returns a new hard-coded sim name that indicates the launch count. Note this disables the translatability of the sim title.
 */
export default function launchCounter( simNameProperty: TReadOnlyProperty<string> ): TReadOnlyProperty<string> {

  let storedRunCountString: string | null = null;
  let newRunCount: number | null = null;

  // Attempt to retrieve the run count from local storage
  try {
    storedRunCountString = window.localStorage.getItem( LOCAL_STORAGE_KEY );
  }
  catch( error ) {
    console.error( 'Error accessing localStorage:', error );
  }

  if ( storedRunCountString ) {
    const storedRunCount = parseInt( storedRunCountString, 10 );
    newRunCount = storedRunCount + 1;
  }
  else {
    newRunCount = 1;
  }

  // Attempt to store the updated run count back to local storage
  try {
    window.localStorage.setItem( LOCAL_STORAGE_KEY, toFixed( newRunCount, 0 ) );
  }
  catch( error ) {
    console.error( 'Error accessing localStorage:', error );
  }

  return new TinyProperty( simNameProperty.value + ' (Run ' + newRunCount + ')' );
}