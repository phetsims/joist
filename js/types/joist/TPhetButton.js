// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 * @author Andrea Lin
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TButton = require( 'PHET_IO/types/sun/buttons/TButton' );

  var TPhetButton = phetioInherit( TButton, 'TPhetButton', function( phetButton, phetioID ) {
    TButton.call( this, phetButton, phetioID );
    assertInstanceOfTypes( phetButton, [
      phet.joist.PhetButton,
      phet.joist.HomeButton
    ] );
  }, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: TButton.events
  } );

  phetioNamespace.register( 'TPhetButton', TPhetButton );

  return TPhetButton;
} );

