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
      backgroundColor: 'black', //TODO joist#255 this should come from LookAndFeel
      tandem: tandem
    }, options );

    //name, homeScreenIcon, createModel, createView, options
    Screen.call( this,

      // The HomeScreen does not have a user-visible name
      null,

      // The HomeScreen icon gets special treatment, doesn't appear in homescreen, does appear (custom) in navbar
      null,

      // Trivial model
      function() {
        return {};
      },

      // View is where all of the work is done
      function() {
        return new HomeScreenView( sim, options.tandem, options );
      },

      options
    );
  }

  joist.register( 'HomeScreen', HomeScreen );

  return inherit( Screen, HomeScreen );
} );