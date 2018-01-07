// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for ScreenButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's ScreenButton
   * @param {ScreenButton} button
   * @param {string} phetioID
   * @constructor
   */
  function ScreenButtonIO( button, phetioID ) {
    assert && assertInstanceOf( button, phet.joist.ScreenButton );
    NodeIO.call( this, button, phetioID );
  }

  phetioInherit( NodeIO, 'ScreenButtonIO', ScreenButtonIO, {}, {
    documentation: 'A pressable button in the simulation, in the home screen',
    events: [ 'fired' ]
  } );

  joist.register( 'ScreenButtonIO', ScreenButtonIO );

  return ScreenButtonIO;
} );

