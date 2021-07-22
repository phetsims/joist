// Copyright 2021, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import VoicingRichText from '../../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const inputTitleString = joistStrings.preferences.tabs.input.title;
const gestureControlsString = joistStrings.preferences.tabs.input.gestureControls.title;
const gestureControlsDescriptionString = joistStrings.preferences.tabs.input.gestureControls.description;
const gestureControlEnabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlert;
const gestureControlDisabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class InputPreferencesPanel extends Node {

  /**
   * @param {BooleanProperty} gestureControlsEnabledProperty
   */
  constructor( gestureControlsEnabledProperty ) {
    super( {

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: inputTitleString
    } );

    const toggleSwitch = new PreferencesToggleSwitch( gestureControlsEnabledProperty, false, true, {
      labelNode: new Text( gestureControlsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } ),
      descriptionNode: new VoicingRichText( gestureControlsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        lineWrap: 350,

        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: gestureControlsString,
          description: gestureControlsDescriptionString
        } )
      } ),
      a11yLabel: gestureControlsString
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );

    gestureControlsEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? gestureControlEnabledAlertString : gestureControlDisabledAlertString;
      voicingUtteranceQueue.addToBack( alert );
    } );
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
