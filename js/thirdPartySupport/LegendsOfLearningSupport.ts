// Copyright 2017-2022, University of Colorado Boulder

/**
 * Support for Legends of Learning platform. Sends init message after sim is constructed and supports pause/resume.
 *
 * To test this class, follow the 'Legends of Learning Test' instructions at
 * https://github.com/phetsims/QA/blob/master/documentation/qa-book.md#legends-of-learning-test
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import Sim from '../Sim.js';

class LegendsOfLearningSupport {

  private readonly sim: Sim;

  public constructor( sim: Sim ) {
    this.sim = sim;

    // Respond to pause/resume commands from the Legends of Learning platform
    window.addEventListener( 'message', message => {
      if ( message.data.messageName === 'pause' ) {
        sim.stepOneFrame();
        sim.activeProperty.value = false;
      }
      else if ( message.data.messageName === 'resume' ) {
        sim.activeProperty.value = true;
      }
    } );
  }

  public start(): void {

    // Send init message when sim has started up so that Legends of Learning can remove their splash screen
    this.sim.isConstructionCompleteProperty.link( isConstructionComplete => {
      isConstructionComplete && ( window.parent !== window ) && window.parent.postMessage( { message: 'init' }, '*' );
    } );
  }
}

joist.register( 'LegendsOfLearningSupport', LegendsOfLearningSupport );
export default LegendsOfLearningSupport;