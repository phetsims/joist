// Copyright 2024-2026, University of Colorado Boulder

/**
 * In this file:
 *
 * regionAndCultureProperty is a global Property used to set aspects of i18n that are related to region and/or culture,
 * but that do not pertain to language (see localeProperty for language).
 *
 * The type RegionAndCulture defines the complete set of choices for regionAndCultureProperty. The choices supported by
 * a sim are defined in package.json via "supportedRegionsAndCultures", and determines the value of
 * supportedRegionAndCultureValues. Whether included explicitly or implicitly, 'usa' is always choice, because it
 * is the fallback.
 *
 * The initial value of regionAndCultureProperty can be specified in package.json and via a query parameter.
 * In package.json, "defaultRegionAndCulture" identifies the initial choice, and defaults to 'usa'.
 * Use the ?regionAndCulture query parameter to override the default, for example ?regionAndCulture=asia
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';
import packageJSON from '../packageJSON.js';

export const DEFAULT_REGION_AND_CULTURE = 'usa';

// The complete set of valid values.
const RegionAndCultureValues = [

  // Inspired by the images and dress of the USA. Although many other countries may also identify with this choice,
  // as PhET being based in the USA, and having difficulty finding language that appropriately reflects all the regions
  // where that may match this value, it was decided to keep "United States of America" as the descriptor with the
  // understanding that other regions may identify with this choice.
  'usa',

  // Inspired by the images and dress of Africa.
  'africa',

  // Similar to 'africa', with adjustments to dress that is representative of more modest cultures.
  'africaModest',

  // Inspired by the images and dress of Asia.
  'asia',

  // Inspired by the images and dress of Latin America.
  'latinAmerica',

  // Inspired by the images and dress of Oceania.
  'oceania',

  // Randomly selects one of the other choices, but not the current choice.
  'random'

] as const;
export type RegionAndCulture = typeof RegionAndCultureValues[ number ];

// The subset of RegionAndCultureValues that is supported by the sim, specified via "supportedRegionsAndCultures" in package.json.
export const supportedRegionAndCultureValues: RegionAndCulture[] = _.uniq( [
  DEFAULT_REGION_AND_CULTURE, // Always supported, since it is our fallback.
  ...( packageJSON?.phet?.simFeatures?.supportedRegionsAndCultures || [] )
] );

assert && assert( _.every( supportedRegionAndCultureValues, value => RegionAndCultureValues.includes( value ) ),
  `unsupported value in packageJSON supportedRegionsAndCultures: ${supportedRegionAndCultureValues}` );

// Is the specified regionAndCulture supported at runtime?
const isSupportedRegionAndCulture = ( regionAndCulture?: RegionAndCulture ): boolean => {
  return !!( regionAndCulture && supportedRegionAndCultureValues.includes( regionAndCulture ) );
};

const regionAndCultureQueryParameter = window.phet.chipper.queryParameters.regionAndCulture;
const initialRegionAndCulture: RegionAndCulture = isSupportedRegionAndCulture( regionAndCultureQueryParameter ) ?
                                                  regionAndCultureQueryParameter : DEFAULT_REGION_AND_CULTURE;

class RegionAndCultureProperty extends Property<RegionAndCulture> {
  protected override unguardedSet( value: RegionAndCulture ): void {
    if ( isSupportedRegionAndCulture( value ) ) {
      super.unguardedSet( value );
    }
    else {
      assert && assert( false, 'Unsupported region-and-culture: ' + value );

      // Do not try to set if the value was invalid
    }
  }
}

const isInstrumented = supportedRegionAndCultureValues.length > 1;

const regionAndCultureProperty = new RegionAndCultureProperty( initialRegionAndCulture, {

  // Sorted so that changing the order of "supportedRegionsAndCultures" in package.json does not change the PhET-iO API.
  validValues: supportedRegionAndCultureValues.sort(),
  tandem: isInstrumented ? Tandem.GENERAL_MODEL.createTandem( 'regionAndCultureProperty' ) : Tandem.OPT_OUT,
  phetioFeatured: isInstrumented,
  phetioValueType: StringIO,
  phetioDocumentation: 'Describes how a region and culture will be portrayed in the sim.'
} );

joist.register( 'regionAndCultureProperty', regionAndCultureProperty );

export default regionAndCultureProperty;