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
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );

  /**
   * Wrapper type for phet/joist's PhetButton class.
   * @param phetButton
   * @param phetioID
   * @constructor
   */
  function TPhetButton( phetButton, phetioID ) {
    assertInstanceOf( phetButton, phet.joist.PhetButton );
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
    }
  }, {
    documentation: 'A pressable PhET logo in the simulation, it usually opens the PhET menu.'
  } );

  joist.register( 'TPhetButton', TPhetButton );

  return TPhetButton;
} );