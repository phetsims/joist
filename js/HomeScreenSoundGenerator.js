// Copyright 2020-2021, University of Colorado Boulder

/**
 * HomeScreenSoundGenerator is responsible for generating sounds that are associated with the home screen, such as the
 * sound for switching between screen icons and the sound for returning to the home screen from a sim screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import MultiClip from '../../tambo/js/sound-generators/MultiClip.js';
import screenSelectionHomeV3_mp3 from '../sounds/screenSelectionHomeV3_mp3.js';
import switchingScreenSelectorIcons003_mp3 from '../sounds/switchingScreenSelectorIcons003_mp3.js';
import joist from './joist.js';

// constants
const SoundType = EnumerationDeprecated.byKeys( [ 'HOME_SCREEN_SELECTED', 'DIFFERENT_ICON_SELECTED' ] );

class HomeScreenSoundGenerator extends MultiClip {

  /**
   * @param {HomeScreenModel} homeScreenModel - the model for the home screen
   * @param {Object} [options]
   */
  constructor( homeScreenModel, options ) {

    // create the map of home screen actions to sounds
    const valuesToSoundsMap = new Map( [
      [ SoundType.HOME_SCREEN_SELECTED, screenSelectionHomeV3_mp3 ],
      [ SoundType.DIFFERENT_ICON_SELECTED, switchingScreenSelectorIcons003_mp3 ]
    ] );

    super( valuesToSoundsMap, options );

    homeScreenModel.screenProperty.lazyLink( screen => {
      if ( screen.model === homeScreenModel ) {
        this.playAssociatedSound( SoundType.HOME_SCREEN_SELECTED );
      }
    } );

    // play the sound when the user selects a different icon on the home screen
    homeScreenModel.selectedScreenProperty.lazyLink( () => {
      if ( homeScreenModel.screenProperty.value.model === homeScreenModel ) {
        this.playAssociatedSound( SoundType.DIFFERENT_ICON_SELECTED );
      }
    } );
  }
}

joist.register( 'HomeScreenSoundGenerator', HomeScreenSoundGenerator );
export default HomeScreenSoundGenerator;