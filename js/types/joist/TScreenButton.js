// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );
  var TVoid = require( 'PHET_IO/types/TVoid' );

  var TScreenButton = phetioInherit( TNode, 'TScreenButton', function( button, phetioID ) {
    TNode.call( this, button, phetioID );
    assertInstanceOf( button, phet.scenery.VBox );
    toEventOnStatic( button, 'CallbacksForFired', 'user', phetioID, TScreenButton, 'fired' );
  }, {
    fire: {
      returnType: TVoid,
      parameterTypes: [],
      implementation: function() {

        // TODO: There are other button types there that this will fail, this works for TextButton/PushButtonModel
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

