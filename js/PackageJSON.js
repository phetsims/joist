// Copyright 2002-2014, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 */
define( function( require ) {
  'use strict';

  // modules
  var packageString = require( 'text!REPOSITORY/package.json' );

  return JSON.parse( packageString );
} );