// Copyright 2016, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 * 
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var joist = require( 'JOIST/joist' );

  function KeyboardHelpButton( sim, backgroundFillProperty, tandem ) {

    var options = {
      highlightExtensionWidth: 8,
      highlightExtensionHeight: 15,
      highlightCenterOffsetY: 0,
      listener: function() {}
    };

    var icon = new FontAwesomeNode( 'keyboard', {
      scale: 0.6,
      pickable: false
    } );

    JoistButton.call( this, icon, backgroundFillProperty, tandem, options );

    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty ],
      function( backgroundFill, showHomeScreen ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        icon.fill = backgroundIsWhite ? '#222' : 'white';
      } );
  } 

  joist.register( 'KeyboardHelpButton', KeyboardHelpButton );

  return inherit( JoistButton, KeyboardHelpButton );

} );