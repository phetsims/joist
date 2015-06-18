// Copyright 2002-2013, University of Colorado Boulder

/**
 * Object representing a simulation version, with optional build timestamp information (conceptually part of the version
 * for potential version comparisons).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {object} options - major/minor/maintenance are required
   * @constructor
   */
  function SimVersion( options ) {
    assert && assert( options.major !== undefined );
    assert && assert( options.minor !== undefined );
    assert && assert( options.maintenance !== undefined );

    this.major = options.major; // {number} major - Major version number
    this.minor = options.minor; // {number} minor - Major version number
    this.maintenance = options.maintenance; // {number} maintenance - Major version number
    this.suffix = options.suffix; // {string} [suffix] - Optional suffix (like 'dev.3')
    this.buildTimestamp = options.buildTimestamp; // {string} [buildTimestamp] - Optional build timestamp, like '2015-06-12 16:05:03 UTC' (phet.chipper.buildTimestamp)
  }

  return inherit( Object, SimVersion, {
    /**
     * Compares versions, returning -1 if this version is before the passed in version, 0 if equal, or 1 if this version
     * is after.
     *
     * This function only compares major/minor/maintenance, leaving suffix/buildTimestamp comparisons for the client
     * for now.
     *
     * @param {SimVersion} version
     */
    compare: function( version ) {
      if ( this.major < version.major ) { return -1; }
      if ( this.major > version.major ) { return 1; }
      if ( this.minor < version.minor ) { return -1; }
      if ( this.minor > version.minor ) { return 1; }
      if ( this.maintenance < version.maintenance ) { return -1; }
      if ( this.maintenance > version.maintenance ) { return 1; }
      return 0; // equal
    },

    get isSimNotPublished() {
      return this.major < 1 || // e.g. 0.0.0-dev.1
             ( this.major === 1 && // e.g. 1.0.0-dev.1
               this.minor === 0 &&
               this.maintenance === 0 &&
               this.suffix );
    },

    toString: function() {
      return this.major + '.' + this.minor + '.' + this.maintenance + ( this.suffix ? '-' + this.suffix : '' );
    }
  }, {
    /**
     * @param {string} versionString - e.g. '1.0.0', '1.0.1-dev.3', etc.
     * @param {string} [buildTimestamp] - Optional build timestamp, like '2015-06-12 16:05:03 UTC' (phet.chipper.buildTimestamp)
     */
    parse: function( versionString, buildTimestamp ) {
      var matches = versionString.match( /(\d+)\.(\d+)\.(\d+)(-(.+))?/ );

      if ( !matches ) {
        throw new Error( 'could not parse version: ' + versionString );
      }

      return new SimVersion( {
        major: parseInt( matches[ 1 ], 10 ),
        minor: parseInt( matches[ 2 ], 10 ),
        maintenance: parseInt( matches[ 3 ], 10 ),
        suffix: matches[ 5 ],
        buildTimestamp: buildTimestamp
      } );
    }
  } );
} );
