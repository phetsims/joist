// Copyright 2023, University of Colorado Boulder

/**
 * A container managing global Properties for simulation region and culture. Contains Properties for characteristics
 * such as selected language or artwork.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import joist from '../joist.js';
import RegionAndCulturePortrayal from './RegionAndCulturePortrayal.js';
import Tandem from '../../../tandem/js/Tandem.js';

export default class RegionAndCultureManager {

  // A character set that the simulation can implement different artwork to match the selected region and culture.
  public readonly regionAndCulturePortrayalProperty: Property<RegionAndCulturePortrayal>;

  public constructor( regionAndCulturePortrayal: RegionAndCulturePortrayal, validValues: RegionAndCulturePortrayal[] ) {
    this.regionAndCulturePortrayalProperty = new Property<RegionAndCulturePortrayal>( regionAndCulturePortrayal, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'regionAndCulturePortrayalProperty' ),
      phetioFeatured: true,
      phetioValueType: RegionAndCulturePortrayal.RegionAndCulturePortrayalIO,
      phetioDocumentation: 'Specifies the region and culture character portrayals in the simulation',
      validValues: validValues
    } );
  }
}

joist.register( 'RegionAndCultureManager', RegionAndCultureManager );
