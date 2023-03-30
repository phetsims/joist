// Copyright 2021-2023, University of Colorado Boulder

/**
 * A Class that manages Simulation features that are enabled and disabled by user Preferences.
 *
 * @author Jesse Greenberg
 */

import { colorProfileProperty, Node, voicingManager, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import responseCollector from '../../../utterance-queue/js/responseCollector.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import joist from '../joist.js';
import PreferencesStorage from './PreferencesStorage.js';
import soundManager from '../../../tambo/js/soundManager.js';
import audioManager from '../audioManager.js';
import Property from '../../../axon/js/Property.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import regionAndCultureManager from './regionAndCultureManager.js';
import SpeechSynthesisAnnouncer from '../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import localeProperty, { Locale } from '../i18n/localeProperty.js';
import merge from '../../../phet-core/js/merge.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import IOType from '../../../tandem/js/types/IOType.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import CharacterSet from './CharacterSet.js';
import Multilink from '../../../axon/js/Multilink.js';

type ModelPropertyLinkable = {
  property: TReadOnlyProperty<unknown> & PhetioObject;
  tandemName?: string; // if blank, will use the tandem.name of the Property.
};

type CustomPreference = {

  // Content should create a child tandem called 'simPreferences'
  createContent: ( parentTandem: Tandem ) => Node;

  // Each will have a PhET-iO LinkedElement added to the model for each of them.
  modelLinkables?: ModelPropertyLinkable[];
};

type CustomPreferencesOptions = {
  customPreferences?: CustomPreference[];
};

const AUDIO_MODEL_TANDEM = 'audioModel';
const VISUAL_MODEL_TANDEM = 'visualModel';
const INPUT_MODEL_TANDEM = 'inputModel';

///////////////////////////////////////////
// Options types

// preferences that are simulation-specific
type SimulationPreferencesOptions = CustomPreferencesOptions;

type VisualPreferencesOptions = {

  // Whether the sim supports projector mode and a toggle switch to enable it in the PreferencesDialog.
  supportsProjectorMode?: boolean;

  // whether the sim supports the "Interactive Highlights" feature, and checkbox to enable in the
  // Preferences Dialog
  supportsInteractiveHighlights?: boolean;
} & CustomPreferencesOptions;

type AudioPreferencesOptions = {

  // The entry point for Voicing, and if true the sim will support Voicing and Voicing options in Preferences.
  // The feature is only available on platforms where SpeechSynthesis is supported. For now, it is only available
  // when running with English locales, accessibility strings are not made available for translation yet.
  supportsVoicing?: boolean;

  // Whether to include checkboxes related to sound and extra sound. supportsExtraSound can only be
  // included if supportsSound is also true.
  supportsSound?: boolean;
  supportsExtraSound?: boolean;
} & CustomPreferencesOptions;

type InputPreferencesOptions = {

  // Whether to include "gesture" controls
  supportsGestureControl?: boolean;
} & CustomPreferencesOptions;

type LocalizationPreferencesOptions = {

  // Whether to include a UI component that changes the sim language. Default for this in phetFeatures is true. But it
  // is still only available when localeProperty indicates that more than one locale is available.
  supportsDynamicLocales?: boolean;

  // Describes the available artwork that can be used for different regions and cultures. If any sets are
  // provided, the Localization tab will include a UI component to swap out pieces of artwork to match the selected
  // region and culture. CharacterSets contains information for the UI component to describe each choice.
  characterSets?: CharacterSet[];

  // Whether to include the default LocalePanel for selecting locale. This was added to allow sims like
  // Number Play and Number Compare to substitute their own custom controls.
  // See https://github.com/phetsims/number-suite-common/issues/47.
  includeLocalePanel?: boolean;
} & CustomPreferencesOptions;

type PreferencesModelSelfOptions = {

  // configuration for controls in the "Simulation" tab of the PreferencesDialog
  simulationOptions?: SimulationPreferencesOptions;

  // configuration for controls in the "Visual" tab of the PreferencesDialog
  visualOptions?: VisualPreferencesOptions;

  // configuration for controls in the "Audio" tab of the PreferencesDialog
  audioOptions?: AudioPreferencesOptions;

  // configuration for controls in the "Input" tab of the PreferencesDialog
  inputOptions?: InputPreferencesOptions;

  // configuration for controls in the "Localization" tab of the PreferencesDialog
  localizationOptions?: LocalizationPreferencesOptions;
};

export type PreferencesModelOptions = PreferencesModelSelfOptions & PhetioObjectOptions;

/////////////////////////////////////
// Model types

type BaseModelType = {
  tandemName: string; // tandem name of the model, like "audioModel"
};

// Model for controls that appear in the "Simulation" panel of preferences
export type SimulationModel = BaseModelType & Required<SimulationPreferencesOptions>;

// Model for controls that appear in the "Visual" panel of preferences
export type VisualModel = BaseModelType & {

  // Whether "Interactive Highlights" are enabled for the simulation. If enabled, focus highlights will appear around
  // focusable components with 'over' events, and persist around the focused element even with mouse and touch
  // interaction.
  interactiveHighlightsEnabledProperty: Property<boolean>;

  // The current colorProfile of the Simulation
  colorProfileProperty: Property<string>;
} & Required<VisualPreferencesOptions>;

// Model for controls that appear in the "Audio" panel of preferences
export type AudioModel = BaseModelType & {

  // When false, no audio features are heard. See audioManager.ts for documentation about audio and sub features.
  audioEnabledProperty: Property<boolean>;
  soundEnabledProperty: Property<boolean>;
  extraSoundEnabledProperty: Property<boolean>;
  voicingEnabledProperty: Property<boolean>;

  // Whether sub-features of Voicing are enabled. See voicingManager and responseCollector for documentation about
  // each of these features.
  voicingMainWindowVoicingEnabledProperty: Property<boolean>;
  voicingObjectResponsesEnabledProperty: Property<boolean>;
  voicingContextResponsesEnabledProperty: Property<boolean>;
  voicingHintResponsesEnabledProperty: Property<boolean>;

  // Controls for the voice of SpeechSynthesisAnnouncer.ts
  voicePitchProperty: NumberProperty;
  voiceRateProperty: NumberProperty;
  voiceProperty: Property<null | SpeechSynthesisVoice>; // Not a PhET-iO linked element because it can't be customized through the API.

  // Whether the Sim Toolbar is enabled, which gives quick access to Voicing controls and features.
  toolbarEnabledProperty: Property<boolean>;
} & Required<AudioPreferencesOptions>;

export type InputModel = BaseModelType & {

  // Whether "Gesture Controls" are enabled for the simulation. If enabled, touch screen input will change to work
  // like a screen reader. Horizontal swipes across the screen will move focus, double-taps will activate the
  // selected item, and tap then hold will initiate drag and drop interactions. Note that enabling this will generally
  // prevent all touch input from working as it does normally.
  gestureControlsEnabledProperty: Property<boolean>;

} & Required<InputPreferencesOptions>;

export type LocalizationModel = BaseModelType & {

  // The selected character artwork to use when the sim supports culture and region switching.
  regionAndCultureProperty: Property<CharacterSet | null>;

  localeProperty: Property<Locale>;
} & Required<LocalizationPreferencesOptions>;

type FeatureModel = SimulationModel | AudioModel | VisualModel | InputModel | LocalizationModel;

export default class PreferencesModel extends PhetioObject {
  public readonly simulationModel: SimulationModel;
  public readonly visualModel: VisualModel;
  public readonly audioModel: AudioModel;
  public readonly inputModel: InputModel;
  public readonly localizationModel: LocalizationModel;

  public constructor( providedOptions: PreferencesModelOptions = {} ) {

    // initialize-globals uses package.json to determine defaults for features enabled by the sim and those defaults
    // can be overwritten by query parameter.  So phet.chipper.queryParameters contains an accurate representation of
    // which features are required.
    const phetFeatures = phet.chipper.queryParameters;

    // Multiple optionize calls + spread in one initialization site so that TypeScript has the correct type for nested
    // options immediately, and we don't need multiple variables to achieve it.
    const options = {

      // Put the spread first so that nested options' defaults will correctly override
      ...( optionize<PreferencesModelOptions, EmptySelfOptions, PhetioObjectOptions>()( {

        // phet-io
        tandem: Tandem.OPTIONAL,
        phetioType: PreferencesModel.PreferencesModelIO,
        phetioFeatured: true,
        phetioState: false,
        phetioReadOnly: true
      }, providedOptions ) ),
      simulationOptions: optionize<SimulationPreferencesOptions, SimulationPreferencesOptions, BaseModelType>()( {
        tandemName: 'simulationModel',
        customPreferences: []
      }, providedOptions.simulationOptions ),
      visualOptions: optionize<VisualPreferencesOptions, VisualPreferencesOptions, BaseModelType>()( {
        tandemName: VISUAL_MODEL_TANDEM,
        supportsProjectorMode: false,
        supportsInteractiveHighlights: phetFeatures.supportsInteractiveHighlights,
        customPreferences: []
      }, providedOptions.visualOptions ),
      audioOptions: optionize<AudioPreferencesOptions, AudioPreferencesOptions, BaseModelType>()( {
        tandemName: AUDIO_MODEL_TANDEM,
        supportsVoicing: phetFeatures.supportsVoicing,
        supportsSound: phetFeatures.supportsSound,
        supportsExtraSound: phetFeatures.supportsExtraSound,
        customPreferences: []
      }, providedOptions.audioOptions ),
      inputOptions: optionize<InputPreferencesOptions, InputPreferencesOptions, BaseModelType>()( {
        tandemName: INPUT_MODEL_TANDEM,
        supportsGestureControl: phetFeatures.supportsGestureControl,
        customPreferences: []
      }, providedOptions.inputOptions ),
      localizationOptions: optionize<LocalizationPreferencesOptions, LocalizationPreferencesOptions, BaseModelType>()( {
        tandemName: 'localizationModel',
        supportsDynamicLocales: !!localeProperty.validValues && localeProperty.validValues.length > 1 && phet.chipper.allowLocaleSwitching,
        characterSets: [],
        customPreferences: [],
        includeLocalePanel: true
      }, providedOptions.localizationOptions )
    };

    super( options );

    this.simulationModel = options.simulationOptions;

    const visualTandem = options.tandem.createTandem( VISUAL_MODEL_TANDEM );
    this.visualModel = merge( {
      interactiveHighlightsEnabledProperty: new BooleanProperty( phet.chipper.queryParameters.interactiveHighlightsInitiallyEnabled, {
        tandem: visualTandem.createTandem( 'interactiveHighlightsEnabledProperty' ),
        phetioState: false
      } ),
      colorProfileProperty: colorProfileProperty
    }, options.visualOptions );

    // For now, the Voicing feature is only available when we are running in the English locale, accessibility
    // strings are not made available for translation. When running with dynamic locales, the voicing feature
    // is supported if English is available, but will be disabled until English is selected.
    const supportsVoicing = options.audioOptions.supportsVoicing &&
                            SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() &&
                            (
                              // Running with english locale OR an environment where locale switching is supported and
                              // english is one of the available languages.
                              phet.chipper.locale.startsWith( 'en' ) ||
                              ( phet.chipper.allowLocaleSwitching && _.some( localeProperty.validValues, value => value.startsWith( 'en' ) ) )
                            );

    // Audio can be disabled explicitly via query parameter
    const audioEnabled = phet.chipper.queryParameters.audio !== 'disabled';

    this.audioModel = {
      supportsVoicing: supportsVoicing && audioEnabled,

      supportsSound: options.audioOptions.supportsSound && audioEnabled,
      supportsExtraSound: options.audioOptions.supportsExtraSound && audioEnabled,

      audioEnabledProperty: audioManager.audioEnabledProperty,
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

      toolbarEnabledProperty: new BooleanProperty( true, {
        tandem: options.tandem.createTandem( AUDIO_MODEL_TANDEM ).createTandem( 'toolbarEnabledProperty' ),
        phetioState: false
      } ),

      customPreferences: options.audioOptions.customPreferences,
      tandemName: options.audioOptions.tandemName
    };

    const inputTandem = options.tandem.createTandem( INPUT_MODEL_TANDEM );
    this.inputModel = merge( {
      gestureControlsEnabledProperty: new BooleanProperty( false, {
        tandem: inputTandem.createTandem( 'gestureControlsEnabledProperty' ),
        phetioState: false
      } )
    }, options.inputOptions );

    this.localizationModel = merge( {
      localeProperty: localeProperty,
      regionAndCultureProperty: regionAndCultureManager.regionAndCultureProperty
    }, options.localizationOptions );

    if ( options.localizationOptions.characterSets.length > 0 ) {

      // default is the first set
      regionAndCultureManager.regionAndCultureProperty.value = options.localizationOptions.characterSets[ 0 ];

      assert && assert( regionAndCultureManager.regionAndCultureProperty.value !== null, 'We have at least one descriptor, so regionAndCultureProperty should not be null.' );
      this.localizationModel.regionAndCultureProperty = regionAndCultureManager.regionAndCultureProperty;
    }


    if ( this.audioModel.supportsExtraSound ) {
      assert && assert( this.audioModel.supportsSound, 'supportsSound must be true to also support extraSound' );
    }

    this.addPhetioLinkedElementsForModel( options.tandem, this.simulationModel );

    this.addPhetioLinkedElementsForModel( options.tandem, this.visualModel, [
      { property: this.visualModel.colorProfileProperty }
    ] );

    this.addPhetioLinkedElementsForModel( options.tandem, this.audioModel, [
      { property: this.audioModel.audioEnabledProperty, tandemName: 'audioEnabledProperty' },
      { property: this.audioModel.soundEnabledProperty, tandemName: 'soundEnabledProperty' },
      { property: this.audioModel.extraSoundEnabledProperty, tandemName: 'extraSoundEnabledProperty' },
      { property: this.audioModel.voicingEnabledProperty, tandemName: 'voicingEnabledProperty' },
      { property: this.audioModel.voicingMainWindowVoicingEnabledProperty, tandemName: 'voicingMainWindowVoicingEnabledProperty' },
      { property: this.audioModel.voicingObjectResponsesEnabledProperty, tandemName: 'voicingObjectResponsesEnabledProperty' },
      { property: this.audioModel.voicingContextResponsesEnabledProperty, tandemName: 'voicingContextResponsesEnabledProperty' },
      { property: this.audioModel.voicingHintResponsesEnabledProperty, tandemName: 'voicingHintResponsesEnabledProperty' },
      { property: this.audioModel.voicePitchProperty, tandemName: 'voicePitchProperty' },
      { property: this.audioModel.voiceRateProperty, tandemName: 'voiceRateProperty' }
    ] );
    this.addPhetioLinkedElementsForModel( options.tandem, this.inputModel );
    this.addPhetioLinkedElementsForModel( options.tandem, this.localizationModel, [
      { property: this.localizationModel.localeProperty, tandemName: 'localeProperty' }
    ] );

    // Since voicingManager in Scenery can not use initialize-globals, set the initial value for whether Voicing is
    // enabled here in the PreferencesModel.
    if ( supportsVoicing ) {
      voicingManager.enabledProperty.value = phet.chipper.queryParameters.voicingInitiallyEnabled;

      // Voicing is only available in the 'en' locale currently. If the locale is changed away from English, Voicing is
      // disabled. The next time Voicing returns to 'en', Voicing will be enabled again.
      let voicingDisabledFromLocale = false;
      localeProperty.link( locale => {

        const englishLocale = locale.startsWith( 'en' );
        if ( voicingManager.enabledProperty.value ) {
          voicingManager.enabledProperty.value = englishLocale;
          voicingDisabledFromLocale = true;
        }
        else if ( voicingDisabledFromLocale && englishLocale ) {
          voicingManager.enabledProperty.value = true;
          voicingDisabledFromLocale = false;
        }
      } );

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

        // Set the first voice according to PhET's preferred english voices
        const voicesMultilink = Multilink.multilink(
          [ voicingManager.voicesProperty, voicingManager.isInitializedProperty ],
          ( voices, initialized ) => {
            if ( initialized && voices.length > 0 ) {
              voicingManager.voiceProperty.value = voicingManager.getEnglishPrioritizedVoices()[ 0 ];
              Multilink.unmultilink( voicesMultilink );
            }
          }
        );
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

      // Register these to be stored when PreferencesStorage is enabled.
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

  private addPhetioLinkedElementsForModel( parentTandem: Tandem, featureModel: FeatureModel, additionalProperties: Array<ModelPropertyLinkable> = [] ): void {
    const tandem = parentTandem.createTandem( featureModel.tandemName );
    const propertiesToLink = additionalProperties;
    for ( let i = 0; i < featureModel.customPreferences.length; i++ ) {
      const customPreference = featureModel.customPreferences[ i ];
      customPreference.modelLinkables && propertiesToLink.push( ...customPreference.modelLinkables );
    }

    for ( let j = 0; j < propertiesToLink.length; j++ ) {
      const modelPropertyObject = propertiesToLink[ j ];
      const tandemName = modelPropertyObject.tandemName || modelPropertyObject.property.tandem.name;
      this.addLinkedElement( modelPropertyObject.property, { tandem: tandem.createTandem( tandemName ) } );
    }
  }

  public preferenceModelHasCustom( preferenceModel: Required<CustomPreferencesOptions> ): boolean {
    return preferenceModel.customPreferences.length > 0;
  }

  /**
   * Returns true if the SimulationModel supports any preferences that can be changed.
   */
  public supportsSimulationPreferences(): boolean {
    return this.preferenceModelHasCustom( this.simulationModel );
  }

  /**
   * Returns true if the VisualModel has any preferences that can be changed.
   */
  public supportsVisualPreferences(): boolean {
    return this.visualModel.supportsInteractiveHighlights ||
           this.visualModel.supportsProjectorMode ||
           this.preferenceModelHasCustom( this.visualModel );
  }

  /**
   * Returns true if the AudioModel has any preferences that can be changed.
   */
  public supportsAudioPreferences(): boolean {
    return this.audioModel.supportsSound ||
           this.audioModel.supportsExtraSound ||
           this.audioModel.supportsVoicing ||
           this.preferenceModelHasCustom( this.audioModel );
  }

  /**
   * Returns true if the InputModel has any preferences that can be changed.
   */
  public supportsInputPreferences(): boolean {
    return this.inputModel.supportsGestureControl || this.preferenceModelHasCustom( this.inputModel );
  }

  /**
   * Returns true if the LocalizationModel has any preferences that can be changed.
   */
  public supportsLocalizationPreferences(): boolean {
    return this.localizationModel.supportsDynamicLocales ||
           this.localizationModel.characterSets.length > 0 ||
           this.preferenceModelHasCustom( this.localizationModel );
  }

  /**
   * Returns true if this model supports any controllable preferences for the dialog. Returns false when the dialog
   * would have nothing to display.
   */
  public shouldShowDialog(): boolean {
    return this.supportsSimulationPreferences() || this.supportsVisualPreferences() ||
           this.supportsInputPreferences() || this.supportsLocalizationPreferences() ||
           this.supportsAudioPreferences();
  }

  public static PreferencesModelIO = new IOType( 'PreferencesModelIO', {
    valueType: PreferencesModel,

    toStateObject: ( preferencesModel: PreferencesModel ) => {
      return {
        supportsProjectorMode: preferencesModel.visualModel.supportsProjectorMode,
        supportsInteractiveHighlights: preferencesModel.visualModel.supportsInteractiveHighlights,
        supportsVoicing: preferencesModel.audioModel.supportsVoicing,
        supportsSound: preferencesModel.audioModel.supportsSound,
        supportsExtraSound: preferencesModel.audioModel.supportsExtraSound,
        supportsGestureControl: preferencesModel.inputModel.supportsGestureControl,
        supportsDynamicLocales: preferencesModel.localizationModel.supportsDynamicLocales,

        // Method-based
        supportsAudioPreferences: preferencesModel.supportsAudioPreferences(),
        supportsInputPreferences: preferencesModel.supportsInputPreferences(),
        supportsLocalizationPreferences: preferencesModel.supportsLocalizationPreferences(),
        supportsSimulationPreferences: preferencesModel.supportsSimulationPreferences(),
        supportsVisualPreferences: preferencesModel.supportsVisualPreferences()
      };
    },
    stateSchema: {
      supportsProjectorMode: BooleanIO,
      supportsInteractiveHighlights: BooleanIO,
      supportsVoicing: BooleanIO,
      supportsSound: BooleanIO,
      supportsExtraSound: BooleanIO,
      supportsGestureControl: BooleanIO,
      supportsDynamicLocales: BooleanIO,

      // Method-based
      supportsAudioPreferences: BooleanIO,
      supportsInputPreferences: BooleanIO,
      supportsLocalizationPreferences: BooleanIO,
      supportsSimulationPreferences: BooleanIO,
      supportsVisualPreferences: BooleanIO
    }
  } );
}

joist.register( 'PreferencesModel', PreferencesModel );
