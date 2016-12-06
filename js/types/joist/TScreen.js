// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TObject = require( 'PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/joist's Screen class.
   * @param screen
   * @param phetioID
   * @constructor
   */
  function TScreen( screen, phetioID ) {
    TObject.call( this, screen, phetioID );
    assertInstanceOf( screen, phet.joist.Screen );
  }

  phetioInherit( TObject, 'TScreen', TScreen, {}, {
    documentation: 'A single screen for a PhET simulation'
  } );

  phetioNamespace.register( 'TScreen', TScreen );

  return TScreen;
} );