// Copyright 2020, University of Colorado Boulder

/**
 * ScreenSelectionSoundGenerator generates sounds when the user switches between screens.  It does *not* handle the
 * sounds associated with the home screen - there is a separate sound generator for that.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import screenSelectedSound from '../sounds/screen-selection_mp3.js';
import joist from './joist.js';

class ScreenSelectionSoundGenerator extends SoundClip {

  /**
   * @param {Property.<Screen>} screenProperty
   * @param {HomeScreen} homeScreen
   * @param {Object} [options]
   */
  constructor( screenProperty, homeScreen, options ) {

    super( screenSelectedSound, options );

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