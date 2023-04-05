// Copyright 2021-2023, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { InputModel } from './PreferencesModel.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesType from './PreferencesType.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';

// constants
const gestureControlEnabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlertStringProperty;
const gestureControlDisabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlertStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

// NOT translatable yet because this tab does not appear in any published simulation.
const inputTitleString = 'Input';
const gestureControlsString = 'Gesture Control';
const gestureControlsDescriptionString = 'Use touch with custom swipes and taps instead. No direct touch with gesture control enabled.';

type InputPreferencesPanelOptions = PickRequired<PreferencesPanelOptions, 'tandem'>;

class InputPreferencesPanel extends PreferencesPanel {
  private readonly disposeInputPreferencesPanel: () => void;

  public constructor( inputModel: InputModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions: InputPreferencesPanelOptions ) {

    super( PreferencesType.INPUT, selectedTabProperty, tabVisibleProperty, {
      labelContent: inputTitleString
    } );

    // children are filled in later depending on what is supported in the InputModel
    const contentVBox = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );
    this.addChild( contentVBox );

    if ( inputModel.supportsGestureControl ) {

      const gestureControlText = new Text( gestureControlsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
      const gestureControlDescriptionNode = new VoicingRichText( gestureControlsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 350,
        maxHeight: 100,

        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternStringProperty, {
          label: gestureControlsString,
          description: gestureControlsDescriptionString
        } )
      } ) );
      const gestureControlsEnabledSwitch = new ToggleSwitch( inputModel.gestureControlsEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
        a11yName: gestureControlsString,
        leftValueContextResponse: gestureControlDisabledAlertStringProperty,
        rightValueContextResponse: gestureControlEnabledAlertStringProperty
      }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
      const gestureControlsControl = new PreferencesControl( {
        labelNode: gestureControlText,
        descriptionNode: gestureControlDescriptionNode,
        controlNode: gestureControlsEnabledSwitch
      } );

      const gesturePanelSection = new PreferencesPanelSection( {
        titleNode: gestureControlsControl,
        contentLeftMargin: 0
      } );

      contentVBox.addChild( gesturePanelSection );

      this.disposeEmitter.addListener( () => {
        gesturePanelSection.dispose();
        gestureControlsControl.dispose();
        gestureControlsEnabledSwitch.dispose();
        gestureControlDescriptionNode.dispose();
        gestureControlText.dispose();
      } );
    }

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );

    inputModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( providedOptions.tandem );
      this.disposeEmitter.addListener( () => customContent.dispose() );
      contentNode.addChild(
        new Node( { children: [ customContent ] } )
      );
    } );

    const customPanelSection = new PreferencesPanelSection( {
      contentNode: contentNode,
      contentLeftMargin: 0
    } );
    contentVBox.addChild( customPanelSection );

    this.disposeInputPreferencesPanel = () => {
      contentVBox.dispose();
      customPanelSection.dispose();
      contentNode.children.forEach( child => child.dispose() );
      contentNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeInputPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
