// Copyright 2022-2024, University of Colorado Boulder

/**
 * RegionAndCultureComboBox is the combo box used to set 'Region and Culture' in Preferences > Localization.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import LocalizedStringProperty from '../../../chipper/js/browser/LocalizedStringProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import regionAndCultureProperty, { RegionAndCulture, supportedRegionAndCultureValues } from '../i18n/regionAndCultureProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

// Maps a RegionAndCulture value to a StringProperty.
const STRING_PROPERTY_MAP: Record<RegionAndCulture, LocalizedStringProperty> = {
  africa: JoistStrings.preferences.tabs.localization.regionAndCulture.africaStringProperty,
  africaModest: JoistStrings.preferences.tabs.localization.regionAndCulture.africaModestStringProperty,
  asia: JoistStrings.preferences.tabs.localization.regionAndCulture.asiaStringProperty,
  latinAmerica: JoistStrings.preferences.tabs.localization.regionAndCulture.latinAmericaStringProperty,
  oceania: JoistStrings.preferences.tabs.localization.regionAndCulture.oceaniaStringProperty,
  random: JoistStrings.preferences.tabs.localization.regionAndCulture.randomStringProperty,
  usa: JoistStrings.preferences.tabs.localization.regionAndCulture.unitedStatesOfAmericaStringProperty
};

type SelfOptions = EmptySelfOptions;
type RegionAndCultureComboBoxOptions = SelfOptions & PickOptional<ComboBoxOptions, 'tandem'>;

class RegionAndCultureComboBox extends ComboBox<RegionAndCulture> {

  public constructor( providedOptions?: RegionAndCultureComboBoxOptions ) {

    const options = optionize<RegionAndCultureComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // For now, do not instrument Preferences elements, see https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      tandem: Tandem.OPT_OUT
    }, providedOptions );

    // Sort the region and culture choices. We are sorting on RegionAndCulture tokens, rather than translated strings,
    // because ComboBox does not have an API for changing the order of items in its listbox. Since there are a
    // relatively small number of items here, we felt that having a consistent order here was sufficient, and that
    // the effort to dynamically put the items in alphabetical order was not warranted.
    // See https://github.com/phetsims/joist/issues/955
    const comboBoxItems = supportedRegionAndCultureValues.slice().sort().map( regionAndCulture => {
      return {
        value: regionAndCulture,
        createNode: () => new Text( STRING_PROPERTY_MAP[ regionAndCulture ], PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS )
      };
    } );

    // TODO: Need a different top layer node for ComboBox here. See https://github.com/phetsims/joist/issues/841
    super( regionAndCultureProperty, comboBoxItems, phet.joist.sim.topLayer, options );
  }
}

joist.register( 'RegionAndCultureComboBox', RegionAndCultureComboBox );
export default RegionAndCultureComboBox;