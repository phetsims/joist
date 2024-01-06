// Copyright 2022-2024, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */
import Disposable from '../../../axon/js/Disposable.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import SoundClip, { SoundClipOptions } from '../../../tambo/js/sound-generators/SoundClip.js';
import cardFlip_mp3 from '../../sounds/cardFlip_mp3.js';
import joist from '../joist.js';
import PreferencesType from './PreferencesType.js';

class PreferencesTabSwitchSoundGenerator extends SoundClip {

  public constructor( selectedTabProperty: EnumerationProperty<PreferencesType>, options: SoundClipOptions ) {

    super( cardFlip_mp3, options );

    const playSound = () => { this.play(); };

    selectedTabProperty.lazyLink( playSound );
  }

  public override dispose(): void {
    Disposable.assertNotDisposable();
  }
}

joist.register( 'PreferencesTabSwitchSoundGenerator', PreferencesTabSwitchSoundGenerator );
export default PreferencesTabSwitchSoundGenerator;
