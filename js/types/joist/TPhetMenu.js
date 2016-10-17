// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TPushButton = require( 'PHET_IO/types/sun/buttons/TPushButton' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  function TPhetMenu( phetMenu, phetioID ) {
    TPushButton.call( this, phetMenu, phetioID );
    assertInstanceOf( phetMenu, phet.joist.PhetMenu );
  }

  phetioInherit( TNode, 'TPhetMenu', TPhetMenu, {}, {
    documentation: 'The PhET Menu in the bottom right of the screen'
  } );

  phetioNamespace.register( 'TPhetMenu', TPhetMenu );

  return TPhetMenu;
} );

