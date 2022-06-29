// Copyright 2022, University of Colorado Boulder

/**
 * Controls specific to localization that will appear under a "Localization" section
 * in the general preferences tab panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import { Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';

// This is NOT translatable yet. This is still being designed and I don't want
// strings to float in translatable strings until this is finished. See
// https://github.com/phetsims/joist/issues/814
const localizationSettingsString = 'Localization Settings';

class LocalizationControlsPanelSection extends PreferencesPanelSection {

  /**
   * @param localizationControls - Node you want under the "Localization" section
   */
  public constructor( localizationControls: Node ) {
    super( {
      titleNode: new Text( localizationSettingsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
      contentNode: localizationControls
    } );
  }
}

joist.register( 'LocalizationControlsPanelSection', LocalizationControlsPanelSection );
export default LocalizationControlsPanelSection;
