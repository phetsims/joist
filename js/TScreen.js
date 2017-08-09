// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var joist = require( 'JOIST/joist' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/joist's Screen class.
   * @param screen
   * @param phetioID
   * @constructor
   */
  function TScreen( screen, phetioID ) {
    assertInstanceOf( screen, phet.joist.Screen );
    TObject.call( this, screen, phetioID );
  }

  phetioInherit( TObject, 'TScreen', TScreen, {}, {
    documentation: 'A single screen for a PhET simulation'
  } );

  joist.register( 'TScreen', TScreen );

  return TScreen;
} );