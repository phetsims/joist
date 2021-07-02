// Copyright 2021, University of Colorado Boulder

/**
 * Configures the Preferences for a simulation, signifying which features are enabled in the simulation and will
 * therefore have a corresponding entry in the PreferencesDialog to enable/disable the feature. This is passed in
 * as an option to Sim.js.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import webSpeaker from '../../../scenery/js/accessibility/voicing/webSpeaker.js';
import joist from '../joist.js';
import packageJSON from '../packageJSON.js';

class PreferencesConfiguration {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    // initialize-globals uses package.json to determine defaults for features enabled by the sim and those defaults
    // can be overwritten by query parameter.  So it contains an accurate representation of which features
    // are requested.
    const phetFeatures = phet.chipper.queryParameters;

    // For now, the Voicing feature is only available when we are running in the english locale, accessibility
    // strings are not made available for translation.
    const simLocale = phet.chipper.locale || 'en';

    options = merge( {

      // configuration for controls in the "General" tab of the PreferencesDialog
      generalOptions: {

        // {Node|null} - any Node you would like to put under the "General" tab with sim-specific controls
        simControls: null
      },

      // configuration for controls in the "Visual" tab of the PreferencesDialog
      visualOptions: {

        // {boolean} whether or not the sim supports the "interactive highlights" feature, and checkbox to enable
        // in the PreferencesDialog
        supportsInteractiveHighlights: phetFeatures.supportsInteractiveHighlights
      },

      // configuration for controls in the "Audio" tab of the PreferencesDialog
      audioOptions: {

        // The entry point for Voicing, and if true the sim will support Voicing and Voicing options in Preferences.
        // The feature is only available on platforms where SpeechSynthesis is supported. For now, it is only available
        // when running with english locales, accessibility strings are not made available for translation yet.
        supportsVoicing: phetFeatures.supportsVoicing && webSpeaker.isSpeechSynthesisSupported() && simLocale === 'en',

        // {boolean} - Whether or not to include checkboxes related to sound and enhanced sound. supportsEnhancedSound
        // can only be included if supportsSound is also true.
        // NOTE: When initialize-globals uses package.json to control sound features the packageJSON check
        // here can be removed
        supportsSound: phetFeatures.supportsSound || packageJSON.phet.features && packageJSON.phet.features.supportsSound,
        supportsEnhancedSound: phetFeatures.supportsEnhancedSound
      },

      // configuration for controls in the "Input" tab of the PreferencesDialog
      inputOptions: {

        // {boolean} - Whether or not to include "gesture" controls
        supportsGestureControl: phetFeatures.supportsGestureControl
      }
    }, options );

    assert && assert( options.generalOptions, 'generalOptions must be defined' );
    assert && assert( options.visualOptions, 'visualOptions must be defined' );
    assert && assert( options.audioOptions, 'audioOptions must be defined' );
    assert && assert( options.inputOptions, 'inputOptions must be defined' );
    if ( options.audioOptions.supportsEnhancedSound ) {
      assert && assert( options.audioOptions.supportsSound, 'supportsSound must be true to also support enhancedSound' );
    }

    // @public (read-only)
    this.generalOptions = options.generalOptions;
    this.visualOptions = options.visualOptions;
    this.audioOptions = options.audioOptions;
    this.inputOptions = options.inputOptions;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;