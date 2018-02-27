// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for Dialog
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // phet-io modules
  var joist = require( 'JOIST/joist' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  
  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's Dialog
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   * @constructor
   */
  function DialogIO( dialog, phetioID ) {
    assert && assertInstanceOf( dialog, phet.joist.Dialog );
    NodeIO.call( this, dialog, phetioID );
  }

  phetioInherit( NodeIO, 'DialogIO', DialogIO, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'DialogIO', DialogIO );

  return DialogIO;
} );
