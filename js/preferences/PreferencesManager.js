// Copyright 2021-2022, University of Colorado Boulder

/**
 * A Class that manages Simulation features that enabled and disabled by user Preferences.
 *
 * @author Jesse Greenberg
 */

import { voicingManager } from '../../../scenery/js/imports.js';
import responseCollector from '../../../utterance-queue/js/responseCollector.js';
import joist from '../joist.js';
import PreferencesProperties from './PreferencesProperties.js';
import PreferencesStorage from './PreferencesStorage.js';

class PreferencesManager {

  /**
   * @param {Sim} sim
   */
  constructor( sim ) {

    // @public {PreferencesProperties}
    this.preferencesProperties = new PreferencesProperties();

    const preferencesConfiguration = sim.preferencesConfiguration;
    assert && assert( preferencesConfiguration, 'PreferencesManager requires the sim to have PreferencesConfiguration' );

    const audioOptions = preferencesConfiguration.audioOptions;
    if ( audioOptions.supportsVoicing ) {

      // Register these to be stored when PreferencesStorage is enabled. TODO: likely to be moved to a better spot, see https://github.com/phetsims/joist/issues/737
      PreferencesStorage.register( responseCollector.objectResponsesEnabledProperty, 'objectResponsesEnabledProperty' );
      PreferencesStorage.register( responseCollector.contextResponsesEnabledProperty, 'contextResponsesEnabledProperty' );
      PreferencesStorage.register( responseCollector.hintResponsesEnabledProperty, 'hintResponsesEnabledProperty' );
      PreferencesStorage.register( voicingManager.voiceRateProperty, 'voiceRateProperty' );
      PreferencesStorage.register( voicingManager.voicePitchProperty, 'voicePitchProperty' );
    }
  }
}

joist.register( 'PreferencesManager', PreferencesManager );
export default PreferencesManager;