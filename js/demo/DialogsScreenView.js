// Copyright 2015-2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var GeneralNavigationHelpContent = require( 'SCENERY_PHET/keyboard/help/GeneralNavigationHelpContent' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    var keyboardHelpDialogContent = new GeneralNavigationHelpContent();

    var backgroundColorProperty = new Property( 'white' );

    var keyboardHelpButton = new KeyboardHelpButton( keyboardHelpDialogContent, backgroundColorProperty, Tandem.optional );
    keyboardHelpButton.setScaleMagnitude( 2 );

    this.addChild( new VBox( {
      children: [
        keyboardHelpButton
      ],
      spacing: 20,
      center: this.layoutBounds.center
    } ) );
  }

  joist.register( 'DialogsScreenView', DialogsScreenView );

  return inherit( ScreenView, DialogsScreenView );
} );