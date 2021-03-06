// Copyright 2021, University of Colorado Boulder

/**
 * A manager that controls whether all audio is enabled and whether each auditory feature is enabled. Has flags that
 * indicate which auditory features are supported. Also responsible for initializing managers for sub-components
 * of the AudioManager.
 *
 * PhET uses the term "Audio" to describe the collection of all auditory features that are provided by the simulation.
 * Under "Audio" there are currently two sub-features that can be separately enabled and disabled that PhET calls
 * "Sound" and "Voicing". Illustrated below:
 *
 * "Audio" - All auditory output in the sim.
 *  - "Sound" - All sound effects and sonifications that represent the simulation.
 *    - "Enhanced Sound" - Additional Sounds that can be enabled separately, but may not be beneficial for all users.
 *  - "Voicing" - Spoken text that describes what is happening in the simulation.
 *
 *  Disabling Audio will mute all subcomponents. But each subcomponent can be muted separately.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import webSpeaker from '../../scenery/js/accessibility/voicing/webSpeaker.js';
import soundManager from '../../tambo/js/soundManager.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js';

// constants
const packageFeatures = packageJSON.phet.features || {};

class AudioManager {
  constructor() {

    // @public (joist-internal, read-only) {boolean} - true if sound is supported and enabled
    this.supportsSound = phet.chipper.queryParameters.supportsSound &&
                         ( phet.chipper.queryParameters.sound === 'enabled' ||
                           phet.chipper.queryParameters.sound === 'muted' );


    // @public (joist-internal, read-only) {boolean} - true if enhancedSound is supported, cannot support enhanced
    // without supporting sound in general
    this.supportsEnhancedSound = this.supportsSound && phet.chipper.queryParameters.supportsEnhancedSound;

    // @public (joist-internal, read-only) {boolean} - used to specify if sound is supported, even if this specific
    // runtime turns it off via a query parameter. Most of the time this should not be used; instead see
    // this.supportsSound. This is to support a consistent API for PhET-iO, see
    // https://github.com/phetsims/joist/issues/573
    this.soundPartOfTheAPI = packageFeatures.supportsSound;

    // @public {joist-internal, read-only) {boolean} - True if voicing is supported.
    this.supportsVoicing = phet.chipper.queryParameters.supportsVoicing;

    // @public {joist-internal, read-only) {boolean} - True if any form of Audio is enabled in the simulation.
    this.supportsAudio = phet.chipper.queryParameters.audio !== 'disabled' && ( this.supportsSound || this.supportsVoicing );

    // @public {BooleanProperty} - Whether or not all features involving audio are enabled (including sound, enhanced
    // sound, and voicing). When false, everything should be totally silent.
    this.audioEnabledProperty = new BooleanProperty( phet.chipper.queryParameters.audio === 'enabled' );

    // @public {DerivedProperty.<boolean>} - Indicates when both Audio and Sound are enabled. When false, the
    // soundManager will not produce any sound.
    this.audioAndSoundEnabledProperty = DerivedProperty.and( [ this.audioEnabledProperty, soundManager.enabledProperty ] );

    // @public {DerivedProperty.<boolean>} - Indicates when both Audio and Voicing are enabled. When false, the
    // webSpeaker will not produce any speech.
    this.audioAndVoicingEnabledProperty = DerivedProperty.and( [ this.audioEnabledProperty, webSpeaker.enabledProperty ] );
  }

  /**
   * Initialize the AudioManager and subcomponents.
   * @public
   */
  initialize( sim ) {

    if ( this.supportsSound ) {
      soundManager.initialize(
        sim.isConstructionCompleteProperty,
        this.audioEnabledProperty,
        sim.browserTabVisibleProperty,
        sim.activeProperty,
        sim.isSettingPhetioStateProperty
      );
    }

    if ( this.supportsVoicing ) {
      webSpeaker.initialize( {

        // specify the Properties that control whether or not output is allowed from webSpeaker
        speechAllowedProperty: new DerivedProperty( [
          sim.isConstructionCompleteProperty,
          sim.browserTabVisibleProperty,
          sim.activeProperty,
          sim.isSettingPhetioStateProperty,
          this.audioEnabledProperty
        ], ( simConstructionComplete, simVisible, simActive, simSettingPhetioState, audioEnabled ) => {
          return simConstructionComplete && simVisible && simActive && !simSettingPhetioState && audioEnabled;
        } )
      } );
    }
  }
}

const audioManager = new AudioManager();

joist.register( 'audioManager', audioManager );
export default audioManager;