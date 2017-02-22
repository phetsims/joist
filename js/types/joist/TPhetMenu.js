// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );


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

  phetioNamespace.register( 'TPhetMenu', TPhetMenu );

  return TPhetMenu;
} );

