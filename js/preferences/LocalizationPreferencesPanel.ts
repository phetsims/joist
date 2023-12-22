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

import { Node, RichText, Text, VBox } from '../../../scenery/js/imports.js';
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
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PreferencesControl from './PreferencesControl.js';

// constants
const localizationTitleStringProperty = JoistStrings.preferences.tabs.localization.titleStringProperty;
const regionAndCultureTitleStringProperty = JoistStrings.preferences.tabs.localization.regionAndCulture.titleStringProperty;
const regionAndCultureDescriptionStringProperty = JoistStrings.preferences.tabs.localization.regionAndCulture.descriptionStringProperty;

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

    // regionAndCulturePortrayalProperty only gets set in PreferencesModel if there is at least one descriptor.
    if ( localizationModel.regionAndCulturePortrayalProperty ) {
      const comboBox = new RegionAndCultureComboBox( localizationModel.regionAndCulturePortrayalProperty, localizationModel.characterSets );
      const labelNode = new Text( regionAndCultureTitleStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS );
      const descriptionNode = new RichText( regionAndCultureDescriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS );
      contentNode.addChild( new PreferencesControl( {
        labelNode: labelNode,
        controlNode: comboBox,
        descriptionNode: descriptionNode
      } ) );
    }

    if ( localizationModel.supportsDynamicLocale && localizationModel.includeLocalePanel ) {

      // The language selection provided by LocalePanel does not follow the PreferencesControl pattern because it is a
      // much larger custom UI component that does not fit in the standard PreferencesControl layout.
      const localeLabel = new Text( JoistStrings.a11y.preferences.tabs.localization.languageSelection.labelStringProperty,
        PreferencesDialogConstants.CONTROL_LABEL_OPTIONS );
      const localeDescription = new RichText( JoistStrings.a11y.preferences.tabs.localization.languageSelection.descriptionStringProperty,
        PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS );
      const localePanel = new LocalePanel( localizationModel.localeProperty );

      const localeVBox = new VBox( {
        children: [ localeLabel, localeDescription, localePanel ],
        align: 'left',
        spacing: 5,
        stretch: true,
        layoutOptions: {
          stretch: true
        }
      } );
      contentNode.addChild( localeVBox );
    }

    localizationModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( providedOptions.tandem );
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
