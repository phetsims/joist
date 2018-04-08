// Copyright 2018, University of Colorado Boulder

/**
 * IO type for PhetButton, to interface with phet-io api.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var JoistButtonIO = require( 'JOIST/JoistButtonIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var NumberIO = require( 'ifphetio!PHET_IO/types/NumberIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * IO type for phet/joist's PhetButton
   * @param {PhetButton} phetButton
   * @param {string} phetioID
   * @constructor
   */
  function PhetButtonIO( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.PhetButton );
    JoistButtonIO.call( this, phetButton, phetioID );
  }

  // The PhetButtonIO acts as the main phet-io branding/logo in the sim. Override most of NodeIO's api functions so
  // this logo cannot be covered up, made invisible, or removed by the client, see https://github.com/phetsims/joist/issues/453
  phetioInherit( JoistButtonIO, 'PhetButtonIO', PhetButtonIO, {

    detach: {
      returnType: VoidIO,
      parameterTypes: [],
      implementation: function() {},
      documentation: 'No op override function for the NodeIO.detach method.'
    },
    isVisible: {
      returnType: BooleanIO,
      parameterTypes: [],
      implementation: function() {},
      documentation: 'No op override function for the NodeIO.isVisible method.'
    },

    setVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( bool ) {},
      documentation: 'No op override function for the NodeIO.setVisible method.'
    },

    addVisibleListener: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [ BooleanIO ] ) ],
      implementation: function( bool ) {}, // eslint-disable-line
      documentation: 'No op override function for the NodeIO.addVisibleListener method.'
    },

    setOpacity: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( num ) {}, // eslint-disable-line
      documentation: 'No op override function for the NodeIO.setOpacity method.'
    },

    setRotation: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( num ) {}, // eslint-disable-line
      documentation: 'No op override function for the NodeIO.setRotation method.'
    }


  }, {
    documentation: 'The PhET Button in the bottom right of the screen',
    event: [ 'fired' ]
  } );

  joist.register( 'PhetButtonIO', PhetButtonIO );

  return PhetButtonIO;
} );

