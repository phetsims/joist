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
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );


  /**
   * Wrapper type for phet/joist's MenuItem
   * @param menuItem
   * @param phetioID
   * @constructor
   */
  function TMenuItem( menuItem, phetioID ) {
    TNode.call( this, menuItem, phetioID );

    // Menu item from Joist, it is defined in PhetMenu.js and does not have its own type
    assertInstanceOf( menuItem, phet.scenery.Node );

    toEventOnStatic( menuItem, 'CallbacksForFired', 'user', phetioID, TMenuItem, 'fired' );

  }

  phetioInherit( TNode, 'TMenuItem', TMenuItem, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: TNode.events
  } );

  phetioNamespace.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );

