// Copyright 2021-2022, University of Colorado Boulder

/**
 * Configures the Preferences for a simulation, signifying which features are enabled in the simulation and will
 * therefore have a corresponding entry in the PreferencesDialog to enable/disable the feature. This is passed in
 * as an option to Sim.js.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import { Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SpeechSynthesisAnnouncer from '../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import joist from '../joist.js';
import { CharacterDescriptor } from './localizationManager.js';

export type GeneralPreferencesOptions = {

  // Creates any Node you would like under the "Simulation specific controls" section of the General tab.
  createSimControls?: ( ( tandem: Tandem ) => Node ) | null;

  // Creates any Node you would like under the "Localization" section of the General tab.
  createLocalizationControls?: ( ( tandem: Tandem ) => Node ) | null;
};

export type VisualPreferencesOptions = {

  // Whether the sim supports projector mode and a toggle switch to enable it in the PreferencesDialog.
  supportsProjectorMode?: boolean;

  // whether or not the sim supports the "Interactive Highlights" feature, and checkbox to enable in the
  // Preferences Dialog
  supportsInteractiveHighlights?: boolean;
};

export type AudioPreferencesOptions = {

  // The entry point for Voicing, and if true the sim will support Voicing and Voicing options in Preferences.
  // The feature is only available on platforms where SpeechSynthesis is supported. For now, it is only available
  // when running with english locales, accessibility strings are not made available for translation yet.
  supportsVoicing?: boolean;

  // Whether or not to include checkboxes related to sound and extra sound. supportsExtraSound can only be
  // included if supportsSound is also true.
  supportsSound?: boolean;
  supportsExtraSound?: boolean;
};

export type InputPreferencesOptions = {

  // Whether or not to include "gesture" controls
  supportsGestureControl?: boolean;
};

export type LocalizationPreferencesOptions = {

  // Whether to include a ComboBox that controls the language. The combo box will only be available if opted in with
  // PreferencesConfiguration and the sim is running in the _all HTML file because that is the only way we will have
  // access to strings of multiple languages.
  supportsLanguageSwitching?: boolean;

  // Whether to include a ComboBox that controls character artwork so that it can be changed to appear more like a
  // particular culture or region.
  supportsCharacterSwitching?: boolean;

  // Describes the available artwork that can be used for character switching. If supportsCharacterSwitching is true,
  // characterDescriptors must be provided. Contains information for the UI component to provide character choices.
  characterDescriptors?: CharacterDescriptor[];
};

export type PreferencesConfigurationOptions = {

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

class PreferencesConfiguration {

  public readonly generalOptions: Required<GeneralPreferencesOptions>;
  public readonly visualOptions: Required<VisualPreferencesOptions>;
  public readonly audioOptions: Required<AudioPreferencesOptions>;
  public readonly inputOptions: Required<InputPreferencesOptions>;
  public readonly localizationOptions: Required<LocalizationPreferencesOptions>;

  public constructor( providedOptions?: PreferencesConfigurationOptions ) {

    // initialize-globals uses package.json to determine defaults for features enabled by the sim and those defaults
    // can be overwritten by query parameter.  So phet.chipper.queryParameters contains an accurate representation of
    // which features are required.
    const phetFeatures = phet.chipper.queryParameters;

    // For now, the Voicing feature is only available when we are running in the english locale, accessibility
    // strings are not made available for translation.
    const simLocale = phet.chipper.locale || 'en';

    const initialOptions = optionize<PreferencesConfigurationOptions>()( {
      generalOptions: {
        createSimControls: null,
        createLocalizationControls: null
      },
      visualOptions: {
        supportsInteractiveHighlights: phetFeatures.supportsInteractiveHighlights
      },
      audioOptions: {
        supportsVoicing: phetFeatures.supportsVoicing && SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() && simLocale === 'en',
        supportsSound: phetFeatures.supportsSound,
        supportsExtraSound: phetFeatures.supportsExtraSound
      },
      inputOptions: {
        supportsGestureControl: phetFeatures.supportsGestureControl
      },
      localizationOptions: {
        supportsLanguageSwitching: false,
        supportsCharacterSwitching: false,
        characterDescriptors: []
      }
    }, providedOptions );

    if ( initialOptions.audioOptions.supportsExtraSound ) {
      assert && assert( initialOptions.audioOptions.supportsSound, 'supportsSound must be true to also support extraSound' );
    }
    if ( initialOptions.localizationOptions.supportsCharacterSwitching ) {
      assert && assert( initialOptions.localizationOptions.characterDescriptors && initialOptions.localizationOptions.characterDescriptors.length > 0,
        'Must provide characterDescriptors if you support characterSwitching' );
    }

    // We know that defaults are populated after the optionize call.
    this.generalOptions = initialOptions.generalOptions as Required<GeneralPreferencesOptions>;
    this.visualOptions = initialOptions.visualOptions as Required<VisualPreferencesOptions>;
    this.audioOptions = initialOptions.audioOptions as Required<AudioPreferencesOptions>;
    this.inputOptions = initialOptions.inputOptions as Required<InputPreferencesOptions>;
    this.localizationOptions = initialOptions.localizationOptions as Required<LocalizationPreferencesOptions>;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;