// Copyright 2015-2019, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );

  // strings
  const packageString = require( 'text!REPOSITORY/package.json' );

  const packageJSON = JSON.parse( packageString );

  joist.register( 'packageJSON', packageJSON );

  return packageJSON;
} );