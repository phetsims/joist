// Copyright 2022-2024, University of Colorado Boulder

/**
 * A ComboBox that lets you change a character or portrayal in a simulation to match a particular culture or region.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../tandem/js/Tandem.js';
import regionAndCultureProperty, { RegionAndCulture, supportedRegionAndCultureValues } from '../i18n/regionAndCultureProperty.js';
import LocalizedStringProperty from '../../../chipper/js/LocalizedStringProperty.js';
import JoistStrings from '../JoistStrings.js';

// Maps a RegionAndCulture value to a StringProperty.
const STRING_PROPERTY_MAP: Record<RegionAndCulture, LocalizedStringProperty> = {
  //TODO https://github.com/phetsims/joist/issues/953 Revise string keys to remove "portrayalSets".
  usa: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.unitedStatesOfAmericaStringProperty,
  africa: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.africaStringProperty,
  africaModest: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.africaModestStringProperty,
  asia: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.asiaStringProperty,
  latinAmerica: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.latinAmericaStringProperty,
  oceania: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.oceaniaStringProperty,
  multi: JoistStrings.preferences.tabs.localization.regionAndCulture.portrayalSets.multiculturalStringProperty
};

type SelfOptions = EmptySelfOptions;
type RegionAndCultureComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'tandem'>;

class RegionAndCultureComboBox extends ComboBox<RegionAndCulture> {

  public constructor( providedOptions?: ComboBoxOptions ) {

    const options = optionize<RegionAndCultureComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the portrayal icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    // Sort the region and culture choices, with the default (initially loaded) at the top.
    const localeCompare = new Intl.Collator( phet.chipper.locale ).compare;
    const comboBoxItems = supportedRegionAndCultureValues.sort( ( a, b ) => {
      if ( a === phet.chipper.regionAndCulture ) {
        return -1;
      }
      else if ( b === phet.chipper.regionAndCulture ) {
        return 1;
      }
      else {
        return localeCompare( STRING_PROPERTY_MAP[ a ].value, STRING_PROPERTY_MAP[ b ].value );
      }
    } ).map( regionAndCulture => {

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
