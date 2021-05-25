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
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

// constants
const TITLE_MAX_WIDTH = 670;

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
    const shortcutsTitleText = new Text( joistStrings.keyboardShortcuts.title, {
      font: new PhetFont( {
        weight: 'bold',
        size: 24
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // pdom options
      tagName: 'h1',
      innerContent: joistStrings.a11y.keyboardHelp.hotKeysAndHelp
    } );

    // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
    const tabHintLine = KeyboardHelpSection.labelWithIcon( joistStrings.keyboardShortcuts.toGetStarted,
      TextKeyNode.tab(), joistStrings.a11y.keyboardHelp.tabToGetStarted, {
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

joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );
export default KeyboardHelpDialog;