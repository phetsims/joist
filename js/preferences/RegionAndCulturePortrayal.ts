// Copyright 2022-2023, University of Colorado Boulder

/**
 * A base class for animated character portrayals used in representing region and culture preferences
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
// TODO: Rename from "QUERY_VALUE" https://github.com/phetsims/joist/issues/943
export const USA_QUERY_VALUE = 'usa';
export const AFRICA_QUERY_VALUE = 'africa';
export const AFRICA_MODEST_QUERY_VALUE = 'africaModest';
export const ASIA_QUERY_VALUE = 'asia';
export const LATIN_AMERICA_QUERY_VALUE = 'latinAmerica';
export const OCEANIA_QUERY_VALUE = 'oceania';
export const MULTICULTURAL_QUERY_VALUE = 'multi';

// The superset list of all regions and cultures supported by any sim. ALL values used by any sim must be in this list.
const SUPPORTED_REGIONS_AND_CULTURES = [
  USA_QUERY_VALUE,
  AFRICA_QUERY_VALUE,
  AFRICA_MODEST_QUERY_VALUE,
  ASIA_QUERY_VALUE,
  LATIN_AMERICA_QUERY_VALUE,
  OCEANIA_QUERY_VALUE,
  MULTICULTURAL_QUERY_VALUE
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
                      public readonly queryParameterValue: string, // Query parameter value attached to this character set
                      providedOptions: RegionAndCulturePortrayalOptions ) {

    super( providedOptions );

    this.labelProperty = label;
  }

  public static createRegionAndCulturePortrayalProperty( regionAndCulturePortrayal: RegionAndCulturePortrayal, validValues: RegionAndCulturePortrayal[] ): Property<RegionAndCulturePortrayal> {
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