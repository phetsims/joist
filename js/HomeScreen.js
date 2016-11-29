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
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   *
   * @constructor
   */
  function HomeScreen( sim, tandem, options ) {

    options = _.extend( {

      //TODO get this color from LookAndFeel, see https://github.com/phetsims/joist/issues/255
      backgroundColorProperty: new Property( Color.toColor( 'black' ) )
    }, options );

    assert && assert( !options.tandem, 'tandem is a required constructor parameter, not an option' );
    options.tandem = tandem;

    Screen.call( this,

      // createModel
      function() { return {}; },

      // createView
      function() {
        return new HomeScreenView( sim, tandem.createTandem( 'view' ), _.pick( options, [
          'showSmallHomeScreenIconFrame',
          'warningNode'
        ] ) );
      },

      options
    );
  }

  joist.register( 'HomeScreen', HomeScreen );

  return inherit( Screen, HomeScreen );
} );