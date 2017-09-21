// Copyright 2017, University of Colorado Boulder

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
  var joist = require( 'JOIST/joist' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

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
      this.constructor,
      'fired'
    );
  }

  phetioInherit( TNode, 'TJoistButton', TJoistButton, {}, {
    documentation: 'The buttons used in the home screen and navigation bar',
    events: [ 'fired' ]
  } );

  joist.register( 'TJoistButton', TJoistButton );

  return TJoistButton;
} );