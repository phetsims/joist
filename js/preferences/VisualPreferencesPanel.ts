// Copyright 2021-2025, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes features such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { combineOptions, type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ToggleSwitch, { type ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { type VisualModel } from './PreferencesModel.js';
import PreferencesPanel, { type PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';
import ProjectorModeToggleSwitch from './ProjectorModeToggleSwitch.js';

// constants
const interactiveHighlightsStringProperty = JoistStrings.preferences.tabs.visual.interactiveHighlightsStringProperty;
const interactiveHighlightsDescriptionStringProperty = JoistStrings.preferences.tabs.visual.interactiveHighlightsDescriptionStringProperty;
const interactiveHighlightsEnabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.visual.interactiveHighlights.enabledAlertStringProperty;
const interactiveHighlightsDisabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.visual.interactiveHighlights.disabledAlertStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

type VisualPreferencesPanelOptions = PickRequired<PreferencesPanelOptions, 'tandem'>;

class VisualPreferencesPanel extends PreferencesPanel {

  public constructor( visualModel: VisualModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: VisualPreferencesPanelOptions ) {

    const options = optionize<PreferencesPanelOptions, EmptySelfOptions, PreferencesPanelOptions>()( {
      accessibleHeading: 'Visual'
    }, providedOptions );

    // Grab the required tandem for subcomponents but the tandem is NOT passed through to the super
    const tandem = options.tandem;
    options.tandem = Tandem.OPT_OUT;

    super( PreferencesType.VISUAL, selectedTabProperty, tabVisibleProperty, options );

    const contentNode = new VBox( {
      spacing: PreferencesDialogConstants.CONTENT_SPACING,
      align: 'left'
    } );

    if ( visualModel.supportsProjectorMode ) {
      const projectorModeSwitch = new ProjectorModeToggleSwitch( visualModel.colorProfileProperty );
      contentNode.addChild( projectorModeSwitch );
    }


    if ( visualModel.supportsInteractiveHighlights ) {

      const label = new Text( interactiveHighlightsStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS );

      const highlightsReadingBlockNameResponsePatternStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
        label: interactiveHighlightsStringProperty,
        description: interactiveHighlightsDescriptionStringProperty
      }, { tandem: Tandem.OPT_OUT } );
      const interactiveHighlightsEnabledSwitchVoicingText = new VoicingText( interactiveHighlightsDescriptionStringProperty, merge( {}, PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: highlightsReadingBlockNameResponsePatternStringProperty
      } ) );
      const interactiveHighlightsEnabledSwitch = new ToggleSwitch( visualModel.interactiveHighlightsEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
        accessibleName: interactiveHighlightsStringProperty,
        leftValueContextResponse: interactiveHighlightsDisabledAlertStringProperty,
        rightValueContextResponse: interactiveHighlightsEnabledAlertStringProperty
      }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );

      const interactiveHighlightsEnabledControl = new PreferencesControl( {
        labelNode: label,
        descriptionNode: interactiveHighlightsEnabledSwitchVoicingText,
        allowDescriptionStretch: false,
        controlNode: interactiveHighlightsEnabledSwitch
      } );

      contentNode.addChild( interactiveHighlightsEnabledControl );
    }

    visualModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( tandem );
      const node = new Node( { children: [ customContent ] } );
      contentNode.addChild( node );
    } );

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // no title for this section so no indendation necessary
      contentLeftMargin: 0
    } );
    this.addChild( panelSection );
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;