// Copyright 2019, University of Colorado Boulder

/**
 * Monitors the activity as it relates to time spent on each screen of a sim. Mainly this is to provide this information
 * to a PhET-iO wrapper frame.
 *
 * The main output of this file is powered by the data stream. As a result the finest granularity of this data is based on
 * the most frequent events that are emitting. As of this writing, when emitting high frequency events, that is every
 * frame on the "stepSimulation" event. Note that if not emitting high frequency events, this Type's live activity
 * (how often the data is updated) won't be nearly as accurate.
 *
 * NOTE: for engagedTime, this is not based on an interval running every second, but instead based on the data
 * stream events. As a result this metric will count "one second of activity" in the following way. An active second
 * begins when an "active event" (see EngagementMetrics.isActiveEvent) is emitted to the data stream. Then the next
 * second of time will be counted as "active" and other active events within that time will not change the output.
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
      this.screens = [];
      this.homeScreen = null;

      // TODO: get rid of sim data, to be computed based on screens, https://github.com/phetsims/joist/issues/553
      this.sim = {
        startTimestamp: null, // the timestamp of the first received step
        currentTimestamp: null, // current time of the sim
        firstEngagementTimestamp: null, // the timestamp of the first time the sim is active with

        // TODO: counted even when not in the active browser tab, perhaps we need to use browserTabVisibleProperty, https://github.com/phetsims/joist/issues/553
        elapsedTime: 0, // number of seconds since startTimestamp

        // TODO: not supported yet, https://github.com/phetsims/joist/issues/553
        engagedTime: 0 // number of seconds in which "activity" occurred, see above doc "NOTE" for more.
      };

      sim.screens.forEach( screen => {
        this.screens.push( new ScreenData( screen.screenTandem.tail ) );
      } );
      if ( sim.screens.length > 1 ) {
        assert && assert( sim.homeScreen, 'home screen should exist' );
        this.homeScreen = new ScreenData( sim.homeScreen.screenTandem.tail );
      }

      // Initial values for sim properties, updated in the event listener callback
      let isHomeScreenShowing = sim.showHomeScreenProperty.value;
      let currentScreenIndex = sim.screenIndexProperty.value;
      let currentScreenEntry = isHomeScreenShowing ? this.homeScreen : this.screens[ currentScreenIndex ];

      const updateCurrentScreenEntry = event => {
        currentScreenEntry = isHomeScreenShowing ? this.homeScreen : this.screens[ currentScreenIndex ];

        // initial condition if first time on this screen
        currentScreenEntry.firstTimestamp = currentScreenEntry.firstTimestamp || event.time;
      };

      // phet-io data stream listener for every sim event.
      dataStream.addAllEventListener( event => {

        // initial condition
        if ( this.sim.startTimestamp === null ) {
          this.sim.startTimestamp = event.time;
          updateCurrentScreenEntry( event );
        }

        if ( event.phetioID === sim.screenIndexProperty.tandem.phetioID &&
             event.name === Property.CHANGED_EVENT_NAME ) {
          currentScreenIndex = event.data.newValue;
          updateCurrentScreenEntry( event );
        }

        // Read values for screen changes through data stream so everything is ordered and synchronized
        if ( event.phetioID === sim.showHomeScreenProperty.tandem.phetioID &&
             event.name === Property.CHANGED_EVENT_NAME ) {
          isHomeScreenShowing = event.data.newValue;
          updateCurrentScreenEntry( event );
        }

        if ( this.isEngagedEvent( event ) ) {
          currentScreenEntry.temporalCounter.onEvent( event.time - this.sim.startTimestamp );

          // First active event
          this.sim.firstEngagementTimestamp = this.sim.firstEngagementTimestamp || event.time;
        }

        if ( event.phetioID === sim.stepSimulationAction.tandem.phetioID ) {
          const currentTime = event.time;
          this.sim.currentTimestamp = currentTime;
          this.sim.elapsedTime = currentTime - this.sim.startTimestamp;
          currentScreenEntry.lastTimestamp = event.time;
          currentScreenEntry.totalTime += Math.floor( event.data.dt * 1000 );
        }
      } );
    }

    /**
     * Returns true if the event signifies that the student is "active." The current definition is just pointer down
     * events.
     * @private
     * @param {Object} event - an event from the data stream
     * @returns {boolean}
     */
    isEngagedEvent( event ) {
      let isActiveEvent = false;
      [ 'mouseDownAction', 'touchDownAction', 'keydownAction', 'penDownAction' ].forEach( eventName => {
        if ( phetio.PhetioIDUtils.getComponentName( event.phetioID ) === eventName ) {
          isActiveEvent = true;
        }
      } );
      return isActiveEvent;
    }

    /**
     * get the current activity data of the simulation.
     * @public
     * @returns {Object}
     */
    getActivity() {
      return {
        sim: this.sim,
        screens: this.screens.map( screen => screen.getData() ),
        homeScreen: this.homeScreen.getData()
      };
    }
  }

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

      // @public (read-only)
      this.temporalCounter = new TemporalCounter( 1000 );
      // TODO: add a `firstEngagedTimestamp`, see https://github.com/phetsims/joist/issues/553
    }

    /**
     * @public
     * @returns {Object}
     */
    getData() {
      return {
        name: this.name,
        totalTime: this.totalTime,
        firstTimestamp: this.firstTimestamp,
        lastTimestamp: this.lastTimestamp,
        engagedTime: this.temporalCounter.counts * 1000
      };
    }
  }

  return joist.register( 'EngagementMetrics', EngagementMetrics );
} );