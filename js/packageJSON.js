// Copyright 2015-2018, University of Colorado Boulder

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

  var packageJSON = JSON.parse( packageString );

  joist.register( 'packageJSON', packageJSON );

  return packageJSON;
} );