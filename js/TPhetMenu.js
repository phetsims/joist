// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/joist's PhetMenu
   * @param phetMenu
   * @param phetioID
   * @constructor
   */
  function TPhetMenu( phetMenu, phetioID ) {
    assertInstanceOf( phetMenu, phet.joist.PhetMenu );
    TNode.call( this, phetMenu, phetioID );
  }

  phetioInherit( TNode, 'TPhetMenu', TPhetMenu, {}, {
    documentation: 'The PhET Menu in the bottom right of the screen',
    event: [ 'fired' ]
  } );

  joist.register( 'TPhetMenu', TPhetMenu );

  return TPhetMenu;
} );

