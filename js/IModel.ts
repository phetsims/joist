// Copyright 2022, University of Colorado Boulder

import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';

/**
 * The model type for Sim.ts may or may not have a step function. If it does have a step function, it
 * has the signature listed here.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type IModel = {
  step: ( dt: number ) => void;
} | ( IntentionalAny & {
  step: never;
} );

export default IModel;