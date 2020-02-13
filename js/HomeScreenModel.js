// Copyright 2020, University of Colorado Boulder

/**
 * Model for the home screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const ReferenceIO = require( 'TANDEM/types/ReferenceIO' );

  class HomeScreenModel {

    /**
     * @param {Sim} sim
     * @param {Tandem} tandem
     */
    constructor( sim, tandem ) {

      assert && assert( sim.screenProperty, 'sim.screenProperty must exist during construction' );

      // @public {Screen[]} - screens in the simulations that are not the HomeScreen
      this.simScreens = sim.simScreens;

      // @public {Property<Screen>}
      this.screenProperty = sim.screenProperty;

      // @public {Property<Screen>}
      this.selectedScreenProperty = new Property( sim.simScreens[ 0 ], {
        validValues: sim.simScreens,
        phetioType: PropertyIO( ReferenceIO ),
        tandem: tandem.createTandem( 'selectedScreenProperty' )
      } );

      // the correct screen icon is selected when returning to the home screen
      this.screenProperty.link( screen => {
        if ( _.includes( sim.simScreens, screen ) ) {
          this.selectedScreenProperty.value = screen;
        }
      } );
    }
  }

  joist.register( 'HomeScreenModel', HomeScreenModel );

  return HomeScreenModel;
} );