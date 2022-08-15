// Copyright 2022, University of Colorado Boulder

/**
 * A container managing global Properties for simulation localization controls. Contains
 * Properties for characteristics such as selected language or artwork.
 *
 * TODO: It is not clear how this will work exactly with the sim, see https://github.com/phetsims/joist/issues/814.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import joist from '../joist.js';
import { Node } from '../../../scenery/js/imports.js';

// A type that describes the possible values for regionAndCultureProperty so that different artwork can be selected from
// by the user to match a particular region or culture.
export type RegionAndCultureDescriptor = {

  // Icon for the UI to select this artwork.
  icon: Node;

  // Label string describing the region or culture in words.
  label: string;
};

class LocalizationManager {

  // An index describing the selected artwork for the simulation to display a particular region and culture.
  // Only relevant if the sim supports `regionAndCultureSwitching`. See PreferencesConfiguration.localizationModel.
  public readonly regionAndCultureProperty: Property<number>;

  // A Property controlling the active language for the simulation. Only relevant if the sim supports language
  // switching and is running in the "_all" version so that we have access to translated strings.
  public readonly languageProperty: Property<string>;

  public constructor() {
    this.regionAndCultureProperty = new NumberProperty( 0 );

    // TODO: Where do valid and initial values come from? see https://github.com/phetsims/joist/issues/814
    this.languageProperty = new Property<string>( 'en' );
  }
}

const localizationManager = new LocalizationManager();

joist.register( 'localizationManager', localizationManager );
export default localizationManager;
