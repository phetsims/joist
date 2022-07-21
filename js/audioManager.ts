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
import { Display, voicingManager, voicingUtteranceQueue } from '../../scenery/js/imports.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import responseCollector from '../../utterance-queue/js/responseCollector.js';
import SpeechSynthesisAnnouncer from '../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import joist from './joist.js';
import Sim from './Sim.js';
import IReadOnlyProperty from '../../axon/js/IReadOnlyProperty.js';

class AudioManager extends PhetioObject {

  // (joist-internal) - true if sound is supported and enabled
  public readonly supportsSound: boolean;

  // (joist-internal) - true if extraSound is supported, cannot support enhanced without supporting sound in general
  public readonly supportsExtraSound: boolean;

  // (joist-internal) - True if "Voicing" features or speech synthesis is supported, and we need to initialize the
  // voicingManager for SpeechSynthesis.
  public readonly supportsVoicing: boolean;

  // (joist-internal) - True if any form of Audio is enabled in the simulation.
  public readonly supportsAudio: boolean;

  // Whether or not all features involving audio are enabled (including sound, extra sound, and voicing). When false,
  // everything should be totally silent.
  public readonly audioEnabledProperty: BooleanProperty;

  // Indicates when both Audio and Sound are enabled. When false, the soundManager will not produce any sound.
  public readonly audioAndSoundEnabledProperty: IReadOnlyProperty<boolean>;

  // Indicates when both Audio and Voicing are enabled. When false, the voicingManager will not produce any speech.
  public readonly audioAndVoicingEnabledProperty: IReadOnlyProperty<boolean>;

  // Indicates when any subcomponent of audio is enabled. Note this will still be true when audio is disabled. It is
  // only for subcomponents.
  public readonly anySubcomponentEnabledProperty: IReadOnlyProperty<boolean>;

  // Indicates when audio and at least one of its subcomponents are enabled. When false, there should be no auditory output.
  public readonly anyOutputEnabledProperty: IReadOnlyProperty<boolean>;

  public constructor( tandem: Tandem ) {

    super( {
      tandem: tandem,
      phetioState: false,
      phetioDocumentation: 'Controls the simulation\'s audio features. This includes sound and voicing. For sims that ' +
                           'do not support these features, this element and its children can be ignored.'
    } );

    this.supportsSound = phet.chipper.queryParameters.supportsSound;
    this.supportsExtraSound = this.supportsSound && phet.chipper.queryParameters.supportsExtraSound;
    this.supportsVoicing = SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() && phet.chipper.queryParameters.supportsVoicing;
    this.supportsAudio = phet.chipper.queryParameters.audio !== 'disabled' && ( this.supportsSound || this.supportsVoicing );

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

    // Since voicingManager in Scenery can not use initialize-globals,set the initial
    // value for whether Voicing is enabled here in the audioManager
    if ( this.supportsVoicing ) {
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
  }

  /**
   * Initialize the AudioManager and subcomponents.
   */
  public initialize( sim: Sim ): void {

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