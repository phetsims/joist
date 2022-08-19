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
import PreferencesConfiguration, { AudioPreferencesOptions, GeneralPreferencesOptions, InputPreferencesOptions, LocalizationPreferencesOptions, VisualPreferencesOptions } from './PreferencesConfiguration.js';
import Property from '../../../axon/js/Property.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import localizationManager from './localizationManager.js';

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

  // Whether the Sim Toolbar is enabled, which gives quick access to Voicing controls and features.
  toolbarEnabledProperty: Property<boolean>;
} & Required<AudioPreferencesOptions>;

export type InputModel = {

  // Whether "Gesture Controls" are enabled for the simulation. If enabled, touch screen input will change to work
  // like a screen reader. Horizontal swipes across the screen will move focus, double-taps will activate the
  // selected item, and tap then hold will initiate drag and drop interactions. Note that enabling this will generally
  // prevent all touch input from working as it does normally.
  gestureControlsEnabledProperty: Property<boolean>;

} & Required<InputPreferencesOptions>;

export type LocalizationModel = {

  // The selected character artwork to use when the sim supports culture and region switching.
  regionAndCultureProperty: Property<number>;
} & Required<LocalizationPreferencesOptions>;

type PreferencesModelOptions = PhetioObjectOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

class PreferencesModel extends PhetioObject {
  public readonly generalModel: GeneralModel;
  public readonly visualModel: VisualModel;
  public readonly audioModel: AudioModel;
  public readonly inputModel: InputModel;
  public readonly localizationModel: LocalizationModel;

  public constructor( preferencesConfiguration: PreferencesConfiguration, providedOptions: PreferencesModelOptions ) {

    const options = optionize<PreferencesModelOptions, EmptySelfOptions, PhetioObjectOptions>()( {
      phetioState: false,
      phetioReadOnly: true
    }, providedOptions );

    super( options );

    this.generalModel = preferencesConfiguration.generalOptions;

    const visualTandem = options.tandem.createTandem( 'visualModel' );
    this.visualModel = {
      supportsInteractiveHighlights: preferencesConfiguration.visualOptions.supportsInteractiveHighlights,
      supportsProjectorMode: preferencesConfiguration.visualOptions.supportsProjectorMode,
      interactiveHighlightsEnabledProperty: new BooleanProperty( false, {
        tandem: visualTandem.createTandem( 'interactiveHighlightsEnabledProperty' ),
        phetioState: false,
        phetioReadOnly: true
      } )
    };

    this.audioModel = {
      supportsVoicing: preferencesConfiguration.audioOptions.supportsVoicing,
      supportsSound: preferencesConfiguration.audioOptions.supportsSound,
      supportsExtraSound: preferencesConfiguration.audioOptions.supportsExtraSound,

      simSoundEnabledProperty: audioManager.audioEnabledProperty,
      soundEnabledProperty: soundManager.enabledProperty,
      extraSoundEnabledProperty: soundManager.extraSoundEnabledProperty,

      voicingEnabledProperty: voicingManager.enabledProperty as Property<boolean>,
      voicingMainWindowVoicingEnabledProperty: voicingManager.mainWindowVoicingEnabledProperty,
      voicingObjectResponsesEnabledProperty: responseCollector.objectResponsesEnabledProperty,
      voicingContextResponsesEnabledProperty: responseCollector.contextResponsesEnabledProperty,
      voicingHintResponsesEnabledProperty: responseCollector.hintResponsesEnabledProperty,
      voicePitchProperty: voicingManager.voicePitchProperty,
      voiceRateProperty: voicingManager.voiceRateProperty,
      voiceProperty: voicingManager.voiceProperty,

      toolbarEnabledProperty: new BooleanProperty( true )
    };

    this.localizationModel = {
      supportsMultipleLocales: preferencesConfiguration.localizationOptions.supportsMultipleLocales,

      regionAndCultureProperty: localizationManager.regionAndCultureProperty,
      regionAndCultureDescriptors: preferencesConfiguration.localizationOptions.regionAndCultureDescriptors
    };

    // Provide linked elements for already instrumented Properties to make PreferencesModel a one-stop shop to view preferences.
    const audioTandem = options.tandem.createTandem( 'audioModel' );
    this.addLinkedElement( this.audioModel.simSoundEnabledProperty, { tandem: audioTandem.createTandem( 'simSoundEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.soundEnabledProperty, { tandem: audioTandem.createTandem( 'soundEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.extraSoundEnabledProperty, { tandem: audioTandem.createTandem( 'extraSoundEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicingEnabledProperty, { tandem: audioTandem.createTandem( 'voicingEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicingMainWindowVoicingEnabledProperty, { tandem: audioTandem.createTandem( 'voicingMainWindowVoicingEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicingObjectResponsesEnabledProperty, { tandem: audioTandem.createTandem( 'voicingObjectResponsesEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicingContextResponsesEnabledProperty, { tandem: audioTandem.createTandem( 'voicingContextResponsesEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicingHintResponsesEnabledProperty, { tandem: audioTandem.createTandem( 'voicingHintResponsesEnabledProperty' ) } );
    this.addLinkedElement( this.audioModel.voicePitchProperty, { tandem: audioTandem.createTandem( 'voicePitchProperty' ) } );
    this.addLinkedElement( this.audioModel.voiceRateProperty, { tandem: audioTandem.createTandem( 'voiceRateProperty' ) } );
    this.addLinkedElement( this.audioModel.voiceProperty, { tandem: audioTandem.createTandem( 'voiceProperty' ) } );

    const inputTandem = options.tandem.createTandem( 'inputModel' );
    this.inputModel = {
      supportsGestureControl: preferencesConfiguration.inputOptions.supportsGestureControl,
      gestureControlsEnabledProperty: new BooleanProperty( false, {
        tandem: inputTandem.createTandem( 'gestureControlsEnabledProperty' ),
        phetioState: false,
        phetioReadOnly: true
      } )
    };

    this.registerPreferencesStorage();
  }

  /**
   * Set up preferencesStorage for supported PreferencesProperties. Don't include all-sound and all-audio controls
   * because that feel too global to automatically take the last value.
   */
  private registerPreferencesStorage(): void {

    if ( this.visualModel.supportsInteractiveHighlights ) {
      PreferencesStorage.register( this.visualModel.interactiveHighlightsEnabledProperty, 'interactiveHighlightsEnabledProperty' );
    }
    if ( this.audioModel.supportsVoicing ) {

      // Register these to be stored when PreferencesStorage is enabled. TODO: likely to be moved to a better spot, see https://github.com/phetsims/joist/issues/737
      PreferencesStorage.register( this.audioModel.voicingObjectResponsesEnabledProperty, 'objectResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voicingContextResponsesEnabledProperty, 'contextResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voicingHintResponsesEnabledProperty, 'hintResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voiceRateProperty, 'voiceRateProperty' );
      PreferencesStorage.register( this.audioModel.voicePitchProperty, 'voicePitchProperty' );
    }
    if ( this.audioModel.supportsExtraSound ) {
      PreferencesStorage.register( this.audioModel.extraSoundEnabledProperty, 'extraSoundEnabledProperty' );
    }

    if ( this.inputModel.supportsGestureControl ) {
      PreferencesStorage.register( this.inputModel.gestureControlsEnabledProperty, 'gestureControlsEnabledProperty' );
    }
  }

  public supportsVisualPreferences(): boolean {
    return this.visualModel.supportsInteractiveHighlights ||
           this.visualModel.supportsProjectorMode;
  }

  public supportsAudioPreferences(): boolean {
    return this.audioModel.supportsVoicing ||
           this.audioModel.supportsSound ||
           this.audioModel.supportsExtraSound;
  }

  public supportsInputPreferences(): boolean {
    return this.inputModel.supportsGestureControl;
  }

  public supportsLocalizationPreferences(): boolean {
    return this.localizationModel.supportsMultipleLocales ||
           this.localizationModel.regionAndCultureDescriptors.length > 0;
  }
}

joist.register( 'PreferencesModel', PreferencesModel );
export default PreferencesModel;