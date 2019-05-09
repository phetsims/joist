// Copyright 2019, University of Colorado Boulder

/**
 * Monitors the activity as it relates to time spent on each screen of a sim
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const timer = require( 'AXON/timer' );

  class ActivityMonitor {

    /**
     * @param {Screen[]} screens
     * @param {NumberProperty} screenIndexProperty
     * @param {BooleanProperty} showHomeScreenProperty
     * @param {Tandem} tandem
     */
    constructor( screens, screenIndexProperty, showHomeScreenProperty, tandem ) {

      // @private
      this.screenIndexProperty = screenIndexProperty;
      this.showHomeScreenProperty = showHomeScreenProperty;

      // @private - the array for storing time values on each screen
      this.screensInfo = screens.map( screen => {
        return {
          time: 0
        };
      } );

      // @public
      this.currentActivityProperty = new Property( this.screensInfo, {
        tandem: tandem.createTandem( 'currentActivityProperty' ),
        phetioType: PropertyIO( ObjectIO )
      } );

      timer.addListener( dt => {
        this.computeActivity( dt );
      } );
    }

    /**
     * Appends the given dt to the current screen
     * @param {number} dt
     * @private
     */
    computeActivity( dt ) {
      if ( this.showHomeScreenProperty.value ) {
        return;
      }

      this.screensInfo[ this.screenIndexProperty.value ].time += dt;
    }
  }

  return joist.register( 'ActivityMonitor', ActivityMonitor );
} );