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
  var TButton = require( 'PHET_IO/types/sun/buttons/TButton' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var TMenuItem = require( 'PHET_IO/types/joist/TMenuItem' );

  var TPhetMenu = phetioInherit( TNode, 'TPhetMenu', function( phetMenu, phetioID ) {
    TButton.call( this, phetMenu, phetioID );
    assertInstanceOf( phetMenu, phet.joist.PhetMenu );
  }, {}, {
    api: {
      aboutButton: TMenuItem,
      fullScreenButton: TMenuItem,
      phetWebsiteButton: TMenuItem,
      reportAProblemButton: TMenuItem,
      screenshotMenuItem: TMenuItem,
      optionsButton: TMenuItem
    },
    documentation: 'The PhET Menu in the bottom right of the screen'
  } );

  phetioNamespace.register( 'TPhetMenu', TPhetMenu );

  return TPhetMenu;
} );

