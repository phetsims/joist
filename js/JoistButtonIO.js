// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var joist = require( 'JOIST/joist' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
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

  phetioInherit( ObjectIO, 'JoistButtonIO', JoistButtonIO, {}, {
    events: [ 'fired' ],
    documentation: 'A button in the joist framework'
  } );

  joist.register( 'JoistButtonIO', JoistButtonIO );

  return JoistButtonIO;
} );