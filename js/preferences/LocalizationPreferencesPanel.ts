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
import PreferencesPanelSection from './PreferencesPanelSection.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';
import LocalePanel from './LocalePanel.js';

class LocalizationPreferencesPanel extends Node {
  public constructor( localizationModel: LocalizationModel ) {
    super();

    const contentNode = new VBox( {
      align: 'left',
      spacing: PreferencesPanelSection.DEFAULT_ITEM_SPACING
    } );

    if ( localizationModel.supportsMultipleLocales ) {
      const localePopup = new LocalePanel();
      contentNode.addChild( localePopup );
    }

    if ( localizationModel.regionAndCultureDescriptors.length > 0 ) {
      contentNode.addChild( new RegionAndCultureComboBox( localizationModel.regionAndCultureProperty, localizationModel.regionAndCultureDescriptors ) );
    }

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // Without a title no indentation is necessary
      contentLeftMargin: 0
    } );

    this.children = [ panelSection ];
  }
}

joist.register( 'LocalizationPreferencesPanel', LocalizationPreferencesPanel );
export default LocalizationPreferencesPanel;
