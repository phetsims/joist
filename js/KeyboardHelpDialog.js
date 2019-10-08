// Copyright 2016-2019, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const Dialog = require( 'SUN/Dialog' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const KeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/KeyboardHelpSection' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const TabKeyNode = require( 'SCENERY_PHET/keyboard/TabKeyNode' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const TITLE_MAX_WIDTH = 500;

  // string
  const keyboardShortcutsTitleString = require( 'string!JOIST/keyboardShortcuts.title' );
  const keyboardShortcutsToGetStartedString = require( 'string!JOIST/keyboardShortcuts.toGetStarted' );

  // a11y string
  const hotKeysAndHelpString = JoistA11yStrings.hotKeysAndHelp.value;
  const tabToGetStartedString = JoistA11yStrings.tabToGetStarted.value;

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
    const shortcutsTitleText = new Text( keyboardShortcutsTitleString, {
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
    const tabHintLine = KeyboardHelpSection.labelWithIcon( keyboardShortcutsToGetStartedString, new TabKeyNode(), tabToGetStartedString, {
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