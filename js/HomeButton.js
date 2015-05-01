// Copyright 2002-2013, University of Colorado Boulder

/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {function} showHomeScreen
   * @param {object} [options]
   * @constructor
   */
  function HomeButton( navigationBarFillProperty, showHomeScreen, options ) {

    var homeIcon = new FontAwesomeNode( 'home', {
      scale: 0.75
    } );
    options = _.extend( {
      highlightExtensionWidth: 4,

      // When pressed, take the user to the home screen.
      listener: showHomeScreen,
      textDescription: 'Home Screen: Button',
      tandem: null
    }, options );
    JoistButton.call( this, homeIcon, navigationBarFillProperty, options );

    Property.multilink( [ this.interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
      if ( navigationBarFill === 'black' ) {
        homeIcon.fill = interactionState === 'pressed' ? 'gray' : 'white';
      }
      else {
        homeIcon.fill = interactionState === 'pressed' ? '#444' : '#222';
      }
    } );
  }

  return inherit( JoistButton, HomeButton );
} );