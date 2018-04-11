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

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var NullableIO = require( 'ifphetio!PHET_IO/types/NullableIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
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
    ObjectIO.call( this, phetButton, phetioID );
  }

  // The PhetButtonIO acts as the main phet-io branding/logo in the sim. It doesn't inherit from NodeIO because we don't
  // all of NodeIO's interactive methods, nor do we want to support maintaining overriding no-ops in this file
  // see https://github.com/phetsims/scenery/issues/711 for more info.
  phetioInherit( ObjectIO, 'PhetButtonIO', PhetButtonIO, {

    setPickable: {
      returnType: VoidIO,
      parameterTypes: [ NullableIO( BooleanIO ) ],
      implementation: function( pickable ) {
        this.instance.pickable = pickable;
      },
      documentation: 'Set whether the node will be pickable (and hence interactive)'
    },

    isPickable: {
      returnType: BooleanIO,
      parameterTypes: [],
      implementation: function() {
        return this.instance.pickable;
      },
      documentation: 'Gets whether the node is pickable (and hence interactive)'
    },

    addPickableListener: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [ BooleanIO ] ) ],
      implementation: function( callback ) {
        var inst = this.instance;
        this.instance.on( 'pickability', function() {
          callback( inst.isPickable() );
        } );
      },
      documentation: 'Adds a listener for when pickability of the node changes'
    }
  }, {
    documentation: 'The PhET Button in the bottom right of the screen',
    events: [ 'fired' ]
  } );

  joist.register( 'PhetButtonIO', PhetButtonIO );

  return PhetButtonIO;
} );

