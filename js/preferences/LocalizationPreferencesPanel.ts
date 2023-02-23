// Copyright 2022-2023, University of Colorado Boulder

/**
 * The content for the "Localization" tab in the PreferencesDialog.
 *
 * This is still being designed and developed. We expect it to contain a UI component to change the
 * language on the fly when running in the "_all" file. There may also be controls to change out
 * a character set or other artwork to match certain cultures or regions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { HBox, Node, Text, VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import { LocalizationModel } from './PreferencesModel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';
import LocalePanel from './LocalePanel.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import PreferencesType from './PreferencesType.js';
import JoistStrings from '../JoistStrings.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

// constants
const localizationTitleStringProperty = JoistStrings.preferences.tabs.localization.titleStringProperty;
const regionAndCultureStringProperty = JoistStrings.preferences.tabs.localization.regionAndCulture.titleStringProperty;

type SelfOptions = EmptySelfOptions;

type LocalizationPreferencesPanelOptions = SelfOptions & PickRequired<PreferencesPanelOptions, 'tandem'>;

class LocalizationPreferencesPanel extends PreferencesPanel {

  public constructor( localizationModel: LocalizationModel,
                      selectedTabProperty: TReadOnlyProperty<PreferencesType>,
                      tabVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: LocalizationPreferencesPanelOptions ) {

    const options = optionize<LocalizationPreferencesPanelOptions, SelfOptions, PreferencesPanelOptions>()( {
      labelContent: localizationTitleStringProperty,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( PreferencesType.LOCALIZATION, selectedTabProperty, tabVisibleProperty, options );

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING
    } );

    // regionAndCultureProperty value only gets set in PreferencesModel if there is at least one descriptor.
    if ( localizationModel.regionAndCultureProperty.value ) {
      const comboBox = new RegionAndCultureComboBox( localizationModel.regionAndCultureProperty, localizationModel.characterSets );
      contentNode.addChild( new HBox( {
        spacing: 10,
        children: [
          new Text( regionAndCultureStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
          comboBox
        ]
      } ) );
      this.disposeEmitter.addListener( () => comboBox.dispose() );
    }

    if ( localizationModel.supportsDynamicLocales && localizationModel.includeLocalePanel ) {
      const localePanel = new LocalePanel( localizationModel.localeProperty );
      contentNode.addChild( localePanel );
      this.disposeEmitter.addListener( () => localePanel.dispose() );
    }

    localizationModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( providedOptions.tandem );
      this.disposeEmitter.addListener( () => customContent.dispose() );
      contentNode.addChild( new Node( {
        children: [ customContent ]
      } ) );
    } );

    // center align within this content if there is only one item, otherwise left align all items
    contentNode.align = contentNode.children.length > 1 ? 'left' : 'center';

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // Without a title no indentation is necessary
      contentLeftMargin: 0
    } );

    this.addChild( panelSection );
  }
}

joist.register( 'LocalizationPreferencesPanel', LocalizationPreferencesPanel );
export default LocalizationPreferencesPanel;
