// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TDialog = require( 'PHET_IO/types/joist/TDialog' );

  /**
   * @constructor
   * Wrapper type for phet/joist's OptionsDialog
   * @param {Dialog} dialog - instance of OptionsDialog
   * @param {string} phetioID - identifier string
   */
  function TOptionsDialog( dialog, phetioID ) {
    TDialog.call( this, dialog, phetioID );
    assertInstanceOf( dialog, phet.sun.Panel );
  }

  phetioInherit( TDialog, 'TOptionsDialog', TOptionsDialog, {}, {
    documentation: 'A dialog panel'
  } );

  phetioNamespace.register( 'TOptionsDialog', TOptionsDialog );

  return TOptionsDialog;
} );
