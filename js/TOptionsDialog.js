// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TDialog = require( 'JOIST/TDialog' );

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
  function TOptionsDialog( dialog, phetioID ) {
    assert && assertInstanceOf( dialog, phet.joist.OptionsDialog );
    TDialog.call( this, dialog, phetioID );
  }

  phetioInherit( TDialog, 'TOptionsDialog', TOptionsDialog, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'TOptionsDialog', TOptionsDialog );

  return TOptionsDialog;
} );
