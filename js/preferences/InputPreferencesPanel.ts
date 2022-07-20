// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import EmptyObjectType from '../../../phet-core/js/types/EmptyObjectType.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, NodeOptions, Text, VoicingRichText } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { InputModel } from './PreferencesManager.js';
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

type SelfOptions = EmptyObjectType;
type InputPreferencesPanelOptions = SelfOptions & NodeOptions;

class InputPreferencesPanel extends Node {
  private readonly disposeInputPreferencesPanel: () => void;

  public constructor( inputModel: InputModel, providedOptions: InputPreferencesPanelOptions ) {
    const options = optionize<InputPreferencesPanelOptions, SelfOptions, NodeOptions>()( {
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: inputTitleString,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

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
      rightValueContextResponse: gestureControlEnabledAlertString,

      // phet-io
      tandem: options.tandem.createTandem( 'gestureControlsEnabledSwitch' )
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: gestureControlsEnabledSwitch
    } );
    this.addChild( panelSection );

    this.disposeInputPreferencesPanel = () => {
      panelSection.dispose();
      gestureControlsEnabledSwitch.dispose();
    };
  }

  public override dispose(): void {
    this.disposeInputPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
