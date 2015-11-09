// Copyright 2015, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var packageString = require( 'text!REPOSITORY/package.json' );

  return JSON.parse( packageString );
} );