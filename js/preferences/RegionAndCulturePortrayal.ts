// Copyright 2022-2023, University of Colorado Boulder

/**
 * A base class for animated character portrayals used in representing region and culture preferences. Region and culture
 * is a preference supported by PreferencesModel and query parameters. The supported region and culture instances for a
 * sim are defined by the package.json object for the sim.
 *
 * How to add character sets to your sim:
 * 1. Add the supported regions and cultures to package.json. Ex. ( supportedRegionsAndCultures: [ 'usa', 'africa', 'asia' ] )
 *    The first element in the array will be the default value of the query parameter.
 * 2. Create a RegionAndCulturePortrayal instance for each supported region and culture. Generally a subclass is needed
 *    to extend the RegionAndCulturePortrayal class in order to add full support for the types of characters or poses
 *    each set may have.
 * 3. All RegionAndCulturePortrayal instances should be gathered as an array and added to the PreferencesModel
 *    localizationOptions.characterSets. The order of the array will be the display order of the regionsAndCultures
 *    displayed in the comboBox. It is advised that your characterSets array matches the order of the
 *    supportedRegionsAndCultures array.
 * 4. Implement the character sets in the sim by listening to and using localizationModel.regionAndCulturePortrayalProperty
 *    in your PreferencesModel instance. This step is dependent on the sim and how it uses character sets. There is
 *    no "one size fits all" implementation.
 *
 * Note: To support PhET-iO and preferences correctly, RegionAndCulturePortayal instances should be created statically.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import joist from '../joist.js';
import LocalizedStringProperty from '../../../chipper/js/LocalizedStringProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO, { ReferenceIOState } from '../../../tandem/js/types/ReferenceIO.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import packageJSON from '../packageJSON.js';

type SelfOptions = EmptySelfOptions;
export type RegionAndCulturePortrayalOptions = SelfOptions & PhetioObjectOptions;

// Constants used for each supported region/culture
export const USA_REGION_AND_CULTURE_ID = 'usa';
export const AFRICA_REGION_AND_CULTURE_ID = 'africa';
export const AFRICA_MODEST_REGION_AND_CULTURE_ID = 'africaModest';
export const ASIA_REGION_AND_CULTURE_ID = 'asia';
export const LATIN_AMERICA_REGION_AND_CULTURE_ID = 'latinAmerica';
export const OCEANIA_REGION_AND_CULTURE_ID = 'oceania';
export const MULTICULTURAL_REGION_AND_CULTURE_ID = 'multi';

// The superset list of all regions and cultures supported by any sim. ALL values used by any sim must be in this list.
const SUPPORTED_REGIONS_AND_CULTURES = [
  USA_REGION_AND_CULTURE_ID,
  AFRICA_REGION_AND_CULTURE_ID,
  AFRICA_MODEST_REGION_AND_CULTURE_ID,
  ASIA_REGION_AND_CULTURE_ID,
  LATIN_AMERICA_REGION_AND_CULTURE_ID,
  OCEANIA_REGION_AND_CULTURE_ID,
  MULTICULTURAL_REGION_AND_CULTURE_ID
];

const isSupportedRegionAndCulture = ( regionAndCulture: string ): boolean => SUPPORTED_REGIONS_AND_CULTURES.includes( regionAndCulture );


// The value of the query parameter
const regionAndCultureQueryParameter = window.phet.chipper.queryParameters.regionAndCulture;

// Assert the query parameter before the simFeatures list because it is more contextual (since it was manually provided
// in this runtime).
assert && assert( regionAndCultureQueryParameter === null ||
                  isSupportedRegionAndCulture( regionAndCultureQueryParameter ),
  `invalid query parameter value for ?regionAndCulture: ${regionAndCultureQueryParameter}` );

// The list of supported regions and cultures as defined in the `simFeatures` of the package.json.
const simFeaturesSupportedRegionsAndCultures = packageJSON.phet?.simFeatures?.supportedRegionsAndCultures;
assert && simFeaturesSupportedRegionsAndCultures && assert( _.every( simFeaturesSupportedRegionsAndCultures, isSupportedRegionAndCulture ),
  `Invalid value in simFeatures.supportedRegionsAndCultures: ${simFeaturesSupportedRegionsAndCultures}. Check RegionAndCulturePortrayal.SUPPORTED_REGIONS_AND_CULTURES.` );


export default class RegionAndCulturePortrayal extends PhetioObject {


  // Label string for the UI component that will select this character set
  public readonly labelProperty: LocalizedStringProperty;

  public constructor( label: LocalizedStringProperty,
                      public readonly regionAndCultureID: string, // Query parameter value attached to this character set
                      providedOptions: RegionAndCulturePortrayalOptions ) {

    super( providedOptions );

    this.labelProperty = label;
  }

  public static createRegionAndCulturePortrayalProperty( regionAndCulturePortrayal: RegionAndCulturePortrayal, validValues: RegionAndCulturePortrayal[] ): Property<RegionAndCulturePortrayal> {
    // TODO: validate that provided validValues here are a subset of 1. SUPPORTED_REGIONS_AND_CULTURES, and 2. simFeatures packageJSON listing? https://github.com/phetsims/joist/issues/943
    return new Property<RegionAndCulturePortrayal>( regionAndCulturePortrayal, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'regionAndCulturePortrayalProperty' ),
      phetioFeatured: true,
      phetioValueType: RegionAndCulturePortrayal.RegionAndCulturePortrayalIO,
      phetioDocumentation: 'Specifies the region and culture character portrayals in the simulation',
      validValues: validValues
    } );
  }

  /**
   * RegionAndCulturePortrayalIO handles PhET-iO serialization of RegionAndCulturePortrayal. Since all RegionAndCulturePortrayals are static instances,
   * it implements 'Reference type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  public static readonly RegionAndCulturePortrayalIO = new IOType<RegionAndCulturePortrayal, ReferenceIOState>( 'RegionAndCulturePortrayalIO', {
    valueType: RegionAndCulturePortrayal,
    supertype: ReferenceIO( IOType.ObjectIO ),
    documentation: 'A RegionAndCulturePortrayal describes and holds the contents of how a region and culture will be portrayed through cartoon characters in the sim.'
  } );
}

joist.register( 'RegionAndCulturePortrayal', RegionAndCulturePortrayal );