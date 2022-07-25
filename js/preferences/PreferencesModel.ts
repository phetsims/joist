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
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

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

type PreferencesModelOptions = PhetioObjectOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

class PreferencesModel extends PhetioObject {

  // Whether the Sim Toolbar is enabled, which gives quick access to various controls for the simulation or
  // active screen.
  public readonly toolbarEnabledProperty = new BooleanProperty( true );

  public readonly generalModel: GeneralModel;
  public readonly visualModel: VisualModel;
  public readonly audioModel: AudioModel;
  public readonly inputModel: InputModel;

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
      voiceProperty: voicingManager.voiceProperty
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

    if ( this.audioModel.supportsVoicing ) {

      // Register these to be stored when PreferencesStorage is enabled. TODO: likely to be moved to a better spot, see https://github.com/phetsims/joist/issues/737
      PreferencesStorage.register( this.audioModel.voicingObjectResponsesEnabledProperty, 'objectResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voicingContextResponsesEnabledProperty, 'contextResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voicingHintResponsesEnabledProperty, 'hintResponsesEnabledProperty' );
      PreferencesStorage.register( this.audioModel.voiceRateProperty, 'voiceRateProperty' );
      PreferencesStorage.register( this.audioModel.voicePitchProperty, 'voicePitchProperty' );
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

joist.register( 'PreferencesModel', PreferencesModel );
export default PreferencesModel;