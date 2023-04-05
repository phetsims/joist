// Copyright 2021-2023, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes features such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { Node, Text, VBox, VoicingText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesControl from './PreferencesControl.js';
import { VisualModel } from './PreferencesModel.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ProjectorModeToggleSwitch from './ProjectorModeToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import PreferencesType from './PreferencesType.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';

// constants
const interactiveHighlightsStringProperty = JoistStrings.preferences.tabs.visual.interactiveHighlightsStringProperty;
const interactiveHighlightsDescriptionStringProperty = JoistStrings.preferences.tabs.visual.interactiveHighlightsDescriptionStringProperty;
const interactiveHighlightsEnabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.visual.interactiveHighlights.enabledAlertStringProperty;
const interactiveHighlightsDisabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.visual.interactiveHighlights.disabledAlertStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

type VisualPreferencesPanelOptions = PickRequired<PreferencesPanelOptions, 'tandem'>;

class VisualPreferencesPanel extends PreferencesPanel {
  private readonly disposeVisualPreferencesPanel: () => void;

  public constructor( visualModel: VisualModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: VisualPreferencesPanelOptions ) {

    const options = optionize<PreferencesPanelOptions, EmptySelfOptions, PreferencesPanelOptions>()( {
      labelContent: 'Visual'
    }, providedOptions );

    // Grab the required tandem for subcomponents but the tandem is NOT passed through to the super
    const tandem = options.tandem;
    options.tandem = Tandem.OPTIONAL;

    super( PreferencesType.VISUAL, selectedTabProperty, tabVisibleProperty, options );

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );

    if ( visualModel.supportsProjectorMode ) {
      const projectorModeSwitch = new ProjectorModeToggleSwitch( visualModel.colorProfileProperty );
      contentNode.addChild( projectorModeSwitch );
      this.disposeEmitter.addListener( () => projectorModeSwitch.dispose() );
    }


    if ( visualModel.supportsInteractiveHighlights ) {

      const label = new Text( interactiveHighlightsStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );

      const highlightsReadingBlockNameResponsePatternStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
        label: interactiveHighlightsStringProperty,
        description: interactiveHighlightsDescriptionStringProperty
      } );
      const interactiveHighlightsEnabledSwitchVoicingText = new VoicingText( interactiveHighlightsDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: highlightsReadingBlockNameResponsePatternStringProperty
      } ) );
      const interactiveHighlightsEnabledSwitch = new ToggleSwitch( visualModel.interactiveHighlightsEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
        a11yName: interactiveHighlightsStringProperty,
        leftValueContextResponse: interactiveHighlightsDisabledAlertStringProperty,
        rightValueContextResponse: interactiveHighlightsEnabledAlertStringProperty
      }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );

      const interactiveHighlightsEnabledControl = new PreferencesControl( {
        labelNode: label,
        descriptionNode: interactiveHighlightsEnabledSwitchVoicingText,
        controlNode: interactiveHighlightsEnabledSwitch
      } );

      contentNode.addChild( interactiveHighlightsEnabledControl );

      this.disposeEmitter.addListener( () => {
        interactiveHighlightsEnabledControl.dispose();
        interactiveHighlightsEnabledSwitch.dispose();
        interactiveHighlightsEnabledSwitchVoicingText.dispose();
        highlightsReadingBlockNameResponsePatternStringProperty.dispose();
        label.dispose();
      } );
    }

    visualModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( tandem );
      const node = new Node( { children: [ customContent ] } );
      contentNode.addChild( node );
      this.disposeEmitter.addListener( () => {
        customContent.dispose();
        node.dispose();
      } );
    } );

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // no title for this section so no indendation necessary
      contentLeftMargin: 0
    } );
    this.addChild( panelSection );

    this.disposeVisualPreferencesPanel = () => {
      panelSection.dispose();
      contentNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeVisualPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
