// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Andrea Lin
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TPushButton = require( 'PHET_IO/types/sun/buttons/TPushButton' );

  /**
   * Wrapper type for phet/joist's PhetButton
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TPhetButton( phetButton, phetioID ) {
    TPushButton.call( this, phetButton, phetioID );
    assertInstanceOfTypes( phetButton, [
      phet.joist.PhetButton,
      phet.joist.HomeButton
    ] );
  }

  phetioInherit( TPushButton, 'TPhetButton', TPhetButton, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: TPushButton.events
  } );

  phetioNamespace.register( 'TPhetButton', TPhetButton );

  return TPhetButton;
} );

