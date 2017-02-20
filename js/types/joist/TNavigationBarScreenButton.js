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
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );

  /**
   * @param {NavigationBarScreenButton} navigationBarScreenButton
   * @param {string} phetioID
   * @constructor
   */
  function TNavigationBarScreenButton( navigationBarScreenButton, phetioID ) {
    TNode.call( this, navigationBarScreenButton, phetioID );

    assertInstanceOfTypes( navigationBarScreenButton, [ phet.joist.NavigationBarScreenButton ] );

    // Send a message on the data stream when the button is pressed.
    toEventOnEmit(
      navigationBarScreenButton.buttonModel.startedCallbacksForFiredEmitter,
      navigationBarScreenButton.buttonModel.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TNavigationBarScreenButton,
      'fired'
    );
  }

  phetioInherit( TNode, 'TNavigationBarScreenButton', TNavigationBarScreenButton, {}, {
    documentation: 'A pressable button in the simulation\'s navigation bar',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TNavigationBarScreenButton', TNavigationBarScreenButton );

  return TNavigationBarScreenButton;
} );