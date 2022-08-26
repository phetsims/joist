// Copyright 2021-2022, University of Colorado Boulder

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
import localizationManager, { RegionAndCultureDescriptor } from './localizationManager.js';
import SpeechSynthesisAnnouncer from '../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import localeProperty from '../localeProperty.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import merge from '../../../phet-core/js/merge.js';

type LinkedModelProperties = {
  property: Property<IntentionalAny>;
  tandemName?: string; // if blank, will use the tandem.name of the Property.
};

type CustomPreference = {

  // Content should create a child tandem called 'simPreferences'
  createContent: ( parentTandem: Tandem ) => Node;

  // Each will have a PhET-iO LinkedElement added to the model for each of them.
  linkedModelProperties?: LinkedModelProperties[];
};

type CustomPreferencesOptions = {
  customPreferences?: CustomPreference[];
};

///////////////////////////////////////////
// Options types

type GeneralPreferencesOptions = CustomPreferencesOptions;

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
  // when running with english locales, accessibility strings are not made available for translation yet.
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
  supportsMultipleLocales?: boolean;

  // Describes the available artwork that can be used for different regions and cultures. If any descriptors are
  // provided, the Localization tab will include a UI component to swap out pieces of artwork to match the selected
  // region and culture. RegionAndCultureDescriptors contains information for the UI component to describe each choice.
  regionAndCultureDescriptors?: RegionAndCultureDescriptor[];
} & CustomPreferencesOptions;

type PreferencesModelSelfOptions = {

  // configuration for controls in the "General" tab of the PreferencesDialog
  generalOptions?: GeneralPreferencesOptions;

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

export type GeneralModel = BaseModelType & Required<GeneralPreferencesOptions>;

export type VisualModel = BaseModelType & {

  // Whether "Interactive Highlights" are enabled for the simulation. If enabled, focus highlights will appear around
  // focusable components with 'over' events, and persist around the focused element even with mouse and touch
  // interaction.
  interactiveHighlightsEnabledProperty: Property<boolean>;

  // The current colorProfile of the Simulation
  colorProfileProperty: Property<string>;
} & Required<VisualPreferencesOptions>;

export type AudioModel = BaseModelType & {
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

export type InputModel = BaseModelType & {

  // Whether "Gesture Controls" are enabled for the simulation. If enabled, touch screen input will change to work
  // like a screen reader. Horizontal swipes across the screen will move focus, double-taps will activate the
  // selected item, and tap then hold will initiate drag and drop interactions. Note that enabling this will generally
  // prevent all touch input from working as it does normally.
  gestureControlsEnabledProperty: Property<boolean>;

} & Required<InputPreferencesOptions>;

export type LocalizationModel = BaseModelType & {

  // The selected character artwork to use when the sim supports culture and region switching.
  regionAndCultureProperty: Property<number>;

  localeProperty: Property<string>;
} & Required<LocalizationPreferencesOptions>;

type FeatureModel = GeneralModel | AudioModel | VisualModel | InputModel | LocalizationModel;

export default class PreferencesModel extends PhetioObject {
  public readonly generalModel: GeneralModel;
  public readonly visualModel: VisualModel;
  public readonly audioModel: AudioModel;
  public readonly inputModel: InputModel;
  public readonly localizationModel: LocalizationModel;

  public constructor( providedOptions?: PreferencesModelOptions ) {
    providedOptions = providedOptions || {};

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
        tandem: Tandem.GENERAL_MODEL.createTandem( 'preferencesModel' ),
        phetioState: false,
        phetioReadOnly: true
      }, providedOptions ) ),
      generalOptions: optionize<GeneralPreferencesOptions, GeneralPreferencesOptions, BaseModelType>()( {
        tandemName: 'generalModel',
        customPreferences: []
      }, providedOptions.generalOptions ),
      visualOptions: optionize<VisualPreferencesOptions, VisualPreferencesOptions, BaseModelType>()( {
        tandemName: 'visualModel',
        supportsProjectorMode: false,
        supportsInteractiveHighlights: phetFeatures.supportsInteractiveHighlights,
        customPreferences: []
      }, providedOptions.visualOptions ),
      audioOptions: optionize<AudioPreferencesOptions, AudioPreferencesOptions, BaseModelType>()( {
        tandemName: 'audioModel',
        supportsVoicing: phetFeatures.supportsVoicing,
        supportsSound: phetFeatures.supportsSound,
        supportsExtraSound: phetFeatures.supportsExtraSound,
        customPreferences: []
      }, providedOptions.audioOptions ),
      inputOptions: optionize<InputPreferencesOptions, InputPreferencesOptions, BaseModelType>()( {
        tandemName: 'inputModel',
        supportsGestureControl: phetFeatures.supportsGestureControl,
        customPreferences: []
      }, providedOptions.inputOptions ),
      localizationOptions: optionize<LocalizationPreferencesOptions, LocalizationPreferencesOptions, BaseModelType>()( {
        tandemName: 'localizationModel',
        supportsMultipleLocales: !!localeProperty.validValues && localeProperty.validValues.length > 1,
        regionAndCultureDescriptors: [],
        customPreferences: []
      }, providedOptions.localizationOptions )
    };

    super( options );

    this.generalModel = options.generalOptions;

    const visualTandem = options.tandem.createTandem( 'visualModel' );
    this.visualModel = merge( {
      interactiveHighlightsEnabledProperty: new BooleanProperty( false, {
        tandem: visualTandem.createTandem( 'interactiveHighlightsEnabledProperty' ),
        phetioState: false,
        phetioReadOnly: true
      } ),
      colorProfileProperty: colorProfileProperty
    }, options.visualOptions );

    // For now, the Voicing feature is only available when we are running in the english locale, accessibility
    // strings are not made available for translation.
    const simLocale = phet.chipper.locale || 'en';
    const supportsVoicing = options.audioOptions.supportsVoicing && SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() && simLocale === 'en';

    // Audio can be disabled explicitly via query parameter
    const audioEnabled = phet.chipper.queryParameters.audio !== 'disabled';

    this.audioModel = {
      supportsVoicing: supportsVoicing && audioEnabled,

      supportsSound: options.audioOptions.supportsSound && audioEnabled,
      supportsExtraSound: options.audioOptions.supportsExtraSound && audioEnabled,

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

      toolbarEnabledProperty: new BooleanProperty( true, {
        tandem: visualTandem.createTandem( 'toolbarEnabledProperty' ),
        phetioState: false,
        phetioReadOnly: true
      } ),

      customPreferences: options.audioOptions.customPreferences,
      tandemName: options.audioOptions.tandemName
    };

    const inputTandem = options.tandem.createTandem( 'inputModel' );
    this.inputModel = merge( {
      gestureControlsEnabledProperty: new BooleanProperty( false, {
        tandem: inputTandem.createTandem( 'gestureControlsEnabledProperty' ),
        phetioState: false,
        phetioReadOnly: true
      } )
    }, options.inputOptions );

    this.localizationModel = merge( {
      localeProperty: localeProperty,
      regionAndCultureProperty: localizationManager.regionAndCultureProperty
    }, options.localizationOptions );

    if ( this.audioModel.supportsExtraSound ) {
      assert && assert( this.audioModel.supportsSound, 'supportsSound must be true to also support extraSound' );
    }

    this.addPhetioLinkedElementsForModel( options.tandem, this.generalModel );

    this.addPhetioLinkedElementsForModel( options.tandem, this.visualModel, [
      { property: this.visualModel.colorProfileProperty }
    ] );

    this.addPhetioLinkedElementsForModel( options.tandem, this.audioModel, [
      { property: this.audioModel.simSoundEnabledProperty, tandemName: 'simSoundEnabledProperty' },
      { property: this.audioModel.soundEnabledProperty, tandemName: 'soundEnabledProperty' },
      { property: this.audioModel.extraSoundEnabledProperty, tandemName: 'extraSoundEnabledProperty' },
      { property: this.audioModel.voicingEnabledProperty, tandemName: 'voicingEnabledProperty' },
      { property: this.audioModel.voicingMainWindowVoicingEnabledProperty, tandemName: 'voicingMainWindowVoicingEnabledProperty' },
      { property: this.audioModel.voicingObjectResponsesEnabledProperty, tandemName: 'voicingObjectResponsesEnabledProperty' },
      { property: this.audioModel.voicingContextResponsesEnabledProperty, tandemName: 'voicingContextResponsesEnabledProperty' },
      { property: this.audioModel.voicingHintResponsesEnabledProperty, tandemName: 'voicingHintResponsesEnabledProperty' },
      { property: this.audioModel.voicePitchProperty, tandemName: 'voicePitchProperty' },
      { property: this.audioModel.voiceRateProperty, tandemName: 'voiceRateProperty' },
      { property: this.audioModel.voiceProperty, tandemName: 'voiceProperty' }
    ] );
    this.addPhetioLinkedElementsForModel( options.tandem, this.inputModel );
    this.addPhetioLinkedElementsForModel( options.tandem, this.localizationModel, [
      { property: this.localizationModel.localeProperty, tandemName: 'localeProperty' }
    ] );

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

  private addPhetioLinkedElementsForModel( parentTandem: Tandem, featureModel: FeatureModel, additionalProperties: Array<LinkedModelProperties> = [] ): void {
    const tandem = parentTandem.createTandem( featureModel.tandemName );
    const propertiesToLink = additionalProperties;
    for ( let i = 0; i < featureModel.customPreferences.length; i++ ) {
      const customPreference = featureModel.customPreferences[ i ];
      customPreference.linkedModelProperties && propertiesToLink.push( ...customPreference.linkedModelProperties );
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
   * Returns true if the GeneralModel supports any preferences that can be changed.
   */
  public supportsGeneralPreferences(): boolean {
    return this.preferenceModelHasCustom( this.generalModel );
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
   * @param [checkSupportsSound] - If true, audioModel.supportsSound is included in the check for whether the model
   *                               supports any audio preferences. There are cases where that needs to be excluded
   *                               (see shouldShowDialog()).
   */
  public supportsAudioPreferences( checkSupportsSound = true ): boolean {
    let supportsAudioPreferences = this.audioModel.supportsVoicing ||
                                   this.audioModel.supportsExtraSound ||
                                   this.preferenceModelHasCustom( this.audioModel );

    supportsAudioPreferences = checkSupportsSound ? ( supportsAudioPreferences || this.audioModel.supportsSound ) : supportsAudioPreferences;
    return supportsAudioPreferences;
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
    return this.localizationModel.supportsMultipleLocales ||
           this.localizationModel.regionAndCultureDescriptors.length > 0 ||
           this.preferenceModelHasCustom( this.localizationModel );
  }

  /**
   * Returns true if this model supports any controllable preferences but MORE than basic sound. If enabling sound
   * is the only preference then we don't want to let the user access the Preferences dialog because there is already
   * a sound control in the navigation bar. The PreferencesDialog is not useful in that case.
   */
  public shouldShowDialog(): boolean {
    return this.supportsGeneralPreferences() || this.supportsVisualPreferences() ||
           this.supportsInputPreferences() || this.supportsLocalizationPreferences() ||
           this.supportsAudioPreferences( false );
  }
}

joist.register( 'PreferencesModel', PreferencesModel );
