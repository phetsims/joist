// Copyright 2022, University of Colorado Boulder

/**
 * The content for the "Localization" tab in the PreferencesDialog.
 *
 * This is still being designed and developed. We expect it to contain a UI component to change the
 * language on the fly when running in the "_all" file. There may also be controls to change out
 * a character set or other artwork to match certain cultures or regions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import { LocalizationModel } from './PreferencesModel.js';
import LanguageComboBox from './LanguageComboBox.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';

class LocalizationPreferencesPanel extends Node {
  public constructor( localizationModel: LocalizationModel ) {

    const contentNode = new VBox( {
      align: 'left',
      spacing: PreferencesPanelSection.DEFAULT_ITEM_SPACING
    } );

    if ( localizationModel.supportsLanguageSwitching ) {
      contentNode.addChild( new LanguageComboBox(
        localizationModel.languageProperty,

        // TODO: Where will this information live and come from, see https://github.com/phetsims/joist/issues/814
        [
          {
            locale: 'en',
            localeLabel: 'English'
          }
        ]
      ) );
    }

    if ( localizationModel.supportsCharacterSwitching ) {
      contentNode.addChild( new RegionAndCultureComboBox( localizationModel.characterProperty, localizationModel.characterDescriptors ) );
    }

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode
    } );

    super( {
      children: [ panelSection ]
    } );
  }
}

joist.register( 'LocalizationPreferencesPanel', LocalizationPreferencesPanel );
export default LocalizationPreferencesPanel;
