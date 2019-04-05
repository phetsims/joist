// Copyright 2015-2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var GeneralKeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/GeneralKeyboardHelpSection' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  var Panel = require( 'SUN/Panel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    var keyboardHelpDialogContent = new GeneralKeyboardHelpSection();

    var keyboardHelpButton = new KeyboardHelpButton(
      keyboardHelpDialogContent,
      phet.joist.sim.lookAndFeel.backgroundColorProperty,
      Tandem.optional
    );
    keyboardHelpButton.setScaleMagnitude( 2 );

    // Since KeyboardHelpButton adapts its color to the navigation bar,
    // put the button in a panel that's the same color as the navigation bar
    var keyboardHelpPanel = new Panel( keyboardHelpButton, {
      fill: phet.joist.sim.lookAndFeel.navigationBarFillProperty.value
    } );

    this.addChild( new VBox( {
      children: [
        keyboardHelpPanel
      ],
      spacing: 20,
      center: this.layoutBounds.center
    } ) );
  }

  joist.register( 'DialogsScreenView', DialogsScreenView );

  return inherit( ScreenView, DialogsScreenView );
} );