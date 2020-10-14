// Copyright 2016-2020, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 *
 * @author Jesse Greenberg
 */

import merge from '../../phet-core/js/merge.js';
import Image from '../../scenery/js/nodes/Image.js';
import Node from '../../scenery/js/nodes/Node.js';
import Dialog from '../../sun/js/Dialog.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import darkIconImage from '../images/keyboard-icon-on-white_png.js'; // on a white navbar
import brightIconImage from '../images/keyboard-icon_png.js'; // on a black navbar
import joist from './joist.js';
import JoistButton from './JoistButton.js';
import joistStrings from './joistStrings.js';
import KeyboardHelpDialog from './KeyboardHelpDialog.js';

// constants
const HELP_BUTTON_HEIGHT = 67;
const HELP_BUTTON_SCALE = 0.30;  // scale applied to the icon

class KeyboardHelpButton extends JoistButton {

  /**
   * @param {Property.<{keyboardHelpNode}>} screenProperty - Property that holds an object that stores keyboardHelpNode on it
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenProperty, backgroundColorProperty, tandem, options ) {

    options = merge( {
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // The keyboard button is not vertically symmetric, due to the cable on the top.
      // This offset adjusts the body of the keyboard to be in the center, so it
      // will align with the speaker button and the PhET logo.
      highlightCenterOffsetY: 2,

      // pdom
      tagName: 'button',
      innerContent: joistStrings.a11y.keyboardHelp.hotKeysAndHelp
    }, options );

    PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

    const content = new Node();

    // When the screen changes, swap out keyboard help content to the selected screen's content.
    screenProperty.link( screen => {
      assert && assert( screen.keyboardHelpNode, 'screen should have keyboardHelpNode' );
      content.children = [ screen.keyboardHelpNode ];
    } );

    const keyboardHelpDialogCapsule = new PhetioCapsule( tandem => {
      return new KeyboardHelpDialog( content, {
        focusOnCloseNode: this,
        tandem: tandem
      } );
    }, [], {
      tandem: tandem.createTandem( 'keyboardHelpDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    assert && assert( !options.listener, 'KeyboardHelpButton sets listener' );
    options.listener = () => {

      // Open the dialog.
      const keyboardHelpDialog = keyboardHelpDialogCapsule.getElement();
      keyboardHelpDialog.show();

      // If the button fired because of accessibility, focus the dialog's close button.
      if ( this.buttonModel.isA11yClicking() ) {
        keyboardHelpDialog.focusCloseButton();
      }
    };

    const icon = new Image( brightIconImage, {
      scale: HELP_BUTTON_SCALE / brightIconImage.height * HELP_BUTTON_HEIGHT,
      pickable: false
    } );

    super( icon, backgroundColorProperty, tandem, options );

    // Change the icon so that it is visible when the background changes from dark to light.
    backgroundColorProperty.link( backgroundColor => {
      icon.image = ( backgroundColor === 'black' ) ? brightIconImage : darkIconImage;
    } );
  }
}

joist.register( 'KeyboardHelpButton', KeyboardHelpButton );
export default KeyboardHelpButton;