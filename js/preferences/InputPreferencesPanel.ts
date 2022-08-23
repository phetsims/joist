// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VBoxOptions, VoicingRichText } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { InputModel } from './PreferencesModel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const gestureControlEnabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlert;
const gestureControlDisabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

// NOT translatable yet because this tab does not appear in any published simulation.
const inputTitleString = 'Input';
const gestureControlsString = 'Gesture Control';
const gestureControlsDescriptionString = 'Use touch with custom swipes and taps instead. No direct touch with gesture control enabled.';

type SelfOptions = EmptySelfOptions;
type InputPreferencesPanelOptions = SelfOptions & VBoxOptions;

class InputPreferencesPanel extends VBox {
  private readonly disposeInputPreferencesPanel: () => void;

  public constructor( inputModel: InputModel, providedOptions?: InputPreferencesPanelOptions ) {
    const options = optionize<InputPreferencesPanelOptions, SelfOptions, VBoxOptions>()( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left',

      // phet-io
      tandem: Tandem.OPTIONAL,

      // a11y
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: inputTitleString
    }, providedOptions );

    const tandem = options.tandem;
    options.tandem = Tandem.OPTIONAL;

    super( options );

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

      this.addChild( gesturePanelSection );
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
      const customContent = customPreference.createContent( tandem );
      disposeEmitter.addListener( () => customContent.dispose() );
      contentNode.addChild(
        new Node( { children: [ customContent ] } )
      );
    } );

    const customPanelSection = new PreferencesPanelSection( {
      contentNode: contentNode,
      contentLeftMargin: 0
    } );
    this.addChild( customPanelSection );

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
