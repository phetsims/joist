// Copyright 2021, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import voicingManager from '../../../scenery/js/accessibility/voicing/voicingManager.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';

// constants
const audioFeaturesString = joistStrings.preferences.tabs.audio.audioFeatures.title;
const audioFeaturesEnabledAlert = joistStrings.a11y.audioFeatures.enabledAlert;
const audioFeaturesDisabledAlert = joistStrings.a11y.audioFeatures.disabledAlert;

class AudioPreferencesTabPanel extends VBox {

  /**
   * @param {Object} audioOptions - configuration for audio settings, see PreferencesConfiguration
   * @param {BooleanProperty} simSoundProperty - whether sim sound is globally enabled
   * @param {BooleanProperty} enableToolbarProperty - whether the Toolbar is enabled
   */
  constructor( audioOptions, simSoundProperty, enableToolbarProperty ) {

    const panelChildren = [];

    if ( audioOptions.supportsVoicing ) {
      panelChildren.push( new VoicingPanelSection( enableToolbarProperty ) );
    }

    if ( audioOptions.supportsSound ) {
      panelChildren.push( new SoundPanelSection( audioOptions ) );
    }

    const sections = new HBox( {
      align: 'top',
      children: panelChildren
    } );

    const allAudioSwitch = new PreferencesToggleSwitch( simSoundProperty, false, true, {
      labelNode: new Text( audioFeaturesString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } ),
      a11yLabel: audioFeaturesString
    } );

    const soundEnabledListener = ( enabled, previousValue ) => {
      sections.enabled = enabled;

      // alerts should occur lazily, not on construction
      if ( previousValue !== null ) {
        const alertString = enabled ? audioFeaturesEnabledAlert : audioFeaturesDisabledAlert;

        phet.joist.sim.utteranceQueue.addToBack( alertString );

        if ( voicingManager.voicingFullyEnabledProperty.value ) {
          voicingManager.speakImmediately( alertString );
        }
      }
    };

    simSoundProperty.link( soundEnabledListener );

    super( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ],

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'Audio'
    } );

    // @private - for disposal
    this.disposeAudioPreferencesPanel = () => {
      simSoundProperty.unlink( soundEnabledListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeAudioPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;