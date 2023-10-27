// Copyright 2022-2023, University of Colorado Boulder

/**
 * A base class for animated character portrayals used in representing region and culture preferences
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import { Node } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import LocalizedStringProperty from '../../../chipper/js/LocalizedStringProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO, { ReferenceIOState } from '../../../tandem/js/types/ReferenceIO.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';

type SelfOptions = EmptySelfOptions;
export type RegionAndCulturePortrayalOptions = SelfOptions & PhetioObjectOptions;

export default class RegionAndCulturePortrayal extends PhetioObject {


  // Label string for the UI component that will select this character set
  public readonly labelProperty: LocalizedStringProperty;

  public constructor( public readonly icon: Node, // Icon for the UI component that would select this character set
                      label: LocalizedStringProperty,
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