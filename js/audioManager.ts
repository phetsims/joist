// Copyright 2021-2022, University of Colorado Boulder

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

class AudioManager extends PhetioObject {

  // Whether or not all features involving audio are enabled (including sound, extra sound, and voicing). When false,
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
      phetioDocumentation: 'determines whether audio features are enabled for this simulation'
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
  }
}

const audioManager = new AudioManager( Tandem.GENERAL_VIEW.createTandem( 'audioManager' ) );

joist.register( 'audioManager', audioManager );
export default audioManager;