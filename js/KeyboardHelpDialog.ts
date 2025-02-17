// Copyright 2016-2025, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Opened via a button in the navigation bar.
 *
 * @author Jesse Greenberg
 */

import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import KeyboardHelpSectionRow from '../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TextKeyNode from '../../scenery-phet/js/keyboard/TextKeyNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import VoicingText from '../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import ReadingBlock, { ReadingBlockOptions } from '../../scenery/js/accessibility/voicing/ReadingBlock.js';
import HBox from '../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../scenery/js/layout/nodes/VBox.js';
import Node, { NodeOptions } from '../../scenery/js/nodes/Node.js';
import Dialog, { DialogOptions } from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import { AnyScreen } from './Screen.js';

// constants
const TITLE_MAX_WIDTH = 670;

const tabToGetStartedStringProperty = JoistStrings.a11y.translatable.keyboardHelp.tabToGetStartedStringProperty;

type SelfOptions = EmptySelfOptions;

export type KeyboardHelpDialogOptions = SelfOptions & StrictOmit<DialogOptions, 'title'> & PickRequired<DialogOptions, 'tandem'>;

export default class KeyboardHelpDialog extends Dialog {

  public constructor( screens: AnyScreen[], screenProperty: Property<AnyScreen>, providedOptions?: KeyboardHelpDialogOptions ) {

    const options = optionize<KeyboardHelpDialogOptions, SelfOptions, DialogOptions>()( {
      titleAlign: 'center',
      fill: 'rgb( 214, 237, 249 )',
      ySpacing: 15,

      // phet-io
      phetioReadOnly: true, // the KeyboardHelpDialog should not be settable
      phetioDynamicElement: true,

      // Append the title to the close button
      closeButtonVoicingDialogTitle: JoistStrings.keyboardShortcuts.titleStringProperty,
      isDisposable: false
    }, providedOptions );

    const content = new Node( {
      tagName: 'div'
    } );

    const contentTandem = options.tandem.createTandem( 'content' );
    const screenContentNodes: Node[] = [];
    screens.forEach( screen => {
      assert && assert( screen.createKeyboardHelpNode, 'if any screen has keyboard help content, then all screens need content' );
      const screenTandem = screen.tandem.supplied ? contentTandem.createTandem( screen.tandem.name ) : Tandem.REQUIRED;
      const keyboardHelpNode = screen.createKeyboardHelpNode!( screenTandem );
      screenContentNodes.push( keyboardHelpNode );
    } );

    const shortcutsTitleText = new VoicingText( JoistStrings.keyboardShortcuts.titleStringProperty, {
      font: new PhetFont( {
        weight: 'bold',
        size: 24
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // voicing options
      readingBlockDisabledTagName: null
    } );

    // a 'tab to get started' hint
    const tabHintLine = new TabHintLine();

    // stack the two items with a bit of spacing
    assert && assert( !options.title, 'KeyboardHelpDialog sets title' );
    const titleVBox = new VBox( {
        children: [ shortcutsTitleText, tabHintLine ],
        spacing: 5,

        // pdom
        tagName: 'div'
      }
    );
    options.title = titleVBox;

    // help content surrounded by a div unless already specified, so that all content is read when dialog opens

    super( content, options );

    // When the screen changes, swap out keyboard help content to the selected screen's content
    Multilink.multilink( [ screenProperty, this.isShowingProperty ], ( screen, isShowing ) => {
      assert && assert( screens.includes( screen ), 'double check that this is an expected screen' );
      const currentContentNode = screenContentNodes[ screens.indexOf( screen ) ];
      if ( isShowing ) {
        assert && assert( currentContentNode, 'a displayed KeyboardHelpButton for a screen should have content' );
        content.children = [ currentContentNode ];
      }
    } );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    if ( assert && window.phet?.chipper?.queryParameters?.binder ) {
      screenContentNodes.forEach( node => {
        content.children = [ node ];
        InstanceRegistry.registerDataURL( 'joist', 'KeyboardHelpDialog', this );
      } );
    }
  }
}

/**
 * An inner class that assembles the "Tab to get started" content of the Dialog title. This content
 * is interactive with Voicing in that it can be clicked to hear this content (when Voicing is enabled).
 */

type TabHintLineSelfOptions = EmptySelfOptions;
type TabHintLineOptions = TabHintLineSelfOptions & NodeOptions & ReadingBlockOptions;

class TabHintLine extends ReadingBlock( Node ) {

  public constructor( providedOptions?: TabHintLineOptions ) {

    const options = optionize<TabHintLineOptions, TabHintLineSelfOptions, ReadingBlockOptions>()( {
      readingBlockNameResponse: tabToGetStartedStringProperty
    }, providedOptions );

    super();

    const tabIcon = TextKeyNode.tab();

    // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
    const labelWithIcon = KeyboardHelpSectionRow.labelWithIcon( JoistStrings.keyboardShortcuts.toGetStartedStringProperty,
      tabIcon, {
        labelInnerContent: tabToGetStartedStringProperty,
        iconOptions: {
          tagName: 'p' // because there is only one, and the default is an li tag
        }
      } );

    // labelWithIcon is meant to be passed to KeyboardHelpSection, so we have to hack a bit here
    const hBox = new HBox( {
      children: [ labelWithIcon.icon, labelWithIcon.label ],
      spacing: 4
    } );

    this.addChild( hBox );
    this.mutate( options );
  }
}

joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );