// Copyright 2015, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  // strings
  var packageString = require( 'text!REPOSITORY/package.json' );

  // TODO: duplicated with getVersionForBrand.js in chipper
  // HACK ALERT: Patch in the phet-io substring if it is a phet-io brand.
  // See https://github.com/phetsims/chipper/issues/507
  var getVersionForBrand = function( brand, version ) {

    if ( brand === 'phet-io' ) {

      // Insert phetio into the version name
      // 1.2.0-dev.31 => 1.2.0-phetiodev.31
      // 1.2.0 => 1.2.0-phetio

      // if there is a hyphen, put phetio before it
      // if there is no hyphen, append phetio
      var hyphenIndex = version.indexOf( '-' );
      if ( hyphenIndex >= 0 ) {
        return version.substring( 0, hyphenIndex + 1 ) + 'phetio' + version.substring( hyphenIndex + 1 );
      }
      else {
        return version + '-phetio';
      }
    }
    return version;
  };

  var packageJSON = JSON.parse( packageString );

  packageJSON.version = getVersionForBrand( phet.chipper.brand, packageJSON.version );

  joist.register( 'packageJSON', packageJSON );

  return packageJSON;
} );