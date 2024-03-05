// Copyright 2024, University of Colorado Boulder

/**
 * A universal region-and-culture Property that is accessible independently of the running Sim instance.
 *
 * Region and culture is a preference supported by PreferencesModel and query parameters. The supported region and
 * cultures for a sim are defined by the package.json object for the sim.
 *
 * Using the `regionAndCulture` query parameter:
 * The sim will set the value of the query parameter as the selected region and culture in preferences as long as the
 * option provided is supported by the sim. If the option provided is not supported by the sim a warning dialogue will
 * be shown at start-up. The available option are defined in code below.
 *
 *   Example: `?regionAndCulture=asia`
 *
 * As of 12/2023 the following are supported Region and Culture options and short descriptions of each:
 *  Africa: Portrayals of people, places, or objects that are inspired by the images and dress of the African region.
 *
 *  Africa (Modest): Similar portrayals to the Africa option, with adjustments to clothing or garb that is representative
 *  of more modest cultures in the region.
 *
 *  Asia: Portrayals of people, places, or objects that are inspired by the images and dress of the Asian region.
 *
 *  Latin America: Portrayals of people, places, or objects that are inspired by the images and dress of the Latin
 *  American region.
 *
 *  Multicultural: This option selects a random region/culture at startup to display as the default option for the sim.
 *  This means that a different portrayal will be set as the default for each refresh, but will remain the same through
 *  reset and any other sim interactions.
 *
 *  Oceania: Portrayals of people, places, or objects that are inspired by the images and dress of the Oceania region.
 *
 *  United States of America: Portrayals of people, places, or objects inspired by the images and dress of the United
 *  States of America. Although many other countries may also reflect this portrayal, as PhET being based in the USA, and
 *  having difficulty finding language that appropriately reflects all the regions where portrayals may match it was
 *  decided to keep "United States of America" as the descriptor with the understanding that other regions may see
 *  themselves reflected in the portrayals.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
  'usa',
  'africa',
  'africaModest',
  'asia',
  'latinAmerica',
  'oceania',
  'multi'
] as const;
export type RegionAndCulture = typeof RegionAndCultureValues[ number ];

// The subset of RegionAndCultureValues that is supported by the sim, specified via "supportedRegionsAndCultures" in package.json.
export const supportedRegionAndCultureValues: RegionAndCulture[] = _.uniq( [
  DEFAULT_REGION_AND_CULTURE, // Always supported, since it is our fallback.
  ...( packageJSON?.phet?.simFeatures?.supportedRegionsAndCultures || [] )
].filter( regionAndCulture => RegionAndCultureValues.includes( regionAndCulture ) ) );

// Is the specified regionAndCulture supported at runtime?
const isSupportedRegionAndCulture = ( regionAndCulture?: RegionAndCulture ): boolean => {
  return !!( regionAndCulture && supportedRegionAndCultureValues.includes( regionAndCulture ) );
};

const initialRegionAndCulture: RegionAndCulture = window.phet.chipper.queryParameters.regionAndCulture;
assert && assert( isSupportedRegionAndCulture( initialRegionAndCulture ),
  `Unsupported value for query parameter ?regionAndCulture: ${initialRegionAndCulture}` );

// Globally available, similar to phet.chipper.locale, for things that might read this (e.g. from puppeteer in the future).
phet.chipper.regionAndCulture = initialRegionAndCulture;

class RegionAndCultureProperty extends Property<RegionAndCulture> {
  protected override unguardedSet( value: RegionAndCulture ): void {
    if ( supportedRegionAndCultureValues.includes( value ) ) {
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
  tandem: isInstrumented ? Tandem.GENERAL_MODEL.createTandem( 'regionAndCultureProperty' ) : Tandem.OPT_OUT,
  phetioFeatured: isInstrumented,
  phetioValueType: StringIO,
  validValues: supportedRegionAndCultureValues,
  phetioDocumentation: 'Describes how a region and culture will be portrayed in the sim.'
} );

joist.register( 'regionAndCultureProperty', regionAndCultureProperty );

export default regionAndCultureProperty;
