// Copyright 2021-2023, University of Colorado Boulder

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
 *    - "Extra Sound" - Additional Sounds that can be enabled separately, but may not be beneficial for all users.
 *  - "Voicing" - Spoken text that describes what is happening in the simulation.
 *
 *  Disabling Audio will mute all subcomponents. But each subcomponent can be muted separately.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import { Display, voicingManager } from '../../scenery/js/imports.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import Sim from './Sim.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';

const ANY_AUDIO_SUPPORTED = phet.chipper.queryParameters.supportsVoicing || phet.chipper.queryParameters.supportsSound;

class AudioManager extends PhetioObject {

  // Whether all features involving audio are enabled (including sound, extra sound, and voicing). When false,
  // everything should be totally silent.
  public readonly audioEnabledProperty: BooleanProperty;

  // Indicates when both Audio and Sound are enabled. When false, the soundManager will not produce any sound.
  public readonly audioAndSoundEnabledProperty: TReadOnlyProperty<boolean>;

  // Indicates when both Audio and Voicing are enabled. When false, the voicingManager will not produce any speech.
  public readonly audioAndVoicingEnabledProperty: TReadOnlyProperty<boolean>;

  // Indicates when any subcomponent of audio is enabled. Note this will still be true when audio is disabled. It is
  // only for subcomponents.
  public readonly anySubcomponentEnabledProperty: TReadOnlyProperty<boolean>;

  // Indicates when audio and at least one of its subcomponents are enabled. When false, there should be no auditory output.
  public readonly anyOutputEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( tandem: Tandem ) {

    super( {
      tandem: tandem,
      phetioState: false,
      phetioDocumentation: 'Controls the simulation\'s audio features. This includes sound and voicing. For sims that ' +
                           'do not support these features, this element and its children can be ignored.'
    } );

    this.audioEnabledProperty = new BooleanProperty( phet.chipper.queryParameters.audio === 'enabled', {
      tandem: tandem.createTandem( 'audioEnabledProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'toggles all audio features on and off; supported only if this sim supports audio features.'
    } );

    this.audioAndSoundEnabledProperty = DerivedProperty.and( [ this.audioEnabledProperty, soundManager.enabledProperty ] );
    this.audioAndVoicingEnabledProperty = DerivedProperty.and( [ this.audioEnabledProperty, voicingManager.enabledProperty ] );

    this.anySubcomponentEnabledProperty = new DerivedProperty(
      [ soundManager.enabledProperty, voicingManager.enabledProperty ],
      ( soundEnabled, voicingEnabled ) => {
        return soundEnabled || voicingEnabled;
      }
    );

    this.anyOutputEnabledProperty = new DerivedProperty(
      [ this.audioEnabledProperty, this.anySubcomponentEnabledProperty ],
      ( audioEnabled, anySubcomponentEnabled ) => {
        return audioEnabled && anySubcomponentEnabled;
      }
    );
  }

  /**
   * Initialize the AudioManager and subcomponents.
   */
  public initialize( sim: Sim ): void {

    if ( sim.preferencesModel.audioModel.supportsSound ) {
      soundManager.initialize(
        sim.isConstructionCompleteProperty,
        this.audioEnabledProperty,
        sim.browserTabVisibleProperty,
        sim.activeProperty,
        sim.isSettingPhetioStateProperty
      );
    }

    if ( sim.preferencesModel.audioModel.supportsVoicing ) {
      voicingManager.initialize( Display.userGestureEmitter, {

        // specify the Properties that control whether or not output is allowed from voicingManager
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

    // If both sound and voicing are enabled, hook up a feature that will turn down the sound level when the speech
    // synthesizer is speaking.  This is called "ducking".
    if ( sim.preferencesModel.audioModel.supportsSound && sim.preferencesModel.audioModel.supportsVoicing ) {

      // state checking
      assert && assert( voicingManager.initialized, 'voicingManager must be initialized before ducking can be set up' );
      assert && assert( soundManager.initialized, 'soundManager must be initialized before ducking can be set up' );

      // Set up the ducking Property and hook it to the emitters that indicate when speaking is occurring in the voicing
      // manager.
      const duckSoundProperty = new BooleanProperty( false );
      voicingManager.startSpeakingEmitter.addListener( () => duckSoundProperty.set( true ) );
      voicingManager.endSpeakingEmitter.addListener( () => duckSoundProperty.set( false ) );

      // Add the ducking property to the sound manager.
      soundManager.addDuckingProperty( duckSoundProperty );
    }
  }
}

const audioManager = new AudioManager( ANY_AUDIO_SUPPORTED ? Tandem.GENERAL_VIEW.createTandem( 'audioManager' ) : Tandem.OPT_OUT );

joist.register( 'audioManager', audioManager );
export default audioManager;