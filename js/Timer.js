// Copyright 2002-2013, University of Colorado Boulder

/**
 * Timer so that other modules can run timing related code through the simulation's requestAnimationFrame.
 * Note: this is not specific to the running screen, it is global across all screens.
 *
 * @author Sam Reid
 */
define( function() {
  'use strict';
  var listeners = [];
  return {

    //Trigger a step event, called by Sim.js in the animation loop
    step: function( dt ) {
      var length = listeners.length;
      for ( var i = 0; i < length; i++ ) {
        listeners[i]( dt );
      }
    },

    //Add a listener to be called back once after the specified time (in milliseconds)
    setTimeout: function( listener, timeout ) {
      var elapsed = 0;
      var timer = this;
      var callback = function( dt ) {
        elapsed += dt;

        //Convert seconds to ms and see if item has timed out
        if ( elapsed * 1000 >= timeout ) {
          listener();
          timer.removeStepListener( callback );
        }
      };
      this.addStepListener( callback );

      //Return the callback so it can be removed with removeStepListener
      return callback;
    },

    //Clear a scheduled timeout
    clearTimeout: function( timeoutID ) { this.removeStepListener( timeoutID ); },

    //Add a listener to be called back on every animationFrame with a dt value
    addStepListener: function( listener ) { listeners.push( listener ); },

    //Remove a step listener from being called back
    removeStepListener: function( listener ) {
      var index = listeners.indexOf( listener );
      if ( index !== -1 ) {
        listeners.splice( index, index + 1 );
      }
    }
  };
} );