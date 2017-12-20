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
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );

  /**
   * Wrapper type for phet/joist's PhetButton class.
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function PhetButtonIO( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.PhetButton );
    ObjectIO.call( this, phetButton, phetioID );
  }

  phetioInherit( ObjectIO, 'PhetButtonIO', PhetButtonIO, {}, {
    events: [ 'fired' ],
    documentation: 'A pressable PhET logo in the simulation, it usually opens the PhET menu.'
  } );

  joist.register( 'PhetButtonIO', PhetButtonIO );

  return PhetButtonIO;
} );