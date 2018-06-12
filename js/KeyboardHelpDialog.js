// Copyright 2016-2018, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var Dialog = require( 'SUN/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var TITLE_MAX_WIDTH = 500;

  // string
  var keyboardShortcutsTitleString = require( 'string!JOIST/keyboardShortcuts.title' );

  // a11y string
  var hotKeysAndHelpString = JoistA11yStrings.hotKeysAndHelp.value;

  /**
   * @param {Node} helpContent - a node containing the sim specific keyboard help content
   * @param {Object} [options]
   * @constructor
   */
  function KeyboardHelpDialog( helpContent, options ) {
    var self = this;

    options = _.extend( {
      titleAlign: 'center',
      fill: 'rgb( 214, 237, 249 )',
      ySpacing: 15,
      tandem: Tandem.required
    }, options );

    // title
    assert && assert( !options.title, 'KeyboardHelpDialog sets title' );
    options.title = new Text( keyboardShortcutsTitleString, {
      font: new PhetFont( {
        weight: 'bold',
        size: 18
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // a11y options
      tagName: 'h1',
      innerContent: hotKeysAndHelpString
    } );

    // help content surrounded by a div unless already specified, so that all content is read when dialog opens
    helpContent.tagName = helpContent.tagName || 'div';

    Dialog.call( this, helpContent, options );

    // a11y - the close button comes first so that the remaining content
    // can easily be read with the screen reader's virtual cursor
    this.accessibleOrder = [ this.closeButton, options.title ];

    // @private (a11y) - input listener for the close button, must be disposed
    var clickListener = {
      click: function() {
        self.hide();
        self.focusActiveElement();
      }
    };
    this.addAccessibleInputListener( clickListener );

    // @private - to be called by dispose
    this.disposeKeyboardHelpDialog = function() {
      self.removeAccessibleInputListener( clickListener );
    };
  }

  joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );

  return inherit( Dialog, KeyboardHelpDialog, {

    /**
     * So the Dialog is eligible for garbage collection.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeKeyboardHelpDialog();
      Dialog.prototype.dispose.call( this );
    },

    /**
     * Focus the close button of the Dialog.
     * @a11y
     * @public
     */
    focusCloseButton: function() {
      this.closeButton.focus();
    }
  } );
} );