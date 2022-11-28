// Copyright 2022, University of Colorado Boulder

/**
 * A container managing global Properties for simulation region and culture. Contains Properties for characteristics
 * such as selected language or artwork.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import joist from '../joist.js';
import { Node } from '../../../scenery/js/imports.js';
import CharacterSet from './CharacterSet.js';

// A type that describes the possible values for regionAndCultureProperty so that different artwork can be selected
// by the user to match a particular region or culture.
export type RegionAndCultureDescriptor = {

  // Icon for the UI to select this artwork.
  icon: Node;

  // Label string describing the region or culture in words.
  label: string;

  characterSet: CharacterSet;
};

class RegionAndCultureManager {

  // An index describing the selected artwork for the simulation to display a particular region and culture. From this
  // value the simulation can implement different artwork to match the selected region and culture.
  public readonly regionAndCultureProperty: Property<CharacterSet> | Property<null>;

  public constructor() {
    this.regionAndCultureProperty = new Property( null );
  }
}

const regionAndCultureManager = new RegionAndCultureManager();

joist.register( 'regionAndCultureManager', regionAndCultureManager );
export default regionAndCultureManager;
