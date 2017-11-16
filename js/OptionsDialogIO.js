// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var DialogIO = require( 'JOIST/DialogIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var joist = require( 'JOIST/joist' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * @constructor
   * Wrapper type for phet/joist's OptionsDialog
   * @param {Dialog} dialog - instance of OptionsDialog
   * @param {string} phetioID - identifier string
   */
  function OptionsDialogIO( dialog, phetioID ) {
    assert && assertInstanceOf( dialog, phet.joist.OptionsDialog );
    DialogIO.call( this, dialog, phetioID );
  }

  phetioInherit( DialogIO, 'OptionsDialogIO', OptionsDialogIO, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'OptionsDialogIO', OptionsDialogIO );

  return OptionsDialogIO;
} );
