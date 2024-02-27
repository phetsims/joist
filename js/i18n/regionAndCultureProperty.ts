// Copyright 2022-2024, University of Colorado Boulder

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
 */

import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';
import packageJSON from '../packageJSON.js';

export const DEFAULT_REGION_AND_CULTURE = 'usa';

export const availableRegionAndCultures = [
  // raw list, because we have this strongly typed
  'usa',
  'africa',
  'africaModest',
  'asia',
  'latinAmerica',
  'oceania',
  'multi'
] as const;
export type RegionAndCulture = typeof availableRegionAndCultures[ number ];

// All available region-and-cultures for the runtime
export const availableRuntimeRegionAndCultures: RegionAndCulture[] = _.uniq( [
  // Always available, since it is our fallback
  DEFAULT_REGION_AND_CULTURE,

  ...( packageJSON?.phet?.simFeatures?.supportedRegionsAndCultures || [] )
].filter( regionAndCulture => availableRegionAndCultures.includes( regionAndCulture ) ) );

const isRegionAndCultureValid = ( regionAndCulture?: RegionAndCulture ): boolean => {
  return !!( regionAndCulture && availableRuntimeRegionAndCultures.includes( regionAndCulture ) );
};

const initialRegionAndCulture: RegionAndCulture = window.phet.chipper.queryParameters.regionAndCulture;

assert && assert( isRegionAndCultureValid( initialRegionAndCulture ),
  `invalid query parameter value for ?regionAndCulture: ${initialRegionAndCulture}` );

// Tagging similar to phet.chipper.locale, for things that might read this (e.g. from puppeteer in the future)
phet.chipper.regionAndCulture = initialRegionAndCulture;

class RegionAndCultureProperty extends Property<RegionAndCulture> {
  protected override unguardedSet( value: RegionAndCulture ): void {
    if ( availableRuntimeRegionAndCultures.includes( value ) ) {
      super.unguardedSet( value );
    }
    else {
      assert && assert( false, 'Unsupported region-and-culture: ' + value );

      // Do not try to set if the value was invalid
    }
  }
}

const isInstrumented = availableRuntimeRegionAndCultures.length > 1;

const regionAndCultureProperty = new RegionAndCultureProperty( initialRegionAndCulture, {
  tandem: isInstrumented ? Tandem.GENERAL_MODEL.createTandem( 'regionAndCultureProperty' ) : Tandem.OPT_OUT,
  phetioFeatured: isInstrumented,
  phetioValueType: StringIO,
  validValues: availableRuntimeRegionAndCultures,
  phetioDocumentation: 'Specifies language currently displayed in the simulation'
} );

joist.register( 'regionAndCultureProperty', regionAndCultureProperty );

export default regionAndCultureProperty;
