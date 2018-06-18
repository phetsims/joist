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
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var NullableIO = require( 'ifphetio!PHET_IO/types/NullableIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/joist's PhetButton
   * @param {PhetButton} phetButton
   * @param {string} phetioID
   * @constructor
   */
  function PhetButtonIO( phetButton, phetioID ) {
    assert && assertInstanceOf( phetButton, phet.joist.PhetButton );
    ObjectIO.call( this, phetButton, phetioID );

    // The PhetButtonIO acts as the main phet-io branding/logo in the sim. It doesn't inherit from NodeIO because we don't
    // all of NodeIO's interactive methods, nor do we want to support maintaining overriding no-ops in this file
    // see https://github.com/phetsims/scenery/issues/711 for more info.
    var pickableProperty = new Property( phetButton.pickable, {
      tandem: phetButton.tandem.createTandem( 'pickableProperty' ),
      phetioType: PropertyIO( NullableIO( BooleanIO ) ),
      phetioInstanceDocumentation: 'Set whether the phetButton will be pickable (and hence interactive), see the NodeIO documentation for more details.'
    } );
    pickableProperty.link( function( pickable ) { phetButton.pickable = pickable; } );
    phetButton.on( 'pickability', function() { pickableProperty.value = phetButton.pickable; } );

    // @private
    this.disposePhetButtonIO = function() {
      pickableProperty.dispose();
    };
  }

  phetioInherit( ObjectIO, 'PhetButtonIO', PhetButtonIO, {

    /**
     * @public - called by PhetioObject when the wrapper is done
     */
    dispose: function() {
      this.disposePhetButtonIO();
    }
  }, {
    documentation: 'The PhET Button in the bottom right of the screen',
    events: [ 'fired' ]
  } );

  joist.register( 'PhetButtonIO', PhetButtonIO );

  return PhetButtonIO;
} );

