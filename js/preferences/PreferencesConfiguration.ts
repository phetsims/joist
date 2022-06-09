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
import SpeechSynthesisAnnouncer from '../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import joist from '../joist.js';

type GeneralOptions = {

  // any Node you would like to put under the "General" tab with sim-specific controls
  simControls?: Node | null;
}

type VisualOptions = {

  // whether or not the sim supports the "Interactive Highlights" feature, and checkbox to enable in the
  // Preferences Dialog
  supportsInteractiveHighlights?: boolean;
}

type AudioOptions = {

  // The entry point for Voicing, and if true the sim will support Voicing and Voicing options in Preferences.
  // The feature is only available on platforms where SpeechSynthesis is supported. For now, it is only available
  // when running with english locales, accessibility strings are not made available for translation yet.
  supportsVoicing?: boolean;

  // Whether or not to include checkboxes related to sound and enhanced sound. supportsEnhancedSound can only be
  // included if supportsSound is also true.
  supportsSound?: boolean;
  supportsEnhancedSound?: boolean;
}

type InputOptions = {

  // Whether or not to include "gesture" controls
  supportsGestureControl?: boolean;
}

export type PreferencesConfigurationOptions = {

  // configuration for controls in the "General" tab of the PreferencesDialog
  generalOptions?: GeneralOptions;

  // configuration for controls in the "Visual" tab of the PreferencesDialog
  visualOptions?: VisualOptions;

  // configuration for controls in the "Audio" tab of the PreferencesDialog
  audioOptions?: AudioOptions;

  // configuration for controls in the "Input" tab of the PreferencesDialog
  inputOptions?: InputOptions;
}

class PreferencesConfiguration {

  public readonly generalOptions: GeneralOptions;
  public readonly visualOptions: VisualOptions;
  public readonly audioOptions: AudioOptions;
  public readonly inputOptions: InputOptions;

  public constructor( providedOptions?: PreferencesConfigurationOptions ) {

    // initialize-globals uses package.json to determine defaults for features enabled by the sim and those defaults
    // can be overwritten by query parameter.  So phet.chipper.queryParameters contains an accurate representation of
    // which features are required.
    const phetFeatures = phet.chipper.queryParameters;

    // For now, the Voicing feature is only available when we are running in the english locale, accessibility
    // strings are not made available for translation.
    const simLocale = phet.chipper.locale || 'en';

    const options = optionize<PreferencesConfigurationOptions>()( {
      generalOptions: {
        simControls: null
      },
      visualOptions: {
        supportsInteractiveHighlights: phetFeatures.supportsInteractiveHighlights
      },
      audioOptions: {
        supportsVoicing: phetFeatures.supportsVoicing && SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() && simLocale === 'en',
        supportsSound: phetFeatures.supportsSound,
        supportsEnhancedSound: phetFeatures.supportsEnhancedSound
      },
      inputOptions: {
        supportsGestureControl: phetFeatures.supportsGestureControl
      }
    }, providedOptions );

    if ( options.audioOptions.supportsEnhancedSound ) {
      assert && assert( options.audioOptions.supportsSound, 'supportsSound must be true to also support enhancedSound' );
    }

    this.generalOptions = options.generalOptions;
    this.visualOptions = options.visualOptions;
    this.audioOptions = options.audioOptions;
    this.inputOptions = options.inputOptions;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;