// Copyright 2016-2022, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 *
 * @author Jesse Greenberg
 */

import Property from '../../axon/js/Property.js';
import EmptyObjectType from '../../phet-core/js/types/EmptyObjectType.js';
import { Color, Image, Node } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import keyboardIconOnWhite_png from '../images/keyboardIconOnWhite_png.js'; // on a white navbar
import keyboardIcon_png from '../images/keyboardIcon_png.js'; // on a black navbar
import joist from './joist.js';
import JoistButton, { JoistButtonOptions } from './JoistButton.js';
import joistStrings from './joistStrings.js';
import KeyboardHelpDialog from './KeyboardHelpDialog.js';
import optionize from '../../phet-core/js/optionize.js';
import Screen from './Screen.js';
import ScreenView from './ScreenView.js';
import IModel from './IModel.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';

// constants
const keyboardShortcutsString = joistStrings.a11y.keyboardHelp.keyboardShortcuts;
const HELP_BUTTON_HEIGHT = 67;
const HELP_BUTTON_SCALE = 0.30; // scale applied to the icon

type SelfOptions = EmptyObjectType;
export type KeyboardHelpButtonOptions = SelfOptions & PickRequired<JoistButtonOptions, 'tandem'>;

class KeyboardHelpButton extends JoistButton {

  /**
   * @param screenProperty - Property that holds an object that stores keyboardHelpNode on it
   * @param backgroundColorProperty
   * @param [providedOptions]
   */
  public constructor( screenProperty: Property<Screen<IModel, ScreenView>>,
                      backgroundColorProperty: Property<Color>,
                      providedOptions: KeyboardHelpButtonOptions ) {

    const options = optionize<KeyboardHelpButtonOptions, SelfOptions, JoistButtonOptions>()( {
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // The keyboard button is not vertically symmetric, due to the cable on the top.
      // This offset adjusts the body of the keyboard to be in the center, so it
      // will align with the speaker button and the PhET logo
      highlightCenterOffsetY: 2,

      // phet-io
      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      innerContent: keyboardShortcutsString,

      // voicing
      voicingNameResponse: keyboardShortcutsString
    }, providedOptions );

    let keyboardHelpDialogCapsule: PhetioCapsule<PhetioObject> | null = null; // set after calling super
    options.listener = () => {

      // @ts-ignore
      const keyboardHelpDialog = keyboardHelpDialogCapsule.getElement();

      // @ts-ignore
      keyboardHelpDialog.show();
    };

    const icon = new Image( keyboardIcon_png, {
      scale: HELP_BUTTON_SCALE / keyboardIcon_png.height * HELP_BUTTON_HEIGHT,
      pickable: false
    } );

    super( icon, backgroundColorProperty, options );

    const content = new Node();

    // When the screen changes, swap out keyboard help content to the selected screen's content
    screenProperty.link( screen => {
      assert && assert( screen.keyboardHelpNode, 'screen should have keyboardHelpNode' );
      content.children = [ screen.keyboardHelpNode! ];
    } );

    // @ts-ignore
    keyboardHelpDialogCapsule = new PhetioCapsule<PhetioObject>( tandem => {

      // Wrap in a node to prevent DAG problems if archetypes are also created
      return new KeyboardHelpDialog( new Node( { children: [ content ] } ), {
        tandem: tandem,
        focusOnHideNode: this
      } );
    }, [], {
      tandem: options.tandem.createTandem( 'keyboardHelpDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( backgroundColor => {
      icon.image = backgroundColor.equals( Color.BLACK ) ? keyboardIcon_png : keyboardIconOnWhite_png;
    } );
  }
}

joist.register( 'KeyboardHelpButton', KeyboardHelpButton );
export default KeyboardHelpButton;