// Copyright 2020, University of Colorado Boulder

/**
 * HomeScreenSoundGenerator is responsible for generating sounds that are associated with the home screen, such as the
 * sound for switching between screen icons and the sound for returning to the home screen from a sim screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import MultiClip from '../../tambo/js/sound-generators/MultiClip.js';
import homeSelectedSound from '../sounds/screen-selection-home-v3_mp3.js';
import iconSelectedSound from '../sounds/switching-screen-selector-icons-003_mp3.js';
import joist from './joist.js';

// constants
const SoundType = Enumeration.byKeys( [ 'HOME_SCREEN_SELECTED', 'DIFFERENT_ICON_SELECTED' ] );

class HomeScreenSoundGenerator extends MultiClip {

  /**
   * @param {HomeScreenModel} homeScreenModel - the model for the home screen
   * @param {Object} [options]
   */
  constructor( homeScreenModel, options ) {

    // create the map of home screen actions to sounds
    const valuesToSoundsMap = new Map( [
      [ SoundType.HOME_SCREEN_SELECTED, homeSelectedSound ],
      [ SoundType.DIFFERENT_ICON_SELECTED, iconSelectedSound ]
    ] );

    super( valuesToSoundsMap, options );

    homeScreenModel.screenProperty.lazyLink( screen => {
      if ( screen.model === homeScreenModel ) {
        console.log( 'play home screen sound' );
        this.playAssociatedSound( SoundType.HOME_SCREEN_SELECTED );
      }
    } );

    // play the sound when the user selects a different icon on the home screen
    homeScreenModel.selectedScreenProperty.lazyLink( selectedScreen => {
      if ( homeScreenModel.screenProperty.value.model === homeScreenModel ) {
        this.playAssociatedSound( SoundType.DIFFERENT_ICON_SELECTED );
      }
    } );
  }
}

joist.register( 'HomeScreenSoundGenerator', HomeScreenSoundGenerator );
export default HomeScreenSoundGenerator;