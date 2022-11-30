// Copyright 2022, University of Colorado Boulder

/**
 * A container managing global Properties for simulation region and culture. Contains Properties for characteristics
 * such as selected language or artwork.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import joist from '../joist.js';
import CharacterSet from './CharacterSet.js';

class RegionAndCultureManager {

  // A character set that the simulation can implement different artwork to match the selected region and culture.
  public readonly regionAndCultureProperty: Property<CharacterSet | null>;

  public constructor() {
    this.regionAndCultureProperty = new Property<CharacterSet | null>( null );
  }
}

const regionAndCultureManager = new RegionAndCultureManager();

joist.register( 'regionAndCultureManager', regionAndCultureManager );
export default regionAndCultureManager;
