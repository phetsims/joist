// Copyright 2019, University of Colorado Boulder

/**
 * Enumeration for the various states that can occur during an "update check." See updateCheck.js for main usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import joist from './joist.js';

export default joist.register( 'UpdateState', Enumeration.byKeys( [
  'UP_TO_DATE',  // Simulation version is equal to or greater than the currently published version.
  'OUT_OF_DATE', // Simulation version is less than currently published version (or equal but has a suffix)
  'CHECKING',    // Request to server sent out, has not processed reply yet.
  'OFFLINE',     // Last attempt to check failed, most likely offline
  'UNCHECKED'    // No attempt as been made to check the version against the latest online.
] ) );