// Copyright 2016, University of Colorado Boulder

/**
 * Wrapper type for JustButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
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
   * @param {JoistButton} joistButton
   * @param {string} phetioID
   * @constructor
   */
  function TJoistButton( joistButton, phetioID ) {
    assertInstanceOf( joistButton, phet.joist.JoistButton );
    TNode.call( this, joistButton, phetioID );

    // Add button fire events to the data stream.
    toEventOnEmit(
      joistButton.buttonModel.startedCallbacksForFiredEmitter,
      joistButton.buttonModel.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TJoistButton,
      'fired'
    );
  }

  phetioInherit( TNode, 'TJoistButton', TJoistButton, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TJoistButton', TJoistButton );

  return TJoistButton;
} );