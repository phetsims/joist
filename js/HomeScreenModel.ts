// Copyright 2020-2023, University of Colorado Boulder

/**
 * Model for the home screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import Screen, { AnyScreen } from './Screen.js';
import TModel from './TModel.js';

class HomeScreenModel implements TModel {
  public simScreens: AnyScreen[]; // screens in the simulations that are not the HomeScreen
  public screenProperty: Property<AnyScreen>;
  public selectedScreenProperty: Property<AnyScreen>;
  public readonly activeSimScreensProperty: ReadOnlyProperty<AnyScreen[]>;

  /**
   * @param screenProperty - the screen that is displayed to the user in the main area above the
   *                                           - navigation bar
   * @param simScreens
   * @param tandem
   */
  public constructor( screenProperty: Property<Screen<IntentionalAny, IntentionalAny>>, simScreens: Screen<IntentionalAny, IntentionalAny>[], activeSimScreensProperty: ReadOnlyProperty<AnyScreen[]>, tandem: Tandem ) {

    this.simScreens = simScreens;
    this.screenProperty = screenProperty;
    this.activeSimScreensProperty = activeSimScreensProperty;
    this.selectedScreenProperty = new Property( simScreens[ 0 ], {
      validValues: simScreens,
      phetioValueType: Screen.ScreenIO,
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

  public reset(): void { /* nothing to do */ }
}

joist.register( 'HomeScreenModel', HomeScreenModel );

export default HomeScreenModel;