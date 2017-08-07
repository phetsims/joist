// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var joist = require( 'JOIST/joist' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TPanel = require( 'SUN/TPanel' );

  /**
   * @constructor
   * Wrapper type for phet/joist's Dialog
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   */
  function TDialog( dialog, phetioID ) {
    TPanel.call( this, dialog, phetioID );
    assertInstanceOf( dialog, phet.joist.Dialog );
  }

  phetioInherit( TPanel, 'TDialog', TDialog, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'TDialog', TDialog );

  return TDialog;
} );
