// Copyright 2021, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes freatures such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const interactiveHighlightsString = joistStrings.preferences.tabs.visual.interactiveHighlights;
const interactiveHighlightsDescriptionString = joistStrings.preferences.tabs.visual.interactiveHighlightsDescription;
const interactiveHighlightsEnabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.enabledAlert;
const interactiveHighlightsDisabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class VisualPreferencesPanel extends Node {

  /**
   * @param {BooleanProperty} interactiveHighlightsEnabledProperty - whether or not interactive highlights are enabled
   */
  constructor( interactiveHighlightsEnabledProperty ) {
    super( {

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'Visual'
    } );

    const label = new Text( interactiveHighlightsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const toggleSwitch = new PreferencesToggleSwitch( interactiveHighlightsEnabledProperty, false, true, {
      labelNode: label,
      descriptionNode: new VoicingText( interactiveHighlightsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: interactiveHighlightsString,
          description: interactiveHighlightsDescriptionString
        } )
      } ),
      a11yLabel: interactiveHighlightsString
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );

    const alertEnabledChange = enabled => {

      // voicing
      const alertString = enabled ? interactiveHighlightsEnabledAlertString : interactiveHighlightsDisabledAlertString;
      voicingUtteranceQueue.addToBack( alertString );

      // pdom
      phet.joist.sim.utteranceQueue.addToBack( alertString );
    };
    interactiveHighlightsEnabledProperty.lazyLink( alertEnabledChange );

    // @private
    this.disposeVisualPreferencesPanel = () => {
      interactiveHighlightsEnabledProperty.unlink( alertEnabledChange );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVisualPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
