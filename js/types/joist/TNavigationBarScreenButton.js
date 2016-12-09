// Copyright 2016, University of Colorado Boulder

/**
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
   * Wrapper type for phet/sun's PushButton class.
   * @param navBarScreenButton
   * @param phetioID
   * @constructor
   */
  function TNavigationBarScreenButton( navBarScreenButton, phetioID ) {
    TNode.call( this, navBarScreenButton, phetioID );

    assertInstanceOfTypes( navBarScreenButton, [
      phet.joist.NavigationBarScreenButton
    ] );

    assert && assert( navBarScreenButton.buttonModel.startedCallbacksForFiredEmitter, 'button models should use emitters' );
      toEventOnEmit( navBarScreenButton.buttonModel.startedCallbacksForFiredEmitter, navBarScreenButton.buttonModel.endedCallbacksForFiredEmitter, 'user', phetioID, TNavigationBarScreenButton, 'fired' );
  }

  phetioInherit( TNode, 'TNavigationBarScreenButton', TNavigationBarScreenButton, {} , {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TNavigationBarScreenButton', TNavigationBarScreenButton );

  return TNavigationBarScreenButton;
} );