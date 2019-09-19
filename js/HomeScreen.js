// Copyright 2015-2019, University of Colorado Boulder

/**
 * Screen for the home screen, which shows icons for selecting the sim content screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const HomeScreenView = require( 'JOIST/HomeScreenView' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // constants
  var BACKGROUND_COLOR = 'black';

  /**
   *
   * @constructor
   */
  function HomeScreen( sim, tandem, options ) {

    options = _.extend( {

      //TODO get this color from LookAndFeel, see https://github.com/phetsims/joist/issues/255
      backgroundColorProperty: new Property( BACKGROUND_COLOR )
    }, options );

    assert && assert( !options.tandem, 'tandem is a required constructor parameter, not an option' );
    options.tandem = tandem;

    Screen.call( this,

      // createModel
      function() { return {}; },

      // createView
      function() {
        return new HomeScreenView( sim, tandem.createTandem( 'view' ), _.pick( options, [
          'warningNode'
        ] ) );
      },

      options
    );
  }

  joist.register( 'HomeScreen', HomeScreen );

  return inherit( Screen, HomeScreen, {}, {

    // @public
    BACKGROUND_COLOR: BACKGROUND_COLOR
  } );
} );