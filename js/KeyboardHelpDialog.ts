// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Opened via a button in the navigation bar.
 *
 * @author Jesse Greenberg
 */

import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import KeyboardHelpSection from '../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../scenery-phet/js/keyboard/TextKeyNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HBox, Node, NodeOptions, PDOMPeer, ReadingBlock, ReadingBlockOptions, VBox, VoicingText } from '../../scenery/js/imports.js';
import Dialog, { DialogOptions } from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

// constants
const TITLE_MAX_WIDTH = 670;

const tabToGetStartedString = joistStrings.a11y.keyboardHelp.tabToGetStarted;

type SelfOptions = {};

export type KeyboardHelpDialogOptions = SelfOptions & StrictOmit<DialogOptions, 'title'>;

export default class KeyboardHelpDialog extends Dialog {

  /**
   * @param helpContent - a Node containing the sim specific keyboard help content
   * @param [providedOptions]
   */
  constructor( helpContent: Node, providedOptions?: KeyboardHelpDialogOptions ) {

    const options = optionize<KeyboardHelpDialogOptions, SelfOptions, DialogOptions>()( {
      titleAlign: 'center',
      fill: 'rgb( 214, 237, 249 )',
      ySpacing: 15,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioReadOnly: true, // the KeyboardHelpDialog should not be settable
      phetioDynamicElement: true,

      // Append the title to the close button
      closeButtonVoicingDialogTitle: joistStrings.keyboardShortcuts.title,

      // Because of the special titleNode, we set the aria-labelledby attribute manually; see below.
      addAriaLabelledByFromTitle: false
    }, providedOptions );

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

    // a 'tab to get started' hint
    const tabHintLine = new TabHintLine();

    // stack the two items with a bit of spacing
    assert && assert( !options.title, 'KeyboardHelpDialog sets title' );
    options.title = new VBox( {
        children: [ shortcutsTitleText, tabHintLine ],
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

type TabHintLineSelfOptions = {};
type TabHintLineOptions = TabHintLineSelfOptions & NodeOptions & ReadingBlockOptions;

class TabHintLine extends ReadingBlock( Node, 0 ) {

  constructor( providedOptions?: TabHintLineOptions ) {

    const options = optionize<TabHintLineOptions, TabHintLineSelfOptions, ReadingBlockOptions>()( {
      readingBlockNameResponse: tabToGetStartedString
    }, providedOptions );

    super();

    // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
    const labelWithIcon = KeyboardHelpSection.labelWithIcon( joistStrings.keyboardShortcuts.toGetStarted,
      TextKeyNode.tab(), {
        labelInnerContent: tabToGetStartedString,
        iconOptions: {
          tagName: 'p' // because there is only one, and the default is an li tag
        }
      } );

    // labelWithIcon is meant to be passed to KeyboardHelpSection, so we have to hack a bit here
    this.addChild( new HBox( { children: [ labelWithIcon.icon, labelWithIcon.label ], spacing: 4 } ) );

    this.mutate( options );
  }
}

joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );