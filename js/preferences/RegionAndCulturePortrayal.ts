// Copyright 2022-2024, University of Colorado Boulder

/**
 * A base class for the portrayal of people, places, or objects in the sim. Region and culture is a preference supported
 * by PreferencesModel and query parameters. The supported region and culture instances for a sim are defined by the
 * package.json object for the sim.
 *
 * Using the `regionAndCulture` query parameter:
 * The sim will set the value of the query parameter as the selected region and culture in preferences as long as the
 * option provided is supported by the sim. If the option provided is not supported by the sim a warning dialogue will
 * be shown at start-up
 * Options:
 * - `africa`
 * - `africaModest`
 * - `asia`
 * - `latinAmerica`
 * - `multi`
 * - `oceania`
 * - `usa`
 *
 * Example: `?regionAndCulture=asia`
 *
 * How to add portrayal sets to your sim:
 * 1. Add the supported regions and cultures to package.json. Ex. ( supportedRegionsAndCultures: [ 'usa', 'africa', 'asia' ] )
 *    The first element in the array will be the default value of the query parameter.
 * 2. Create a RegionAndCulturePortrayal instance for each supported region and culture. Generally a subclass is needed
 *    to extend the RegionAndCulturePortrayal class in order to add full support for the types of portrayals or poses
 *    each set may have.
 * 3. All RegionAndCulturePortrayal instances should be gathered as an array and added to the PreferencesModel
 *    localizationOptions.portrayals. The order of the array will be the display order of the regionsAndCultures
 *    displayed in the comboBox. It is advised that your portrayals array matches the order of the
 *    supportedRegionsAndCultures array.
 * 4. Implement the portrayal sets in the sim by listening to and using localizationModel.regionAndCulturePortrayalProperty
 *    in your PreferencesModel instance. This step is dependent on the sim and how it uses each portrayal. There is
 *    no "one size fits all" implementation. Some sims that provide examples of implementation are: number-line-integers,
 *    energy-skate-park, and area-model-algebra.
 *
 * Note: To support PhET-iO and preferences correctly, RegionAndCulturePortrayal instances should be created statically.
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
 */

import joist from '../joist.js';
import LocalizedStringProperty from '../../../chipper/js/LocalizedStringProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO, { ReferenceIOState } from '../../../tandem/js/types/ReferenceIO.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import packageJSON from '../packageJSON.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = StrictOmit<PhetioObjectOptions, 'tandem' | 'phetioState'>;
export type RegionAndCulturePortrayalOptions = SelfOptions & ParentOptions;

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
] as const;

export type RegionAndCultureID = typeof SUPPORTED_REGIONS_AND_CULTURES[number];

const isSupportedRegionAndCulture = ( regionAndCulture: RegionAndCultureID ): boolean => SUPPORTED_REGIONS_AND_CULTURES.includes( regionAndCulture );

// The list of supported regions and cultures as defined in the `simFeatures` of the package.json.
const simFeaturesSupportedRegionsAndCultures = packageJSON.phet?.simFeatures?.supportedRegionsAndCultures;
assert && simFeaturesSupportedRegionsAndCultures && assert( _.every( simFeaturesSupportedRegionsAndCultures, isSupportedRegionAndCulture ),
  `Invalid value in simFeatures.supportedRegionsAndCultures: ${simFeaturesSupportedRegionsAndCultures}. Check RegionAndCulturePortrayal.SUPPORTED_REGIONS_AND_CULTURES.` );


export default class RegionAndCulturePortrayal extends PhetioObject {


  // Label string for the UI component that will select this portrayal set
  public readonly labelProperty: LocalizedStringProperty;

  public constructor( label: LocalizedStringProperty,
                      public readonly regionAndCultureID: RegionAndCultureID, // Query parameter value attached to this portrayal set
                      providedOptions?: RegionAndCulturePortrayalOptions ) {

    const options = optionize<RegionAndCulturePortrayalOptions, SelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REGION_CULTURE_PORTRAYALS.createTandem( regionAndCultureID ),
      phetioState: false
    }, providedOptions );

    super( options );
    assert && this.tandem?.supplied && assert( SUPPORTED_REGIONS_AND_CULTURES.includes( this.tandem.name as RegionAndCultureID ),
      `RegionAndCulturePortrayal should have a tandem name that matches its portrayal name: ${this.tandem.name}` );

    this.labelProperty = label;
  }

  public static createRegionAndCulturePortrayalProperty( regionAndCulturePortrayal: RegionAndCulturePortrayal, validValues: RegionAndCulturePortrayal[] ): Property<RegionAndCulturePortrayal> {
    assert && assert( _.every( validValues, value => SUPPORTED_REGIONS_AND_CULTURES.includes( value.regionAndCultureID ) ),
      `validValues regionAndCultureIDs must be a subset of RegionAndCulturePortrayal.SUPPORTED_REGIONS_AND_CULTURES, but was ${validValues.map( value => value.regionAndCultureID )}`
    );

    return new Property<RegionAndCulturePortrayal>( regionAndCulturePortrayal, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'regionAndCulturePortrayalProperty' ),
      phetioFeatured: true,
      phetioValueType: RegionAndCulturePortrayal.RegionAndCulturePortrayalIO,
      phetioDocumentation: 'Specifies the region and culture portrayals in the simulation',
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
    documentation: 'A RegionAndCulturePortrayal describes and holds the contents of how a region and culture will be portrayed through artwork in the sim.'
  } );
}

joist.register( 'RegionAndCulturePortrayal', RegionAndCulturePortrayal );