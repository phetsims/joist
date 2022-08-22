// Copyright 2022, University of Colorado Boulder

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import SoundClip, { SoundClipOptions } from '../../../tambo/js/sound-generators/SoundClip.js';
import cardFlip_mp3 from '../../sounds/cardFlip_mp3.js';
import joist from '../joist.js';
import PreferencesType from './PreferencesType.js';

class PreferencesTabSwitchSoundGenerator extends SoundClip {

  private readonly disposePreferencesTabSwitchSoundGenerator: () => void;

  public constructor( selectedTabProperty: EnumerationProperty<PreferencesType>, options: SoundClipOptions ) {

    super( cardFlip_mp3, options );

    const playSound = () => { this.play(); };

    selectedTabProperty.lazyLink( playSound );

    this.disposePreferencesTabSwitchSoundGenerator = () => {
      selectedTabProperty.unlink( playSound );
    };
  }

  /**
   * Release any memory references to avoid memory leaks.
   */
  public override dispose(): void {
    this.disposePreferencesTabSwitchSoundGenerator();
    super.dispose();
  }
}

joist.register( 'PreferencesTabSwitchSoundGenerator', PreferencesTabSwitchSoundGenerator );
export default PreferencesTabSwitchSoundGenerator;
