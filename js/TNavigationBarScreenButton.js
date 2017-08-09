// Copyright 2016, University of Colorado Boulder

/**
 * Wrapper type for NavigationBarScreenButton
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
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

  /**
   * @param {NavigationBarScreenButton} navigationBarScreenButton
   * @param {string} phetioID
   * @constructor
   */
  function TNavigationBarScreenButton( navigationBarScreenButton, phetioID ) {
    assertInstanceOf( navigationBarScreenButton, phet.joist.NavigationBarScreenButton );
    TNode.call( this, navigationBarScreenButton, phetioID );

    // Send a message on the data stream when the button is pressed.
    toEventOnEmit(
      navigationBarScreenButton.buttonModel.startedCallbacksForFiredEmitter,
      navigationBarScreenButton.buttonModel.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      this.constructor,
      'fired'
    );
  }

  phetioInherit( TNode, 'TNavigationBarScreenButton', TNavigationBarScreenButton, {}, {
    documentation: 'A pressable button in the simulation\'s navigation bar',
    events: [ 'fired' ]
  } );

  joist.register( 'TNavigationBarScreenButton', TNavigationBarScreenButton );

  return TNavigationBarScreenButton;
} );