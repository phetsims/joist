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
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's ScreenButton
   * @param {NavigationBarScreenButton} button
   * @param {string} phetioID
   * @constructor
   */
  function NavigationBarScreenButtonIO( button, phetioID ) {
    assert && assertInstanceOf( button, phet.joist.NavigationBarScreenButton );
    NodeIO.call( this, button, phetioID );
  }

  phetioInherit( NodeIO, 'NavigationBarScreenButtonIO', NavigationBarScreenButtonIO, {}, {
    documentation: 'A pressable button in the simulation, in the home screen',
    events: [ 'fired' ]
  } );

  joist.register( 'NavigationBarScreenButtonIO', NavigationBarScreenButtonIO );

  return NavigationBarScreenButtonIO;
} );

