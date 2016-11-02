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
  var TPanel = require( 'PHET_IO/types/sun/TPanel' );

  /**
   * @constructor
   *
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   */
  function TDialog( dialog, phetioID ) {
    TPanel.call( this, dialog, phetioID );
    assertInstanceOf( dialog, phet.sun.Panel );
  }

  phetioInherit( TPanel, 'TDialog', TDialog, {}, {
    documentation: 'A dialog panel'
  } );

  phetioNamespace.register( 'TDialog', TDialog );

  return TDialog;
} );
