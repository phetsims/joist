// Copyright 2021-2022, University of Colorado Boulder

/**
 * A Class that manages Simulation features that are enabled and disabled by user Preferences.
 *
 * @author Jesse Greenberg
 */

import { voicingManager, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
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
import SpeechSynthesisAnnouncer from '../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import Tandem from '../../../tandem/js/Tandem.js';

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

// Any of the sub-models of the PreferencesModel
// type FeatureModel = GeneralModel | VisualModel | AudioModel | InputModel | LocalizationModel;

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

  public constructor( preferencesConfiguration: PreferencesConfiguration, providedOptions?: PreferencesModelOptions ) {

    const options = optionize<PreferencesModelOptions, EmptySelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'preferencesModel' ),
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

    // For now, the Voicing feature is only available when we are running in the english locale, accessibility
    // strings are not made available for translation.
    const simLocale = phet.chipper.locale || 'en';
    const supportsVoicing = preferencesConfiguration.audioOptions.supportsVoicing && SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() && simLocale === 'en';

    // Audio can be disabled explicitly via query parameter
    const audioEnabled = phet.chipper.queryParameters.audio !== 'disabled';

    this.audioModel = {
      supportsVoicing: supportsVoicing && audioEnabled,

      supportsSound: preferencesConfiguration.audioOptions.supportsSound && audioEnabled,
      supportsExtraSound: preferencesConfiguration.audioOptions.supportsExtraSound && audioEnabled,

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

    // Since voicingManager in Scenery can not use initialize-globals, set the initial value for whether Voicing is
    // enabled here in the PreferencesModel.
    if ( supportsVoicing ) {
      voicingManager.enabledProperty.value = phet.chipper.queryParameters.voicingInitiallyEnabled;

      // The default utteranceQueue will be used for voicing of simulation components, and it is enabled when the
      // voicingManager is fully enabled (voicingManager is enabled and the voicing is enabled for the "main window"
      // sim screens)
      voicingManager.enabledProperty.link( enabled => {
        voicingUtteranceQueue.enabled = enabled;
        !enabled && voicingUtteranceQueue.clear();
      } );

      // If initially enabled, then apply all responses on startup, can (and should) be overwritten by PreferencesStorage.
      if ( phet.chipper.queryParameters.voicingInitiallyEnabled ) {
        responseCollector.objectResponsesEnabledProperty.value = true;
        responseCollector.contextResponsesEnabledProperty.value = true;
        responseCollector.hintResponsesEnabledProperty.value = true;
      }
    }

    if ( phet.chipper.queryParameters.printVoicingResponses ) {
      voicingManager.startSpeakingEmitter.addListener( text => console.log( text ) );
    }

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

  /**
   * Returns true if the GeneralModel supports any preferences that can be changed.
   */
  public supportsGeneralPreferences(): boolean {
    return !!this.generalModel.createSimControls;
  }

  /**
   * Returns true if the VisualModel has any preferences that can be changed.
   */
  public supportsVisualPreferences(): boolean {
    return this.visualModel.supportsInteractiveHighlights ||
           this.visualModel.supportsProjectorMode;
  }

  /**
   * Returns true if the AudioModel has any preferences that can be changed.
   */
  public supportsAudioPreferences(): boolean {
    return this.audioModel.supportsVoicing ||
           this.audioModel.supportsSound ||
           this.audioModel.supportsExtraSound;
  }

  /**
   * Returns true if the InputModel has any preferences that can be changed.
   */
  public supportsInputPreferences(): boolean {
    return this.inputModel.supportsGestureControl;
  }

  /**
   * Returns true if the LocalizationModel has any preferences that can be changed.
   */
  public supportsLocalizationPreferences(): boolean {
    return this.localizationModel.supportsMultipleLocales ||
           this.localizationModel.regionAndCultureDescriptors.length > 0;
  }

  /**
   * Returns true if this model supports any controllable preferences but MORE than basic sound. If enabling sound
   * is the only preference then we don't want to let the user access the Preferences dialog because there is already
   * a sound control in the navigation bar. The PreferencesDialog is not useful in that case.
   */
  public shouldShowDialog(): boolean {
    return this.supportsGeneralPreferences() || this.supportsVisualPreferences() ||
           this.supportsInputPreferences() || this.supportsLocalizationPreferences() ||

           // TODO: Create an option in supportsAudioPreferences to exclude supportsSound so we can still use that function? see https://github.com/phetsims/joist/issues/834
           this.audioModel.supportsVoicing || this.audioModel.supportsExtraSound;
  }
}

joist.register( 'PreferencesModel', PreferencesModel );
export default PreferencesModel;