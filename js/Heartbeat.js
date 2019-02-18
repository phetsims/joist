// Copyright 2017-2019, University of Colorado Boulder

/**
 * For preventing Safari from going to sleep - added to the self.display.domElement instead of the body to prevent a VoiceOver bug
 * where the virtual cursor would spontaneously move when the div content changed, see https://github.com/phetsims/joist/issues/140
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  // variables
  var started = false;

  var Heartbeat = {

    /**
     * Initializes the heartbeat div to begin ticking to prevent Safari from going to sleep.
     * @param {Sim} sim
     * @public
     */
    start: function( sim ) {
      assert && assert( !started, 'Heartbeat can only be started once' );
      started = true;

      var heartbeatDiv = document.createElement( 'div' );
      heartbeatDiv.style.opacity = 0;

      // Extra style (also used for accessibility) that makes it take up no visual layout space.
      // Without this, it could cause some layout issues. See https://github.com/phetsims/gravity-force-lab/issues/39
      heartbeatDiv.style.position = 'absolute';
      heartbeatDiv.style.left = '0';
      heartbeatDiv.style.top = '0';
      heartbeatDiv.style.width = '0';
      heartbeatDiv.style.height = '0';
      heartbeatDiv.style.clip = 'rect(0,0,0,0)';
      heartbeatDiv.setAttribute( 'aria-hidden', true ); // hide div from screen readers (a11y)
      sim.display.domElement.appendChild( heartbeatDiv );

      // prevent Safari from going to sleep, see https://github.com/phetsims/joist/issues/140
      sim.frameStartedEmitter.addListener( function() {
        if ( sim.frameCounter % 1000 === 0 ) {
          heartbeatDiv.innerHTML = phet.joist.random.nextDouble();
        }
      } );
    }
  };

  joist.register( 'Heartbeat', Heartbeat );

  return Heartbeat;
} );