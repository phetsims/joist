// Copyright 2017, University of Colorado Boulder

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
  var TNode = require( 'SCENERY/nodes/TNode' );

  /**
   * @constructor
   * Wrapper type for phet/joist's Dialog
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   */
  function TDialog( dialog, phetioID ) {
    TNode.call( this, dialog, phetioID );
    assertInstanceOf( dialog, phet.joist.Dialog );
  }

  phetioInherit( TNode, 'TDialog', TDialog, {}, {
    documentation: 'A dialog panel'
  } );

  joist.register( 'TDialog', TDialog );

  return TDialog;
} );
