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
  var KeyboardHelpDialog = require( 'JOIST/KeyboardHelpDialog' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    var keyboardHelpDialogContent = new GeneralNavigationHelpContent();

    //TODO #486 why doesn't this render?
    var keyboardHelpButton = new KeyboardHelpButton( keyboardHelpDialogContent, phet.joist.sim.lookAndFeel, Tandem.optional );

    //TODO #486 workaround, delete this when keyboardHelpButton renders
    var myButton = new RectangularPushButton( {
      content: new Text( 'keyboard help', { font: new PhetFont( 20 ) } ),
      listener: function() {
        new KeyboardHelpDialog( myButton, keyboardHelpDialogContent ).show();
      }
    } );

    this.addChild( new VBox( {
      children: [
        keyboardHelpButton,
        myButton
      ],
      spacing: 20,
      center: this.layoutBounds.center
    } ) );
  }

  joist.register( 'DialogsScreenView', DialogsScreenView );

  return inherit( ScreenView, DialogsScreenView );
} );