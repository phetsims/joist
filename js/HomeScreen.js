// Copyright 2015, University of Colorado Boulder

/**
 * Screen for the home screen, which shows icons for selecting the sim content screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var HomeScreenView = require( 'JOIST/HomeScreenView' );
  var joist = require( 'JOIST/joist' );

  /**
   *
   * @constructor
   */
  function HomeScreen( sim, tandem, options ) {

    options = _.extend( {
      backgroundColor: 'black' //TODO joist#255 this should come from LookAndFeel
    }, options );

    assert && assert( !options.tandem, 'tandem is a required constructor parameter, not an option' );
    options.tandem = tandem;

    Screen.call( this,

      // createModel
      function() { return {}; },

      // createView
      function() {
        return new HomeScreenView( sim, tandem.createTandem( 'view' ), options );
      },

      options
    );
  }

  joist.register( 'HomeScreen', HomeScreen );

  return inherit( Screen, HomeScreen );
} );