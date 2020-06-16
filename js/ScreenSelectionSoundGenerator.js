// Copyright 2020, University of Colorado Boulder

import Enumeration from '../../phet-core/js/Enumeration.js';
import MultiClip from '../../tambo/js/sound-generators/MultiClip.js';
import homeSelectedSound from '../sounds/screen-selection-home-v3_mp3.js';
import screenSelectedSound from '../sounds/screen-selection_mp3.js';
import iconSelectedSound from '../sounds/switching-screen-selector-icons-003_mp3.js';
import joist from './joist.js';

// constants
const SoundType = Enumeration.byKeys( [ 'ICON_SELECTED', 'HOME_SCREEN', 'OTHER_SCREEN' ] );

/**
 * ScreenSelectionSoundGenerator generates sounds when the user switches between screens and screen icons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
class ScreenSelectionSoundGenerator extends MultiClip {

  /**
   * @param {HomeScreenModel} homeScreenModel - the model for the home screen
   * @param {Object} [options]
   */
  constructor( homeScreenModel, options ) {

    // create the map of screen index values to sounds
    const valuesToSoundsMap = new Map();

    // map state enumeration to sounds (can't use Map's initialization constructor since it's not supported in IE)
    valuesToSoundsMap.set( SoundType.ICON_SELECTED, iconSelectedSound );
    valuesToSoundsMap.set( SoundType.HOME_SCREEN, homeSelectedSound );
    valuesToSoundsMap.set( SoundType.OTHER_SCREEN, screenSelectedSound );

    super( valuesToSoundsMap, options );

    // play the sound when the user selects a different icon on the home screen
    homeScreenModel.selectedScreenProperty.lazyLink( () => {

      // only play this sound when on the home screen
      if ( homeScreenModel.screenProperty.value.model === homeScreenModel ) {
        this.playAssociatedSound( SoundType.ICON_SELECTED );
      }
    } );

    // play sounds when the user navigates between screens and to/from the home screen
    homeScreenModel.screenProperty.lazyLink( currentScreen => {

      // play one sound for the home screen, another for all other screens
      this.playAssociatedSound( currentScreen.model === homeScreenModel ? SoundType.HOME_SCREEN : SoundType.OTHER_SCREEN );
    } );
  }
}

joist.register( 'ScreenSelectionSoundGenerator', ScreenSelectionSoundGenerator );
export default ScreenSelectionSoundGenerator;