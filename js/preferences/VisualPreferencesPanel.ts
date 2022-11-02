// Copyright 2021-2022, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes freatures such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VoicingText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import { VisualModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ProjectorModeToggleSwitch from './ProjectorModeToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Emitter from '../../../axon/js/Emitter.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import PreferencesType from './PreferencesType.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';

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

    const disposeEmitter = new Emitter();

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );

    if ( visualModel.supportsProjectorMode ) {
      const projectorModeSwitch = new ProjectorModeToggleSwitch( visualModel.colorProfileProperty );
      contentNode.addChild( projectorModeSwitch );
      disposeEmitter.addListener( () => projectorModeSwitch.dispose() );
    }


    if ( visualModel.supportsInteractiveHighlights ) {

      const label = new Text( interactiveHighlightsStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
      const interactiveHighlightsEnabledSwitchVoicingText = new VoicingText( interactiveHighlightsDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternStringProperty, {
          label: interactiveHighlightsStringProperty,
          description: interactiveHighlightsDescriptionStringProperty
        } )
      } ) );
      const interactiveHighlightsEnabledSwitch = new PreferencesToggleSwitch( visualModel.interactiveHighlightsEnabledProperty, false, true, {
        labelNode: label,
        descriptionNode: interactiveHighlightsEnabledSwitchVoicingText,
        a11yLabel: interactiveHighlightsStringProperty,
        leftValueContextResponse: interactiveHighlightsDisabledAlertStringProperty,
        rightValueContextResponse: interactiveHighlightsEnabledAlertStringProperty
      } );

      contentNode.addChild( interactiveHighlightsEnabledSwitch );
      disposeEmitter.addListener( () => {
        label.dispose();
        interactiveHighlightsEnabledSwitchVoicingText.dispose();
        interactiveHighlightsEnabledSwitch.dispose();
      } );
    }

    visualModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( tandem );
      const node = new Node( { children: [ customContent ] } );
      contentNode.addChild( node );
      disposeEmitter.addListener( () => {
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
      disposeEmitter.emit();
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
