// Copyright 2020-2024, University of Colorado Boulder

/**
 * ScreenSelectionSoundGenerator generates sounds when the user switches between screens.  It does *not* handle the
 * sounds associated with the home screen - there is a separate sound generator for that.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import type ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import SoundClip, { type SoundClipOptions } from '../../tambo/js/sound-generators/SoundClip.js';
import screenSelection_mp3 from '../sounds/screenSelection_mp3.js';
import type HomeScreen from './HomeScreen.js';
import joist from './joist.js';
import { type AnyScreen } from './Screen.js';

class ScreenSelectionSoundGenerator extends SoundClip {

  public constructor( screenProperty: ReadOnlyProperty<AnyScreen>, homeScreen: HomeScreen | null, options?: SoundClipOptions ) {

    super( screenSelection_mp3, options );

    // play sounds when the user navigates between screens and to/from the home screen
    screenProperty.lazyLink( currentScreen => {
      if ( currentScreen !== homeScreen ) {
        this.play();
      }
    } );
  }
}

joist.register( 'ScreenSelectionSoundGenerator', ScreenSelectionSoundGenerator );
export default ScreenSelectionSoundGenerator;