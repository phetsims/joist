// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { InputModel } from './PreferencesModel.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import PreferencesType from './PreferencesType.js';

// constants
const gestureControlEnabledAlertString = JoistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlertStringProperty;
const gestureControlDisabledAlertString = JoistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlertStringProperty;
const labelledDescriptionPatternString = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

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

    const disposeEmitter = new Emitter();

    if ( inputModel.supportsGestureControl ) {

      const gestureControlsEnabledSwitch = new PreferencesToggleSwitch( inputModel.gestureControlsEnabledProperty, false, true, {
        labelNode: new Text( gestureControlsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        descriptionNode: new VoicingRichText( gestureControlsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
          lineWrap: 350,

          readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
            label: gestureControlsString,
            description: gestureControlsDescriptionString
          } )
        } ) ),

        // a11y
        a11yLabel: gestureControlsString,
        leftValueContextResponse: gestureControlDisabledAlertString,
        rightValueContextResponse: gestureControlEnabledAlertString
      } );

      const gesturePanelSection = new PreferencesPanelSection( {
        titleNode: gestureControlsEnabledSwitch,
        contentLeftMargin: 0
      } );

      contentVBox.addChild( gesturePanelSection );
      disposeEmitter.addListener( () => {
        gesturePanelSection.dispose();
        gestureControlsEnabledSwitch.dispose();
      } );
    }

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );

    inputModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( providedOptions.tandem );
      disposeEmitter.addListener( () => customContent.dispose() );
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
      disposeEmitter.emit();
      customPanelSection.dispose();
      contentNode.children.forEach( child => child.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeInputPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
