// Copyright 2015-2019, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const GeneralKeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/GeneralKeyboardHelpSection' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  const Panel = require( 'SUN/Panel' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    const keyboardHelpDialogContent = new GeneralKeyboardHelpSection();

    const keyboardHelpButton = new KeyboardHelpButton(
      keyboardHelpDialogContent,
      phet.joist.sim.lookAndFeel.backgroundColorProperty,
      Tandem.OPTIONAL
    );
    keyboardHelpButton.setScaleMagnitude( 2 );

    // Since KeyboardHelpButton adapts its color to the navigation bar,
    // put the button in a panel that's the same color as the navigation bar
    const keyboardHelpPanel = new Panel( keyboardHelpButton, {
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