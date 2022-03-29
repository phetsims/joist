// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VoicingRichText, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
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

class InputPreferencesPanel extends Node {

  /**
   * @param {Object} inputModel - see PreferencesManager
   * @param {Object} [options]
   */
  constructor( inputModel, options ) {
    options = merge( {

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: inputTitleString,

      tandem: Tandem.REQUIRED
    }, options );

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
      a11yLabel: gestureControlsString,
      tandem: options.tandem.createTandem( 'gestureControlsEnabledSwitch' )
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: gestureControlsEnabledSwitch
    } );
    this.addChild( panelSection );

    inputModel.gestureControlsEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? gestureControlEnabledAlertString : gestureControlDisabledAlertString;
      voicingUtteranceQueue.addToBack( alert );
    } );

    // @private
    this.disposeInputPreferencesPanel = () => {
      gestureControlsEnabledSwitch.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeInputPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
