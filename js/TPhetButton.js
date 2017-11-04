// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var joist = require( 'JOIST/joist' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TFunctionWrapper = require( 'ifphetio!PHET_IO/types/TFunctionWrapper' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );

  /**
   * Wrapper type for phet/joist's PhetButton class.
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TPhetButton( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.PhetButton );
    TObject.call( this, phetButton, phetioID );
  }

  phetioInherit( TObject, 'TPhetButton', TPhetButton, {
    setPickable: {
      returnType: TVoid,
      parameterTypes: [ TBoolean ],
      implementation: function( pickable ) {
        this.instance.setPickable( pickable );
      },
      documentation: 'Set whether the phet button will be pickable (and hence interactive)'
    },
    isPickable: {
      returnType: TBoolean,
      parameterTypes: [ TVoid ],
      implementation: function() {
        return this.instance.isPickable();
      },
      documentation: 'Get whether the phet button will be pickable (and hence interactive)'
    },
    addPickableListener: {
      returnType: TVoid,
      parameterTypes: [ TFunctionWrapper( TVoid, [ TBoolean ] ) ],
      implementation: function( callback ) {
        var inst = this.instance;
        this.instance.on( 'pickability', function() {
          callback( inst.isPickable() );
        } );
      },
      documentation: 'Adds a listener for when pickability of the PhetButton changes'
    }
  }, {
    documentation: 'A pressable PhET logo in the simulation, it usually opens the PhET menu.',

    /**
     * Encodes a PhetButton instance to a state.
     * @param {Object} instance
     * @returns {Object} - a state object
     */
    toStateObject: function( instance ) {
      return { pickable: instance.pickable };
    },

    /**
     * Decodes a state into a PhetButton.
     * @param {Object} stateObject
     * @returns {Object}
     */
    fromStateObject: function( stateObject ) {
      return stateObject;
    },

    /**
     * Used to set the value of the instance when loading a state
     * @param {PhetButton} instance
     * @param {Object} stateObject
     */
    setValue: function( instance, stateObject ) {
      instance.pickable = stateObject.pickable;
    }
  } );

  joist.register( 'TPhetButton', TPhetButton );

  return TPhetButton;
} );