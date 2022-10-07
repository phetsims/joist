// Copyright 2022, University of Colorado Boulder

/**
 * The model type for Sim.ts must have a reset function and if it has a step function, it must have this signature:
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type TModel = {
  step?: ( dt: number ) => void;
  reset: () => void;
};

export default TModel;