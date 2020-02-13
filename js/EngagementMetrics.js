// Copyright 2019, University of Colorado Boulder

/**
 * Monitors the engagement as it relates to time spent on each screen of a sim. Mainly this is to provide this information
 * to a PhET-iO wrapper frame.
 *
 * The main output of this file is powered by the data stream. As a result the finest granularity of this data is based on
 * the most frequent events that are emitting. As of this writing, when emitting high frequency events, that is every
 * frame on the "stepSimulation" event. Note that this Type requires high frequency events to be emitted.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const Property = require( 'AXON/Property' );
  const TemporalCounter = require( 'JOIST/TemporalCounter' );

  // ifphetio
  const dataStream = require( 'ifphetio!PHET_IO/dataStream' );

  class EngagementMetrics {

    /**
     * @param {Sim} sim
     */
    constructor( sim ) {
      assert && assert( dataStream, 'cannot add dataStream listener because dataStream is not defined' );

      // @private
      this.screens = []; // {ScreenData[]}
      this.homeScreen = null; // {ScreenData|null}

      this.startTimestamp = null; // number, the timestamp of the start of the sim.

      // Initial values for sim properties, updated in the dataStream listener callback
      let isHomeScreenShowing = sim.showHomeScreenProperty.value;
      let currentScreenIndex = sim.screenIndexProperty.value;
      let currentScreenEntry = isHomeScreenShowing ? this.homeScreen : this.screens[ currentScreenIndex ];

      sim.screens.forEach( screen => {
        this.screens.push( new ScreenData( screen.tandem.name ) );
      } );

      // ?homeScreen=false will still create a HomeScreen instance, but give no way to interface with it.
      if ( phet.chipper.queryParameters.homeScreen && sim.screens.length > 1 ) {
        assert && assert( sim.homeScreen, 'home screen should exist' );
        this.homeScreen = new ScreenData( sim.homeScreen.tandem.name );
      }

      const updateCurrentScreenEntry = event => {
        currentScreenEntry = isHomeScreenShowing ? this.homeScreen : this.screens[ currentScreenIndex ];

        // initial condition if first time on this screen
        currentScreenEntry.firstTimestamp = currentScreenEntry.firstTimestamp || event.time;
      };

      // phet-io data stream listener for every sim event.
      dataStream.addAllEventListener( event => {

        // initial condition
        if ( this.startTimestamp === null ) {
          this.startTimestamp = event.time;
          updateCurrentScreenEntry( event );
        }

        // screenIndex changed
        if ( event.phetioID === sim.screenIndexProperty.tandem.phetioID &&
             event.name === Property.CHANGED_EVENT_NAME ) {
          currentScreenIndex = event.data.newValue;
          updateCurrentScreenEntry( event );
        }

        // the home screen showing toggled
        if ( event.phetioID === sim.showHomeScreenProperty.tandem.phetioID &&
             event.name === Property.CHANGED_EVENT_NAME ) {
          isHomeScreenShowing = event.data.newValue;
          updateCurrentScreenEntry( event );
        }

        // Handle the case if the event signifies engagement with the simulation.
        this.isEngagedEvent( event ) && currentScreenEntry.onEngagedEvent( event, this.startTimestamp );

        if ( event.phetioID === sim.stepSimulationAction.tandem.phetioID ) {

          // TODO: counted even when not in the active browser tab, perhaps we need to use browserTabVisibleProperty, https://github.com/phetsims/joist/issues/553
          // TODO: or just be adding up dt values instead of trying to use event.time, which is just from Date.now(), https://github.com/phetsims/joist/issues/553
          currentScreenEntry.lastTimestamp = event.time;
          currentScreenEntry.totalTime += Math.floor( event.data.dt * 1000 );
        }
      } );
    }

    /**
     * Returns true if the event signifies that the student is "engaged." The current definition is just pointer down
     * events.
     * @private
     * @param {Object} event - an event from the PhET-iO data stream
     * @returns {boolean}
     */
    isEngagedEvent( event ) {
      let engaged = false;
      [ 'mouseDownAction', 'touchDownAction', 'keydownAction', 'penDownAction' ].forEach( eventName => {
        if ( phetio.PhetioIDUtils.getComponentName( event.phetioID ) === eventName ) {
          engaged = true;
        }
      } );
      return engaged;
    }

    /**
     * get the current engagement data of the simulation.
     * @public
     * @returns {Object}
     */
    getEngagementMetrics() {
      let screens = this.screens;
      if ( this.homeScreen ) {
        screens = screens.concat( [ this.homeScreen ] );
      }
      return {
        sim: {

          // the timestamp of the first received model step
          startTimestamp: this.startTimestamp,

          // number of seconds since startTimestamp
          elapsedTime: _.sum( screens.map( screen => screen.totalTime ) ),

          // number of seconds in which "engagement" occurred
          engagedTime: _.sum( screens.map( screen => screen.engagedTime ) ),

          // the timestamp of the first time the sim is engaged with
          firstEngagementTimestamp: _.min( screens.map( screen => screen.firstEngagementTimestamp ) ),

          // current time of the sim
          currentTimestamp: _.max( screens.map( screen => screen.lastTimestamp ) )
        },
        homeScreen: this.homeScreen && this.homeScreen.getData(), // show even if null
        screens: this.screens.map( screen => screen.getData() )
      };
    }
  }

  // private class to keep track of data for each screen.
  class ScreenData {

    /**
     * @param {string} name
     */
    constructor( name ) {

      // @public
      this.name = name;
      this.firstTimestamp = null;
      this.lastTimestamp = null;
      this.totalTime = 0;
      this.firstEngagedTimestamp = null;

      // @public (read-only)
      this.temporalCounter = new TemporalCounter( 1000 );
    }

    /**
     * Getter to keep things a bit more modular
     * @returns {number} - the ms of engagement for the sim
     */
    get engagedTime() {
      return this.temporalCounter.counts * 1000;
    }

    /**
     * @public
     * @param {Object} event
     * @param {number} simStartTimestamp - of start of the simulation
     */
    onEngagedEvent( event, simStartTimestamp ) {

      this.temporalCounter.onEvent( event.time - simStartTimestamp );

      // case for first engaged event
      this.firstEngagementTimestamp = this.firstEngagementTimestamp || event.time;
    }

    /**
     * Public facing info, mainer getter for this POJSO.
     * @public
     * @returns {Object}
     */
    getData() {
      return {
        name: this.name,
        totalTime: this.totalTime,
        engagedTime: this.engagedTime,
        firstTimestamp: this.firstTimestamp,
        lastTimestamp: this.lastTimestamp
      };
    }
  }

  return joist.register( 'EngagementMetrics', EngagementMetrics );
} );