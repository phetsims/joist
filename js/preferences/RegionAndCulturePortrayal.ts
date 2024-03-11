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
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import regionAndCultureProperty, { RegionAndCulture, supportedRegionAndCultureValues } from '../i18n/regionAndCultureProperty.js';
import JoistStrings from '../JoistStrings.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = StrictOmit<PhetioObjectOptions, 'tandem' | 'phetioState'>;
export type RegionAndCulturePortrayalOptions = SelfOptions & ParentOptions;

const STRING_PROPERTY_MAP: Record<RegionAndCulture, LocalizedStringProperty> = {
  africa: JoistStrings.preferences.tabs.localization.regionAndCulture.africaStringProperty,
  africaModest: JoistStrings.preferences.tabs.localization.regionAndCulture.africaModestStringProperty,
  asia: JoistStrings.preferences.tabs.localization.regionAndCulture.asiaStringProperty,
  latinAmerica: JoistStrings.preferences.tabs.localization.regionAndCulture.latinAmericaStringProperty,
  oceania: JoistStrings.preferences.tabs.localization.regionAndCulture.oceaniaStringProperty,
  random: JoistStrings.preferences.tabs.localization.regionAndCulture.randomStringProperty,
  usa: JoistStrings.preferences.tabs.localization.regionAndCulture.unitedStatesOfAmericaStringProperty
};

export default class RegionAndCulturePortrayal extends PhetioObject {

  public readonly regionAndCulture: RegionAndCulture;

  // Label string for the UI component that will select this portrayal
  public readonly labelProperty: LocalizedStringProperty;

  public constructor( regionAndCulture: RegionAndCulture,
                      providedOptions?: RegionAndCulturePortrayalOptions ) {

    const options = optionize<RegionAndCulturePortrayalOptions, SelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REGION_CULTURE_PORTRAYALS.createTandem( regionAndCulture ),
      phetioState: false
    }, providedOptions );

    super( options );

    this.regionAndCulture = regionAndCulture;
    this.labelProperty = STRING_PROPERTY_MAP[ regionAndCulture ];
  }

  public static createRegionAndCulturePortrayalProperty( regionAndCulturePortrayal: RegionAndCulturePortrayal, validValues: RegionAndCulturePortrayal[] ): Property<RegionAndCulturePortrayal> {
    assert && assert( _.every( validValues, value => supportedRegionAndCultureValues.includes( value.regionAndCulture ) ),
      `validValues must be a subset of RegionAndCulture values, but was ${validValues.map( value => value.regionAndCulture )}`
    );

    const regionAndCulturePortrayalProperty = new Property<RegionAndCulturePortrayal>( regionAndCulturePortrayal, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'regionAndCulturePortrayalProperty' ),
      phetioFeatured: true,
      phetioValueType: RegionAndCulturePortrayal.RegionAndCulturePortrayalIO,
      phetioDocumentation: 'Specifies the region and culture portrayals in the simulation',
      validValues: validValues
    } );

    // TODO: This is a temporary solution to keep the two Properties in sync until we have finish porting
    //  the regionAndCulturePortrayalProperty usages to the regionAndCultureProperty. These links can be removed
    //  once the post is complete. https://github.com/phetsims/joist/issues/953
    // NOTE: In the future, this (risky) bidirectional
    regionAndCulturePortrayalProperty.link( regionAndCulturePortrayal => {
      regionAndCultureProperty.value = regionAndCulturePortrayal.regionAndCulture;
    } );
    regionAndCultureProperty.lazyLink( regionAndCulture => {
      const portrayal = validValues.find( portrayal => portrayal.regionAndCulture === regionAndCulture );

      // NOTE: In the future, we shouldn't need this (being error-permissive here)
      if ( portrayal ) {
        regionAndCulturePortrayalProperty.value = portrayal;
      }
    } );

    return regionAndCulturePortrayalProperty;
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