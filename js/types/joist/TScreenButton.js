// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );
  var TVoid = require( 'PHET_IO/types/TVoid' );

  /**
   * Wrapper type for phet/joist's ScreenButton
   * @param button
   * @param phetioID
   * @constructor
   */
  function TScreenButton( button, phetioID ) {
    TNode.call( this, button, phetioID );
    assertInstanceOf( button, phet.scenery.VBox );
    toEventOnEmit(
      button.startedCallbacksForFiredEmitter,
      button.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TScreenButton,
      'fired' );
  }

  phetioInherit( TNode, 'TScreenButton', TScreenButton, {
    fire: {
      returnType: TVoid,
      parameterTypes: [],
      implementation: function() {
        this.instance.buttonModel.fire();
      },
      documentation: 'Fire the button\'s action, as if the button has been pressed and released'
    }
  }, {
    documentation: 'A pressable button in the simulation, in the home screen',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TScreenButton', TScreenButton );

  return TScreenButton;
} );

