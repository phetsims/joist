// Copyright 2019-2022, University of Colorado Boulder

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

import Property from '../../axon/js/Property.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import joist from './joist.js';
import Sim from './Sim.js';
import TemporalCounter from './TemporalCounter.js';

/////////////////////////////////
// TODO: Duplication alert! MK doesn't want to import from phet-io into joist, so we will just duplicate the type for now. https://github.com/phetsims/joist/issues/553
type PhetioEventData = Record<string, IntentionalAny>;
type PhetioEvent = {
  index: number;
  time: number;
  type: string;
  phetioID: string;
  name: string;
  componentType: string;
  children?: PhetioEvent[];
  data?: PhetioEventData;
  metadata?: PhetioEventData;
};
////////////////////////////////

type ScreenDataType = {
  name: string;
  totalTime: number;
  engagedTime: number;
  firstTimestamp: number;
  lastTimestamp: number;
};
type EngagementMetricsData = {
  sim: {

    // the timestamp of the first received model step
    startTimestamp: number;

    // number of seconds since startTimestamp
    elapsedTime: number;

    // number of seconds in which "engagement" occurred
    engagedTime: number;

    // the timestamp of the first time the sim is engaged with
    firstEngagementTimestamp: number;

    // current time of the sim
    currentTimestamp: number;
  };
  screens: ScreenDataType[];
};


class EngagementMetrics {

  private readonly screens: ScreenData[] = []; // {ScreenData[]}

  private startTimestamp: number | null = null; // number, the timestamp of the start of the sim.

  public constructor( sim: Sim ) {
    const dataStream = phet && phet.phetio && phet.phetio.dataStream;
    assert && assert( dataStream, 'cannot add dataStream listener because dataStream is not defined' );

    let currentScreenEntry = this.screens[ sim.screens.indexOf( sim.selectedScreenProperty.value ) ];

    sim.screens.forEach( screen => {
      this.screens.push( new ScreenData( screen.tandem.name ) );
    } );

    const updateCurrentScreenEntry = ( event: PhetioEvent ) => {
      currentScreenEntry = this.screens[ sim.screens.indexOf( sim.selectedScreenProperty.value ) ];

      // initial condition if first time on this screen
      currentScreenEntry.firstTimestamp = currentScreenEntry.firstTimestamp! || event.time;
    };

    // phet-io data stream listener for every sim event.
    dataStream.addAllEventListener( ( event: PhetioEvent ) => {

      // initial condition
      if ( this.startTimestamp === null ) {
        this.startTimestamp = event.time;
        updateCurrentScreenEntry( event );
      }

      // screenIndex changedr
      if ( event.phetioID === sim.selectedScreenProperty.tandem.phetioID &&
           event.name === Property.CHANGED_EVENT_NAME ) {
        updateCurrentScreenEntry( event );
      }

      // Handle the case if the event signifies engagement with the simulation.
      this.isEngagedEvent( event ) && currentScreenEntry.onEngagedEvent( event, this.startTimestamp );

      if ( event.phetioID === sim.stepSimulationAction.tandem.phetioID ) {

        // TODO: counted even when not in the active browser tab, perhaps we need to use browserTabVisibleProperty, https://github.com/phetsims/joist/issues/553
        // TODO: or just be adding up dt values instead of trying to use event.time, which is just from Date.now(), https://github.com/phetsims/joist/issues/553
        currentScreenEntry.lastTimestamp = event.time;
        currentScreenEntry.totalTime += Math.floor( event.data!.dt * 1000 );
      }
    } );
  }

  /**
   * Returns true if the event signifies that the student is "engaged." The current definition is just pointer down
   * events.
   */
  private isEngagedEvent( event: PhetioEvent ): boolean {
    let engaged = false;
    [ 'mouseDownAction', 'touchDownAction', 'keydownAction', 'penDownAction' ].forEach( eventName => {
      if ( window.phetio.PhetioIDUtils.getComponentName( event.phetioID ) === eventName ) {
        engaged = true;
      }
    } );
    return engaged;
  }

  /**
   * get the current engagement data of the simulation.
   */
  public getEngagementMetrics(): EngagementMetricsData {
    const screens = this.screens;
    return {
      sim: {

        // the timestamp of the first received model step
        startTimestamp: this.startTimestamp!,

        // number of seconds since startTimestamp
        elapsedTime: _.sum( screens.map( screen => screen.totalTime ) ),

        // number of seconds in which "engagement" occurred
        engagedTime: _.sum( screens.map( screen => screen.engagedTime ) ),

        // the timestamp of the first time the sim is engaged with
        firstEngagementTimestamp: _.min( screens.map( screen => screen.firstTimestamp ) )!,

        // current time of the sim
        currentTimestamp: _.max( screens.map( screen => screen.lastTimestamp ) )!
      },
      screens: screens.map( screen => screen.getData() )
    };
  }
}

// private class to keep track of data for each screen.
class ScreenData {

  public name: string;
  public firstTimestamp: number | null = null;
  public lastTimestamp: number | null = null;
  public totalTime = 0;
  public firstEngagedTimestamp = null;
  public readonly temporalCounter = new TemporalCounter( 1000 );

  public constructor( name: string ) {
    this.name = name;
  }

  /**
   * Getter to keep things a bit more modular
   * @returns - the ms of engagement for the sim
   */
  public get engagedTime(): number {
    return this.temporalCounter.counts * 1000;
  }

  public onEngagedEvent( event: PhetioEvent, simStartTimestamp: number ): void {

    this.temporalCounter.onEvent( event.time - simStartTimestamp );

    // case for first engaged event
    this.firstTimestamp = this.firstTimestamp! || event.time;
  }

  /**
   * Public facing info, mainer getter for this POJSO.
   */
  public getData(): ScreenDataType {
    return {
      name: this.name,
      totalTime: this.totalTime,
      engagedTime: this.engagedTime,
      firstTimestamp: this.firstTimestamp!,
      lastTimestamp: this.lastTimestamp!
    };
  }
}

joist.register( 'EngagementMetrics', EngagementMetrics );
export default EngagementMetrics;