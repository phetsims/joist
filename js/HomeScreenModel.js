// Copyright 2020, University of Colorado Boulder

/**
 * Model for the home screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import PropertyIO from '../../axon/js/PropertyIO.js';
import joist from './joist.js';
import ScreenIO from './ScreenIO.js';

class HomeScreenModel {

  /**
   * @param {Property.<Screen>} screenProperty - the screen that is displayed to the user in the main area above the
   *                                           - navigation bar
   * @param {Screen[]} simScreens
   * @param {Tandem} tandem
   */
  constructor( screenProperty, simScreens, tandem ) {

    // @public {Screen[]} - screens in the simulations that are not the HomeScreen
    this.simScreens = simScreens;

    // @public {Property<Screen>} - the screen that is displayed to the user in the main area above the navigation bar
    this.screenProperty = screenProperty;

    // @public {Property<Screen>} - on the home screen only, the screen corresponding to the large button icon
    this.selectedScreenProperty = new Property( simScreens[ 0 ], {
      validValues: simScreens,
      phetioType: PropertyIO( ScreenIO ),
      tandem: tandem.createTandem( 'selectedScreenProperty' )
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