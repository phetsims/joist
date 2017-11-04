// Copyright 2017, University of Colorado Boulder

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

  /**
   * Wrapper type for phet/joist's ScreenButton
   * @param button
   * @param phetioID
   * @constructor
   */
  function TScreenButton( button, phetioID ) {
    assert && assertInstanceOf( button, phet.joist.ScreenButton );
    TNode.call( this, button, phetioID );
  }

  phetioInherit( TNode, 'TScreenButton', TScreenButton, {}, {
    documentation: 'A pressable button in the simulation, in the home screen',
    events: [ 'fired' ]
  } );

  joist.register( 'TScreenButton', TScreenButton );

  return TScreenButton;
} );

