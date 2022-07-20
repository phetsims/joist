// Copyright 2021-2022, University of Colorado Boulder

/**
 * A Class that manages Simulation features that are enabled and disabled by user Preferences.
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
import PreferencesConfiguration, { AudioPreferencesOptions, GeneralPreferencesOptions, InputPreferencesOptions, VisualPreferencesOptions } from './PreferencesConfiguration.js';
import Property from '../../../axon/js/Property.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';

export type GeneralModel = Required<GeneralPreferencesOptions>;

export type VisualModel = {

  // Whether "Interactive Highlights" are enabled for the simulation. If enabled, focus highlights will appear around
  // focusable components with 'over' events, and persist around the focused element even with mouse and touch
  // interaction.
  interactiveHighlightsEnabledProperty: Property<boolean>;
} & Required<VisualPreferencesOptions>;

export type AudioModel = {
  simSoundEnabledProperty: Property<boolean>;
  soundEnabledProperty: Property<boolean>;
  extraSoundEnabledProperty: Property<boolean>;
  voicingEnabledProperty: Property<boolean>;
  voicingMainWindowVoicingEnabledProperty: Property<boolean>;
  voicingObjectResponsesEnabledProperty: Property<boolean>;
  voicingContextResponsesEnabledProperty: Property<boolean>;
  voicingHintResponsesEnabledProperty: Property<boolean>;
  voicePitchProperty: NumberProperty;
  voiceRateProperty: NumberProperty;
  voiceProperty: Property<null | SpeechSynthesisVoice>;
} & Required<AudioPreferencesOptions>;

export type InputModel = {

  // Whether "Gesture Controls" are enabled for the simulation. If enabled, touch screen input will change to work
  // like a screen reader. Horizontal swipes across the screen will move focus, double-taps will activate the
  // selected item, and tap then hold will initiate drag and drop interactions. Note that enabling this will generally
  // prevent all touch input from working as it does normally.
  gestureControlsEnabledProperty: Property<boolean>;

} & Required<InputPreferencesOptions>;

class PreferencesManager {

  // Whether the Sim Toolbar is enabled, which gives quick access to various controls for the simulation or
  // active screen.
  public readonly toolbarEnabledProperty = new BooleanProperty( true );

  public readonly generalModel: GeneralModel;
  public readonly visualModel: VisualModel;
  public readonly audioModel: AudioModel;
  public readonly inputModel: InputModel;

  public constructor( preferencesConfiguration: PreferencesConfiguration ) {
    this.generalModel = preferencesConfiguration.generalOptions;

    this.visualModel = {
      supportsInteractiveHighlights: preferencesConfiguration.visualOptions.supportsInteractiveHighlights,
      interactiveHighlightsEnabledProperty: new BooleanProperty( false )
    };

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

    this.inputModel = {
      supportsGestureControl: preferencesConfiguration.inputOptions.supportsGestureControl,
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

  public supportsVisualPreferences(): boolean {
    return this.visualModel.supportsInteractiveHighlights;
  }

  public supportsAudioPreferences(): boolean {
    return this.audioModel.supportsVoicing ||
           this.audioModel.supportsSound ||
           this.audioModel.supportsExtraSound;
  }

  public supportsInputPreferences(): boolean {
    return this.inputModel.supportsGestureControl;
  }
}

joist.register( 'PreferencesManager', PreferencesManager );
export default PreferencesManager;