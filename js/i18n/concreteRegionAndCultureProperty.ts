// Copyright 2024, University of Colorado Boulder

/**
 * Like regionAndCultureProperty, but excludes the "random" option, since it doesn't represent a concrete region and culture.
 * "random" means to randomly select one of the other choices that is supported by the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import joist from '../joist.js';
import regionAndCultureProperty, { RegionAndCulture, supportedRegionAndCultureValues } from './regionAndCultureProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';

// The complete set of RegionAndCulture values, minus 'random'.
export type ConcreteRegionAndCulture = Exclude<RegionAndCulture, 'random'>;

// The values supported by the sim at runtime, minus 'random'.
export const concreteRegionAndCultureValues: ConcreteRegionAndCulture[] =
  supportedRegionAndCultureValues.filter( regionAndCulture => regionAndCulture !== 'random' ) as ConcreteRegionAndCulture[];

// The previous value of concreteRegionAndCultureProperty.
let previousConcreteRegionAndCulture: ConcreteRegionAndCulture | null = null;

// When 'random' is selected, randomly select one of the other choices, but not the previous choice.
export const concreteRegionAndCultureProperty: TReadOnlyProperty<ConcreteRegionAndCulture> = new DerivedProperty(
  [ regionAndCultureProperty ], ( regionAndCulture => {

  const concreteRegionAndCulture = regionAndCulture === 'random' ? dotRandom.sample( supportedRegionAndCultureValues.filter( regionAndCulture => {
    return regionAndCulture !== 'random' && regionAndCulture !== previousConcreteRegionAndCulture;
  } ) ) as ConcreteRegionAndCulture : regionAndCulture;

  previousConcreteRegionAndCulture = concreteRegionAndCulture;

  return concreteRegionAndCulture;
} ) );

joist.register( 'concreteRegionAndCultureProperty', concreteRegionAndCultureProperty );

export default concreteRegionAndCultureProperty;