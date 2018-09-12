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
  var NodeProperty = require( 'SCENERY/util/NodeProperty' );
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
    // Note that this code is duplicated with similar code in NodeIO
    var pickableProperty = new NodeProperty( phetButton, 'pickability', 'pickable', {

      // pick the following values from the parent Node
      phetioReadOnly: phetButton.phetioReadOnly,
      phetioState: phetButton.phetioState,

      tandem: phetButton.tandem.createTandem( 'pickableProperty' ),
      phetioType: PropertyIO( NullableIO( BooleanIO ) ),
      phetioInstanceDocumentation: 'Set whether the phetButton will be pickable (and hence interactive), see the NodeIO documentation for more details'
    } );

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

    /**
     * See NodeIO.toStateObject
     * @returns {undefined} - We don't use null because other types want that value in the state, see `NullableIO` for example.
     * @override
     */
    toStateObject: function() {
      return undefined;
    },

    /**
     * See NodeIO.fromStateObject
     * @param {Node} o
     * @returns {Object}
     * @override - to prevent attempted JSON serialization of circular Node
     */
    fromStateObject: function( o ) {
      return o; // Pass through values defined by subclasses, such as AquaRadioButtonIO.enabled
    }
  } );

  joist.register( 'PhetButtonIO', PhetButtonIO );

  return PhetButtonIO;
} );

