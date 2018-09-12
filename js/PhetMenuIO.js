// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for PhetMenu
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's PhetMenu
   * @param {PhetMenu} phetMenu
   * @param {string} phetioID
   * @constructor
   */
  function PhetMenuIO( phetMenu, phetioID ) {
    assert && assertInstanceOf( phetMenu, phet.joist.PhetMenu );
    ObjectIO.call( this, phetMenu, phetioID );
  }

  // don't inherit from NodeIO so that its visibility can't be changed
  phetioInherit( ObjectIO, 'PhetMenuIO', PhetMenuIO, {}, {
    documentation: 'The PhET Menu in the bottom right of the screen'
  } );

  joist.register( 'PhetMenuIO', PhetMenuIO );

  return PhetMenuIO;
} );

