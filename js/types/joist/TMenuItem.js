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

  var TMenuItem = phetioInherit( TButton, 'TMenuItem', function( menuItem, phetioID ) {
    TButton.call( this, menuItem, phetioID );
    assertInstanceOf( menuItem, phet.scenery.Node ); // Menu item from Joist // TODO: be more specific about this type
  }, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: TButton.events
  } );

  phetioNamespace.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );

