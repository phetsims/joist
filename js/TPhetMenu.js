// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var joist = require( 'JOIST/joist' );
  var TNode = require( 'ifphetio!PHET_IO/types/scenery/nodes/TNode' );

  /**
   * Wrapper type for phet/joist's PhetMenu
   * @param phetMenu
   * @param phetioID
   * @constructor
   */
  function TPhetMenu( phetMenu, phetioID ) {
    TNode.call( this, phetMenu, phetioID );
    assertInstanceOf( phetMenu, phet.joist.PhetMenu );
  }

  phetioInherit( TNode, 'TPhetMenu', TPhetMenu, {}, {
    documentation: 'The PhET Menu in the bottom right of the screen',
    event: [ 'fired' ]
  } );

  joist.register( 'TPhetMenu', TPhetMenu );

  return TPhetMenu;
} );

