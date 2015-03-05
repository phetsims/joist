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

  function HomeButton( lookAndFeel, model, options ) {

    var homeIcon = new FontAwesomeNode( 'home', {
      scale: 0.75
    } );
    options = _.extend( {
      highlightExtensionWidth: 4,

      // When pressed, take the user to the home screen.
      listener: function() {
        model.showHomeScreen = true;
      },
      textDescription: 'Home Screen: Button',
      componentID: 'homeButton'
    }, options );
    JoistButton.call( this, homeIcon, lookAndFeel, options );

    Property.multilink( [ this.interactionStateProperty, lookAndFeel.navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
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