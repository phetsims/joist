// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/joist's ScreenButton
   * @param button
   * @param phetioID
   * @constructor
   */
  function TScreenButton( button, phetioID ) {
    assertInstanceOf( button, phet.scenery.VBox );
    TNode.call( this, button, phetioID );
    toEventOnEmit(
      button.startedCallbacksForFiredEmitter,
      button.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TScreenButton,
      'fired' );
  }

  phetioInherit( TNode, 'TScreenButton', TScreenButton, {}, {
    documentation: 'A pressable button in the simulation, in the home screen',
    events: [ 'fired' ]
  } );

  joist.register( 'TScreenButton', TScreenButton );

  return TScreenButton;
} );

