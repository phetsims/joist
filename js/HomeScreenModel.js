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
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';

class HomeScreenModel {

  /**
   * @param {Property.<Screen>} screenProperty
   * @param {Screen[]} simScreens
   * @param {Tandem} tandem
   */
  constructor( screenProperty, simScreens, tandem ) {

    // @public {Screen[]} - screens in the simulations that are not the HomeScreen
    this.simScreens = simScreens;

    // @public {Property<Screen>}
    this.screenProperty = screenProperty;

    // @public {Property<Screen>}
    this.selectedScreenProperty = new Property( simScreens[ 0 ], {
      validValues: simScreens,
      phetioType: PropertyIO( ReferenceIO ),
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