// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var joist = require( 'JOIST/joist' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/joist's PhetButton class.
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TPhetButton( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.PhetButton );
    TObject.call( this, phetButton, phetioID );
  }

  phetioInherit( TObject, 'TPhetButton', TPhetButton, {}, {
    documentation: 'A pressable PhET logo in the simulation, it usually opens the PhET menu.'
  } );

  joist.register( 'TPhetButton', TPhetButton );

  return TPhetButton;
} );