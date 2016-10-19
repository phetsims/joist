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
  var TPushButton = require( 'PHET_IO/types/sun/buttons/TPushButton' );

  function TMenuItem( menuItem, phetioID ) {
    TPushButton.call( this, menuItem, phetioID );

    // Menu item from Joist, it is defined in PhetMenu.js and does not have its own type
    assertInstanceOf( menuItem, phet.scenery.Node );
  }

  phetioInherit( TPushButton, 'TMenuItem', TMenuItem, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: TPushButton.events
  } );

  phetioNamespace.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );

