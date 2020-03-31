// Copyright 2016-2020, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 *
 * @author Jesse Greenberg
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import Image from '../../scenery/js/nodes/Image.js';
import DialogIO from '../../sun/js/DialogIO.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import PhetioCapsuleIO from '../../tandem/js/PhetioCapsuleIO.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import darkIconImage from '../images/keyboard-icon-on-white_png.js'; // on a white navbar
import brightIconImage from '../images/keyboard-icon_png.js'; // on a black navbar
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import JoistButton from './JoistButton.js';
import KeyboardHelpDialog from './KeyboardHelpDialog.js';

// constants
const hotKeysAndHelpString = joistStrings.a11y.keyboardHelp.hotKeysAndHelp;
const HELP_BUTTON_HEIGHT = 67;
const HELP_BUTTON_SCALE = 0.30;  // scale applied to the icon

/**
 * @param {Node} helpContent - content for the KeyboardHelpDialog
 * @param {Property.<Color|string>} backgroundColorProperty
 * @param {Tandem} tandem
 * @param {Object} [options]
 * @constructor
 */
function KeyboardHelpButton( helpContent, backgroundColorProperty, tandem, options ) {

  options = merge( {
    highlightExtensionWidth: 5,
    highlightExtensionHeight: 10,

    // The keyboard button is not vertically symmetric, due to the cable on the top.
    // This offset adjusts the body of the keyboard to be in the center, so it
    // will align with the speaker button and the PhET logo
    highlightCenterOffsetY: 2,

    // a11y
    tagName: 'button',
    innerContent: hotKeysAndHelpString
  }, options );

  assert && assert( !options.listener, 'KeyboardHelpButton set\'s its own listener' );

  PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

  const keyboardHelpDialogCapsule = new PhetioCapsule( tandem => {
    return new KeyboardHelpDialog( helpContent, {
      focusOnCloseNode: this,
      tandem: tandem
    } );
  }, [], {
    tandem: tandem.createTandem( 'keyboardHelpDialogCapsule' ),
    phetioType: PhetioCapsuleIO( DialogIO )
  } );

  options.listener = () => {
    const keyboardHelpDialog = keyboardHelpDialogCapsule.getInstance();
    keyboardHelpDialog.show();

    // if listener was fired because of accessibility
    if ( this.buttonModel.isA11yClicking() ) {

      // focus the close button if the dialog is open with a keyboard
      keyboardHelpDialog.focusCloseButton();
    }
  };

  const icon = new Image( brightIconImage, {
    scale: HELP_BUTTON_SCALE / brightIconImage.height * HELP_BUTTON_HEIGHT,
    pickable: false
  } );

  JoistButton.call( this, icon, backgroundColorProperty, tandem, options );

  // change the icon so that it is visible when the background changes from dark to light
  backgroundColorProperty.link( function( backgroundColor ) {
    icon.image = backgroundColor === 'black' ? brightIconImage : darkIconImage;
  } );
}

joist.register( 'KeyboardHelpButton', KeyboardHelpButton );

inherit( JoistButton, KeyboardHelpButton );
export default KeyboardHelpButton;