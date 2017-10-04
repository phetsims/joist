// Copyright 2016-2017, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 *
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var KeyboardHelpDialog = require( 'JOIST/KeyboardHelpDialog' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  // images
  var brightIconMipmap = require( 'mipmap!JOIST/keyboard-icon.png' ); // on a black navbar
  var darkIconMipmap = require( 'mipmap!JOIST/keyboard-icon-on-white.png' ); // on a white navbar
  assert && assert( brightIconMipmap instanceof Array, 'icon must be a mipmap' );

  // constants
  var HELP_BUTTON_HEIGHT = 67;
  var HELP_BUTTON_SCALE = 0.32;  // scale applied to the icon
  var BUTTON_SCALE = HELP_BUTTON_SCALE / brightIconMipmap[ 0 ].height * HELP_BUTTON_HEIGHT;

  function KeyboardHelpButton( sim, backgroundFillProperty, tandem ) {
    var self = this;

    var keyboardHelpDialog = null;
    var openDialog = function() {
      if ( !keyboardHelpDialog ) {
        keyboardHelpDialog = new KeyboardHelpDialog( self, sim.keyboardHelpNode, {
          tandem: tandem.createTandem( 'keyboardHelpDialog' )
        } );
      }
      keyboardHelpDialog.show();
    };

    var options = {
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,
      highlightCenterOffsetY: 3,
      listener: openDialog,

      // a11y options
      tagName: 'button',
      accessibleLabel: JoistA11yStrings.hotKeysAndHelpString
    };

    var icon = new Image( brightIconMipmap, {
      scale: BUTTON_SCALE,
      pickable: false
    } );

    JoistButton.call( this, icon, backgroundFillProperty, tandem, options );

    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty ],
      function( backgroundFill, showHomeScreen ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        icon.image = backgroundIsWhite ? darkIconMipmap : brightIconMipmap;
      } );

    // a11y - open the dialog on 'spacebar' or 'enter' and focus the 'Close' button immediately
    this.clickListener = this.addAccessibleInputListener( {
      click: function() {
        openDialog();
        keyboardHelpDialog.closeButtonPath.focus();
      } }
    );
  }

  joist.register( 'KeyboardHelpButton', KeyboardHelpButton );

  return inherit( JoistButton, KeyboardHelpButton, {

    /**
     * To make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.removeAccessibleInputListener( this.clickListener );
      JoistButton.prototype.dispose && JoistButton.prototype.dispose.call( this );
    }
  } );

} );