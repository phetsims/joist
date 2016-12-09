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
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  /**
   * Wrapper type for phet/joist's PhetButton
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TJoistButton( phetButton, phetioID ) {
    TNode.call( this, phetButton, phetioID );
    assertInstanceOf( phetButton, phet.joist.JoistButton );

    assert && assert( phetButton.buttonModel.startedCallbacksForFiredEmitter, 'button models should use emitters' );
    toEventOnEmit( phetButton.buttonModel.startedCallbacksForFiredEmitter, phetButton.buttonModel.endedCallbacksForFiredEmitter, 'user', phetioID, TJoistButton, 'fired' );

  }

  phetioInherit( TNode, 'TJoistButton', TJoistButton, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TJoistButton', TJoistButton );

  return TJoistButton;
} );

