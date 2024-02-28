// Copyright 2024, University of Colorado Boulder

/**
 * Like regionAndCultureProperty, but excludes the "multi" option, since it doesn't represent a concrete region and culture.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import joist from '../joist.js';
import regionAndCultureProperty, { availableRuntimeRegionAndCultures, RegionAndCulture } from './regionAndCultureProperty.js';
import { DerivedProperty, TReadOnlyProperty } from '../../../axon/js/imports.js';
import { dotRandom } from '../../../dot/js/imports.js';

export type ConcreteRegionAndCulture = Exclude<RegionAndCulture, 'multi'>;

export const availableConcreteRegionAndCultures: ConcreteRegionAndCulture[] = availableRuntimeRegionAndCultures.filter( regionAndCulture => regionAndCulture !== 'multi' ) as ConcreteRegionAndCulture[];

export const concreteRegionAndCultureProperty: TReadOnlyProperty<ConcreteRegionAndCulture> = new DerivedProperty( [
  regionAndCultureProperty
], ( regionAndCulture => {
  return regionAndCulture === 'multi' ? dotRandom.sample( availableRuntimeRegionAndCultures.filter( regionAndCulture => {
    return regionAndCulture !== 'multi' && regionAndCulture !== concreteRegionAndCultureProperty.value;
  } ) ) : regionAndCulture;
} ), {
  strictAxonDependencies: false
} ) as TReadOnlyProperty<ConcreteRegionAndCulture>;

joist.register( 'concreteRegionAndCultureProperty', concreteRegionAndCultureProperty );

export default concreteRegionAndCultureProperty;
