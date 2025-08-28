// Copyright 2022-2025, University of Colorado Boulder

/**
 * The content for the "Localization" tab in the PreferencesDialog.
 *
 * This is still being designed and developed. We expect it to contain a UI component to change the
 * language on the fly when running in the "_all" file. There may also be controls to change out
 * a character set or other artwork to match certain cultures or regions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions, type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import VoicingRichText from '../../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import VoicingText, { VoicingTextOptions } from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import { supportedRegionAndCultureValues } from '../i18n/regionAndCultureProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import LocalePanel from './LocalePanel.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { type LocalizationModel } from './PreferencesModel.js';
import PreferencesPanel, { type PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';

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
      accessibleHeading: localizationTitleStringProperty,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( PreferencesType.LOCALIZATION, selectedTabProperty, tabVisibleProperty, options );

    const contentNode = new VBox( {
      spacing: PreferencesDialogConstants.CONTENT_SPACING
    } );

    // Add 'Region and Culture' combo box if there are at least 2 values.
    if ( supportedRegionAndCultureValues.length > 1 ) {
      const comboBox = new RegionAndCultureComboBox();
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
      const localeLabel = new VoicingText(
        JoistStrings.preferences.tabs.localization.languageSelection.titleStringProperty,
        combineOptions<VoicingTextOptions>( {}, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS, {

          // Default behavior for VoicingText creates an accessibleParagraph
          // but this needs to be a heading.
          accessibleHeading: JoistStrings.preferences.tabs.localization.languageSelection.titleStringProperty,
          accessibleParagraph: null
        } )
      );
      const localeDescription = new VoicingRichText( JoistStrings.preferences.tabs.localization.languageSelection.descriptionStringProperty,
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