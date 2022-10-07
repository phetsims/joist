// Copyright 2022, University of Colorado Boulder

/**
 * The model type for Sim.ts must have a reset function and if it has a step function, it must have this signature.
 * See https://github.com/phetsims/joist/issues/861 for the origins and design history of TModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type TModel = {
  step?: ( dt: number ) => void;
  reset: () => void;
};

export default TModel;