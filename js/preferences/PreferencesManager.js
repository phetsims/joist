// Copyright 2021, University of Colorado Boulder

/**
 * A Class that manages Simulation features that enabled and disabled by user Preferences.
 *
 * @author Jesse Greenberg
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Property from '../../../axon/js/Property.js';
import voicingManager from '../../../scenery/js/accessibility/voicing/voicingManager.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import webSpeaker from '../../../scenery/js/accessibility/voicing/webSpeaker.js';
import joistVoicingUtteranceQueue from '../../../utterance-queue/js/UtteranceQueue.js';
import joist from '../joist.js';
import PreferencesProperties from './PreferencesProperties.js';

class PreferencesManager {

  /**
   * @param {Sim} sim
   */
  constructor( sim ) {

    // @public {PreferencesProperties}
    this.preferencesProperties = new PreferencesProperties();

    const preferencesConfiguration = sim.preferencesConfiguration;
    assert && assert( preferencesConfiguration, 'PreferencesManager requires the sim to have PreferencesConfiguration' );

    const audioOptions = preferencesConfiguration.audioOptions;
    if ( audioOptions.supportsVoicing ) {

      webSpeaker.initialize( {

        // specify the Properties that control whether or not output is allowed from webSpeaker
        speechAllowedProperty: new DerivedProperty( [
          sim.isConstructionCompleteProperty,
          sim.browserTabVisibleProperty,
          sim.activeProperty,
          sim.isSettingPhetioStateProperty,
          sim.allAudioEnabledProperty
        ], ( simConstructionComplete, simVisible, simActive, simSettingPhetioState, allAudioEnabled ) => {
          return simConstructionComplete && simVisible && simActive && !simSettingPhetioState && allAudioEnabled;
        } )
      } );

      // The default utteranceQueue will be used for voicing of simulation components, and
      // it is enabled when the voicingManager is fully enabled.
      voicingManager.voicingFullyEnabledProperty.link( enabled => {
        voicingUtteranceQueue.enabled = enabled;
      } );

      // the utteranceQueue for surrounding user controls is enabled as long as voicing is enabled
      webSpeaker.enabledProperty.link( enabled => {
        joistVoicingUtteranceQueue.enabled = enabled;
      } );

      // For now, ReadingBlocks are only enabled when voicing is fully enabled and when sound is on. We decided that
      // having ReadingBlock highlights that do nothing is too confusing so they should be removed unless they
      // have some output.
      Property.multilink( [
        voicingManager.voicingFullyEnabledProperty,
        sim.allAudioEnabledProperty
      ], ( voicingFullyEnabled, allAudioEnabled ) => {
        sim.display.focusManager.readingBlockHighlightsVisibleProperty.value = voicingFullyEnabled && allAudioEnabled;
      } );

      this.preferencesProperties.interactiveHighlightsEnabledProperty.link( visible => {
        sim.display.focusManager.interactiveHighlightsVisibleProperty.value = visible;
      } );
    }
  }
}

joist.register( 'PreferencesManager', PreferencesManager );
export default PreferencesManager;