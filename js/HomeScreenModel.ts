// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the home screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import Screen from './Screen.js';
import ScreenView from './ScreenView.js';

class HomeScreenModel {
  public simScreens: Screen<IntentionalAny, ScreenView>[]; // screens in the simulations that are not the HomeScreen
  public screenProperty: Property<Screen<IntentionalAny, ScreenView>>;
  public selectedScreenProperty: Property<Screen<IntentionalAny, ScreenView>>;

  /**
   * @param screenProperty - the screen that is displayed to the user in the main area above the
   *                                           - navigation bar
   * @param simScreens
   * @param tandem
   */
  public constructor( screenProperty: Property<Screen<IntentionalAny, IntentionalAny>>, simScreens: Screen<IntentionalAny, IntentionalAny>[], tandem: Tandem ) {

    this.simScreens = simScreens;
    this.screenProperty = screenProperty;
    this.selectedScreenProperty = new Property( simScreens[ 0 ], {
      validValues: simScreens,
      phetioType: Property.PropertyIO( Screen.ScreenIO ),
      tandem: tandem.createTandem( 'selectedScreenProperty' ),
      phetioFeatured: true
    } );

    // the correct screen icon is selected when returning to the home screen
    this.screenProperty.link( screen => {
      if ( _.includes( simScreens, screen ) ) {
        this.selectedScreenProperty.value = screen;
      }
    } );
  }
}

joist.register( 'HomeScreenModel', HomeScreenModel );

export default HomeScreenModel;