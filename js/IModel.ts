// Copyright 2022, University of Colorado Boulder

/**
 * The model type for Sim.ts must have a step function.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type IModel = {
  step: ( dt: number ) => void;
};

export default IModel;