// Copyright 2021-2022, University of Colorado Boulder

/**
 * A Class that manages Simulation features that enabled and disabled by user Preferences.
 *
 * @author Jesse Greenberg
 */

import { voicingManager } from '../../../scenery/js/imports.js';
import responseCollector from '../../../utterance-queue/js/responseCollector.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import joist from '../joist.js';
import PreferencesStorage from './PreferencesStorage.js';
import soundManager from '../../../tambo/js/soundManager.js';
import audioManager from '../audioManager.js';

class PreferencesManager {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   */
  constructor( preferencesConfiguration ) {

    assert && assert( preferencesConfiguration, 'PreferencesManager requires the sim to have PreferencesConfiguration' );


    // @public {BooleanProperty} - Whether or not the Sim Toolbar is enabled, which gives quick access to various
    // controls for the simulation or active screen.
    this.toolbarEnabledProperty = new BooleanProperty( true );

    // @public (read-only)
    this.generalModel = preferencesConfiguration.generalOptions;

    // @public (read-only)
    this.visualModel = {
      supportsInteractiveHighlights: preferencesConfiguration.visualOptions.supportsInteractiveHighlights,


      // @public {BooleanProperty} - Whether or not "Interactive Highlights" are enabled for the simulation. If enabled,
      // focus highlights will appear around focusable components with 'over' events, and persist around the focused
      // element even with mouse and touch interaction.
      interactiveHighlightsEnabledProperty: new BooleanProperty( false )
    };

    // @public (read-only)
    this.audioModel = {
      supportsVoicing: preferencesConfiguration.audioOptions.supportsVoicing,
      supportsSound: preferencesConfiguration.audioOptions.supportsSound,
      supportsExtraSound: preferencesConfiguration.audioOptions.supportsExtraSound,

      simSoundEnabledProperty: audioManager.audioEnabledProperty,
      soundEnabledProperty: soundManager.enabledProperty,
      extraSoundEnabledProperty: soundManager.extraSoundEnabledProperty,

      voicingEnabledProperty: voicingManager.enabledProperty,
      voicingMainWindowVoicingEnabledProperty: voicingManager.mainWindowVoicingEnabledProperty,
      voicingObjectResponsesEnabledProperty: responseCollector.objectResponsesEnabledProperty,
      voicingContextResponsesEnabledProperty: responseCollector.contextResponsesEnabledProperty,
      voicingHintResponsesEnabledProperty: responseCollector.hintResponsesEnabledProperty,
      voicePitchProperty: voicingManager.voicePitchProperty,
      voiceRateProperty: voicingManager.voiceRateProperty,
      voiceProperty: voicingManager.voiceProperty
    };

    // @public (read-only)
    this.inputModel = {
      supportsGestureControl: preferencesConfiguration.inputOptions.supportsGestureControl,

      // @public {BooleanProperty} - Whether or not "Gesture Controls" are enabled for the simulation. If enabled,
      // touch screen input will change to work like a screen reader. Horizontal swipes across the screen will move focus,
      // double-taps will activate the selected item, and tap then hold will initiate drag and drop interactions.
      // Note that enabling this will generally prevent all touch input from working as it does normally.
      gestureControlsEnabledProperty: new BooleanProperty( false )
    };


    if ( this.audioModel.supportsVoicing ) {

      // Register these to be stored when PreferencesStorage is enabled. TODO: likely to be moved to a better spot, see https://github.com/phetsims/joist/issues/737
      PreferencesStorage.register( responseCollector.objectResponsesEnabledProperty, 'objectResponsesEnabledProperty' );
      PreferencesStorage.register( responseCollector.contextResponsesEnabledProperty, 'contextResponsesEnabledProperty' );
      PreferencesStorage.register( responseCollector.hintResponsesEnabledProperty, 'hintResponsesEnabledProperty' );
      PreferencesStorage.register( voicingManager.voiceRateProperty, 'voiceRateProperty' );
      PreferencesStorage.register( voicingManager.voicePitchProperty, 'voicePitchProperty' );
    }
    PreferencesStorage.register( this.visualModel.interactiveHighlightsEnabledProperty, 'interactiveHighlightsEnabledProperty' );
  }

  /**
   * @public
   * @returns {boolean}
   */
  supportsVisualPreferences() {
    return this.visualModel.supportsInteractiveHighlights;
  }

  /**
   * @public
   * @returns {boolean}
   */
  supportsAudioPreferences() {
    return this.audioModel.supportsVoicing ||
           this.audioModel.supportsSound ||
           this.audioModel.supportsExtraSound;
  }

  /**
   * @public
   * @returns {boolean}
   */
  supportsInputPreferences() {
    return this.inputModel.supportsGestureControl;
  }
}

joist.register( 'PreferencesManager', PreferencesManager );
export default PreferencesManager;