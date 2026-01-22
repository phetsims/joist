// Copyright 2016-2018, University of Colorado Boulder

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

  // images
  var brightIconMipmap = require( 'mipmap!JOIST/keyboard-icon.png' ); // on a black navbar
  var darkIconMipmap = require( 'mipmap!JOIST/keyboard-icon-on-white.png' ); // on a white navbar
  assert && assert( Array.isArray( brightIconMipmap ), 'icon must be a mipmap' );

  // a11y strings
  var hotKeysAndHelpString = JoistA11yStrings.hotKeysAndHelp.value;

  // constants
  var HELP_BUTTON_HEIGHT = 67;
  var HELP_BUTTON_SCALE = 0.32;  // scale applied to the icon
  var BUTTON_SCALE = HELP_BUTTON_SCALE / brightIconMipmap[ 0 ].height * HELP_BUTTON_HEIGHT;

  /**
   * @param {Node} keyboardHelpNode - content for the KeyboardHelpDialog
   * @param {LookAndFeel} simLookAndFeel - state and colors of sim/NavigationBar to set color for icon of this button
   * @param {Tandem} tandem
   * @constructor
   */
  function KeyboardHelpButton( keyboardHelpNode, simLookAndFeel, tandem ) {
    var self = this;

    var keyboardHelpDialog = null;
    var openDialog = function() {
      if ( !keyboardHelpDialog ) {
        keyboardHelpDialog = new KeyboardHelpDialog( self, keyboardHelpNode, {
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
      innerContent: hotKeysAndHelpString,
      a11yEndListener: function() {

        // focus the close button if the dialog is open with a keyboard
        keyboardHelpDialog.closeButtonPath.focus();
      }
    };

    var icon = new Image( brightIconMipmap, {
      scale: BUTTON_SCALE,
      pickable: false
    } );

    JoistButton.call( this, icon, simLookAndFeel.navigationBarFillProperty, tandem, options );

    // change the icon so that it is visible when the navigation bar changes from dark to light
    simLookAndFeel.navigationBarDarkProperty.link( function( navigationBarDark ) {
      icon.image = navigationBarDark ? darkIconMipmap : brightIconMipmap;
    } );
  }

  joist.register( 'KeyboardHelpButton', KeyboardHelpButton );

  return inherit( JoistButton, KeyboardHelpButton, {

    /**
     * To make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      JoistButton.prototype.dispose && JoistButton.prototype.dispose.call( this );
    }
  } );

} );