// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for OptionsDialog
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var DialogIO = require( 'SUN/DialogIO' );
  var joist = require( 'JOIST/joist' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's OptionsDialog
   * @param {OptionsDialog} optionsDialog - instance of OptionsDialog
   * @param {string} phetioID - identifier string
   * @constructor
   */
  function OptionsDialogIO( optionsDialog, phetioID ) {
    assert && assertInstanceOf( optionsDialog, phet.joist.OptionsDialog );
    DialogIO.call( this, optionsDialog, phetioID );
  }

  phetioInherit( DialogIO, 'OptionsDialogIO', OptionsDialogIO, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'OptionsDialogIO', OptionsDialogIO );

  return OptionsDialogIO;
} );
