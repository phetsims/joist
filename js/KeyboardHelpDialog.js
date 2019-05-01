// Copyright 2016-2019, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var Dialog = require( 'SUN/Dialog' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var KeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/KeyboardHelpSection' );
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

    options = _.extend( {
      titleAlign: 'center',
      fill: 'rgb( 214, 237, 249 )',
      ySpacing: 15,
      tandem: Tandem.required,

      // Because of the special titleNode, we set the aria-labelledby attribute manually; see below.
      addAriaLabelledByFromTitle: false
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
    var tabHintLine = KeyboardHelpSection.labelWithIcon( keyboardShortcutsToGetStartedString, new TabKeyNode(), tabToGetStartedString, {
      iconOptions: {
        tagName: 'p' // because there is only one, and the default is an li tag
      }
    } );

    // stack the two items with a bit of spacing
    options.title = new VBox( {
        children: [
          shortcutsTitleText,

          // labelWithIcon is meant to be passed to KeyboardHelpSection, so we have to hack a bit here
          new HBox( { children: [ tabHintLine.icon, tabHintLine.label ], spacing: 4 } )
        ],
        spacing: 5,

        // a11y
        tagName: 'div'
      }
    );

    // help content surrounded by a div unless already specified, so that all content is read when dialog opens
    helpContent.tagName = helpContent.tagName || 'div';

    Dialog.call( this, helpContent, options );

    // (a11y) Make sure that the title passed to the Dialog has an accessible name.
    this.addAriaLabelledbyAssociation( {
      thisElementName: AccessiblePeer.PRIMARY_SIBLING,
      otherNode: shortcutsTitleText,
      otherElementName: AccessiblePeer.PRIMARY_SIBLING
    } );
  }

  joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );

  return inherit( Dialog, KeyboardHelpDialog );
} );