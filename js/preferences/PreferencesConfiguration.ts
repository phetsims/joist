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

export type GeneralPreferencesOptions = {

  // Creates any Node you would like under the "Simulation specific controls" section of the General tab.
  createSimControls?: ( ( tandem: Tandem ) => Node ) | null;

  // Creates any Node you would like under the "Localization" section of the General tab.
  createLocalizationControls?: ( ( tandem: Tandem ) => Node ) | null;
};

export type VisualPreferencesOptions = {

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

export type PreferencesConfigurationOptions = {

  // configuration for controls in the "General" tab of the PreferencesDialog
  generalOptions?: GeneralPreferencesOptions;

  // configuration for controls in the "Visual" tab of the PreferencesDialog
  visualOptions?: VisualPreferencesOptions;

  // configuration for controls in the "Audio" tab of the PreferencesDialog
  audioOptions?: AudioPreferencesOptions;

  // configuration for controls in the "Input" tab of the PreferencesDialog
  inputOptions?: InputPreferencesOptions;
};

class PreferencesConfiguration {

  public readonly generalOptions: Required<GeneralPreferencesOptions>;
  public readonly visualOptions: Required<VisualPreferencesOptions>;
  public readonly audioOptions: Required<AudioPreferencesOptions>;
  public readonly inputOptions: Required<InputPreferencesOptions>;

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
      }
    }, providedOptions );

    if ( initialOptions.audioOptions.supportsExtraSound ) {
      assert && assert( initialOptions.audioOptions.supportsSound, 'supportsSound must be true to also support extraSound' );
    }

    // We know that defaults are populated after the optionize call.
    this.generalOptions = initialOptions.generalOptions as Required<GeneralPreferencesOptions>;
    this.visualOptions = initialOptions.visualOptions as Required<VisualPreferencesOptions>;
    this.audioOptions = initialOptions.audioOptions as Required<AudioPreferencesOptions>;
    this.inputOptions = initialOptions.inputOptions as Required<InputPreferencesOptions>;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;