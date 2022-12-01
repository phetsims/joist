// Copyright 2020-2022, University of Colorado Boulder

/**
 * HomeScreenSoundGenerator is responsible for generating sounds that are associated with the home screen, such as the
 * sound for switching between screen icons and the sound for returning to the home screen from a sim screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import MultiClip, { MultiClipOptions } from '../../tambo/js/sound-generators/MultiClip.js';
import screenSelectionHomeV3_mp3 from '../sounds/screenSelectionHomeV3_mp3.js';
import switchingScreenSelectorIcons003_mp3 from '../sounds/switchingScreenSelectorIcons003_mp3.js';
import joist from './joist.js';
import HomeScreenModel from './HomeScreenModel.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';

class SoundType extends EnumerationValue {
  public static readonly HOME_SCREEN_SELECTED = new SoundType();
  public static readonly DIFFERENT_ICON_SELECTED = new SoundType();
  public static readonly enumeration = new Enumeration( SoundType );
}

class HomeScreenSoundGenerator extends MultiClip<SoundType> {
  public constructor( homeScreenModel: HomeScreenModel, providedOptions?: MultiClipOptions ) {

    // create the map of home screen actions to sounds
    const valuesToSoundsMap = new Map( [
      [ SoundType.HOME_SCREEN_SELECTED, screenSelectionHomeV3_mp3 ],
      [ SoundType.DIFFERENT_ICON_SELECTED, switchingScreenSelectorIcons003_mp3 ]
    ] );

    super( valuesToSoundsMap, providedOptions );

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