// Copyright 2018-2020, University of Colorado Boulder

/**
 * IO type for PhetButton, to interface with phet-io api.  The PhetButtonIO acts as the main phet-io branding/logo in
 * the sim. It doesn't inherit from NodeIO because we neither need all of NodeIO's API methods, nor do we want to
 * support maintaining overriding no-ops in this file see https://github.com/phetsims/scenery/issues/711 for more info.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PropertyIO from '../../axon/js/PropertyIO.js';
import NodeProperty from '../../scenery/js/util/NodeProperty.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import joist from './joist.js';

class PhetButtonIO extends ObjectIO {
  constructor( phetButton, phetioID ) {
    super( phetButton, phetioID );

    // This code is similar to code in NodeIO, but it is not customizable through phetioComponentOptions because all
    // instances have the same level of instrumentation.
    const pickableProperty = new NodeProperty( phetButton, 'pickability', 'pickable', {

      // pick the following values from the parent Node
      phetioReadOnly: phetButton.phetioReadOnly,
      tandem: phetButton.tandem.createTandem( 'pickableProperty' ),
      phetioType: PropertyIO( NullableIO( BooleanIO ) ),
      phetioDocumentation: 'Set whether the phetButton will be pickable (and hence interactive), see the NodeIO documentation for more details'
    } );

    // @private
    this.disposePhetButtonIO = function() {
      pickableProperty.dispose();
    };
  }

  /**
   * @public - called by PhetioObject when the wrapper is done
   */
  dispose() {
    this.disposePhetButtonIO();
  }

  /**
   * See NodeIO.toStateObject
   * @returns {undefined} - We don't use null because other types want that value in the state, see `NullableIO` for example.
   * @override
   */
  static toStateObject() {
    return undefined;
  }

  /**
   * See NodeIO.fromStateObject
   * @param {Node} o
   * @returns {Object}
   * @override - to prevent attempted JSON serialization of circular Node
   */
  static fromStateObject( o ) {
    return o; // Pass through values defined by subclasses
  }
}

PhetButtonIO.documentation = 'The PhET Button in the bottom right of the screen';
PhetButtonIO.validator = { isValidValue: v => v instanceof phet.joist.PhetButton };
PhetButtonIO.typeName = 'PhetButtonIO';
ObjectIO.validateSubtype( PhetButtonIO );

joist.register( 'PhetButtonIO', PhetButtonIO );
export default PhetButtonIO;