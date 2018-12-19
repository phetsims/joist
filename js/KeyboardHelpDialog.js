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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HelpContent = require( 'SCENERY_PHET/keyboard/help/HelpContent' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TabKeyNode = require( 'SCENERY_PHET/keyboard/TabKeyNode' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  var TITLE_MAX_WIDTH = 500;

  // string
  var keyboardShortcutsTitleString = require( 'string!JOIST/keyboardShortcuts.title' );
  var keyboardShortcutsToGetStartedString = require( 'string!JOIST/keyboardShortcuts.toGetStarted' );

  // a11y string
  var hotKeysAndHelpString = JoistA11yStrings.hotKeysAndHelp.value;
  var tabToGetStartedString = JoistA11yStrings.tabToGetStarted.value;

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
      tandem: Tandem.required,

      // the width of the KeyboardHelpDialog is constrained to the simulation bounds
      layoutStrategy: function( dialog, simBounds, screenBounds, scale ) {

        // empirically determined to have some margin relative to max width
        dialog.maxWidth = ( simBounds.width / scale ) * 0.90;

        // this is the default layout strategy in Dialog
        dialog.center = simBounds.center.times( 1.0 / scale );
      }
    }, options );

    // title
    assert && assert( !options.title, 'KeyboardHelpDialog sets title' );
    var shortcutsTitleText = new Text( keyboardShortcutsTitleString, {
      font: new PhetFont( {
        weight: 'bold',
        size: 18
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // a11y options
      tagName: 'h1',
      innerContent: hotKeysAndHelpString
    } );

    // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
    var tabHintText = new Text( keyboardShortcutsToGetStartedString, { font: HelpContent.DEFAULT_LABEL_FONT } );
    var tabHintLine = HelpContent.labelWithIcon( tabHintText, new TabKeyNode(), tabToGetStartedString, {
      iconOptions: {
        tagName: 'p' // because there is only one, and the default is an li tag
      }
    } );

    // stack the two items with a bit of spacing
    options.title = new VBox( {
        children: [
          shortcutsTitleText,

          // labelWithIcon is meant to be passed to HelpContent, so we have to hack a bit here
          new HBox( { children: [ tabHintLine.icon, tabHintLine.label ], spacing: 4 } )
        ],
        spacing: 5
      }
    );

    // help content surrounded by a div unless already specified, so that all content is read when dialog opens
    helpContent.tagName = helpContent.tagName || 'div';

    Dialog.call( this, helpContent, options );

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
    }
  } );
} );