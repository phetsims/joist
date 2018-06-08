// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for JoistButton
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's PhetButton class.
   * @param {JoistButton} phetButton
   * @param {string} phetioID
   * @constructor
   */
  function JoistButtonIO( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.JoistButton );
    NodeIO.call( this, phetButton, phetioID );
  }

  phetioInherit( NodeIO, 'JoistButtonIO', JoistButtonIO, {}, {
    events: [ 'fired' ],
    documentation: 'A button in the joist framework'
  } );

  joist.register( 'JoistButtonIO', JoistButtonIO );

  return JoistButtonIO;
} );