// Copyright 2019, University of Colorado Boulder

/**
 * Enumeration for the various states that can occur during an "update check." See updateCheck.js for main usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const joist = require( 'JOIST/joist' );

  return joist.register( 'UpdateState', new Enumeration( [
    'UP_TO_DATE',  // Simulation version is equal to or greater than the currently published version.
    'OUT_OF_DATE', // Simulation version is less than currently published version (or equal but has a suffix)
    'CHECKING',    // Request to server sent out, has not processed reply yet.
    'OFFLINE',     // Last attempt to check failed, most likely offline
    'UNCHECKED'    // No attempt as been made to check the version against the latest online.
  ] ) );
} );
