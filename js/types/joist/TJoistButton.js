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
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  /**
   * Wrapper type for phet/joist's PhetButton
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TJoistButton( phetButton, phetioID ) {
    TNode.call( this, phetButton, phetioID );
    assertInstanceOfTypes( phetButton, [
      phet.joist.JoistButton
    ] );
  }

  phetioInherit( TNode, 'TJoistButton', TJoistButton, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: TNode.events
  } );

  phetioNamespace.register( 'TJoistButton', TJoistButton );

  return TJoistButton;
} );

