// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */

import merge from '../../phet-core/js/merge.js';
import KeyboardHelpSection from '../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../scenery-phet/js/keyboard/TextKeyNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HBox, Node, PDOMPeer, ReadingBlock, VBox, VoicingText } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

// constants
const TITLE_MAX_WIDTH = 670;

const tabToGetStartedString = joistStrings.a11y.keyboardHelp.tabToGetStarted;

class KeyboardHelpDialog extends Dialog {

  /**
   * @param {Node} helpContent - a node containing the sim specific keyboard help content
   * @param {Object} [options]
   */
  constructor( helpContent, options ) {

    options = merge( {
      titleAlign: 'center',
      fill: 'rgb( 214, 237, 249 )',
      ySpacing: 15,
      tandem: Tandem.REQUIRED,

      phetioReadOnly: true, // the KeyboardHelpDialog should not be settable
      phetioDynamicElement: true,

      // Because of the special titleNode, we set the aria-labelledby attribute manually; see below.
      addAriaLabelledByFromTitle: false
    }, options );

    // title
    assert && assert( !options.title, 'KeyboardHelpDialog sets title' );
    const shortcutsTitleText = new VoicingText( joistStrings.keyboardShortcuts.title, {
      font: new PhetFont( {
        weight: 'bold',
        size: 24
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // pdom options
      tagName: 'h1',
      innerContent: joistStrings.a11y.keyboardHelp.keyboardShortcuts
    } );

    // stack the two items with a bit of spacing
    options.title = new VBox( {
        children: [
          shortcutsTitleText,
          new TabHintLine()
        ],
        spacing: 5,

        // pdom
        tagName: 'div'
      }
    );

    // help content surrounded by a div unless already specified, so that all content is read when dialog opens
    helpContent.tagName = helpContent.tagName || 'div';

    super( helpContent, options );

    // (a11y) Make sure that the title passed to the Dialog has an accessible name.
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: shortcutsTitleText,
      otherElementName: PDOMPeer.PRIMARY_SIBLING
    } );
  }
}

/**
 * An inner class that assembles the "Tab to get started" content of the Dialog title. This content
 * is interactive with Voicing in that it can be clicked to hear this content (when Voicing is enabled).
 */
class TabHintLine extends Node {

  /**
   * @mixes ReadingBlock
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      readingBlockContent: tabToGetStartedString
    }, options );

    super();

    // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
    const labelWithIcon = KeyboardHelpSection.labelWithIcon( joistStrings.keyboardShortcuts.toGetStarted,
      TextKeyNode.tab(), tabToGetStartedString, {
        iconOptions: {
          tagName: 'p' // because there is only one, and the default is an li tag
        }
      } );

    // labelWithIcon is meant to be passed to KeyboardHelpSection, so we have to hack a bit here
    this.addChild( new HBox( { children: [ labelWithIcon.icon, labelWithIcon.label ], spacing: 4 } ) );

    this.initializeReadingBlock();
    this.mutate( options );
  }
}

ReadingBlock.compose( TabHintLine );

joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );
export default KeyboardHelpDialog;